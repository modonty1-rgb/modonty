"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { logAction } from "@/lib/audit/log-action";
import { findLeadByPhone } from "./helpers/find-lead-by-phone";
import { leadSchema, type LeadInput } from "./helpers/lead-schema";
import { resolveLeadDeal } from "./helpers/resolve-lead-deal";
import { followUpSchema, type FollowUpInput } from "./helpers/follow-up-schema";
import { syncLeadNextAction } from "./helpers/sync-lead-next-action";
import { isNoAnswer } from "./helpers/no-answer";

type Result =
  | { success: true; id: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Every write runs the same three steps in the same order: who is asking, is the input
 * valid, then the database. Checking the caller first matters — validating before it leaks
 * the shape of the form to someone who should not have reached it.
 */
type ParseFail = { fail: Extract<Result, { success: false }>; data?: undefined; userId?: undefined };
type ParseOk = { fail?: undefined; data: ReturnType<typeof leadSchema.parse>; userId: string };

/**
 * النوع مُعلَن صراحةً لا مستنتَجاً، والفحص `if (gate.fail)` لا `"fail" in gate`: الفرع الناجح
 * يحمل `fail?: undefined` كي يصحّ الوصول، و`in` ترى المفتاح معرَّفاً في الفرعين فلا تضيّق شيئاً.
 * أما الفحص على القيمة فيضيّق الاتحاد فعلاً.
 */
async function parse(input: LeadInput): Promise<ParseFail | ParseOk> {
  const gate = await requireAdmin();
  if ("error" in gate) return { fail: { success: false as const, error: gate.error } };

  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      fail: {
        success: false as const,
        error: "الحقول المعلّمة بالأحمر تحتاج مراجعة.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }
  return { data: parsed.data, userId: gate.userId };
}

/**
 * الحملة المُسندة للعميل: بريفٌ موافَقٌ عليه فقط — نفس شرط القائمة، على الخادم (خالد ٢٩ سبتمبر ٢٠٢٦).
 * القائمة تُخفي غير الموافَق؛ هذا يمنع من يرسل المعرّف بيده. و`keep` يُبقي ربطاً قائماً على عميلٍ
 * قديم وإن لم يكن بريفه موافَقاً (حملات ما قبل البريف) — حفظُ تعديلٍ آخر لا يمسح نسبته بصمت.
 */
async function resolveCampaign(id?: string | null, keep?: string | null): Promise<string | null> {
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) return null;
  if (keep && id === keep) return id;
  const found = await db.adCampaign.findFirst({ where: { id, approval: "APPROVED" }, select: { id: true } });
  return found?.id ?? null;
}

/**
 * An industry id that matches nothing means the dropdown and the database have drifted.
 * Writing it anyway leaves a row pointing at an industry that is not there — the orphan
 * that drops a whole query in Mongo, not just its own row.
 */
async function resolveIndustry(id?: string): Promise<string | null> {
  if (!id) return null;

  /**
   * ما ليس معرّفاً أصلاً لا يُسأل عنه.
   *
   * مونجو يرفض السلسلة قبل أن يبحث: `Malformed ObjectID … got: "__other__", length 9` —
   * استثناءٌ يبتلعه `catch` فيظهر «تعذّر الحفظ» بلا سبب. ظننتُ أن الدالّة تردّ `null` لما لا
   * تجده، وكتبتُ ذلك في تعليقٍ عند خيار «مجال تاني»، فأخذني ظنّي إلى حفظٍ يفشل صامتاً.
   * تُردّ `null` لغير الموجود، لا لغير الصالح — والفرق هو هذا الحارس.
   */
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return null;

  const found = await db.industry.findUnique({ where: { id }, select: { id: true } });
  return found?.id ?? null;
}

/** يُعاد بناء صفحتَي العميل معاً — الصفّ يظهر في الجدول وفي صفحته. */
function revalidateLead(id?: string) {
  revalidatePath("/sales-leads");
  if (id) revalidatePath(`/sales-leads/${id}`);
}

/**
 * The old `status` column is still mapped while the backfill is verified. Both are written
 * so a row saved today is correct under either reader — the deprecated one is dropped in a
 * separate pass, and until then a stale `status` would be a second, wrong answer.
 */
const STATUS_FROM_STAGE: Record<string, "PROSPECT" | "ACTIVE" | "ARCHIVED"> = {
  NEW: "PROSPECT",
  CONTACTED: "ACTIVE",
  QUOTED: "ACTIVE",
  NEGOTIATING: "ACTIVE",
  WON: "ACTIVE",
  LOST: "ARCHIVED",
};

export async function createLead(input: LeadInput): Promise<Result> {
  const gate = await parse(input);
  if (gate.fail) return gate.fail;
  const { data, userId } = gate;
  const { note, stage, nextActionAt, nextActionNote, ownerId, ...fields } = data;

  /**
   * رقمٌ مسجَّل من قبل يُمنع، والرسالة تسمّي صاحبه.
   *
   * مقيس قبل الإصلاح: حفظتُ «عيادة الأمل» برقم «دكتور محمد الشناوي» فمرّ بلا كلمة — صفّان
   * بنفس الجوّال. والمنع وحده لا يكفي: «الرقم مكرّر» تترك المندوبة تبحث، أما اسم صاحبه فينقلها
   * إليه مباشرةً — وهو ما تريده فعلاً حين يتّصل عميلٌ سجّلته زميلتها الأسبوع الماضي.
   */
  const clash = await findLeadByPhone(data.phone);
  if (clash) {
    return {
      success: false,
      error: `هذا الرقم مسجّل عند «${clash.name}»`,
      fieldErrors: { phone: [`مسجّل عند «${clash.name}»`] },
    };
  }

  // الباقة والمدّة والسعر من الكتالوج لا من الشاشة (٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد).
  const deal = await resolveLeadDeal(data);
  if (!deal.ok) return { success: false, error: "الصفقة تحتاج مراجعة — الباقة أو المدّة.", fieldErrors: deal.fieldErrors };

  try {
    const lead = await db.salesLead.create({
      data: {
        ...fields,
        ...deal.data,
        industryId: await resolveIndustry(data.industryId),
        campaignId: await resolveCampaign(data.campaignId),
        stage,
        status: STATUS_FROM_STAGE[stage] ?? "PROSPECT",
        // مَن سجّلته يتابعه، حتى تُنقل المسؤولية صراحةً. البديل — تركه فارغاً — يجعل العميل
        // بلا صاحب من لحظة إنشائه، وهذه أوّل طريقة يضيع بها.
        ownerId: ownerId ?? userId,
        createdById: userId,
      },
      select: { id: true },
    });

    /**
     * أوّل ما قيل في المكالمة يُكتب صفَّ متابعةٍ لا عموداً على العميل — فيبدأ السجلّ من
     * السطر الأوّل. والموعد يُكتب معه في نفس الصفّ لأنه نتاج نفس المكالمة.
     */
    if (note?.trim() || nextActionAt) {
      await db.salesLeadFollowUp.create({
        data: {
          leadId: lead.id,
          channel: "CALL",
          happenedAt: new Date(),
          body: note?.trim() || "أول تسجيل للعميل.",
          nextActionAt: nextActionAt ?? null,
          nextActionNote: nextActionNote ?? null,
          doneAt: null,
          stageAfter: stage,
          createdById: userId,
        },
      });
      await syncLeadNextAction(lead.id);
    }

    revalidateLead();
    return { success: true, id: lead.id };
  } catch {
    return { success: false, error: "ما قدرنا نحفظ. يُرجى المحاولة مرة ثانية." };
  }
}

/**
 * التعديل يمسّ بيانات العميل وحدها.
 *
 * لا يكتب `note` ولا الموعد: هذان يعيشان في جدول المتابعة الآن، ويُضافان بفعلهما. لو كتبهما
 * التعديل لأنشأ صفَّ سجلٍّ جديداً كلّما صُحّح رقم تليفون — وامتلأ تاريخ العميل بأحداث لم تقع.
 */
export async function updateLead(id: string, input: LeadInput): Promise<Result> {
  const gate = await parse(input);
  if (gate.fail) return gate.fail;
  const { data } = gate;
  const { note, stage, nextActionAt, nextActionNote, ownerId, ...fields } = data;

  // نفس الحارس، و`id` مستثنى: العميل لا يصطدم بنفسه حين يُحفظ بلا تغيير في رقمه.
  const clash = await findLeadByPhone(data.phone, id);
  if (clash) {
    return {
      success: false,
      error: `هذا الرقم مسجّل عند «${clash.name}»`,
      fieldErrors: { phone: [`مسجّل عند «${clash.name}»`] },
    };
  }

  const deal = await resolveLeadDeal(data);
  if (!deal.ok) return { success: false, error: "الصفقة تحتاج مراجعة — الباقة أو المدّة.", fieldErrors: deal.fieldErrors };
  const current = await db.salesLead.findUnique({ where: { id }, select: { campaignId: true } });

  try {
    await db.salesLead.update({
      where: { id },
      data: {
        ...fields,
        ...deal.data,
        industryId: await resolveIndustry(data.industryId),
        campaignId: await resolveCampaign(data.campaignId, current?.campaignId),
        stage,
        status: STATUS_FROM_STAGE[stage] ?? "PROSPECT",
        ownerId: ownerId ?? undefined,
      },
    });
    revalidateLead(id);
    return { success: true, id };
  } catch {
    return { success: false, error: "ما قدرنا نحفظ. يُرجى المحاولة مرة ثانية." };
  }
}

/**
 * ── الفعل الرئيسي في الشاشة ──────────────────────────────────────────────────────────────
 *
 * كل تواصل مع العميل يمرّ من هنا: يُكتب صفّاً في السجلّ، ويحرّك المرحلة إن تحرّكت، ويُقفل
 * الموعد الذي كان مستحقّاً — ثم يُعاد بناء الكاش على صفّ العميل من الجدول.
 *
 * إقفال المواعيد القديمة تلقائياً مقصود: المندوبة سجّلت أنها كلّمته، فالموعد الذي كان يقول
 * «كلّميه» تحقّق. مطالبتها بضغطة ثانية لإقفاله تعني أن نصف المواعيد ستبقى مفتوحة إلى الأبد
 * وقائمة «مَن عليّا النهارده» تمتلئ بما تمّ فعلاً.
 */
export async function addFollowUp(leadId: string, input: FollowUpInput): Promise<Result> {
  const gate = await requireAdmin();
  if ("error" in gate) return { success: false, error: gate.error };

  const parsed = followUpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "الحقول المعلّمة بالأحمر تحتاج مراجعة.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const d = parsed.data;

  const lead = await db.salesLead.findUnique({ where: { id: leadId }, select: { id: true, stage: true } });
  if (!lead) return { success: false, error: "العميل غير موجود." };

  /**
   * المرحلة تتحرّك وحدها (خالد ٢٨ سبتمبر ٢٠٢٦): أوّل تواصلٍ حقيقيّ مع «جديد» يجعله «تواصلنا» —
   * الملاحظة الداخليّة ليست تواصلاً. و«عرض سعر» اختيارٌ صريح (`stageAfter`)، ولا يرجع أحدٌ للخلف.
   */
  // «ما ردّ» is an attempt, not contact: the lead stays «جديد» (helpers/no-answer.ts).
  const nextStage =
    d.stageAfter ??
    (lead.stage === "NEW" && d.channel !== "NOTE" && !isNoAnswer(d.body) ? "CONTACTED" : undefined);

  try {
    // تُقرأ الصفوف ثم يُقفل المفتوح منها في الكود لا في `updateMany`: الشرط يقارن حقلاً
    // اختيارياً بـ`null`، وهو في مونجو غائبٌ لا فارغ — والمقارنة تسقط الصفوف بصمت.
    //
    // كل موعدٍ مفتوح يُقفل لا المستحقّ وحده (٢٨ سبتمبر ٢٠٢٦، اختبار ١٠ متابعات): آخر تسجيلٍ هو
    // الخطّة. كان موعد «بكرة» يبقى مفتوحاً بعد مكالمة اليوم «نكلّمه بعد أسبوع»، فيظهر العميل
    // غداً في «عليّ اليوم» والسطر يقول «بعد أسبوع».
    const open = await db.salesLeadFollowUp.findMany({
      where: { leadId },
      select: { id: true, nextActionAt: true, doneAt: true },
      take: 500,
    });
    // …except after an unanswered attempt with no new date: «ما ردّ» changes nothing about the
    // plan, so next week's call stays booked (measured 28 Sep 2026: «بعد ٧ أيام» → «بدون موعد»).
    const keepPlan = isNoAnswer(d.body) && !d.nextActionAt;
    const staleIds = keepPlan
      ? []
      : open.filter((r) => r.nextActionAt != null && r.doneAt == null).map((r) => r.id);
    if (staleIds.length) {
      await db.salesLeadFollowUp.updateMany({
        where: { id: { in: staleIds } },
        data: { doneAt: d.happenedAt },
      });
    }

    const row = await db.salesLeadFollowUp.create({
      data: {
        leadId,
        channel: d.channel,
        happenedAt: d.happenedAt,
        body: d.body,
        nextActionAt: d.nextActionAt ?? null,
        nextActionNote: d.nextActionNote ?? null,
        doneAt: null,
        stageAfter: nextStage ?? null,
        createdById: gate.userId,
      },
      select: { id: true },
    });

    if (nextStage) {
      await db.salesLead.update({
        where: { id: leadId },
        data: { stage: nextStage, status: STATUS_FROM_STAGE[nextStage] ?? "ACTIVE" },
      });
    }

    await syncLeadNextAction(leadId);
    revalidateLead(leadId);
    return { success: true, id: row.id };
  } catch {
    return { success: false, error: "ما قدرنا نسجّل المتابعة. يُرجى المحاولة مرة ثانية." };
  }
}

/** إقفال موعدٍ بلا تسجيل تواصل — «ده اتعمل خلاص» في ضغطة، بلا نموذج. */
export async function completeFollowUp(id: string): Promise<Result> {
  const gate = await requireAdmin();
  if ("error" in gate) return { success: false, error: gate.error };

  try {
    const row = await db.salesLeadFollowUp.update({
      where: { id },
      data: { doneAt: new Date() },
      select: { leadId: true },
    });
    await syncLeadNextAction(row.leadId);
    revalidateLead(row.leadId);
    return { success: true, id };
  } catch {
    return { success: false, error: "ما قدرنا نقفل الموعد. يُرجى المحاولة مرة ثانية." };
  }
}

/** تأجيل الموعد المفتوح — تؤجَّل المتابعة نفسها لا يُكتب موعد ثانٍ يزاحم الأوّل. */
export async function snoozeFollowUp(id: string, days: number): Promise<Result> {
  const gate = await requireAdmin();
  if ("error" in gate) return { success: false, error: gate.error };
  if (!Number.isFinite(days) || days < 1 || days > 365) {
    return { success: false, error: "عدد الأيام لازم يكون بين ١ و٣٦٥." };
  }

  try {
    const current = await db.salesLeadFollowUp.findUnique({
      where: { id },
      select: { leadId: true, nextActionAt: true },
    });
    if (!current) return { success: false, error: "الموعد غير موجود." };

    // يُحسب من اليوم لا من الموعد الفائت: تأجيل موعدٍ متأخر عشرة أيام «بكرة» يجب أن يعني
    // بكرة، لا بعد غدٍ بتسعة أيام.
    const base = new Date();
    base.setDate(base.getDate() + days);
    base.setHours(9, 0, 0, 0);

    await db.salesLeadFollowUp.update({ where: { id }, data: { nextActionAt: base } });
    await syncLeadNextAction(current.leadId);
    revalidateLead(current.leadId);
    return { success: true, id };
  } catch {
    return { success: false, error: "ما قدرنا نأجّل. يُرجى المحاولة مرة ثانية." };
  }
}

/** تحريك المرحلة وحدها — من البطاقة أو الجدول، بلا فتح نموذج المتابعة. */
/**
 * جودة العميل بعد أوّل تواصل — ضغطةٌ واحدة من المندوب (خالد ٢٩ سبتمبر ٢٠٢٦): مناسب · ضعيف · مو صالح.
 * هي ما يحكم به الميديا باير على بريفه: كم عميلاً «مناسباً» جاب، لا كم رقماً. `null` يمسحها.
 */
export async function setLeadQuality(id: string, quality: "GOOD" | "WEAK" | "INVALID" | null): Promise<Result> {
  const gate = await requireAdmin();
  if ("error" in gate) return { success: false, error: gate.error };
  if (quality !== null && !["GOOD", "WEAK", "INVALID"].includes(quality)) return { success: false, error: "قيمة غير معروفة." };
  try {
    await db.salesLead.update({
      where: { id },
      data: { quality, qualityAt: quality ? new Date() : null },
      select: { campaignId: true },
    });
    revalidateLead(id);
    revalidatePath("/campaigns");
    return { success: true, id };
  } catch {
    return { success: false, error: "ما قدرنا نحفظ. يُرجى المحاولة مرة ثانية." };
  }
}

export async function setLeadStage(
  id: string,
  stage: "NEW" | "CONTACTED" | "QUOTED" | "NEGOTIATING",
): Promise<Result> {
  const gate = await requireAdmin();
  if ("error" in gate) return { success: false, error: gate.error };
  try {
    await db.salesLead.update({
      where: { id },
      data: { stage, status: STATUS_FROM_STAGE[stage] ?? "ACTIVE" },
    });
    revalidateLead(id);
    return { success: true, id };
  } catch {
    return { success: false, error: "ما قدرنا نحدّث. يُرجى المحاولة مرة ثانية." };
  }
}

/**
 * **حذفُ العميل المحتمل نهائياً** — حلّ محلّ «خسرناه» (خالد ٢٨ سبتمبر ٢٠٢٦: «بدل خسرناه نعملها
 * حذف، لأن كل ما خسرناه هذا أساساً ما له داعي»).
 *
 * يُحذف الصفّ وسجلُّ متابعاته معاً. ويُرفض في حالتين لأنّ الصفّ فيهما ليس عميلاً محتملاً فقط:
 * - **صار عميلاً** (`convertedClientId`): هو السجلّ الوحيد لكيف وصل العميل (السكيما تنصّ عليه).
 * - **عليه طلبُ اشتراك** (`CheckoutOrder.leadId`): الطلبُ ماليّ ويشير إليه بلا علاقة، فحذفُه
 *   يترك طلباً يشير إلى لا شيء. يُلغى الطلب أوّلاً إن كان خطأً.
 * ويُكتب في سجلّ التدقيق مَن حذف مَن — الأثرُ الوحيد بعد أن يذهب الصفّ.
 */
export async function deleteLead(id: string): Promise<Result> {
  const gate = await requireAdmin();
  if ("error" in gate) return { success: false, error: gate.error };

  const lead = await db.salesLead.findUnique({
    where: { id },
    select: { id: true, name: true, phone: true, stage: true, convertedClientId: true },
  });
  if (!lead) return { success: false, error: "العميل المحتمل غير موجود — ربما حُذف." };
  if (lead.convertedClientId) {
    return { success: false, error: "صار عميلاً عندنا — لا يُحذف، فهو سجلّ كيف وصلنا." };
  }
  const order = await db.checkoutOrder.findFirst({ where: { leadId: id }, select: { number: true } });
  if (order) {
    return { success: false, error: `عليه طلب اشتراك ${order.number} — ألغي الطلب أوّلاً إن كان خطأً.` };
  }

  try {
    await db.$transaction([
      db.salesLeadFollowUp.deleteMany({ where: { leadId: id } }),
      db.salesLead.delete({ where: { id } }),
    ]);
    await logAction("lead.delete", {
      entity: "SalesLead",
      entityId: id,
      summary: `حُذف العميل المحتمل «${lead.name}»`,
      metadata: { name: lead.name, phone: lead.phone, stage: lead.stage },
    });
    revalidateLead();
    return { success: true, id };
  } catch {
    return { success: false, error: "ما قدرنا نحذفه. يُرجى المحاولة مرة ثانية." };
  }
}

/** إرجاع عميلٍ خسرناه إلى الفانل — الخسارة قرارٌ يُراجَع، لا حائط. */
export async function reopenLead(id: string): Promise<Result> {
  const gate = await requireAdmin();
  if ("error" in gate) return { success: false, error: gate.error };
  try {
    await db.salesLead.update({
      where: { id },
      data: { stage: "CONTACTED", status: "ACTIVE", lostReason: null, lostNote: null, lostAt: null },
    });
    revalidateLead(id);
    return { success: true, id };
  } catch {
    return { success: false, error: "ما قدرنا نرجّعه. يُرجى المحاولة مرة ثانية." };
  }
}

/**
 * **حُذفت `convertLeadToClient` (١٧ سبتمبر ٢٠٢٦).**
 *
 * كانت تسأل الموظّف «اختر الباقة» ثمّ تؤسّس الكرت مباشرةً — بابُ ميلادٍ ثالث بفلوسٍ
 * مكتوبةٍ باليد، لا طلبَ وراءها ولا مبلغَ مدفوع. وهي نفسُ النسخة الثانية التي
 * أسقطتها الورقة من شاشتَي الإنشاء والتعديل.
 *
 * والمسار الآن واحد: زرُّ «حوّله إلى عميل» يفتح `/orders/new?leadId=` — طلبٌ بمبلغٍ
 * حقيقيّ — ثمّ يُفعَّل بزرّ «فعّل» نفسه، فيُختَم `convertedClientId` من هناك
 * (`lib/orders/activate-from-order.ts`). مصدرٌ واحد للمال، ومَولدٌ واحد للعميل.
 */

