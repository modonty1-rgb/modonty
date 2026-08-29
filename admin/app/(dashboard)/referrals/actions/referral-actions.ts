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
import { ALLOWED_NEXT, STATUS_AR, STATUS_STAMP } from "../helpers/referral-status";

export interface ReferralRow {
  id: string;
  candidateName: string | null;
  candidateNote: string | null;
  phoneE164: string;
  status: ReferralLeadStatus;
  referrerName: string;
  referrerId: string;
  convertedClientId: string | null;
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

  return rows.map((r) => ({
    id: r.id,
    candidateName: r.candidateName,
    candidateNote: r.candidateNote,
    phoneE164: r.phoneE164,
    status: r.status,
    referrerName: r.referrerClient?.name ?? "—",
    referrerId: r.referrerClient?.id ?? "",
    convertedClientId: r.convertedClientId,
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
    select: { status: true, contactedAt: true, subscribedAt: true, paidAt: true, rewardedAt: true },
  });
  if (!current) return { ok: false, error: "الإحالة غير موجودة." };
  if (current.status === next) return { ok: false, error: "الإحالة في هذه الحالة أصلاً." };

  if (!ALLOWED_NEXT[current.status].includes(next)) {
    return { ok: false, error: `لا يمكن الانتقال من «${STATUS_AR[current.status]}» إلى «${STATUS_AR[next]}».` };
  }

  if (next === "SUBSCRIBED" && !input.convertedClientId) {
    return { ok: false, error: "اختر العميل الذي صار منه المُرشَّح — بلاه لا يُربط السداد بالإحالة." };
  }

  const data: Prisma.ReferralLeadUpdateInput = { status: next };
  if (input.convertedClientId) data.convertedClientId = input.convertedClientId;

  // الختم يُكتب مرّة واحدة. إعادة الدخول لنفس الحالة مستحيلة بالمسار أعلاه، لكن الحارس
  // يبقى: هو نفسه ما يمنع منح المكافأة مرّتين لو أُعيد استدعاء العملية.
  const field = STATUS_STAMP[next];
  if (field && current[field] === null) data[field] = new Date();

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
