const SALES_WHATSAPP = process.env.NEXT_PUBLIC_SALES_WHATSAPP || "966541018020";

// نصّ الواتساب يحمل اسم الموقع، فصار دالّةً تأخذه بدل ثابتٍ يقرأ `BRAND_AR`.
// وبغياب الاسم يُرسَل الرابط بلا نصّ — رسالةٌ تبدأ بـ«شفت قصة» ثم فراغ أسوأ من لا نصّ.
export const salesWhatsappUrl = (siteName?: string) =>
  siteName
    ? `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(`السلام عليكم، شفت قصة ${siteName} وعندي سؤال:`)}`
    : `https://wa.me/${SALES_WHATSAPP}`;
