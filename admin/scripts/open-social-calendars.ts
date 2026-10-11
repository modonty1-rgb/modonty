/**
 * Social Calendar got a calendars table (Khalid, 11 Oct 2026): a post belongs to a calendar, not a client.
 * This opens the content calendar of every client that already has posts or was activated, and links
 * each existing post to its client's calendar.
 *
 *   pnpm tsx scripts/open-social-calendars.ts                   ← dry run on modonty_dev (default): reports, writes NOTHING
 *   pnpm tsx scripts/open-social-calendars.ts --apply           ← writes to modonty_dev
 *   pnpm tsx scripts/open-social-calendars.ts --prod [--apply]  ← target `modonty` (production) — only on Khalid's order
 *
 * Idempotent: a client with a calendar keeps it, and only posts without `calendarId` are linked.
 * Calendars written before `kind` existed get `CONTENT` (they were all client calendars).
 * The old `clientId` on posts is left in place (the old calendar code on other machines still reads it).
 */
import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

// Node on Windows refuses the SRV lookup of mongodb+srv (measured 11 Oct 2026: querySrv ECONNREFUSED).
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const APPLY = process.argv.includes("--apply");
const PROD = process.argv.includes("--prod");
const ROOT = path.resolve(__dirname, "..", "..");

function readEnv(file: string, key: string): string | undefined {
  if (!fs.existsSync(file)) return undefined;
  const m = fs.readFileSync(file, "utf8").match(new RegExp(`^${key}="?([^"\\r\\n]+)"?`, "m"));
  return m?.[1];
}
const dbNameOf = (url: string) => new URL(url.replace(/^mongodb(\+srv)?:/, "https:")).pathname.slice(1);

const targetUrl = process.env.DATABASE_URL || readEnv(path.join(ROOT, "shared", ".env"), "DATABASE_URL");
if (!targetUrl) throw new Error("DATABASE_URL not found");
const targetDb = dbNameOf(targetUrl);
if (PROD ? targetDb !== "modonty" : targetDb !== "modonty_dev") {
  throw new Error(`Refusing: target database is "${targetDb}" — expected ${PROD ? "modonty (--prod)" : "modonty_dev"}`);
}
process.env.DATABASE_URL = targetUrl;

type Oid = { $oid: string };

(async () => {
  const prisma = new PrismaClient();

  // Clients that own posts today (posts still carry the old `clientId`).
  const groups = (await prisma.socialPost.aggregateRaw({
    pipeline: [
      { $match: { calendarId: { $exists: false }, clientId: { $type: "objectId" } } },
      { $group: { _id: "$clientId", n: { $sum: 1 } } },
    ],
  })) as unknown as { _id: Oid; n: number }[];
  const withPosts = new Map(groups.map((g) => [g._id.$oid, g.n]));

  // Activated clients — the card is founded by activation, so they get a calendar even with no posts yet.
  const activated = await prisma.client.findMany({
    where: { subscriptionStatus: { not: "PENDING" }, OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }] },
    select: { id: true },
  });
  const clientIds = [...new Set([...withPosts.keys(), ...activated.map((c) => c.id)])];

  const existing = await prisma.socialCalendar.findMany({ where: { kind: "CONTENT", clientId: { in: clientIds } }, select: { id: true, clientId: true } });
  const calendarOf = new Map(existing.map((c) => [c.clientId!, c.id]));

  const kindless = (await prisma.$runCommandRaw({ count: "social_calendars", query: { kind: { $exists: false } } })) as { n: number };
  const report = { calendarsWithoutKind: kindless.n, kindSet: 0, clients: clientIds.length, withPosts: withPosts.size, calendarsExisting: calendarOf.size, calendarsCreated: 0, postsToLink: [...withPosts.values()].reduce((a, b) => a + b, 0), postsLinked: 0 };

  if (APPLY) {
    const k = (await prisma.$runCommandRaw({
      update: "social_calendars",
      updates: [{ q: { kind: { $exists: false } }, u: { $set: { kind: "CONTENT" } }, multi: true }],
    })) as { nModified?: number };
    report.kindSet = k.nModified ?? 0;
    for (const clientId of clientIds) {
      if (!calendarOf.has(clientId)) {
        const c = await prisma.socialCalendar.create({ data: { kind: "CONTENT", clientId }, select: { id: true } });
        calendarOf.set(clientId, c.id);
        report.calendarsCreated++;
      }
    }
    for (const clientId of withPosts.keys()) {
      const res = (await prisma.$runCommandRaw({
        update: "social_calendar_posts",
        updates: [
          {
            q: { clientId: { $oid: clientId }, calendarId: { $exists: false } },
            u: { $set: { calendarId: { $oid: calendarOf.get(clientId)! } } },
            multi: true,
          },
        ],
      })) as { nModified?: number };
      report.postsLinked += res.nModified ?? 0;
    }
  }

  const left = (await prisma.socialPost.aggregateRaw({ pipeline: [{ $match: { calendarId: { $exists: false } } }, { $count: "n" }] })) as unknown as { n: number }[];
  await prisma.$disconnect();
  console.log(JSON.stringify({ mode: APPLY ? "APPLY" : "DRY-RUN", target: targetDb, ...report, postsWithoutCalendar: left[0]?.n ?? 0 }, null, 2));
})().catch((e) => {
  console.error("failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
