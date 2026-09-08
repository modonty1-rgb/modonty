import "server-only";

import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import type { Stage } from "./funnel";

export interface DueRow {
  id: string;
  leadId: string;
  leadName: string;
  company: string | null;
  phone: string | null;
  /** لازمٌ لبناء رابط واتساب الدوليّ — الرقم المحلّي وحده لا يفتح محادثة. */
  countryCode: string | null;
  stage: Stage;
  channel: string;
  body: string;
  happenedAt: Date;
  nextActionAt: Date;
  nextActionNote: string | null;
  ownerName: string | null;
}

/**
 * أحداث تايملاين العميل. الموعد اختياري لأن المتابعة تُسجَّل حتى إن لم يتفق الطرفان على موعد
 * تالٍ؛ إخفاؤها من التايملاين يمحو سياق المكالمة التالية.
 */
export interface FollowUpTimelineRow extends Omit<DueRow, "nextActionAt"> {
  nextActionAt: Date | null;
  doneAt: Date | null;
}

const CEILING = 500;

/**
 * كل المواعيد المفتوحة عبر العملاء كلهم — قائمة «المتابعة» التي طلبها خالد (٤ سبتمبر).
 *
 * تُقرأ من جدول المتابعة لا من صفّ العميل: صفّ العميل يحمل **نسخةً** من الموعد الأقرب وحده،
 * وهي تكفي لعمودٍ في جدول، لا لشاشةٍ تعرض ما قيل في المكالمة التي أنتجت الموعد.
 *
 * `WON` و`LOST` مستبعدان من القاعدة: عميلٌ أُقفل لا يُطالَب بمكالمة. والاستبعاد في الاستعلام
 * لا بعده، وإلّا أكل السقفُ المواعيدَ المفتوحة لصالح صفوفٍ مقفلة.
 */
export async function getDueFollowUps(): Promise<{
  overdue: DueRow[];
  today: DueRow[];
  upcoming: DueRow[];
  historyByLead: Record<string, FollowUpTimelineRow[]>;
  total: number;
  truncated: boolean;
}> {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const where = {
    // `$ne: null` في مونجو يستبعد الغائب كذلك، لكن الشرط مكتوبٌ صراحةً لا مستنتَجاً.
    nextActionAt: { not: null },
    // الغياب والفراغ معاً: الحقل يُكتب صراحةً في كل مسار من مساراتنا، لكن `OR` تكلفتها صفر
    // وتحمي من أي صفٍّ يدخل من مكانٍ آخر لاحقاً.
    OR: [{ doneAt: null }, { doneAt: { isSet: false } }],
    // مصفوفة قابلة للتعديل لا `as const`: نوع بريزما لـ`notIn` هو `SalesStage[]`، ولا يقبل
    // `readonly`. والوسم يبقى على النوع لا على الثبات.
    lead: { is: { stage: { notIn: ["WON", "LOST"] satisfies Stage[] } } },
  } satisfies Prisma.SalesLeadFollowUpWhereInput;

  const followUpSelect = {
    id: true,
    leadId: true,
    channel: true,
    body: true,
    happenedAt: true,
    nextActionAt: true,
    nextActionNote: true,
    doneAt: true,
    lead: {
      select: {
        name: true,
        company: true,
        phone: true,
        countryCode: true,
        stage: true,
        owner: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    },
  } as const;

  const [total, rows] = await Promise.all([
    db.salesLeadFollowUp.count({ where }),
    db.salesLeadFollowUp.findMany({
      where,
      orderBy: { nextActionAt: "asc" },
      take: CEILING,
      select: followUpSelect,
    }),
  ]);

  const shape = (r: (typeof rows)[number]): FollowUpTimelineRow | null => {
    // `lead` قد يغيب لو حُذف العميل من خارج التطبيق — الكاسكيد على مونجو محاكاةٌ في العميل
    // ولا تسري على Compass. الصفّ اليتيم يُتخطّى بدل أن يُسقط الشاشة كلها.
    if (!r.lead) return null;
    return {
      id: r.id,
      leadId: r.leadId,
      leadName: r.lead.name,
      company: r.lead.company,
      phone: r.lead.phone,
      countryCode: r.lead.countryCode,
      stage: r.lead.stage as Stage,
      channel: r.channel,
      body: r.body,
      happenedAt: r.happenedAt,
      nextActionAt: r.nextActionAt,
      nextActionNote: r.nextActionNote,
      doneAt: r.doneAt,
      ownerName: r.lead.owner?.name ?? r.lead.createdBy?.name ?? null,
    };
  };

  const shaped: DueRow[] = rows
    // `lead` قد يغيب لو حُذف العميل من خارج التطبيق — الكاسكيد على مونجو محاكاةٌ في العميل
    // ولا تسري على Compass. الصفّ اليتيم يُتخطّى بدل أن يُسقط الشاشة كلها.
    .filter((r) => r.lead != null && r.nextActionAt != null)
    .map(shape)
    .filter((r): r is FollowUpTimelineRow & { nextActionAt: Date } => r !== null && r.nextActionAt !== null);

  const leadIds = [...new Set(shaped.map((r) => r.leadId))];
  const historyRows = leadIds.length === 0
    ? []
    : await db.salesLeadFollowUp.findMany({
        where: { leadId: { in: leadIds } },
        orderBy: { happenedAt: "desc" },
        select: followUpSelect,
      });
  const historyByLead: Record<string, FollowUpTimelineRow[]> = {};
  for (const row of historyRows) {
    const item = shape(row as (typeof rows)[number]);
    if (!item) continue;
    const history = (historyByLead[item.leadId] ??= []);
    // بعض الصفوف القديمة دخلت مكررة أثناء ترحيل البيانات؛ المعرف هو الحقيقة لا ترتيب القراءة.
    if (!history.some((existing) => existing.id === item.id)) history.push(item);
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return {
    overdue: shaped.filter((r) => r.nextActionAt < startOfToday),
    today: shaped.filter((r) => r.nextActionAt >= startOfToday && r.nextActionAt <= endOfToday),
    upcoming: shaped.filter((r) => r.nextActionAt > endOfToday),
    historyByLead,
    total,
    truncated: total > rows.length,
  };
}
