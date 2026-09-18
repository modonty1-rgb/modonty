import { db } from "@/lib/db";

/**
 * رقم المبيعات ورابط واتساب — مصدرٌ واحد لكل صفحات البيمنت.
 *
 * كان يُقرأ ويُنظَّف في أربعة مواضع (`failed` · `success` · `error` · وكلٌّ بنصّه)، فصار
 * الرقم يظهر في ثلاثة ويغيب في رابع بلا سبب ظاهر. وهنا يُقرأ مرّة: ما لم يُضبط
 * الرقم لا يُرسم شيء — فلا زرّ «تواصل» يفتح محادثةً مع لا أحد.
 *
 * **ومصدرُه الإعدادات لا متغيّرُ بيئة** (خالد ١٨ سبتمبر ٢٠٢٦: «رقم المبيعات والإيميل هو
 * نفسه اللي المفروض نستخدمه في الريڤيو تبع البنك»). و`NEXT_PUBLIC_SALES_WHATSAPP`
 * يُخبز في البناء: تغييرُه يحتاج نشرةً جديدة، والرقمُ القديم يبقى معروضاً للمشترين
 * حتى تمرّ. و`Settings.salesPhone` هو نفسُه الذي تطبعه الفاتورة، فيصل المشتري إلى
 * نفس الجهة من المستند ومن الشاشة.
 *
 * ويبقى المتغيّرُ احتياطاً أخيراً: قاعدةٌ لم تُملأ بعد خيرٌ من زرٍّ مفقود.
 */
const ENV_FALLBACK = process.env.NEXT_PUBLIC_SALES_WHATSAPP?.replace(/\D/g, "") ?? "";

export interface SalesContact {
  href: string;
  label: string;
}

async function salesDigits(): Promise<string> {
  try {
    const s = await db.settings.findUnique({
      where: { singletonKey: "global" },
      select: { salesPhone: true, orgContactTelephone: true },
    });
    const raw = s?.salesPhone?.trim() || s?.orgContactTelephone?.trim() || "";
    const digits = raw.replace(/\D/g, "");
    return digits.length >= 8 ? digits : ENV_FALLBACK;
  } catch {
    // صفحةُ دفعٍ لا تسقط لأنّ الإعدادات تعذّرت — الرقمُ زينةٌ على الصفحة لا شرطُ عملها.
    return ENV_FALLBACK;
  }
}

export async function salesWhatsapp(): Promise<SalesContact | null> {
  const digits = await salesDigits();
  if (digits.length < 8) return null;
  return {
    href: `https://wa.me/${digits}`,
    /* يُقرأ `+966 54 101 8020`: مجموعاتٌ يمسحها الإبهام على الجوّال، لا سلسلةٌ واحدة. */
    label: `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`,
  };
}

/** رابط واتساب برسالةٍ جاهزة — يوفّر على المشتري كتابة سياقه. */
export async function salesWhatsappWithText(text: string): Promise<string | null> {
  const wa = await salesWhatsapp();
  return wa ? `${wa.href}?text=${encodeURIComponent(text)}` : null;
}
