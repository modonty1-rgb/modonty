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

  const [total, rows] = await Promise.all([
    db.salesLeadFollowUp.count({ where }),
    db.salesLeadFollowUp.findMany({
      where,
      orderBy: { nextActionAt: "asc" },
      take: CEILING,
      select: {
        id: true,
        leadId: true,
        channel: true,
        body: true,
        happenedAt: true,
        nextActionAt: true,
        nextActionNote: true,
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
      },
    }),
  ]);

  const shaped: DueRow[] = rows
    // `lead` قد يغيب لو حُذف العميل من خارج التطبيق — الكاسكيد على مونجو محاكاةٌ في العميل
    // ولا تسري على Compass. الصفّ اليتيم يُتخطّى بدل أن يُسقط الشاشة كلها.
    .filter((r) => r.lead != null && r.nextActionAt != null)
    .map((r) => ({
      id: r.id,
      leadId: r.leadId,
      leadName: r.lead!.name,
      company: r.lead!.company,
      phone: r.lead!.phone,
      countryCode: r.lead!.countryCode,
      stage: r.lead!.stage as Stage,
      channel: r.channel,
      body: r.body,
      happenedAt: r.happenedAt,
      nextActionAt: r.nextActionAt!,
      nextActionNote: r.nextActionNote,
      ownerName: r.lead!.owner?.name ?? r.lead!.createdBy?.name ?? null,
    }));

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return {
    overdue: shaped.filter((r) => r.nextActionAt < startOfToday),
    today: shaped.filter((r) => r.nextActionAt >= startOfToday && r.nextActionAt <= endOfToday),
    upcoming: shaped.filter((r) => r.nextActionAt > endOfToday),
    total,
    truncated: total > rows.length,
  };
}
