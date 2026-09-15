/**
 * رقم المبيعات ورابط واتساب — مصدرٌ واحد لكل صفحات البيمنت.
 *
 * كان يُقرأ ويُنظَّف في أربعة مواضع (`failed` · `success` · `error` · وكلٌّ بنصّه)، فصار
 * الرقم يظهر في ثلاثة ويغيب في رابع بلا سبب ظاهر. وهنا يُقرأ مرّة: ما لم يُضبط
 * المتغيّر لا يُرسم شيء — فلا زرّ «تواصل» يفتح محادثةً مع لا أحد.
 *
 * الرقم نفسه الذي يستعمله جبر سيو (`JbrSiteSettings.whatsappNumber` = 966541018020)،
 * فالمشتري يصل إلى نفس الفريق من المنصّتين.
 */
const RAW = process.env.NEXT_PUBLIC_SALES_WHATSAPP?.replace(/\D/g, "") ?? "";

export function salesWhatsapp(): { href: string; label: string } | null {
  if (RAW.length < 8) return null;
  return {
    href: `https://wa.me/${RAW}`,
    /* يُقرأ `+966 54 101 8020`: مجموعاتٌ يمسحها الإبهام على الجوّال، لا سلسلةٌ واحدة. */
    label: `+${RAW.slice(0, 3)} ${RAW.slice(3, 5)} ${RAW.slice(5, 8)} ${RAW.slice(8)}`,
  };
}

/** رابط واتساب برسالةٍ جاهزة — يوفّر على المشتري كتابة سياقه. */
export function salesWhatsappWithText(text: string): string | null {
  const wa = salesWhatsapp();
  return wa ? `${wa.href}?text=${encodeURIComponent(text)}` : null;
}
