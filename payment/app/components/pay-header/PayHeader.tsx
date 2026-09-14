import { getSiteChrome } from "@/app/data/get-site-chrome";
import { ThemeToggle } from "../theme-toggle/ThemeToggle";
import { SocialRow } from "../social-row/SocialRow";

/**
 * ترويسة صفحة الباقات: شعارٌ وزرّ سمة، ولا شيء غيرهما.
 *
 * لا قائمة عمداً (خالد ١٤ سبتمبر ٢٠٢٦ سأل عن منيو، والجواب مقيس في صفحات البيع كلّها):
 * كل رابطٍ في ترويسة صفحة بيع هو مخرجٌ قبل الشراء. فالروابط نزلت إلى التذييل حيث
 * يصل إليها من يبحث عنها، ولا تعترض من جاء ليشتري.
 *
 * والشعار من الإعدادات لا من `public/`: يُبدَّل من شاشة الأدمن ويظهر هنا بلا نشر.
 */
export async function PayHeader({ showSocials = false }: { showSocials?: boolean } = {}) {
  const { siteName, logoUrl, socials } = await getSiteChrome();

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
          {showSocials ? <SocialRow socials={socials} /> : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
