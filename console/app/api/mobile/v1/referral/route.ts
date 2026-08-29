import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { arabicRelativeTime } from "@/lib/mobile-api/arabic-format";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

type ReferralStatus = "NEW" | "CONTACTED" | "SUBSCRIBED" | "PAID" | "REWARDED" | "REJECTED" | "LOST";

const statusLabels: Record<ReferralStatus, string> = {
  NEW: "بانتظار التواصل",
  CONTACTED: "تم التواصل",
  SUBSCRIBED: "اشترك العميل",
  PAID: "تم السداد",
  REWARDED: "أضيف الشهر المجاني",
  REJECTED: "اعتذر العميل",
  LOST: "لم يكتمل الترشيح",
};

/**
 * القوسان اختياريان — لأن لوحة `phone-pad` على أندرويد لا تحتويهما.
 *
 * مقيس على جهاز الاختبار (SM-A217F): اللوحة تعرض `1-9 · 0 · * · # · , · +` **ولا قوس فيها**.
 * فالصيغة السابقة `(+20) 100 123 4567` كانت مفروضة على المستخدم وهو **لا يستطيع كتابتها**؛
 * كان الحقل يقبل ما لا يمكن إدخاله. الآن يُقبل ما تنتجه اللوحة فعلاً:
 *   `+20 100 123 4567` · `+201001234567` · وكذلك `(+20) 100 123 4567` لمن يلصقه.
 * المخرَج واحد دائماً: E.164.
 */
function parsePhone(value: string) {
  const match = /^\(?\s*(\+\d{1,3})\s*\)?[\s-]*(\d[\d\s-]*\d|\d)$/.exec(value.trim());
  if (!match) return null;
  const phoneE164 = `${match[1]}${match[2].replace(/[^\d]/g, "")}`;
  return /^\+[1-9]\d{7,14}$/.test(phoneE164) ? phoneE164 : null;
}

function maskPhone(phone: string) {
  return `${phone.slice(0, -4).replace(/\d/g, "•")}${phone.slice(-4)}`;
}

/**
 * Four tones, not seven colours.
 *
 * The seven statuses are a funnel with four meanings for the referrer: nothing has happened
 * yet · it is moving · you earned the reward · it ended. Before this, CONTACTED, SUBSCRIBED,
 * PAID and REWARDED all rendered in one colour, so a client watching their referral saw no
 * progress at all — four different milestones looked identical.
 */
const statusTones: Record<ReferralStatus, "waiting" | "progress" | "done" | "closed"> = {
  NEW: "waiting",
  CONTACTED: "progress",
  SUBSCRIBED: "progress",
  PAID: "progress",
  REWARDED: "done",
  REJECTED: "closed",
  LOST: "closed",
};

/** Which timestamp the CURRENT status was stamped with — «تم التواصل قبل ٣ أيام». */
function stageMoment(referral: { status: ReferralStatus; contactedAt: Date | null; subscribedAt: Date | null; paidAt: Date | null; rewardedAt: Date | null }) {
  if (referral.status === "REWARDED") return referral.rewardedAt;
  if (referral.status === "PAID") return referral.paidAt;
  if (referral.status === "SUBSCRIBED") return referral.subscribedAt;
  if (referral.status === "CONTACTED") return referral.contactedAt;
  return null;
}

type ReferralRow = {
  id: string; candidateName: string | null; candidateNote: string | null; phoneE164: string;
  status: ReferralStatus; createdAt: Date; closingNote: string | null;
  contactedAt: Date | null; subscribedAt: Date | null; paidAt: Date | null; rewardedAt: Date | null;
};

/** Shapes one row for the app. Formatting stays here — Hermes ships a partial `Intl`. */
function referralRecord(referral: ReferralRow, now: Date) {
  const moment = stageMoment(referral);
  return {
    id: referral.id,
    name: referral.candidateName?.trim() || maskPhone(referral.phoneE164),
    note: referral.candidateNote,
    statusLabel: statusLabels[referral.status],
    statusKey: referral.status,
    statusTone: statusTones[referral.status],
    // «متى تحرّكت» — الأختام كانت تُكتب في القاعدة ولا تصل الشاشة أبداً.
    stageAtLabel: moment === null ? null : arabicRelativeTime(moment, now),
    // سبب الرفض أو الانقطاع بخطّ الأدمن. كان مخزَّناً ومحجوباً عن صاحب الإحالة.
    closingNote: referral.status === "REJECTED" || referral.status === "LOST" ? referral.closingNote : null,
    // «متى أرسلتها» is what tells one referral from the next; the raw ISO never reached a screen.
    sentAtLabel: arabicRelativeTime(referral.createdAt, now),
    createdAt: referral.createdAt.toISOString(),
  };
}

async function referralsFor(clientId: string) {
  const now = new Date();
  const referrals = await db.referralLead.findMany({
    where: { referrerClientId: clientId },
    orderBy: { createdAt: "desc" },
    select: { id: true, candidateName: true, candidateNote: true, phoneE164: true, status: true, createdAt: true, closingNote: true, contactedAt: true, subscribedAt: true, paidAt: true, rewardedAt: true },
  });
  return referrals.map((referral) => referralRecord(referral, now));
}
export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");

  const referrals = await referralsFor(session.clientId);
  return ok({
    screenTitle: "الإحالة",
    backLabel: "رجوع إلى الرئيسية",
    sections: { how: "كيف تعمل الإحالة", add: "إضافة إحالة", mine: "إحالاتي" },
    title: "رشّح عميلاً واحصل على شهر مجاناً",
    description: "أرسل رقم العميل بعد أن تشرح له الخدمة، ونضيف الشهر تلقائياً بعد الاشتراك والسداد.",
    formTitle: "بيانات العميل المرشّح",
    nameLabel: "اسم العميل أو نشاطه",
    namePlaceholder: "مثال: مؤسسة نور الشام للتجميل",
    phoneLabel: "رقم جوال العميل",
    // لوحة الأرقام على أندرويد فيها `+` ولا قوس فيها — فالمثال يطلب ما يمكن كتابته.
    phonePlaceholder: "+20 100 123 4567",
    phoneFormatLabel: "ابدأ بعلامة + ثم مفتاح الدولة ثم الرقم.",
    noteLabel: "ملاحظة عن العميل (اختياري)",
    notePlaceholder: "مثال: يفضّل التواصل مساءً",
    consentLabel: "شرحت له خدمة مدونتي ووافق على التواصل",
    consentDescription: "سنستخدم الرقم للتواصل معه حول الخدمة فقط.",
    submitLabel: "إرسال بيانات العميل",
    // Names the blocker instead of leaving a dead button.
    submittingLabel: "يُرسل الترشيح…",
    submitSuccessLabel: "سُجّل الترشيح بنجاح.",
    stepsTitle: "كيف تحصل على الشهر المجاني؟",
    steps: ["ترسل رقم العميل", "نتواصل معه لشرح الخدمة", "بعد الاشتراك والسداد نضيف شهراً"],
    // «آخر ترشيح» was dropped: the «إحالاتي» section shows the same row at the top of a real
    // list, so a second card repeating it was one contract field with no consumer.
    referralsTitle: "إحالاتي",
    referralsEmptyTitle: "ما فيه ترشيحات مسجّلة بعد.",
    referralsEmptyDescription: "أضف أول إحالة ليتابع فريق مدونتي حالتها هنا.",
    referrals,
  });
}

export async function POST(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");

  let body: { candidateName?: unknown; candidateNote?: unknown; phone?: unknown; consent?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail("VALIDATION_ERROR", "بيانات الإحالة غير صحيحة.");
  }

  /**
   * The name is required HERE, not in the schema.
   *
   * `candidateName String?` stays optional in `schema.prisma` because tightening it needs
   * `prisma db push`, which this task forbids — and because rows created before this rule
   * legitimately have no name. The API is the gate; the column keeps its history.
   */
  const candidateName = typeof body.candidateName === "string" ? body.candidateName.trim() : "";
  if (candidateName.length === 0) return fail("VALIDATION_ERROR", "اكتب اسم العميل أو نشاطه.");

  const phoneE164 = typeof body.phone === "string" ? parsePhone(body.phone) : null;
  if (!phoneE164) return fail("VALIDATION_ERROR", "ابدأ الرقم بعلامة + ثم مفتاح الدولة، مثل +20 100 123 4567.");
  if (body.consent !== true) return fail("VALIDATION_ERROR", "أكّد أن صاحب الرقم موافق على التواصل.");

  const candidateNote = typeof body.candidateNote === "string" ? body.candidateNote.trim() || null : null;

  /**
   * Two guards, on purpose.
   *
   * The DATABASE is the real one: `referrerClientId_phoneE164_key` is unique, so two requests
   * racing in the same millisecond cannot both win — the loser surfaces as `P2002` in the
   * catch below (verified on `modonty_dev`: a direct duplicate insert is rejected with
   * `Unique constraint failed on the constraint: referrerClientId_phoneE164_key`).
   *
   * This read comes first only to give the CLIENT a clean 409 with an Arabic message instead
   * of a driver error. It is a courtesy, not the constraint.
   *
   * ⚠️ The index exists on `modonty_dev` because it was created there explicitly. Production
   * has never had `prisma db push` run for this model — until it does, only the read below
   * guards production, and it is not atomic.
   */
  const alreadySent = await db.referralLead.findFirst({
    where: { referrerClientId: session.clientId, phoneE164 },
    select: { id: true },
  });
  if (alreadySent) return fail("CONFLICT", "أرسلت هذا الرقم من قبل.");

  try {
    const referral = await db.referralLead.create({
      data: { referrerClientId: session.clientId, candidateName, candidateNote, phoneE164, consentConfirmedAt: new Date() },
      select: { id: true, candidateName: true, candidateNote: true, phoneE164: true, status: true, createdAt: true, closingNote: true, contactedAt: true, subscribedAt: true, paidAt: true, rewardedAt: true },
    });
    return ok({
      successLabel: "سُجّل الترشيح بنجاح.",
      lastReferral: referralRecord(referral, new Date()),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return fail("CONFLICT", "أرسلت هذا الرقم من قبل.");
    throw error;
  }
}
