"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Find rows whose required relation points at something that no longer exists.
 *
 * Why this has to exist. `onDelete: Cascade` is not a database constraint — MongoDB has
 * no foreign keys at all. Prisma simulates it in the client, and only when the delete
 * goes through Prisma. A `mongosh` delete, a restored backup, a prod↔local sync, a raw
 * `deleteMany`, an edit from the Atlas UI — each leaves the dependent rows behind while
 * the schema keeps claiming the relation is intact.
 *
 * Then a read arrives. Because the relation is declared REQUIRED, Prisma refuses to
 * return the row and throws `Inconsistent query result: Field X is required to return
 * data, got null instead` — which drops the ENTIRE query, not the one bad row. That is
 * how a single dangling ArticleTag took down the whole articles page for جبر سيو while
 * every other client was fine.
 *
 * The relation list is read from Prisma's own datamodel rather than hardcoded, so a
 * required relation added tomorrow is covered the day it ships — nobody has to remember
 * this file exists.
 *
 * Read-only by design. Deleting is a separate, explicitly-invoked action: an orphan can
 * mean a genuine leftover OR a target that was never imported, and the two look
 * identical from here. A human decides.
 */

/** Enough to recognise the rows in Atlas without dragging the whole set into memory. */
const SAMPLE_LIMIT = 5;
/** Relations scanned at once — each is a full collection scan with a $lookup. */
const CONCURRENCY = 4;

export interface RequiredRelation {
  /** Stable identifier, e.g. "ArticleTag.tag". */
  key: string;
  model: string;
  field: string;
  collection: string;
  foreignKey: string;
  targetModel: string;
  targetCollection: string;
  /** Column the FK points at — `_id` in practice, resolved rather than assumed. */
  targetKey: string;
}

export interface OrphanFinding extends RequiredRelation {
  count: number;
  sampleIds: string[];
}

export interface OrphanScanResult {
  relationsScanned: number;
  /** Relations whose scan itself errored — reported, never silently dropped. */
  failed: { key: string; error: string }[];
  totalOrphans: number;
  /** Only relations that actually have orphans, worst first. */
  findings: OrphanFinding[];
}

/**
 * Every required, singular relation in the schema, resolved to raw collection names.
 *
 * Composite-key relations are skipped: a multi-field join needs a different lookup shape
 * and this schema has none. If one is ever added, it is counted as unscanned rather than
 * quietly ignored.
 */
export async function listRequiredRelations(): Promise<{
  relations: RequiredRelation[];
  skippedComposite: number;
}> {
  const models = Prisma.dmmf.datamodel.models;
  const byName = new Map(models.map((m) => [m.name, m]));
  const relations: RequiredRelation[] = [];
  let skippedComposite = 0;

  /**
   * The Prisma field name is NOT the column name. `ClientReview.reviewerId` is stored as
   * `authorId` via `@map`, and a raw query that asks for `reviewerId` finds nothing —
   * which looks exactly like an orphan. Resolving through `dbName` is what keeps this
   * scan from reporting healthy rows as broken.
   */
  const columnOf = (model: (typeof models)[number], prismaField: string): string =>
    model.fields.find((f) => f.name === prismaField)?.dbName ?? prismaField;

  for (const model of models) {
    for (const field of model.fields) {
      const from = field.relationFromFields;
      const to = field.relationToFields;
      if (field.kind !== "object" || !field.isRequired || field.isList || !from?.length) continue;
      if (from.length > 1) {
        skippedComposite++;
        continue;
      }
      const target = byName.get(field.type);
      relations.push({
        key: `${model.name}.${field.name}`,
        model: model.name,
        field: field.name,
        collection: model.dbName ?? model.name,
        foreignKey: columnOf(model, from[0]),
        targetModel: field.type,
        targetCollection: target?.dbName ?? field.type,
        targetKey: target ? columnOf(target, to?.[0] ?? "id") : "_id",
      });
    }
  }

  return { relations, skippedComposite };
}

interface FacetRow {
  count?: { n?: number }[];
  samples?: { _id?: unknown }[];
}

/**
 * A raw command returns Mongo's extended JSON, so `_id` arrives as `{ $oid: "..." }`
 * rather than a string. Printing it directly yields "[object Object]" — useless for
 * finding the row in Atlas, which is the entire point of collecting samples.
 */
function readObjectId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "$oid" in value) {
    return String((value as { $oid: unknown }).$oid);
  }
  return String(value ?? "");
}

/**
 * One relation, one aggregation.
 *
 * A missing key and a key pointing nowhere both leave the lookup empty, so both are
 * caught here — and both crash Prisma identically, which is what matters.
 */
async function scanRelation(rel: RequiredRelation): Promise<OrphanFinding> {
  const res = (await db.$runCommandRaw({
    aggregate: rel.collection,
    pipeline: [
      {
        $lookup: {
          from: rel.targetCollection,
          localField: rel.foreignKey,
          foreignField: rel.targetKey,
          as: "__target",
        },
      },
      { $match: { __target: { $size: 0 } } },
      {
        $facet: {
          count: [{ $count: "n" }],
          samples: [{ $limit: SAMPLE_LIMIT }, { $project: { _id: 1 } }],
        },
      },
    ],
    cursor: {},
  })) as { cursor?: { firstBatch?: FacetRow[] } };

  const facet = res?.cursor?.firstBatch?.[0];
  return {
    ...rel,
    count: facet?.count?.[0]?.n ?? 0,
    sampleIds: (facet?.samples ?? []).map((d) => readObjectId(d._id)).filter(Boolean),
  };
}

/** Run the relations in small batches — 49 concurrent collection scans is not kind to the cluster. */
export async function scanOrphans(): Promise<OrphanScanResult> {
  const { relations } = await listRequiredRelations();
  const findings: OrphanFinding[] = [];
  const failed: { key: string; error: string }[] = [];

  for (let i = 0; i < relations.length; i += CONCURRENCY) {
    const batch = relations.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(batch.map(scanRelation));
    results.forEach((r, j) => {
      if (r.status === "fulfilled") {
        if (r.value.count > 0) findings.push(r.value);
      } else {
        failed.push({
          key: batch[j].key,
          error: r.reason instanceof Error ? r.reason.message : String(r.reason),
        });
      }
    });
  }

  findings.sort((a, b) => b.count - a.count);
  return {
    relationsScanned: relations.length,
    failed,
    totalOrphans: findings.reduce((sum, f) => sum + f.count, 0),
    findings,
  };
}

/**
 * Delete the orphans of ONE relation, named explicitly.
 *
 * Deliberately not wired into Run-All. The scan re-runs first so the ids are current —
 * deleting from a stale report is how a healthy row gets removed. Capped per call so a
 * mistake stays small.
 */
export async function deleteOrphansForRelation(
  key: string
): Promise<{ ok: boolean; deleted: number; error?: string }> {
  const { relations } = await listRequiredRelations();
  const rel = relations.find((r) => r.key === key);
  if (!rel) return { ok: false, deleted: 0, error: `Unknown relation "${key}"` };

  try {
    const res = (await db.$runCommandRaw({
      aggregate: rel.collection,
      pipeline: [
        {
          $lookup: {
            from: rel.targetCollection,
            localField: rel.foreignKey,
            foreignField: rel.targetKey,
            as: "__target",
          },
        },
        { $match: { __target: { $size: 0 } } },
        { $limit: 500 },
        { $project: { _id: 1 } },
      ],
      cursor: {},
    })) as { cursor?: { firstBatch?: { _id?: unknown }[] } };

    // Extended JSON round-trips: the `{ $oid }` shape read here is the shape the delete
    // needs back, so the ids are passed through untouched rather than re-parsed.
    const ids = (res?.cursor?.firstBatch ?? [])
      .map((d) => d._id)
      .filter((id): id is Prisma.InputJsonValue => id != null);
    if (ids.length === 0) return { ok: true, deleted: 0 };

    const del = (await db.$runCommandRaw({
      delete: rel.collection,
      deletes: [{ q: { _id: { $in: ids } }, limit: 0 }],
    })) as { n?: number };

    return { ok: true, deleted: del?.n ?? 0 };
  } catch (e) {
    return { ok: false, deleted: 0, error: e instanceof Error ? e.message : String(e) };
  }
}
