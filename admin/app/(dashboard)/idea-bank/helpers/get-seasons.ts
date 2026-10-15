import { db } from "@/lib/db";
import { queryAnalytics } from "@/lib/gsc/analytics";

/**
 * **التقويم الموسمي** (خالد ١٥ أكتوبر ٢٠٢٦) — المواسم السعودية القادمة، ومتى نجهّز مقالاتها، وكم جاءنا
 * منها في قوقل الموسم الماضي (Search Console). مقالٌ يُنشر يوم المناسبة لا يلحق ترتيبها — يُنشر قبلها.
 *
 * التواريخ الهجرية من تقويم أم القرى (`Intl` · `islamic-umalqura`) — الرسمي في المملكة؛ رمضان والعيدان
 * يُعلَنان بالرؤية فقد يختلفان يوماً. لا مناسبة تاريخها متغيّر بقرار (كبداية الدراسة) — لا تخمين.
 */
type Season = {
  key: string;
  name: string;
  /** يطابق اليوم نفسه — هجري أو ميلادي. */
  isDay: (d: Date) => boolean;
  hijri: boolean;
  /** نمط RE2 لكلمات الموسم في Search Console. */
  gscRegex: string;
  /** كلمة تُطابق عناوين مقالاتنا («كتبنا عنه»). */
  titleWord: string;
};

export type SeasonRow = {
  id: string;
  name: string;
  hijri: boolean;
  nextDate: string;
  daysLeft: number;
  prepareBy: string;
  /** ظهورنا في قوقل حول الموسم الماضي (٣ أسابيع قبله إلى ٣ أيام بعده) — null = Search Console غير متاح. */
  lastSeason: { date: string; impressions: number; clicks: number; topQueries: { query: string; impressions: number }[] } | null;
  articles: number;
};

const PREPARE_DAYS = 21; // قوقل يحتاج أسابيع ليفهرس ويرتّب — ثلاثة أسابيع قبل المناسبة
const DAY = 86400_000;

const hijriFmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", timeZone: "Asia/Riyadh" });
const hijri = (d: Date) => {
  const p = Object.fromEntries(hijriFmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { month: Number(p.month), day: Number(p.day) };
};
const riyadh = (d: Date) => new Date(d.getTime() + 3 * 3600_000); // اليوم بتوقيت الرياض
const onHijri = (month: number, day: number) => (d: Date) => {
  const h = hijri(d);
  return h.month === month && h.day === day;
};
const onGregorian = (month: number, day: number) => (d: Date) => {
  const r = riyadh(d);
  return r.getUTCMonth() + 1 === month && r.getUTCDate() === day;
};

const SEASONS: Season[] = [
  { key: "ramadan", name: "رمضان", isDay: onHijri(9, 1), hijri: true, gscRegex: "رمضان", titleWord: "رمضان" },
  { key: "fitr", name: "عيد الفطر", isDay: onHijri(10, 1), hijri: true, gscRegex: "عيد الفطر|العيد", titleWord: "عيد الفطر" },
  { key: "hajj", name: "الحج ويوم عرفة", isDay: onHijri(12, 9), hijri: true, gscRegex: "الحج|عرفة|عرفه", titleWord: "الحج" },
  { key: "adha", name: "عيد الأضحى", isDay: onHijri(12, 10), hijri: true, gscRegex: "الاضحى|الأضحى|الاضحي", titleWord: "الأضحى" },
  { key: "hijri-new-year", name: "رأس السنة الهجرية", isDay: onHijri(1, 1), hijri: true, gscRegex: "السنة الهجرية|السنه الهجريه|العام الهجري", titleWord: "الهجري" },
  { key: "founding", name: "يوم التأسيس", isDay: onGregorian(2, 22), hijri: false, gscRegex: "يوم التأسيس|يوم التاسيس", titleWord: "التأسيس" },
  { key: "flag", name: "يوم العلم", isDay: onGregorian(3, 11), hijri: false, gscRegex: "يوم العلم", titleWord: "يوم العلم" },
  { key: "national", name: "اليوم الوطني", isDay: onGregorian(9, 23), hijri: false, gscRegex: "اليوم الوطني|اليوم الوطنى", titleWord: "اليوم الوطني" },
  {
    // الجمعة التي تلي رابع خميس من نوفمبر — بين ٢٣ و٢٩ نوفمبر دائماً
    key: "white-friday",
    name: "الجمعة البيضاء",
    isDay: (d) => {
      const r = riyadh(d);
      return r.getUTCMonth() === 10 && r.getUTCDay() === 5 && r.getUTCDate() >= 23 && r.getUTCDate() <= 29;
    },
    hijri: false,
    gscRegex: "الجمعة البيضاء|الجمعه البيضاء|black friday|بلاك فرايدي",
    titleWord: "الجمعة البيضاء",
  },
];

/** أقرب يومٍ يطابق المناسبة، للأمام أو للخلف، خلال ٤٠٠ يوم. */
function find(s: Season, from: Date, step: 1 | -1): Date | null {
  for (let i = step === 1 ? 0 : 1; i <= 400; i++) {
    const d = new Date(from.getTime() + step * i * DAY);
    if (s.isDay(d)) return d;
  }
  return null;
}

const ymd = (d: Date) => riyadh(d).toISOString().slice(0, 10);

let gscCache: { at: number; data: Record<string, SeasonRow["lastSeason"]> } | null = null;
const GSC_TTL_MS = 6 * 3600_000;

async function lastSeasonGsc(s: Season, prev: Date): Promise<SeasonRow["lastSeason"]> {
  const res = await queryAnalytics({
    startDate: ymd(new Date(prev.getTime() - 21 * DAY)),
    endDate: ymd(new Date(prev.getTime() + 3 * DAY)),
    dimensions: ["query"],
    filters: [{ dimension: "query", operator: "includingRegex", expression: s.gscRegex }],
    rowLimit: 1000,
  });
  return {
    date: ymd(prev),
    impressions: res.rows.reduce((n, r) => n + r.impressions, 0),
    clicks: res.rows.reduce((n, r) => n + r.clicks, 0),
    topQueries: res.rows
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 5)
      .map((r) => ({ query: r.keys[0] ?? "", impressions: r.impressions })),
  };
}

export async function getSeasons(): Promise<SeasonRow[]> {
  const now = new Date();
  const dated = SEASONS.map((s) => ({ s, next: find(s, now, 1), prev: find(s, now, -1) })).filter(
    (x): x is { s: Season; next: Date; prev: Date | null } => !!x.next,
  );

  let gsc = gscCache && Date.now() - gscCache.at < GSC_TTL_MS ? gscCache.data : null;
  if (!gsc) {
    try {
      const entries = await Promise.all(dated.map(async ({ s, prev }) => [s.key, prev ? await lastSeasonGsc(s, prev) : null] as const));
      gsc = Object.fromEntries(entries);
      gscCache = { at: Date.now(), data: gsc };
    } catch (e) {
      console.error("[idea-bank] Search Console unavailable for seasons:", e);
    }
  }

  const counts = await Promise.all(
    dated.map(({ s }) => db.article.count({ where: { status: "PUBLISHED", title: { contains: s.titleWord } } })),
  );

  return dated
    .map(({ s, next }, i) => ({
      id: s.key,
      name: s.name,
      hijri: s.hijri,
      nextDate: next.toISOString(),
      daysLeft: Math.round((next.getTime() - now.getTime()) / DAY),
      prepareBy: new Date(next.getTime() - PREPARE_DAYS * DAY).toISOString(),
      lastSeason: gsc ? gsc[s.key] ?? null : null,
      articles: counts[i],
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);
}
