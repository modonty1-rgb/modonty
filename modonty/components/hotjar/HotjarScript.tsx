import "server-only";
import Script from "next/script";

export function HotjarScript() {
  const siteId = process.env.NEXT_PUBLIC_HOTJAR_SITE_ID;
  const version = process.env.NEXT_PUBLIC_HOTJAR_VERSION || "6";

  if (!siteId) return null;

  return (
    <Script
      id="hotjar-script"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${siteId},hjsv:${version}};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `,
      }}
    />
  );
}
