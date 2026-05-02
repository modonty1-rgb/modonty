import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { MongoClient, IndexDescription } from "mongodb";

// Hardcoded PROD URL (read-only source)
const PROD_DATABASE_URL =
  "mongodb+srv://modonty-admin:2053712713@modonty-cluster.tgixa8h.mongodb.net/modonty?retryWrites=true&w=majority&appName=modonty-cluster";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300; // 5 min

interface SseEvent {
  type:
    | "start"
    | "collection_start"
    | "doc_progress"
    | "collection_done"
    | "collection_failed"
    | "indexes_rebuilding"
    | "complete"
    | "fatal";
  [key: string]: unknown;
}

export async function POST(_req: NextRequest) {
  // Block in production runtime — defense in depth
  if (process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "Disabled in production runtime" },
      { status: 403 }
    );
  }

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

        send({
          type: "start",
          total: collections.length,
          source: "modonty (PROD)",
          target: "modonty_dev (LOCAL)",
        });

        let totalDocs = 0;
        let successCount = 0;
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

            // 3. Stream documents from PROD → insert to LOCAL one by one
            const cursor = prodDb.collection(collName).find({});
            const localCol = localDb.collection(collName);

            let docCount = 0;
            for await (const doc of cursor) {
              await localCol.insertOne(doc);
              docCount++;

              // Progress every 100 docs (avoid spamming SSE)
              if (docCount % 100 === 0) {
                send({
                  type: "doc_progress",
                  collection: collName,
                  docs: docCount,
                });
              }
            }

            // 4. Recreate indexes (skip the auto _id index)
            // MongoDB rejects null for unique/sparse — only bool or undefined.
            const indexesToCreate = prodIndexes
              .filter((idx) => idx.name !== "_id_")
              .map((idx) => {
                const spec: IndexDescription = {
                  key: idx.key,
                  name: idx.name,
                  background: true,
                };
                if (idx.unique === true) spec.unique = true;
                if (idx.sparse === true) spec.sparse = true;
                if (idx.expireAfterSeconds !== undefined && idx.expireAfterSeconds !== null) {
                  spec.expireAfterSeconds = idx.expireAfterSeconds;
                }
                return spec;
              });

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

        send({
          type: "complete",
          collections: collections.length,
          successCount,
          failedCount,
          totalDocs,
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
