import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * **صفحة الكورة جاهزةً من سيرفر الرادار** (`automation/football/football.py`) — يسحب من الموقع الرسمي
 * لدوري روشن ومن 365Scores ويطابقهما، ثم يرسلها هنا فتُكتب صفّاً واحداً في `feed_snapshots`.
 * مدونتي تقرأ الصفّ فقط ولا تتّصل بأي مصدر خارجي (خالد ١٥ أكتوبر ٢٠٢٦: «ما نأثر على مدونتي»).
 * نفس سرّ الرادار (`RADAR_INGEST_SECRET`).
 */
// نفس المفتاح في مدونتي (`football/data/get-football-page.ts`) — ملف route لا يصدّر غير المعالجات
const FOOTBALL_PAGE_KEY = "football:page:v1";

const Side = z.object({ name: z.string().min(1).max(80), goals: z.number().int().min(0).max(99).nullable() });
const Match = z.object({
  id: z.string().min(1).max(160),
  kickoff: z.string().min(10).max(40),
  state: z.enum(["upcoming", "live", "finished", "off", "unconfirmed"]),
  status: z.string().max(10),
  minute: z.number().int().min(0).max(200).nullable(),
  round: z.string().max(40).nullable(),
  venue: z.string().max(160).nullable(),
  home: Side,
  away: Side,
});
const Day = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), matches: z.array(Match).max(40), known: z.boolean() });
const Row = z.object({
  position: z.number().int(), team: z.string().max(80), played: z.number().int(), won: z.number().int(),
  drawn: z.number().int(), lost: z.number().int(), goalsFor: z.number().int(), goalsAgainst: z.number().int(),
  goalDifference: z.number().int(), points: z.number().int(), zone: z.enum(["asia", "drop"]).nullable(),
});
const Body = z.object({
  version: z.literal(1),
  seasonName: z.string().max(20),
  days: z.object({ yesterday: Day, today: Day, tomorrow: Day }),
  table: z.object({
    rows: z.array(Row).min(10).max(30),
    scorers: z.array(z.object({ rank: z.number().int(), player: z.string().max(80), club: z.string().max(80), goals: z.number().int() })).max(20),
    clubNames: z.record(z.string(), z.string()),
  }),
  crests: z.record(z.string(), z.string().url().max(300)),
  // آسيا · الخليج · الكأس · السوبر · المنتخب — من 365Scores وحده
  others: z.array(z.object({ competition: z.string().max(80), matches: z.array(Match).max(40) })).max(15).default([]),
  updatedAt: z.string().max(40),
  checks: z.object({ unconfirmed: z.number().int(), scorersVerified: z.boolean(), errors: z.array(z.string().max(500)).max(5) }),
});

export async function POST(request: NextRequest) {
  const secret = process.env.RADAR_INGEST_SECRET;
  if (!secret || request.headers.get("x-radar-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad-request", issues: parsed.error.issues.slice(0, 3) }, { status: 400 });
  }

  const payload = parsed.data as unknown as Prisma.InputJsonValue;
  const fetchedAt = new Date(parsed.data.updatedAt);
  const lastError = parsed.data.checks.errors.length ? parsed.data.checks.errors.join(" | ").slice(0, 300) : null;
  await db.feedSnapshot.upsert({
    where: { key: FOOTBALL_PAGE_KEY },
    create: { key: FOOTBALL_PAGE_KEY, payload, fetchedAt: Number.isNaN(fetchedAt.getTime()) ? new Date() : fetchedAt, lastError },
    update: { payload, fetchedAt: Number.isNaN(fetchedAt.getTime()) ? new Date() : fetchedAt, lastError },
    select: { id: true },
  });
  return NextResponse.json({ ok: true });
}
