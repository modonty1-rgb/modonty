"use server";

import { db } from "@/lib/db";

interface IndexDoc {
  name: string;
  key: Record<string, unknown>;
  expireAfterSeconds?: number;
}

interface ListIndexesResult {
  ok: number;
  cursor: { firstBatch: IndexDoc[] };
}

const EXPECTED_TTL = [
  { collection: "slug_change_otps", field: "expiresAt", label: "Slug Change OTPs" },
  { collection: "sessions", field: "expires", label: "Auth Sessions" },
  { collection: "verification_tokens", field: "expires", label: "Verification Tokens" },
] as const;

export interface TTLIndexStatus {
  collection: string;
  label: string;
  field: string;
  exists: boolean;
  indexName?: string;
}

export async function createTTLIndex(
  collection: string,
  field: string
): Promise<{ success: boolean; message: string }> {
  try {
    await db.$runCommandRaw({
      createIndexes: collection,
      indexes: [
        {
          key: { [field]: 1 },
          name: `${field}_ttl`,
          expireAfterSeconds: 0,
        },
      ],
    });
    return { success: true, message: `TTL index created on ${collection}.${field}` };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Failed to create index" };
  }
}

export async function getIndexHealth(): Promise<TTLIndexStatus[]> {
  return Promise.all(
    EXPECTED_TTL.map(async (expected) => {
      try {
        const res = (await db.$runCommandRaw({
          listIndexes: expected.collection,
        })) as unknown as ListIndexesResult;
        const indexes = res.cursor?.firstBatch ?? [];
        const ttlIndex = indexes.find(
          (idx) =>
            Object.keys(idx.key).includes(expected.field) &&
            typeof idx.expireAfterSeconds === "number"
        );
        return {
          collection: expected.collection,
          label: expected.label,
          field: expected.field,
          exists: !!ttlIndex,
          indexName: ttlIndex?.name,
        };
      } catch {
        return {
          collection: expected.collection,
          label: expected.label,
          field: expected.field,
          exists: false,
        };
      }
    })
  );
}

// Non-TTL query indexes Prisma defines in the schema but `prisma db push` can't
// safely create on prod (it would ALSO drop the manually-managed TTL indexes
// above, which aren't in the schema). createIndexes is additive + idempotent:
// it creates the collection if missing and NEVER drops anything. Names match
// Prisma's so a future `db push` sees them already in sync.
const EXPECTED_PERF_INDEXES: { collection: string; key: Record<string, number>; name: string }[] = [
  { collection: "page_views", key: { sessionId: 1, createdAt: 1 }, name: "page_views_sessionId_createdAt_idx" },
  { collection: "page_views", key: { createdAt: 1 }, name: "page_views_createdAt_idx" },
];

export async function ensurePerfIndexes(): Promise<{ created: number; details: string[] }> {
  let created = 0;
  const details: string[] = [];
  for (const idx of EXPECTED_PERF_INDEXES) {
    try {
      const res = (await db.$runCommandRaw({
        createIndexes: idx.collection,
        indexes: [{ key: idx.key, name: idx.name }],
      })) as unknown as { numIndexesBefore?: number; numIndexesAfter?: number };
      if ((res.numIndexesAfter ?? 0) > (res.numIndexesBefore ?? 0)) {
        created++;
        details.push(idx.name);
      }
    } catch (e) {
      details.push(`${idx.name} FAILED: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return { created, details };
}
