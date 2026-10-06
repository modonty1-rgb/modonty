import Script from "next/script";

/**
 * حاوية GTM خاصّة بموقع الدفع `pay.modonty.com` — أنشأها خالد ٥ أكتوبر ٢٠٢٦ في حساب
 * «JBRSEO - modonty» كي تركّب عليها أماني بكسلات الإعلانات (ميتا وغيرها) لمسار الشراء.
 *
 * حاوية مستقلّة لا حاوية مدونتي (GTM-MNRR2NS9): بكسلات مسار الدفع وأحداث الشراء لا تختلط
 * بتتبّع المدوّنة، وتُنشر وتُراجَع وحدها.
 *
 * الرقم ثابت هنا لا من `NEXT_PUBLIC_GTM_CONTAINER_ID`: ذلك المتغيّر في `.env.shared` يحمل
 * حاوية مدونتي، فقراءته هنا كانت ستركّب حاوية المدوّنة على صفحة الدفع بصمت. والرقم ليس سرّاً.
 *
 * على الإنتاج فقط — نفس قرار `shared/lib/gtm/getGTMSettings.ts`: زيارات التطوير لا تدخل
 * أرقام الإعلانات. و`afterInteractive` لا `lazyOnload`: زائر الإعلان يجب أن يُحسب ولو غادر
 * بسرعة، والبكسل الذي يتأخّر حتى خمول الصفحة يفوّت أكثرهم.
 */
const PAY_GTM_CONTAINER_ID = "GTM-M2JDW3VH";

export function GtmContainer() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${PAY_GTM_CONTAINER_ID}');`,
        }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${PAY_GTM_CONTAINER_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
