"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { checkFinanceAdmin } from "@/lib/require-finance-admin";
import { logAction } from "@/lib/audit/log-action";
import { campaignSchema, marketDefaults, type CampaignInput } from "./helpers/campaign-schema";
import { nextCampaignCode } from "./helpers/next-campaign-code";

type Result =
  | { success: true; id: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/** مَن يسأل ← هل المدخل صحيح ← ثم القاعدة. الترتيب مقصود: التحقّق قبل الحارس يكشف شكل النموذج لمن لا يحقّ له بلوغه. */
async function gate(input: CampaignInput) {
  const auth = await requireAdmin();
  if ("error" in auth) return { fail: { success: false as const, error: auth.error } };

  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) {
    return {
      fail: {
        success: false as const,
        error: "راجع الحقول المعلّمة بالأحمر.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }
  return { data: parsed.data, userId: auth.userId };
}

function refresh(id?: string) {
  revalidatePath("/campaigns");
  if (id) revalidatePath(`/campaigns/${id}/edit`);
  revalidatePath("/sales-leads/new");
}

/**
 * بريفٌ جديد — يصل «بانتظار الموافقة» بكودٍ يُكتب في اسم حملة المنصّة. والوسم في الرابط هو
 * الكود نفسه، فالعميل الذي يصل من الإعلان يحمل رقم البريف الذي وُوفق عليه.
 */
export async function createCampaign(input: CampaignInput): Promise<Result> {
  const g = await gate(input);
  if (g.fail) return g.fail;

  const market = marketDefaults(g.data.countryCode);
  const code = await nextCampaignCode();
  try {
    const row = await db.adCampaign.create({
      data: {
        ...g.data,
        code,
        utmCampaign: code.toLowerCase(),
        currency: market.currency,
        approval: "PENDING",
        createdById: g.userId,
      },
      select: { id: true },
    });
    refresh();
    return { success: true, id: row.id };
  } catch {
    return { success: false, error: "تعذّر الحفظ. جرّب مرّة أخرى." };
  }
}

/**
 * تعديل البريف. ما وُوفق عليه يعود «بانتظار الموافقة» إن غيّر غيرُ الأدمن **ما وُوفق عليه**:
 * الهدف أو البريف أو السقف أو التكلفة المستهدفة. تعديل الاسم أو الملاحظة لا يُسقط الموافقة.
 */
export async function updateCampaign(id: string, input: CampaignInput): Promise<Result> {
  const g = await gate(input);
  if (g.fail) return g.fail;

  const before = await db.adCampaign.findUnique({
    where: { id },
    select: { approval: true, objective: true, brief: true, spendCap: true, targetCostPerLead: true },
  });
  if (!before) return { success: false, error: "الحملة غير موجودة." };

  const isAdmin = (await checkFinanceAdmin()).status === "ok";
  const termsChanged =
    before.objective !== g.data.objective ||
    (before.brief ?? "") !== g.data.brief ||
    before.spendCap !== g.data.spendCap ||
    (before.targetCostPerLead ?? null) !== (g.data.targetCostPerLead ?? null);
  const reopen = before.approval === "APPROVED" && termsChanged && !isAdmin;

  const market = marketDefaults(g.data.countryCode);
  try {
    await db.adCampaign.update({
      where: { id },
      data: {
        ...g.data,
        currency: market.currency,
        ...(reopen ? { approval: "PENDING" as const, decidedAt: null, approvedById: null, decisionNote: null } : {}),
      },
      select: { id: true },
    });
    refresh(id);
    return { success: true, id };
  } catch {
    return { success: false, error: "تعذّر الحفظ. جرّب مرّة أخرى." };
  }
}

/**
 * موافقة أو رفض — للأدمن وحده. الرفض يحتاج سبباً يقرؤه الميديا باير؛ والموافقة تجعل البريف
 * يظهر في فورم العميل المحتمل ويُحسب صرفه «معتمداً».
 */
export async function decideCampaign(id: string, decision: "APPROVED" | "REJECTED", note?: string): Promise<Result> {
  const gate = await checkFinanceAdmin();
  if (gate.status !== "ok") return { success: false, error: "الموافقة للأدمن وحده." };
  const auth = await requireAdmin();
  if ("error" in auth) return { success: false, error: auth.error };

  const text = note?.trim() ?? "";
  if (decision === "REJECTED" && text.length < 3) return { success: false, error: "اكتب سبب الرفض — يقرؤه الميديا باير." };

  const row = await db.adCampaign.findUnique({ where: { id }, select: { code: true, name: true, spendCap: true, currency: true } });
  if (!row) return { success: false, error: "الحملة غير موجودة." };

  await db.adCampaign.update({
    where: { id },
    data: {
      approval: decision,
      approvedById: auth.userId,
      decidedAt: new Date(),
      decisionNote: text || null,
      // `status` untouched (Khalid, 29 Sep 2026): a first approval finds DRAFT and lands in
      // «موافَق عليها»; re-approving an edited brief returns it to where it was — running or stopped.
    },
    select: { id: true },
  });
  await logAction("campaign.decide", {
    entity: "Campaign",
    entityId: id,
    summary: `${decision === "APPROVED" ? "موافقة على" : "رفض"} ${row.code ?? ""} ${row.name}${text ? ` — ${text}` : ""}`,
    metadata: { decision, spendCap: row.spendCap, currency: row.currency },
  });
  refresh(id);
  return { success: true, id };
}

/**
 * إيقاف الحملة أو إعادة تشغيلها — للأدمن وحده، ويُعكس متى شاء. الموقوفة لا يغطّي كودُها حملات ميتا:
 * أيّ حملةٍ تحمله وتبقى شغّالة تظهر تنبيهاً «شغّالة بعد الإيقاف». والتشغيل يجعلها `ACTIVE` —
 * «شغّالة»، أوّل مرّةٍ من «موافَق عليها» وبعدها من «موقوفة».
 */
export async function setCampaignRun(id: string, run: boolean): Promise<Result> {
  const gate = await checkFinanceAdmin();
  if (gate.status !== "ok") return { success: false, error: "الإيقاف والتشغيل للأدمن وحده." };

  const row = await db.adCampaign.findUnique({ where: { id }, select: { code: true, name: true, approval: true } });
  if (!row) return { success: false, error: "الحملة غير موجودة." };
  if (row.approval !== "APPROVED") return { success: false, error: "الإيقاف والتشغيل لحملةٍ موافَق عليها فقط." };

  await db.adCampaign.update({ where: { id }, data: { status: run ? "ACTIVE" : "PAUSED" }, select: { id: true } });
  await logAction(run ? "campaign.resume" : "campaign.stop", {
    entity: "Campaign",
    entityId: id,
    summary: `${run ? "تشغيل" : "إيقاف"} ${row.code ?? ""} ${row.name}`,
  });
  refresh(id);
  return { success: true, id };
}
