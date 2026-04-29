import { db } from "@/lib/db";

export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export interface DeviceBreakdown {
  type: DeviceType;
  count: number;
  percentage: number;
}

export interface NewVsReturning {
  newVisitors: number;
  returningVisitors: number;
  total: number;
  newPercentage: number;
}

export interface DayOfWeekItem {
  day: number; // 0 = Sunday … 6 = Saturday (per JS Date.getDay)
  views: number;
  percentage: number;
}

export interface HourOfDayItem {
  hour: number; // 0..23
  views: number;
  percentage: number;
}

export interface InsightItem {
  id: string;
  tone: "positive" | "neutral" | "warning";
  title: string;
  detail: string;
}

function classifyUserAgent(ua: string | null | undefined): DeviceType {
  if (!ua) return "unknown";
  const s = ua.toLowerCase();
  if (/(ipad|tablet|playbook|silk|kindle)/.test(s)) return "tablet";
  if (/(mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini)/.test(s))
    return "mobile";
  if (/(mozilla|chrome|safari|firefox|edge|trident|opera)/.test(s)) return "desktop";
  return "unknown";
}

function sinceDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

/**
 * Derives device type for each Analytics record from the userAgent string.
 * Returns counts + percentages grouped by device.
 */
export async function getDeviceBreakdown(
  clientId: string,
  days: number
): Promise<DeviceBreakdown[]> {
  const rows = await db.analytics.findMany({
    where: { clientId, timestamp: { gte: sinceDate(days) } },
    select: { userAgent: true },
    take: 5000,
  });

  const counts: Record<DeviceType, number> = {
    mobile: 0,
    tablet: 0,
    desktop: 0,
    unknown: 0,
  };
  for (const r of rows) {
    counts[classifyUserAgent(r.userAgent)]++;
  }
  const total = rows.length;
  const order: DeviceType[] = ["mobile", "desktop", "tablet", "unknown"];
  return order
    .map((type) => ({
      type,
      count: counts[type],
      percentage: total > 0 ? (counts[type] / total) * 100 : 0,
    }))
    .filter((x) => x.count > 0);
}

/**
 * New vs returning visitors over the period.
 * "Returning" = a sessionId/userId with > 1 article view inside the window.
 */
export async function getNewVsReturning(
  clientId: string,
  days: number
): Promise<NewVsReturning> {
  const rows = await db.articleView.findMany({
    where: { article: { clientId }, createdAt: { gte: sinceDate(days) } },
    select: { sessionId: true, userId: true },
    take: 10000,
  });
  const counts = new Map<string, number>();
  for (const r of rows) {
    const k = r.userId ?? r.sessionId;
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  let newVisitors = 0;
  let returningVisitors = 0;
  for (const [, c] of counts) {
    if (c > 1) returningVisitors++;
    else newVisitors++;
  }
  const total = newVisitors + returningVisitors;
  return {
    newVisitors,
    returningVisitors,
    total,
    newPercentage: total > 0 ? (newVisitors / total) * 100 : 0,
  };
}

/**
 * Group views by day-of-week (0..6) in client local time.
 */
export async function getDayOfWeekPattern(
  clientId: string,
  days: number
): Promise<DayOfWeekItem[]> {
  const rows = await db.analytics.findMany({
    where: { clientId, timestamp: { gte: sinceDate(days) } },
    select: { timestamp: true },
    take: 10000,
  });
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const r of rows) counts[new Date(r.timestamp).getDay()]++;
  const total = rows.length;
  return counts.map((views, day) => ({
    day,
    views,
    percentage: total > 0 ? (views / total) * 100 : 0,
  }));
}

/**
 * Group views by hour-of-day (0..23).
 */
export async function getHourOfDayPattern(
  clientId: string,
  days: number
): Promise<HourOfDayItem[]> {
  const rows = await db.analytics.findMany({
    where: { clientId, timestamp: { gte: sinceDate(days) } },
    select: { timestamp: true },
    take: 10000,
  });
  const counts = new Array(24).fill(0) as number[];
  for (const r of rows) counts[new Date(r.timestamp).getHours()]++;
  const total = rows.length;
  return counts.map((views, hour) => ({
    hour,
    views,
    percentage: total > 0 ? (views / total) * 100 : 0,
  }));
}

const DAY_NAMES_AR = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

interface InsightInputs {
  device: DeviceBreakdown[];
  newVsReturning: NewVsReturning;
  dayPattern: DayOfWeekItem[];
  hourPattern: HourOfDayItem[];
  avgScrollDesktop?: number;
  avgScrollMobile?: number;
  bounceRate: number;
  scrollDepth: number;
  timeOnPage: number;
}

/**
 * Rule-based recommendations. Each rule reads the inputs and emits 0-1 insights
 * with a concrete, action-oriented message.
 */
export function buildInsights(inputs: InsightInputs): InsightItem[] {
  const out: InsightItem[] = [];

  // 1. Best day to publish
  if (inputs.dayPattern.length > 0) {
    const best = [...inputs.dayPattern].sort((a, b) => b.views - a.views)[0];
    if (best.views > 0) {
      out.push({
        id: "best-day",
        tone: "positive",
        title: `أفضل يوم للنشر: ${DAY_NAMES_AR[best.day]}`,
        detail: `${best.views} مشاهدة (${best.percentage.toFixed(0)}٪ من إجمالي المشاهدات).`,
      });
    }
  }

  // 2. Peak hour
  if (inputs.hourPattern.length > 0) {
    const peak = [...inputs.hourPattern].sort((a, b) => b.views - a.views)[0];
    if (peak.views > 0) {
      const ampm = peak.hour >= 12 ? "م" : "ص";
      const h12 = peak.hour % 12 === 0 ? 12 : peak.hour % 12;
      out.push({
        id: "peak-hour",
        tone: "positive",
        title: `وقت الذروة: ${h12}${ampm}`,
        detail: `جمهورك أكثر نشاطاً حول الساعة ${h12}${ampm}. حدّد إشعارات النشر قبل هذا الوقت بساعة.`,
      });
    }
  }

  // 3. Mobile-heavy audience
  const mobile = inputs.device.find((d) => d.type === "mobile");
  if (mobile && mobile.percentage > 65) {
    out.push({
      id: "mobile-heavy",
      tone: "neutral",
      title: "جمهورك على الموبايل بشكل أساسي",
      detail: `${mobile.percentage.toFixed(0)}٪ من القرّاء على الموبايل. اكتب فقرات قصيرة، عناوين فرعية واضحة، وصور خفيفة.`,
    });
  }

  // 4. Desktop-heavy audience
  const desktop = inputs.device.find((d) => d.type === "desktop");
  if (desktop && desktop.percentage > 65) {
    out.push({
      id: "desktop-heavy",
      tone: "neutral",
      title: "جمهورك على الديسكتوب",
      detail: `${desktop.percentage.toFixed(0)}٪ على ديسكتوب. تستحمل المقالات الطويلة + صور بدقة عالية.`,
    });
  }

  // 5. Returning visitor strength
  if (inputs.newVsReturning.total >= 10) {
    const returningPct =
      100 - inputs.newVsReturning.newPercentage;
    if (returningPct >= 30) {
      out.push({
        id: "loyal-readers",
        tone: "positive",
        title: "ولاء قوي من القرّاء",
        detail: `${returningPct.toFixed(0)}٪ من زوّارك راجعوا أكثر من مرة. شجّعهم على الاشتراك بالنشرة.`,
      });
    }
  }

  // 6. Bounce-rate flag
  if (inputs.bounceRate > 60) {
    out.push({
      id: "high-bounce",
      tone: "warning",
      title: "نسبة الارتداد مرتفعة",
      detail: `${inputs.bounceRate.toFixed(0)}٪ يغادرون فوراً. حسّن العناوين، السطور الأولى، أو سرعة الصفحة.`,
    });
  }

  // 7. Low scroll depth
  if (inputs.scrollDepth > 0 && inputs.scrollDepth < 30) {
    out.push({
      id: "shallow-scroll",
      tone: "warning",
      title: "القرّاء لا يكملون المقال",
      detail: `متوسط التمرير ${inputs.scrollDepth.toFixed(0)}٪. اختصر المقدمة، أو أضف عناوين فرعية تشد الانتباه.`,
    });
  }

  // 8. Strong time-on-page
  if (inputs.timeOnPage >= 60 && inputs.timeOnPage < 600) {
    const min = (inputs.timeOnPage / 60).toFixed(1);
    out.push({
      id: "strong-time",
      tone: "positive",
      title: "القرّاء يقضون وقتاً جيداً",
      detail: `متوسط الوقت ${min} دقيقة — مؤشر صحي. حافظ على عمق المحتوى.`,
    });
  }

  return out;
}
