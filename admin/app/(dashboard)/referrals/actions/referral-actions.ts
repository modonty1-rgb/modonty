"use server";

/**
 * إحالات العملاء — قراءة الجدول ونقل الحالة.
 *
 * الصفّ يصل من تطبيق الجوّال (`console/app/api/mobile/v1/referral/route.ts`)، ومن هنا
 * يتابعه الفريق: يتّصل، يسجّل الاشتراك، يمنح المكافأة. لا إنشاء هنا — المُحيل وحده ينشئ،
 * وصفٌّ يخلقه موظّف بلا موافقة مسجَّلة يخالف شرط الوجود في النموذج.
 */

import { revalidatePath } from "next/cache";
import { ReferralLeadStatus, Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { REVENUE_ORDER } from "@/lib/orders/revenue-order";
import { ALLOWED_NEXT, STATUS_AR, STATUS_STAMP } from "../helpers/referral-status";

/** الطلب المدفوع الذي يثبت «سدّد» — يُعرض رقمه وتاريخه بجانب الحالة. */
export interface ReferralPaidOrder {
  id: string;
  number: string;
  paidAt: Date | null;
}

interface ReferralLeadRef {
  id: string;
  convertedClientId: string | null;
  createdAt: Date;
}

/**
 * «سدّد» يثبته طلبٌ مدفوع للعميل الناتج، لا ضغطةُ موظّف: `PAID` وليس حساباً داخلياً
 * (REVENUE_ORDER — المستردّ خارج). ٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد.
 *
 * والدليلُ **أوّلُ** طلبٍ مدفوع للعميل، بشرط أن يكون بعد الإحالة: قائمةُ «اشترك» تعرض كلَّ
 * العملاء، فعميلٌ قديم دفع قبل أن يُحال لم تُنتجه الإحالة — وطلبُه القديم لا يفتح مكافأة.
 * `paidBefore` = إحالاتٌ عميلُها دفع قبلها، لتقول رسالةُ الرفض السببَ الصحيح.
 */
async function findReferralPaidOrders(
  leads: ReadonlyArray<ReferralLeadRef>,
): Promise<{ proof: Map<string, ReferralPaidOrder>; paidBefore: Set<string> }> {
  const proof = new Map<string, ReferralPaidOrder>();
  const paidBefore = new Set<string>();
  const clientIds = [
    ...new Set(leads.map((l) => l.convertedClientId).filter((id): id is string => Boolean(id))),
  ];
  if (clientIds.length === 0) return { proof, paidBefore };

  const orders = await db.checkoutOrder.findMany({
    where: { ...REVENUE_ORDER, clientId: { in: clientIds } },
    orderBy: { createdAt: "asc" },
    take: 1000,
    select: { id: true, number: true, paidAt: true, createdAt: true, clientId: true },
  });
  const paidTime = (o: { paidAt: Date | null; createdAt: Date }) => (o.paidAt ?? o.createdAt).getTime();
  const firstByClient = new Map<string, (typeof orders)[number]>();
  for (const o of orders) {
    if (!o.clientId) continue;
    const seen = firstByClient.get(o.clientId);
    if (!seen || paidTime(o) < paidTime(seen)) firstByClient.set(o.clientId, o);
  }

  for (const lead of leads) {
    const first = lead.convertedClientId ? firstByClient.get(lead.convertedClientId) : undefined;
    if (!first) continue;
    if (paidTime(first) < lead.createdAt.getTime()) paidBefore.add(lead.id);
    else proof.set(lead.id, { id: first.id, number: first.number, paidAt: first.paidAt });
  }
  return { proof, paidBefore };
}

export interface ReferralRow {
  id: string;
  candidateName: string | null;
  candidateNote: string | null;
  phoneE164: string;
  status: ReferralLeadStatus;
  referrerName: string;
  referrerId: string;
  convertedClientId: string | null;
  /** أوّل طلبٍ مدفوع للعميل الناتج بعد الإحالة — `null` = لا مال أنتجته، فلا «سدّد» ولا مكافأة. */
  paidOrder: ReferralPaidOrder | null;
  consentConfirmedAt: Date;
  contactedAt: Date | null;
  subscribedAt: Date | null;
  paidAt: Date | null;
  rewardedAt: Date | null;
  closingNote: string | null;
  createdAt: Date;
}

export async function getReferrals(): Promise<ReferralRow[]> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const rows = await db.referralLead.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true, candidateName: true, candidateNote: true, phoneE164: true,
      status: true, consentConfirmedAt: true, contactedAt: true, subscribedAt: true,
      paidAt: true, rewardedAt: true, closingNote: true, createdAt: true,
      convertedClientId: true,
      referrerClient: { select: { id: true, name: true } },
    },
  });

  const { proof: paidOrders } = await findReferralPaidOrders(rows);

  return rows.map((r) => ({
    id: r.id,
    candidateName: r.candidateName,
    candidateNote: r.candidateNote,
    phoneE164: r.phoneE164,
    status: r.status,
    referrerName: r.referrerClient?.name ?? "—",
    referrerId: r.referrerClient?.id ?? "",
    convertedClientId: r.convertedClientId,
    paidOrder: paidOrders.get(r.id) ?? null,
    consentConfirmedAt: r.consentConfirmedAt,
    contactedAt: r.contactedAt,
    subscribedAt: r.subscribedAt,
    paidAt: r.paidAt,
    rewardedAt: r.rewardedAt,
    closingNote: r.closingNote,
    createdAt: r.createdAt,
  }));
}

export interface ReferralStats {
  total: number;
  byStatus: Record<ReferralLeadStatus, number>;
}

export async function getReferralStats(): Promise<ReferralStats> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const grouped = await db.referralLead.groupBy({ by: ["status"], _count: true });
  const byStatus = Object.fromEntries(
    Object.values(ReferralLeadStatus).map((s) => [s, 0])
  ) as Record<ReferralLeadStatus, number>;
  let total = 0;
  for (const g of grouped) { byStatus[g.status] = g._count; total += g._count; }
  return { total, byStatus };
}

/** عملاء للاختيار منهم عند تسجيل «اشترك» — المُرشَّح صار عميلاً، وأيّهم؟ */
export async function getClientOptions(): Promise<Array<{ id: string; name: string }>> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const rows = await db.client.findMany({
    orderBy: { createdAt: "desc" },
    take: 400,
    select: { id: true, name: true },
  });
  return rows.map((c) => ({ id: c.id, name: c.name ?? "بلا اسم" }));
}

export interface TransitionInput {
  /** إلزامي مع «رفض» و«انقطع» — بلا سبب يصير التقرير أرقاماً بلا تفسير. */
  closingNote?: string;
  /**
   * إلزامي مع «اشترك». هذي الحلقة التي كانت مفقودة: بلا تسجيل العميل الناتج لا يعرف
   * `advanceReferralOnPayment` أيّ إحالة يخصّها السداد، فيبقى الربط ميتاً مهما كُتب.
   */
  convertedClientId?: string;
}

export interface TransitionResult {
  ok: boolean;
  error?: string;
}

export async function setReferralStatus(
  id: string,
  next: ReferralLeadStatus,
  input: TransitionInput = {}
): Promise<TransitionResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "غير مصرّح — سجّل الدخول." };

  const current = await db.referralLead.findUnique({
    where: { id },
    select: {
      status: true, contactedAt: true, subscribedAt: true, paidAt: true, rewardedAt: true,
      convertedClientId: true, createdAt: true,
    },
  });
  if (!current) return { ok: false, error: "الإحالة غير موجودة." };
  if (current.status === next) return { ok: false, error: "الإحالة في هذه الحالة أصلاً." };

  if (!ALLOWED_NEXT[current.status].includes(next)) {
    return { ok: false, error: `لا يمكن الانتقال من «${STATUS_AR[current.status]}» إلى «${STATUS_AR[next]}».` };
  }

  if (next === "SUBSCRIBED" && !input.convertedClientId) {
    return { ok: false, error: "اختر العميل الذي صار منه المُرشَّح — بلاه لا يُربط السداد بالإحالة." };
  }

  /**
   * «سدّد» والمكافأة بعده يشترطان طلباً مدفوعاً للعميل الناتج — يُفحص عند كليهما، فطلبٌ
   * استُرد بعد «سدّد» يوقف المكافأة. ٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد.
   */
  let paidOrder: ReferralPaidOrder | null = null;
  if (next === "PAID" || next === "REWARDED") {
    if (!current.convertedClientId) {
      return { ok: false, error: "الإحالة غير مربوطة بعميل — سجّل «اشترك» واختر العميل أوّلاً." };
    }
    const { proof, paidBefore } = await findReferralPaidOrders([
      { id, convertedClientId: current.convertedClientId, createdAt: current.createdAt },
    ]);
    paidOrder = proof.get(id) ?? null;
    if (!paidOrder) {
      return {
        ok: false,
        error: paidBefore.has(id)
          ? "هذا العميل دفع قبل تاريخ الإحالة — لم تُنتجه الإحالة، فلا «سدّد» ولا مكافأة."
          : next === "PAID"
            ? "لا يوجد طلبٌ مدفوع لهذا العميل — «سدّد» يثبته طلبٌ مدفوع في صفحة الطلبات، لا هذه الضغطة."
            : "لا يوجد طلبٌ مدفوع لهذا العميل الآن (ربما استُرد) — لا تُمنح المكافأة بلا مالٍ دخل.",
      };
    }
  }

  const data: Prisma.ReferralLeadUpdateInput = { status: next };
  if (input.convertedClientId) data.convertedClientId = input.convertedClientId;

  // الختم يُكتب مرّة واحدة. إعادة الدخول لنفس الحالة مستحيلة بالمسار أعلاه، لكن الحارس
  // يبقى: هو نفسه ما يمنع منح المكافأة مرّتين لو أُعيد استدعاء العملية.
  // وختم «سدّد» هو تاريخ دفع الطلب نفسه، لا يوم الضغطة.
  const field = STATUS_STAMP[next];
  if (field && current[field] === null) {
    data[field] = next === "PAID" && paidOrder?.paidAt ? paidOrder.paidAt : new Date();
  }

  const note = input.closingNote?.trim();
  if (note) data.closingNote = note;

  try {
    await db.referralLead.update({ where: { id }, data });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "تعذّر الحفظ." };
  }

  revalidatePath("/referrals");
  return { ok: true };
}
