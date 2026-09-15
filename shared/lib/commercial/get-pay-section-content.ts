import type { PrismaClient } from "@prisma/client";

/**
 * كلام صفحة البيع حول البطاقات لسوق واحد (PAY-G13).
 *
 * في `shared` لأن مستهلكيه اثنان: شاشة المعاينة في الأدمن، و`/pay` الحقيقية في `PAY-C2`.
 * ويرجع دائماً كائناً مكتملاً — صفٌّ غير موجود بعد يرجع بقيم فارغة لا `null`، كي لا يحمل
 * كل مستهلك حارسه الخاص، ولا تنكسر صفحة بيع لأن أحداً لم يفتح شاشة التحرير بعد.
 */

export interface PaySectionContent {
  market: string;
  announcement: string | null;
  headline: string | null;
  subheadline: string | null;
  trustItems: string[];
  vatNote: string | null;
  installmentLabel: string | null;
  refundNote: string | null;
  paymentFootnote: string | null;
  paymentFootnoteSub: string | null;
  /** أسماء من القائمة المغلقة — تُحوَّل إلى مسارات في `payMarkAsset`. */
  payMarks: string[];
  installmentMark: string | null;
  /** قسم الفريق على صفحة التصفّح — فارغين يسقطان على افتراضيّ المكوّن. */
  teamHeadline: string | null;
  teamSubheadline: string | null;
}

const EMPTY = {
  announcement: null, headline: null, subheadline: null, trustItems: [] as string[],
  vatNote: null, installmentLabel: null, refundNote: null,
  paymentFootnote: null, paymentFootnoteSub: null, payMarks: [] as string[], installmentMark: null,
  teamHeadline: null, teamSubheadline: null,
};

export async function getPaySectionContent(db: PrismaClient, market: string): Promise<PaySectionContent> {
  const row = await db.paySectionContent.findUnique({
    where: { market },
    select: {
      announcement: true, headline: true, subheadline: true, trustItems: true,
      vatNote: true, installmentLabel: true, refundNote: true,
      paymentFootnote: true, paymentFootnoteSub: true, payMarks: true, installmentMark: true,
      teamHeadline: true, teamSubheadline: true,
    },
  });
  return { market, ...(row ?? EMPTY) };
}
