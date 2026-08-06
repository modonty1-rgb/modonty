import dns from "node:dns";
import dnsPromises from "node:dns/promises";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { MongoClient, IndexDescription } from "mongodb";
import { listRequiredRelations, scanOrphans } from "@/app/(dashboard)/database/actions/orphan-scan";

// Hardcoded PROD URL (read-only source)
const PROD_DATABASE_URL =
  "mongodb+srv://modonty-admin:2053712713@modonty-cluster.tgixa8h.mongodb.net/modonty?retryWrites=true&w=majority&appName=modonty-cluster";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300; // 5 min

// High-volume event/tracking collections skipped during the local sync — they are
// pure raw-event firehoses (a row per visit/click) that GA4 already owns as the source
// of truth, or that only exist as a footer fallback. Copying them dominated the sync
// time (13,827 docs → ~21 min) for zero dev value: local admin/dashboard work reads GA4,
// not these. They're recreated EMPTY locally (indexes kept) so any code that queries
// them still returns 0 rather than erroring. Full retention/deletion decision lives in
// the schema-review task (documents/tasks/TODO.md).
const SKIP_COLLECTIONS = new Set<string>([
  "page_views",          // GA4 fallback only — footer reads GA4 first
  "article_views",       // GA4 screenPageViews covers this
  "client_views",        // GA4 covers this
  "analytics",           // raw per-visit; GA4 is the thermometer
  "engagement_duration", // raw time-on-page events
  "article_link_clicks", // raw outbound-click events
  "cta_clicks",          // raw CTA-click events (GA4 has cta_click)
  "shares",              // raw share events
  "conversions",         // raw conversion events (GA4 covers funnel)
  "campaign_tracking",   // raw UTM events
  "lead_scoring",        // derived from events — recomputable, not source data
  "email_events",        // raw Resend webhook log
]);

interface SseEvent {
  type:
    | "start"
    | "collection_start"
    | "collection_skipped"
    | "doc_progress"
    | "collection_done"
    | "collection_failed"
    | "indexes_rebuilding"
    | "verifying"
    | "verified"
    | "complete"
    | "fatal";
  [key: string]: unknown;
}

/**
 * Guard the skip list against schema drift.
 *
 * A skipped collection is recreated EMPTY. That is harmless only while nothing with a
 * REQUIRED relation points into it — the moment someone adds one, every synced row on
 * that side lands here orphaned, and the page that reads it dies for the whole table,
 * not just the bad row. Checked at run time because the schema changes far more often
 * than this file does.
 */
async function findSkipListConflicts(): Promise<string[]> {
  const { relations } = await listRequiredRelations();
  return relations
    .filter((r) => SKIP_COLLECTIONS.has(r.targetCollection))
    .map((r) => `${r.key} → ${r.targetCollection}`);
}

// Recreate PROD indexes locally (minus the auto _id index). MongoDB rejects null for
// unique/sparse — only bool or undefined — so those are set only when explicitly true.
function buildIndexSpecs(prodIndexes: { name?: string; key: Record<string, number>; unique?: boolean; sparse?: boolean; expireAfterSeconds?: number | null }[]): IndexDescription[] {
  return prodIndexes
    .filter((idx) => idx.name !== "_id_")
    .map((idx) => {
      const spec: IndexDescription = { key: idx.key, name: idx.name, background: true };
      if (idx.unique === true) spec.unique = true;
      if (idx.sparse === true) spec.sparse = true;
      if (idx.expireAfterSeconds !== undefined && idx.expireAfterSeconds !== null) {
        spec.expireAfterSeconds = idx.expireAfterSeconds;
      }
      return spec;
    });
}

export async function POST(_req: NextRequest) {
  // The gate that actually protects anything is the DATABASE_URL check below: this route
  // only ever writes to `modonty_dev`, and the deployed admin points at `modonty`, so it
  // is refused there no matter who calls it.
  //
  // A NODE_ENV check used to sit here as well, but it blocked the one case we need — the
  // migration rehearsal runs against a production BUILD on this machine (`next start`,
  // which sets NODE_ENV=production) while still talking to the local test database. That
  // check was measuring the bundle, not the database, and the database is what matters.
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const localUrl = process.env.DATABASE_URL;
  if (!localUrl) {
    return Response.json(
      { error: "DATABASE_URL is not set" },
      { status: 500 }
    );
  }

  // Refuse to write to PROD database
  if (!localUrl.includes("modonty_dev")) {
    const dbName = localUrl.match(/\/(\w+)\?/)?.[1] || "unknown";
    return Response.json(
      {
        error: `Refusing — DATABASE_URL must point to modonty_dev (current: ${dbName})`,
      },
      { status: 400 }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SseEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      // Some Windows setups leave Node's c-ares resolver pointed at 127.0.0.1
      // (where no DNS server listens), which breaks the SRV lookup that
      // `mongodb+srv://` needs — even though the OS resolver (Prisma, nslookup)
      // works. Fall back to public DNS only when the resolver is loopback.
      // dev-only route; never runs in production.
      //
      // `node:dns` and `node:dns/promises` keep SEPARATE server lists. The Mongo
      // driver resolves SRV through the promises resolver, so setting only the
      // callback one leaves the driver still aimed at 127.0.0.1 → querySrv
      // ECONNREFUSED. Both must be set.
      const isLoopback = (s: string) => s.startsWith("127.") || s === "::1";
      if (dns.getServers().some(isLoopback)) {
        dns.setServers(["1.1.1.1", "8.8.8.8"]);
      }
      if (dnsPromises.getServers().some(isLoopback)) {
        dnsPromises.setServers(["1.1.1.1", "8.8.8.8"]);
      }

      const prodClient = new MongoClient(PROD_DATABASE_URL);
      const localClient = new MongoClient(localUrl);

      try {
        await prodClient.connect();
        await localClient.connect();

        const prodDb = prodClient.db();
        const localDb = localClient.db();

        // Filter out system collections + Prisma migrations
        const allCollections = await prodDb.listCollections().toArray();
        const collections = allCollections.filter(
          (c) =>
            !c.name.startsWith("system.") &&
            !c.name.startsWith("_") &&
            c.type !== "view"
        );

        // Checked before a single byte moves: if the schema has grown a required relation
        // into a collection we recreate empty, this copy would manufacture orphans on
        // purpose. Better to refuse than to hand over a database that crashes on read.
        const skipConflicts = await findSkipListConflicts();
        if (skipConflicts.length > 0) {
          send({
            type: "fatal",
            error:
              `Skip list is unsafe — ${skipConflicts.length} required relation(s) point into a collection this sync empties: ` +
              `${skipConflicts.join(", ")}. Remove those collections from SKIP_COLLECTIONS or the copy will create orphans.`,
          });
          return;
        }

        send({
          type: "start",
          total: collections.length,
          source: "modonty (PROD)",
          target: "modonty_dev (LOCAL)",
        });

        let totalDocs = 0;
        let successCount = 0;
        let skippedCount = 0;
        let failedCount = 0;
        const startTime = Date.now();

        for (let i = 0; i < collections.length; i++) {
          const c = collections[i];
          const collName = c.name;

          send({
            type: "collection_start",
            name: collName,
            index: i + 1,
            total: collections.length,
          });

          try {
            // 1. Drop local collection
            try {
              await localDb.collection(collName).drop();
            } catch {
              // collection didn't exist — ok
            }

            // 2. Read indexes from PROD (to recreate after data insert)
            const prodIndexes = await prodDb
              .collection(collName)
              .listIndexes()
              .toArray();

            const localCol = localDb.collection(collName);

            // Skipped collections: recreate empty (indexes only), copy no data.
            let docCount = 0;
            if (SKIP_COLLECTIONS.has(collName)) {
              const indexesToCreate = buildIndexSpecs(prodIndexes);
              if (indexesToCreate.length > 0) {
                await localCol.createIndexes(indexesToCreate);
              }
              skippedCount++;
              send({
                type: "collection_skipped",
                name: collName,
                indexes: indexesToCreate.length,
              });
              continue;
            }

            // 3. Stream documents from PROD → insert to LOCAL in batches of 500.
            // Batched insertMany (unordered) is far faster than one insertOne per doc,
            // which was the real bottleneck on large collections.
            const cursor = prodDb.collection(collName).find({});
            const BATCH = 500;
            let batch: unknown[] = [];
            const flush = async () => {
              if (batch.length === 0) return;
              await localCol.insertMany(batch as never[], { ordered: false });
              docCount += batch.length;
              batch = [];
              send({ type: "doc_progress", collection: collName, docs: docCount });
            };
            for await (const doc of cursor) {
              batch.push(doc);
              if (batch.length >= BATCH) await flush();
            }
            await flush();

            // 4. Recreate indexes (skip the auto _id index)
            const indexesToCreate = buildIndexSpecs(prodIndexes);

            if (indexesToCreate.length > 0) {
              await localCol.createIndexes(indexesToCreate);
            }

            totalDocs += docCount;
            successCount++;

            send({
              type: "collection_done",
              name: collName,
              docs: docCount,
              indexes: indexesToCreate.length,
            });
          } catch (error) {
            failedCount++;
            send({
              type: "collection_failed",
              name: collName,
              error: error instanceof Error ? error.message : "Unknown",
            });
          }
        }

        // The copy is not the finish line. Collections are copied one after another over
        // several minutes, each dropped before it is refilled — so a row can land here
        // pointing at a parent that was never copied, or that was deleted in PROD while
        // the copy was still running. Prisma then refuses the ENTIRE query that touches
        // it, and a page dies for one client while everyone else is fine. That is not a
        // theory: a scan of this database found two reviews pointing at a user who does
        // not exist here, and Prisma throws `Inconsistent query result` on them today.
        //
        // So the sync verifies its own result. Finding this now costs seconds; finding it
        // when a page falls over costs an afternoon of looking in the wrong place.
        send({ type: "verifying" });
        const scan = await scanOrphans().catch((e) => ({
          relationsScanned: 0,
          failed: [{ key: "scan", error: e instanceof Error ? e.message : String(e) }],
          totalOrphans: 0,
          findings: [],
        }));

        send({
          type: "verified",
          relationsScanned: scan.relationsScanned,
          totalOrphans: scan.totalOrphans,
          scanFailed: scan.failed.length,
          findings: scan.findings.slice(0, 10).map((f) => ({
            key: f.key,
            count: f.count,
            where: `${f.collection}.${f.foreignKey} → ${f.targetCollection}`,
            sampleIds: f.sampleIds,
          })),
        });

        // "Complete" has to mean "you can trust this copy". A failed collection leaves a
        // hole; orphans leave rows that crash on read. Either one makes the local database
        // a misleading place to test against, so neither is allowed to pass as success.
        send({
          type: "complete",
          collections: collections.length,
          successCount,
          skippedCount,
          failedCount,
          totalDocs,
          totalOrphans: scan.totalOrphans,
          usable: failedCount === 0 && scan.totalOrphans === 0,
          durationMs: Date.now() - startTime,
        });
      } catch (error) {
        send({
          type: "fatal",
          error: error instanceof Error ? error.message : "Unknown",
        });
      } finally {
        await prodClient.close().catch(() => {});
        await localClient.close().catch(() => {});
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
