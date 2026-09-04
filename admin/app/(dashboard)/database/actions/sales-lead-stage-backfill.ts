"use server";

import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * ترحيل صفوف العملاء المحتملين إلى الفانل الجديد.
 *
 * ── لماذا هذا الملف إلزاميّ لا تحسينيّ ──────────────────────────────────────────────────
 * `SalesLead.stage` حقلٌ **مطلوب**، والصفوف التي سبقته لا تحمله. وفي مونجو الحقل الغائب ليس
 * `null` — فبريزما ترمي عند قراءة حقلٍ مطلوب غائب («Field stage is required to return data»).
 * أي أن شاشة العملاء المحتملين **تنهار كاملةً** حتى يمرّ هذا الترحيل. ليس تنظيفاً مؤجَّلاً.
 *
 * ── لماذا `$runCommandRaw` لا بريزما ────────────────────────────────────────────────────
 * للسبب نفسه: بريزما لا تستطيع قراءة الصفّ لتصلحه. الأمر الخام يتخطّى طبقة التحقّق، وهو
 * المسار الرسمي المذكور في التوثيق لأوامر مونجو عدا `find`/`aggregate`.
 *
 * ── ماذا يفعل ───────────────────────────────────────────────────────────────────────────
 * ١. يشتقّ `stage` من `status` القديمة، ويغلّب `convertedClientId` عليها: صفٌّ تحوّل إلى عميل
 *    هو `WON` مهما قالت حالته المخزّنة — التحويل حدثٌ والحالة أثرٌ له.
 * ٢. ينقل عمود `notes` إلى أوّل صفّ متابعة. بدون هذه الخطوة يبقى الكلام المكتوب في النظام
 *    القديم في عمودٍ لم يعد يقرأه أحد — وهو التاريخ الوحيد لهؤلاء العملاء.
 *
 * تكراره لا يضرّ: كل خطوة مشروطة بغياب ما تكتبه.
 */

const COLLECTION = "sales_leads";

/** الخريطة من الحالات الثلاث القديمة إلى الفانل. */
const STAGE_FROM_STATUS: Record<string, string> = {
  PROSPECT: "NEW",
  ACTIVE: "CONTACTED",
  ARCHIVED: "LOST",
};

export interface SalesLeadBackfillStats {
  /** كل الصفوف في المجموعة. */
  total: number;
  /** صفوف بلا `stage` — هذه التي تُسقط الشاشة. */
  missingStage: number;
  /**
   * صفوف عندها كلامٌ في `notes`. **مرشَّح لا نتيجة**: لا يطرح منها ما نُقل فعلاً، لأن معرفة
   * ذلك تحتاج قراءة جدول المتابعة لكل صفّ — والتمريرة نفسها تتخطّى المنقول بشرطها الخاصّ.
   */
  notesPresent: number;
  /** صفوف المتابعة الموجودة الآن. */
  followUps: number;
}

/**
 * القراءة بأمر خام كذلك — `db.salesLead.count()` نفسها تمرّ بطبقة التحقّق، ولا يصحّ أن تكون
 * شاشةُ التشخيص أوّلَ ما ينكسر حين يكون هناك ما يُشخَّص.
 */
export async function getSalesLeadBackfillStats(): Promise<SalesLeadBackfillStats> {
  // `$runCommandRaw` تقبل `InputJsonObject` لا `Record<string, unknown>` — والفرق حقيقيّ
  // (الأولى ترفض `undefined` والدوالّ)، فيُمرَّر المرشِّح بنوعه الذي تقبله بدل توسيعه.
  const countWhere = async (filter: Prisma.InputJsonObject): Promise<number> => {
    const res = (await db.$runCommandRaw({ count: COLLECTION, query: filter })) as { n?: number };
    return res?.n ?? 0;
  };

  const [total, missingStage, notesPresent, followUps] = await Promise.all([
    countWhere({}),
    countWhere({ stage: { $exists: false } }),
    countWhere({ notes: { $nin: [null, ""] } }),
    db.$runCommandRaw({ count: "sales_lead_followups", query: {} }).then((r) => (r as { n?: number })?.n ?? 0),
  ]);

  return { total, missingStage, notesPresent, followUps };
}

export interface SalesLeadBackfillResult {
  stagesWritten: number;
  notesMigrated: number;
  /** صفوف بقيت بلا `stage` بعد التمريرة — فوق الصفر يعني أن الشاشة ستظلّ تنهار. */
  stillMissing: number;
}

export async function backfillSalesLeadStages(): Promise<SalesLeadBackfillResult> {
  // ① المرحلة. ترتيب التحديثات مقصود: الاشتقاق من الحالة أوّلاً، ثم `WON` فوقه — فالأخير
  //    يغلب، ولا يحتاج الشرط الأوّل أن يستثنيه.
  const updates = [
    ...Object.entries(STAGE_FROM_STATUS).map(([status, stage]) => ({
      q: { stage: { $exists: false }, status },
      u: { $set: { stage } },
      multi: true,
    })),
    // صفّ بلا `status` أصلاً — لا يُترك بلا مرحلة، وإلا بقي هو وحده يُسقط الاستعلام.
    { q: { stage: { $exists: false } }, u: { $set: { stage: "NEW" } }, multi: true },
    {
      q: { convertedClientId: { $nin: [null, ""] } },
      u: { $set: { stage: "WON" } },
      multi: true,
    },
  ];

  const res = (await db.$runCommandRaw({ update: COLLECTION, updates, ordered: true })) as {
    nModified?: number;
  };
  const stagesWritten = res?.nModified ?? 0;

  // ② الكلام القديم → أوّل صفّ متابعة. يقرأ ببريزما بأمان الآن: `stage` صار مكتوباً فوق.
  const withNotes = await db.salesLead.findMany({
    where: { notes: { not: null } },
    select: { id: true, notes: true, createdAt: true, createdById: true },
    take: 2000,
  });

  let notesMigrated = 0;
  for (const lead of withNotes) {
    const body = lead.notes?.trim();
    if (!body) continue;

    // شرط عدم التكرار: العميل الذي له صفّ متابعة منقول مسبقاً يُتخطّى، فتشغيلها مرّتين
    // لا ينشئ نسختين من نفس الكلام.
    const already = await db.salesLeadFollowUp.count({ where: { leadId: lead.id } });
    if (already > 0) continue;

    await db.salesLeadFollowUp.create({
      data: {
        leadId: lead.id,
        channel: "NOTE",
        // تاريخ إنشاء الصفّ لا اليوم: الكلام قيل وقتها، وتأريخه اليوم يكذب على السجلّ.
        happenedAt: lead.createdAt,
        body,
        nextActionAt: null,
        nextActionNote: null,
        doneAt: lead.createdAt,
        stageAfter: null,
        createdById: lead.createdById,
      },
    });
    notesMigrated++;
  }

  const after = (await db.$runCommandRaw({
    count: COLLECTION,
    query: { stage: { $exists: false } },
  })) as { n?: number };

  return { stagesWritten, notesMigrated, stillMissing: after?.n ?? 0 };
}
