import { cacheLife } from "next/cache";

import { db } from "@/lib/db";
import type { LeagueTable, Match } from "../helpers/types";

export interface MatchDay {
  date: string;
  matches: Match[];
  /** False when the day could not be read (refused, failed) — its empty list is not «no matches». */
  known: boolean;
}

export interface FootballPage {
  /** The match the page leads with: live, else the next kickoff, else today's last result. */
  lead: Match | null;
  days: { yesterday: MatchDay; today: MatchDay; tomorrow: MatchDay };
  table: LeagueTable | null;
  /** Arabic club name → crest URL. A club missing here keeps its letter mark. */
  crests: Record<string, string>;
  /** Oldest source on the page — what «آخر تحديث» honestly means. */
  updatedAt: string | null;
  /** آسيا · الخليج · الكأس · السوبر · المنتخب — بطولةً بطولة، من 365Scores وحده. */
  others: { competition: string; matches: Match[] }[];
}

/** ما يرسله سيرفر الرادار (`automation/football/football.py`) ويكتبه الأدمن في `feed_snapshots`. */
interface FootballFeed {
  days: FootballPage["days"];
  table: LeagueTable;
  crests: Record<string, string>;
  others?: FootballPage["others"];
  updatedAt: string;
}

/** نفس المفتاح في الأدمن (`app/api/football/ingest/route.ts`). */
const FOOTBALL_PAGE_KEY = "football:page:v1";

function pickLead(today: Match[], tomorrow: Match[]): Match | null {
  return (
    today.find((m) => m.state === "live") ??
    today.find((m) => m.state === "upcoming") ??
    tomorrow.find((m) => m.state === "upcoming") ??
    today.filter((m) => m.state === "finished").at(-1) ??
    null
  );
}

const emptyDay = (date: string): MatchDay => ({ date, matches: [], known: false });

/**
 * صفحة الكورة كما أرسلها سيرفر الرادار — صفٌّ واحد من القاعدة، ولا اتّصال بأي مصدر خارجي من مدونتي
 * (خالد ١٥ أكتوبر ٢٠٢٦). السيرفر يسحب من الموقع الرسمي لدوري روشن ومن 365Scores كل دقيقة وقت المباريات
 * ويطابقهما؛ والصفحة تعيد قراءة الصفّ كل دقيقة.
 */
export async function getFootballPage(): Promise<FootballPage> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });

  const row = await db.feedSnapshot.findUnique({
    where: { key: FOOTBALL_PAGE_KEY },
    select: { payload: true },
  });
  const feed = (row?.payload ?? null) as FootballFeed | null;
  if (!feed) {
    const today = new Date().toISOString().slice(0, 10);
    return {
      lead: null,
      days: { yesterday: emptyDay(today), today: emptyDay(today), tomorrow: emptyDay(today) },
      table: null,
      crests: {},
      updatedAt: null,
      others: [],
    };
  }

  return {
    lead: pickLead(feed.days.today.matches, feed.days.tomorrow.matches),
    days: feed.days,
    table: feed.table,
    crests: feed.crests,
    updatedAt: feed.updatedAt,
    others: feed.others ?? [],
  };
}
