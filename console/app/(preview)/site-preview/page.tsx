import { redirect } from "next/navigation";
import { getHeaderTemplate } from "@modonty/shared/components/partner-site/free/header";
import { getFooterTemplate } from "@modonty/shared/components/partner-site/free/footer";
import { getHomeData, hexToHslTriplet } from "@modonty/shared/lib/partner-site";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMySiteData } from "@/lib/my-site/get-my-site-data";
import { buildPreviewChrome } from "@/lib/my-site/build-preview-chrome";
import { PAGE_BLOCKS } from "@/lib/my-site/page-blocks";
import { isBlocksPage } from "@/lib/my-site/page-keys";

export const dynamic = "force-dynamic";

interface SitePreviewProps {
  searchParams: Promise<{ h?: string; f?: string; c?: string; p?: string; hidden?: string; bare?: string; only?: string }>;
}

/**
 * The partner's site as the visitor gets it — the SAME components modonty renders, driven by
 * choices that are not saved yet (they arrive in the query string).
 *
 * Why a route and not a `<div>` inside the settings screen: the templates decide phone vs
 * desktop with Tailwind's `md:` breakpoints, and those read the VIEWPORT, not the box they
 * sit in. Drawn in a 390px div inside a 1440px window every template still renders its
 * desktop shape — a preview that lies. Inside an iframe the frame IS the viewport, so 390
 * means 390 and the partner sees his real phone layout.
 *
 * It sits outside `(dashboard)` on purpose: no sidebar, no console chrome, nothing but the site.
 */
export default async function SitePreviewPage({ searchParams }: SitePreviewProps) {
  const sp = await searchParams;

  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const [site, home] = await Promise.all([getMySiteData(clientId), getHomeData(db, { id: clientId })]);
  if (!site || !home) redirect("/");

  const page = isBlocksPage(sp.p) ? sp.p : "home";
  const hidden = new Set((sp.hidden ?? "").split(",").filter(Boolean));
  const primaryColor = sp.c && sp.c !== "default" ? sp.c : null;

  const Header = getHeaderTemplate(sp.h ?? site.headerTemplate).Component;
  const Footer = getFooterTemplate(sp.f ?? site.footerTemplate).Component;
  const year = new Intl.DateTimeFormat("ar-SA", { year: "numeric" }).format(new Date());
  const { header, footer } = buildPreviewChrome(site, primaryColor, year);

  // The colour is the unsaved choice, not the stored one — the rest of the data is his own.
  const data = { ...home.data, primaryColor };
  // Same rule the live site applies: a block leaves the page when it is switched off OR empty.
  const blocks = PAGE_BLOCKS[page].filter((b) => !hidden.has(b.key) && !b.isEmpty(data));

  // The partner's colour re-points Tailwind's `primary` — exactly as modonty does it in
  // `clients/[slug]/layout.tsx:110`. Without this line the templates keep the platform's
  // blue and a colour pick changes nothing on screen: the choice saves and looks broken.
  const primaryHsl = primaryColor ? hexToHslTriplet(primaryColor) : null;

  return (
    <div data-partner-theme className="min-h-screen bg-background">
      {primaryHsl && <style>{`[data-partner-theme]{--primary:${primaryHsl};--ring:${primaryHsl}}`}</style>}
      {/* `bare`: نسخة القصّاصة داخل بطاقات الاختيار — لا تُمرَّر، فشريط التمرير فيها
          زخرفة تشوّش على الشكل الذي يُقارَن. الإطاران الكبيران يحتفظان بشريطهما. */}
      {sp.bare ? <style>{`html{scrollbar-width:none}html::-webkit-scrollbar{display:none}`}</style> : null}

      {/* `only`: بطاقة اختيار الهيدر تحتاج الهيدر وحده. بلا هذا كانت كل بطاقة تحمّل الموقع
          كاملاً — قِيس ٥٠ طلباً و١١ صورة للبطاقة الواحدة، وأحد عشر إطاراً معاً ≈٥٤٥ طلباً
          وزمن تحميل ١٢ ثانية، لتُعرض شريحة ٣٠٠px. */}
      {sp.only !== "footer" && <Header data={header} preview />}
      {!sp.only && (
        <main>
          {blocks.map((b) => (
            <b.Component key={b.key} data={data} preview />
          ))}
        </main>
      )}
      {sp.only !== "header" && <Footer data={footer} preview />}
    </div>
  );
}
