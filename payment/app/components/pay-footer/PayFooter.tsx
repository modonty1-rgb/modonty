
import { modontyUrl } from "@/lib/modonty-url";
import { getSiteChrome } from "@/app/data/get-site-chrome";

/**
 * تذييل الأوفرفيو والعقد: الروابط التي يبحث عنها المتردّد.
 *
 * ولا وجود له في صفحة الباقات (خالد ١٤ سبتمبر ٢٠٢٦: «أي تشتيت في صفحة الباقات ما له
 * داعي») — كل رابطٍ هناك مخرجٌ قبل الشراء. ومكانه هنا الأسفل لا الأعلى: في آخر الصفحة
 * يصير طمأنينةً لمن قرأ ولم يقرّر، وفي أوّلها يصير مخرجاً قبل أن يبدأ.
 *
 * والحسابات لم تعد فيه — انتقلت إلى ترويسة الأوفرفيو (`SocialRow`) في نفس اليوم.
 */
export async function PayFooter() {
  const { siteName } = await getSiteChrome();

  return (
    <footer className="mt-14 border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <nav aria-label="روابط مدونتي" className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-[13px]">
          {[
            // القياس الحيّ (١٤ سبتمبر ٢٠٢٦): /news · /terms · /contact ⇒ ٢٠٠،
            // و/privacy و/refund-policy ⇒ ٤٠٤. فالخصوصية تحت /legal، ولا صفحة
            // استرداد في مدونتي أصلاً — فلا يُوضع رابطٌ إليها ليقود إلى ٤٠٤.
            { label: "نموذج العقد", href: "/sa/contract" },
            { label: "أخبار مدونتي", href: modontyUrl("/news") },
            { label: "الشروط والأحكام", href: modontyUrl("/terms") },
            { label: "اتفاقية الاستخدام", href: modontyUrl("/legal/user-agreement") },
            { label: "سياسة الخصوصية", href: modontyUrl("/legal/privacy-policy") },
            { label: "موثوقية مدونتي", href: modontyUrl("/trust") },
            { label: "تواصل معنا", href: modontyUrl("/contact") },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              {...(l.href.startsWith("/") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              className="inline-flex h-11 items-center rounded-md px-3 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <p className="mt-5 text-center text-[11.5px] leading-relaxed text-muted-foreground/80">
          {/* بلا سنة (خالد ١٤ سبتمبر ٢٠٢٦): `new Date()` يرفضه `cacheComponents` عند
              التقديم المسبق، فيُخرج الأوفرفيو من السكون — والتذييل في كل صفحة. والسنة
              لا تضيف حقّاً ولا تُسقطه، فحذفها أرخص من كاشٍ يحرسها. */}
          © {siteName ?? "مدونتي"} — جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
