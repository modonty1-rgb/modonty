import { redirect } from "next/navigation";
import { resolvePartnerTheme, getThemeFooter, getThemeHeader, getThemePage, themeTokensCss } from "@modonty/shared/components/partner-site/theme";
import { getHomeData, hexToHslTriplet } from "@modonty/shared/lib/partner-site";
import { PageFrame, PARTNER_PAGE_TITLE_PREFIX } from "@modonty/shared/components/partner-site/parts/page-frame";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMySiteData } from "@/lib/my-site/get-my-site-data";
import { buildPreviewChrome } from "./helpers/build-preview-chrome";
import { isBlocksPage } from "@/lib/my-site/page-keys";
import { SITE_LOCALE_GREGORIAN } from "@modonty/shared/lib/constants/locale";

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
  // The builder never sends `?hidden=`, so the preview showed sections the live site hides — a
  // partner could not see, or bring back, what was switched off (4 Oct 2026). Without the param
  // the preview now applies what is saved, per page («home:testimonials»), like modonty does.
  const hidden = new Set(sp.hidden ? sp.hidden.split(",").filter(Boolean) : home.hiddenSections);
  const primaryColor = sp.c && sp.c !== "default" ? sp.c : null;

  // Same theme registry modonty renders from (THEMES.md) — header, footer and the look.
  const theme = resolvePartnerTheme(site.themeKey);
  const Header = getThemeHeader(theme, sp.h ?? site.headerTemplate).Component;
  const Footer = getThemeFooter(theme, sp.f ?? site.footerTemplate).Component;
  const year = new Intl.DateTimeFormat(SITE_LOCALE_GREGORIAN, { year: "numeric" }).format(new Date());
  const { header, footer } = buildPreviewChrome(site, primaryColor, year);

  // The colour is the unsaved choice, not the stored one — the rest of the data is his own.
  // WhatsApp shows only when he has a number — same rule as the live site, which no longer draws
  // a dead button without one. `#whatsapp` keeps it inert inside the preview frame.
  const data = { ...home.data, primaryColor, whatsappHref: site.chrome.phone ? "#whatsapp" : null };
  // Same rule the live site applies: a block leaves the page when it is switched off OR empty.
  // modonty's «قيد التجهيز» rule (`resolveClientPageState`): no about text, no services, no articles.
  const notReady = !home.data.about.description?.trim() && home.data.services.length === 0 && home.data.posts.length === 0;
  const titlePrefix = page in PARTNER_PAGE_TITLE_PREFIX ? PARTNER_PAGE_TITLE_PREFIX[page as keyof typeof PARTNER_PAGE_TITLE_PREFIX] : null;
  const blocks = getThemePage(theme, page).filter((b) => !hidden.has(`${page}:${b.key}`) && !hidden.has(b.key) && !b.isEmpty(data));

  // The partner's colour re-points Tailwind's `primary` — exactly as modonty does it in
  // `clients/[slug]/layout.tsx:110`. Without this line the templates keep the platform's
  // blue and a colour pick changes nothing on screen: the choice saves and looks broken.
  // «لون مدونتي» = modonty's brand blue (#3030FF, modonty/app/globals.css `--brand-blue`). Without a
  // colour the preview fell back to the CONSOLE's primary — LinkedIn blue #0a66c2 — so the default
  // looked different here than on the live site (4 Oct 2026).
  const primaryHsl = primaryColor ? hexToHslTriplet(primaryColor) : "240 100% 59.41%";

  return (
    <div data-partner-theme className="min-h-screen bg-background">
      <style>{`[data-partner-theme]{${themeTokensCss(theme.tokens)}}`}</style>
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
          {/* What the live site shows instead of the plain blocks (4 Oct 2026): the preview had no
              unpublished warning, no «قيد التجهيز» state, and no inner-page title or trail. */}
          {!site.published && (
            <p role="status" className="bg-destructive/10 px-6 py-3 text-center text-sm font-medium text-destructive">
              موقعك غير منشور الآن — اشتراكك غير فعّال، والزائر يرى «الصفحة غير موجودة».
            </p>
          )}
          {page === "home" && notReady ? (
            <div className="mx-auto max-w-[1128px] px-6 py-12">
              <div className="rounded-lg border bg-card px-6 py-10 text-center">
                <h2 className="text-lg font-bold text-foreground">صفحة هذا الشريك قيد التجهيز</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
                  هذا ما يراه الزائر الآن بدل الأقسام: لا وصف ولا خدمات ولا مقالات بعد. أضف أيّاً منها وتظهر صفحتك كاملة.
                </p>
              </div>
            </div>
          ) : titlePrefix ? (
            <PageFrame siteName={home.data.name} base="#home" title={`${titlePrefix} ${home.data.name}`}>
              {blocks.map((b) => (
                <b.Component key={b.key} data={data} preview />
              ))}
            </PageFrame>
          ) : (
            blocks.map((b) => <b.Component key={b.key} data={data} preview />)
          )}
        </main>
      )}
      {sp.only !== "header" && <Footer data={footer} preview />}
    </div>
  );
}
