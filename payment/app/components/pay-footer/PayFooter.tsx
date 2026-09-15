
import { modontyUrl } from "@/lib/modonty-url";
import { getSiteChrome } from "@/app/data/get-site-chrome";
import { getSellerLegal } from "@/app/data/get-seller-legal";
import { salesWhatsapp } from "@/lib/sales-whatsapp";
import { SocialRow } from "../social-row/SocialRow";

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
  const [{ siteName, socials }, legal] = await Promise.all([getSiteChrome(), getSellerLegal()]);
  const wa = salesWhatsapp();

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

        {/* الحسابات هنا لا في الترويسة (خالد ١٥ سبتمبر ٢٠٢٦): في الأعلى مخرجٌ قبل أن
            يرى الزائر سعراً، وفي الأسفل دليل وجودٍ لمن قرأ ولم يقرّر. */}
        <div className="mt-2 flex justify-center">
          <SocialRow socials={socials} />
        </div>

        {/* `min-h-11` على البريد والهاتفين (قياس ١٥ سبتمبر ٢٠٢٦: ارتفاعها كان ١٧px).
            الاستثناء في WCAG 2.5.8 يعفي الروابط **داخل جملة** — وهذه ليست كذلك: الهاتف
            والواتساب يُضغطان بالإبهام على الجوّال لا يُقرآن، فيؤخذان بحدّ الهدف لا بحدّ
            النصّ. والارتفاع وحده يكفي — `inline-flex` يمدّد منطقة اللمس بلا أن يزيح السطر. */}
        {/* السجلّ النظاميّ للمنشأة — من نفس القارئ الذي تقرأ به الفاتورة الضريبية ونموذج
            العقد (`getSellerLegal`)، فلا يختلف ما في التذييل عمّا في العقد الذي يوقّعه
            المشتري بالدفع. ومصدره `Settings` فيُصحَّح من شاشة بيانات المنشأة بلا نشر.

            وموضعه التذييل: مشترٍ يدفع لشركةٍ يريد أن يعرف **من** يقبض — والسجلّ التجاري
            والرقم الضريبي هما ما يُتحقَّق منهما، لا الاسم التجاري وحده. وما ليس في
            الإعدادات لا يُرسم، فلا حقلٌ فارغ بعنوان بلا قيمة. */}
        {legal.legalName || legal.crNumber || legal.vatNumber ? (
          <dl className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 border-t border-border/60 pt-5 text-[11.5px] leading-relaxed text-muted-foreground">
            {legal.legalName ? (
              /* «تُشغّلها» لا الاسم مجرَّداً (خالد ١٥ سبتمبر ٢٠٢٦): «مدونتي» علامةٌ تجارية
                 و«شركة جبر الجنوبية» هي المنشأة النظامية التي تقبض وتُصدر الفاتورة.
                 وسردهما بلا رابطٍ يجعل المشتري يظنّهما جهتين — والجملة تقول العلاقة
                 صراحةً، وهو نفس ما يقوله بند ١ في نموذج العقد. */
              <div className="w-full text-center">
                <dt className="sr-only">الجهة المشغِّلة</dt>
                <dd>
                  منصّة <span className="font-semibold text-foreground/85">{legal.siteName ?? "مدونتي"}</span>
                  {" تُشغّلها "}
                  <span className="font-semibold text-foreground/85">{legal.legalName}</span>
                </dd>
              </div>
            ) : null}
            {legal.crNumber ? (
              <div className="flex items-center gap-1.5">
                <dt>سجل تجاري</dt>
                {/* `dir=ltr` و`tabular-nums` على الأرقام النظامية: رقمٌ يُنسخ ويُطابق، فلا
                    ينعكس ترتيبه ولا تختلف عروض خاناته. */}
                <dd dir="ltr" className="font-medium tabular-nums text-foreground/85">{legal.crNumber}</dd>
              </div>
            ) : null}
            {legal.vatNumber ? (
              <div className="flex items-center gap-1.5">
                <dt>الرقم الضريبي</dt>
                <dd dir="ltr" className="font-medium tabular-nums text-foreground/85">{legal.vatNumber}</dd>
              </div>
            ) : null}
            {legal.capital ? (
              <div className="flex items-center gap-1.5">
                <dt>رأس المال</dt>
                {/* نصٌّ لا رقم: يُعرض كما قُيّد في السجلّ بعملته، ولا يُعاد تنسيقه. */}
                {/* `dir=ltr` و`tabular-nums` كالسجلّ والرقم الضريبي: رقمٌ نظاميّ يُنسخ
                    ويُطابَق، فيُكتب بأرقام لاتينية لا هندية، ولا ينعكس ترتيبه. */}
                <dd dir="ltr" className="font-medium tabular-nums text-foreground/85">{legal.capital}</dd>
              </div>
            ) : null}
            {legal.address ? (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">العنوان</dt>
                <dd>{legal.address}</dd>
              </div>
            ) : null}
            {legal.email ? (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">البريد</dt>
                <dd><a href={`mailto:${legal.email}`} dir="ltr" className="inline-flex min-h-11 items-center hover:text-foreground">{legal.email}</a></dd>
              </div>
            ) : null}
            {legal.phone ? (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">الهاتف</dt>
                <dd><a href={`tel:${legal.phone}`} dir="ltr" className="inline-flex min-h-11 items-center tabular-nums hover:text-foreground">{legal.phone}</a></dd>
              </div>
            ) : null}
            {/* رقم المبيعات غير هاتف المنشأة: هذا للتواصل التجاري قبل الشراء، وذاك
                الرقم النظاميّ المقيَّد في السجلّ. وفصلهما مقصود — المشتري يريد الأوّل. */}
            {wa ? (
              <div className="flex items-center gap-1.5">
                <dt>مبيعات</dt>
                <dd>
                  <a href={wa.href} target="_blank" rel="noopener noreferrer" dir="ltr" className="inline-flex min-h-11 items-center tabular-nums hover:text-foreground">
                    {wa.label}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <p className="mt-5 text-center text-[11.5px] leading-relaxed text-muted-foreground">
          {/* السنة ثابتةٌ في الكود لا محسوبة (خالد ١٤ سبتمبر ٢٠٢٦). `new Date()` يرفضه
              `cacheComponents` عند التقديم المسبق فيُخرج الأوفرفيو من السكون — والتذييل
              في كل صفحة. وتُحدَّث يدوياً مرّةً كل سنة: سطرٌ واحد أرخص من كاشٍ يحرس رقماً
              يتبدّل مرّةً في ٣٦٥ يوماً. */}
          © ٢٠٢٦ {siteName ?? "مدونتي"} — جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
