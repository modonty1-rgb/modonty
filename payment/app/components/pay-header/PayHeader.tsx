import { Whatsapp } from "@modonty/shared/components/icons/whatsapp";

import { getSiteChrome } from "@/app/data/get-site-chrome";
import { ThemeToggle } from "../theme-toggle/ThemeToggle";
import { salesWhatsapp } from "@/lib/sales-whatsapp";

/**
 * ترويسة صفحة الباقات: شعارٌ وزرّ سمة، ولا شيء غيرهما.
 *
 * لا قائمة عمداً (خالد ١٤ سبتمبر ٢٠٢٦ سأل عن منيو، والجواب مقيس في صفحات البيع كلّها):
 * كل رابطٍ في ترويسة صفحة بيع هو مخرجٌ قبل الشراء. فالروابط نزلت إلى التذييل حيث
 * يصل إليها من يبحث عنها، ولا تعترض من جاء ليشتري.
 *
 * والشعار من الإعدادات لا من `public/`: يُبدَّل من شاشة الأدمن ويظهر هنا بلا نشر.
 */
/**
 * ⚠ بلا حسابات التواصل (خالد ١٥ سبتمبر ٢٠٢٦): نزلت إلى التذييل.
 * في الترويسة خمسة مخارج قبل أن يرى الزائر سعراً — ومن يفتح إنستقرامك من صفحة بيع نادراً
 * ما يعود. وفي التذييل تصير دليل وجودٍ لمن قرأ ولم يقرّر، وهو نفس منطق روابط العقد
 * والشروط. والواتساب وحده يبقى هنا لأنه **يُدخل** لا يُخرج.
 */
export async function PayHeader() {
  const { siteName, logoUrl } = await getSiteChrome();
  const wa = salesWhatsapp();

  return (
    <header className="border-b border-border/60 bg-card/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* الشعار يرجع إلى الأوفرفيو لا يخرج إلى `modonty.com` (خالد ١٤ سبتمبر ٢٠٢٦):
            كان آخر رابطٍ يخرج المشتري من صفحة الباقات — وقيس حيّاً: عشرة روابط في الصفحة
            تسعة منها شراء، وهذا العاشر وحده يغادر النطاق. */}
        <a
          href="/"
          aria-label={`${siteName ?? "مدونتي"} — الصفحة الرئيسية`}
          className="-mr-2 inline-flex h-11 items-center rounded-md px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
        >
          {logoUrl ? (
            // `img` لا `next/image`: الشعار من CDN خارجي، وتمريره على مُحسِّن الصور يضيف
            // نطاقاً في الإعداد ونداءً في كل طلب مقابل صورةٍ حجمها كيلوبايتات.
            <img src={logoUrl} alt={siteName ?? "مدونتي"} className="h-7 w-auto" />
          ) : (
            <span className="text-[17px] font-extrabold text-foreground">{siteName ?? "مدونتي"}</span>
          )}
        </a>
        {/* الحسابات في الأوفرفيو وحدها: هناك تعريفٌ بالمنصّة، وفي صفحة الباقات مخرجٌ
            قبل الشراء. */}
        <div className="flex items-center gap-1">
          {/* رقم المبيعات في الترويسة: المشتري المتردّد يريد إنساناً قبل أن يقرأ سعراً،
              والرقم ظاهرٌ يقول «خلفه أحد». ولا يُرسم إن لم يُضبط المتغيّر — زرٌّ يفتح
              محادثةً مع لا أحد أسوأ من غيابه. والنصّ يُخفى تحت `sm` ويبقى الأيقونة. */}
          {wa ? (
            <a
              href={wa.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`تواصل على واتساب ${wa.label}`}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl px-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
            >
              <Whatsapp className="size-[17px]" aria-hidden />
              <span dir="ltr" className="hidden text-[12.5px] font-medium tabular-nums sm:inline">{wa.label}</span>
            </a>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
