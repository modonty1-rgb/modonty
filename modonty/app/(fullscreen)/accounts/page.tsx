import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";

import { LOGO_URL, SITE_URL } from "@/constants";
import { jsonLdHtml, jsonLdHtmlFromString } from "@/lib/seo";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getContentPageRow } from "@/lib/seo/get-content-page-row";
import { buildSiteEntityIds } from "@modonty/shared/lib/seo/site-entity-ids";
import {
  IconChevronLeft,
  IconEmail,
  IconMessage,
  IconExternal,
  IconFacebook,
  IconHandshake,
  IconInstagram,
  IconLinkedin,
  IconSnapchat,
  IconTelegram,
  IconTiktok,
  IconTwitter,
  IconWebsite,
  IconWhatsappBrand,
  IconYoutube,
} from "@/lib/icons";

import { AccountLink } from "./components/account-link";
import { ShareAccountsButton } from "./components/share-accounts-button";
import { getAccountHandle } from "./helpers/get-account-handle";
import { getAccountsData } from "./helpers/get-accounts-data";

/**
 * **حساباتُ مدونتي في رابطٍ واحد** — `modonty.com/accounts` (خالد ٢٣ سبتمبر ٢٠٢٦).
 *
 * الرابطُ الذي يوضع في «البايو» على كلّ منصّة. يملأ الشاشة بلا هيدر الموقع ولا فوتره
 * (مجموعة `(fullscreen)`، انظر README هناك): الزائرُ جاء ليختار وجهةً، لا ليتصفّح.
 *
 * ── القياس: الـUTM على رابط البايو، لا على روابط الصفحة ──
 * كلُّ منصّةٍ تضع رابطَها الموسوم، مثلاً:
 *   modonty.com/accounts?utm_source=instagram&utm_medium=social&utm_campaign=link_in_bio
 * فيُنسب GA4 الزيارةَ كلَّها — هذه الصفحة وما بعدها — إلى «Organic Social / instagram».
 * (`utm_medium=social` هو شرطُ قناة Organic Social في GA4: support.google.com/analytics/answer/9756891)
 *
 * وروابطُ الصفحة الداخليّة بلا UTM عمداً: GA4 يحسم مصدرَ الجلسة عند `session_start`،
 * والوسمُ على رابطٍ داخليّ يصنع «حملةً» جديدة مزيّفة (support.google.com/analytics/answer/11242841).
 * وأيُّ زرٍّ ضُغط يُقاس بحدث `cta_click` (`accounts:<id>`) — لا بتلويث الرابط.
 *
 * والصفحةُ نفسُها لا تقرأ `searchParams`، فتُبنى ثابتةً وتُخدَم من الكاش.
 *
 * ── ما يُدار من الأدمن (Modonty → Pages → Accounts) ──
 * العنوانُ والوصفُ والـrobots والـcanonical وبطاقةُ المشاركة — وصورةُ المشاركة نفسُها هي
 * صورةُ الهيرو في رأس الصفحة، فرفعٌ واحد يخدم الاثنين. والـJSON-LD يولّده الأدمن ويتحقّق
 * منه: ProfilePage ← mainEntity: Organization (ومعها sameAs = الحسابات).
 */
const FALLBACK_DESCRIPTION = "كل حسابات مدونتي على منصّات التواصل في مكانٍ واحد.";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getContentPageRow("accounts"), {
    path: "/accounts",
    fallbackTitle: "حساباتنا",
    fallbackDescription: FALLBACK_DESCRIPTION,
  });
}

/**
 * قبل أن يُحفظ سجلُّ الصفحة في الأدمن لا يوجد graph مخزَّن — فلا تخرج الصفحةُ بلا بيانات
 * منظّمة: نفسُ الشكل الذي يولّده الأدمن، بأقلّ حقوله.
 */
function fallbackGraph(sameAs: string[]): object {
  const { organization } = buildSiteEntityIds(SITE_URL);
  const url = `${SITE_URL}/accounts`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": organization, url: SITE_URL, ...(sameAs.length ? { sameAs } : {}) },
      { "@type": "ProfilePage", "@id": `${url}#profilepage`, url, name: "حساباتنا", description: FALLBACK_DESCRIPTION, mainEntity: { "@id": organization } },
    ],
  };
}

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Each network on its own colour — the tile is recognised before the word is read. The glyph
 * inherits `currentColor`, so the tile sets both; Snapchat's yellow carries a dark glyph.
 */
const CHANNEL_TILE: Record<string, string> = {
  instagram: "bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white",
  tiktok: "bg-black text-white",
  twitter: "bg-black text-white",
  linkedin: "bg-[#0A66C2] text-white",
  facebook: "bg-[#1877F2] text-white",
  youtube: "bg-[#FF0000] text-white",
  snapchat: "bg-[#FFFC00] text-black",
  pinterest: "bg-[#E60023] text-white",
  whatsapp: "bg-[#25D366] text-white",
  telegram: "bg-[#229ED9] text-white",
};

const CHANNEL_ICON: Record<string, Icon> = {
  facebook: IconFacebook,
  linkedin: IconLinkedin,
  youtube: IconYoutube,
  twitter: IconTwitter,
  instagram: IconInstagram,
  tiktok: IconTiktok,
  snapchat: IconSnapchat,
  whatsapp: IconWhatsappBrand,
  telegram: IconTelegram,
};

/**
 * «صِر شريكاً» → صفحة الباقات على pay.modonty.com (خالد ٢٣ سبتمبر ٢٠٢٦: jbrseo أُوقف).
 *
 * بلا UTM عمداً: نطاقٌ فرعيٌّ من نفس الموقع، والوسمُ عليه يقطع زيارةَ الزائر إلى «حملة»
 * جديدة كما يفعل على الرابط الداخليّ. والضغطةُ نفسُها تُقاس بـ`cta_click` (`accounts:partner`).
 */
const PARTNER_URL = "https://pay.modonty.com";

export default async function AccountsPage() {
  const [{ socials, salesWhatsapp, contactEmail }, row] = await Promise.all([getAccountsData(), getContentPageRow("accounts")]);
  const hero = row?.socialImage?.trim() || null;
  const storedJsonLd = row?.jsonLdStructuredData?.trim();
  const name = row?.title?.trim() || "مدونتي";

  /**
   * One primary action, the rest quiet. Three loud colours stacked (the first version) made
   * every button shout the same — the visitor could not tell which one we meant.
   */
  const secondary: { id: string; href: string; label: string; icon: Icon; external: boolean }[] = [
    { id: "partner", href: PARTNER_URL, label: "صِر شريكاً", icon: IconHandshake, external: true },
    ...(salesWhatsapp ? [{ id: "sales_whatsapp", href: salesWhatsapp, label: "واتساب المبيعات", icon: IconWhatsappBrand, external: true }] : []),
    // البريدُ من Settings → Business → Contact (orgContactEmail) — لا عنوانَ مكتوبٌ هنا.
    ...(contactEmail ? [{ id: "email", href: `mailto:${contactEmail}`, label: "راسلنا بالبريد", icon: IconEmail, external: true }] : []),
    { id: "contact_form", href: "/contact", label: "نموذج التواصل", icon: IconMessage, external: false },
  ];

  return (
    <main dir="rtl" className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: storedJsonLd ? jsonLdHtmlFromString(storedJsonLd) : jsonLdHtml(fallbackGraph(socials.map((s) => s.href))),
        }}
      />
      {/* A soft brand glow behind the header — depth without a second colour competing. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,hsl(var(--primary)/0.18),transparent)]"
      />

      <div className="relative mx-auto flex w-full max-w-md flex-col px-[clamp(0.75rem,0.4rem+1.8vw,1rem)] pb-12 pt-[clamp(1rem,0.7rem+1.5vw,1.5rem)]">
        {/* ── Profile header ── the admin's share image as a cover, the logo overlapping it. */}
        <header className="flex flex-col items-center text-center">
          {hero ? (
            <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-3xl border bg-card shadow-sm">
              <OptimizedImage
                media={asMedia(hero)}
                alt={row?.socialImageAlt?.trim() || name}
                fill
                sizes="(max-width: 448px) 100vw, 448px"
                className="object-cover"
                preload
                loading="eager"
              />
            </div>
          ) : null}
          <AccountLink
            id="logo"
            href="/"
            className={`relative block size-[clamp(4.75rem,3.6rem+5.6vw,6rem)] overflow-hidden rounded-full border-4 border-background bg-white shadow-md ring-1 ring-border ${hero ? "-mt-[clamp(2.375rem,1.8rem+2.8vw,3rem)]" : "mt-6"}`}
          >
            <OptimizedImage media={asMedia(LOGO_URL)} alt="مدونتي — الصفحة الرئيسية" fill sizes="96px" className="object-contain p-3" preload={!hero} loading="eager" />
          </AccountLink>
          <h1 className="mt-3 inline-flex items-center gap-1.5 text-[clamp(1.25rem,0.85rem+2vw,1.625rem)] font-black leading-tight">
            {name}
            <VerifiedBadge className="size-[clamp(1rem,0.8rem+1vw,1.25rem)]" label="الحساب الرسمي" />
          </h1>
          <p className="mt-1 text-[clamp(0.8125rem,0.7rem+0.55vw,0.9375rem)] text-muted-foreground">كل حساباتنا في مكانٍ واحد</p>
          {/* Share under the identity, not over the cover (Khalid, 23 Sep 2026: on the image it
              fought the picture). Quiet, so the primary action below stays the first read. */}
          <div className="mt-3">
            <ShareAccountsButton url={`${SITE_URL}/accounts`} title={name} />
          </div>
        </header>

        {/* ── Actions ── */}
        <nav aria-label="روابط رئيسية" className="mt-7 flex flex-col gap-2.5">
          <AccountLink
            id="home"
            href="/"
            className="flex min-h-[clamp(3rem,2.55rem+2.2vw,3.5rem)] items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[clamp(0.9375rem,0.8rem+0.7vw,1.0625rem)] font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 motion-safe:active:scale-[0.98]"
          >
            <IconWebsite className="size-5" aria-hidden />
            زُر مدونتي
          </AccountLink>
          <div className={`grid gap-2.5 ${secondary.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {secondary.map(({ id, href, label, icon: I, external }, i) => (
              <AccountLink
                key={id}
                id={id}
                href={href}
                external={external}
                className={`${secondary.length % 2 === 1 && i === secondary.length - 1 ? "col-span-2" : ""} flex min-h-[clamp(2.75rem,2.4rem+1.7vw,3rem)] items-center justify-center gap-[clamp(0.25rem,0.1rem+0.7vw,0.5rem)] whitespace-nowrap rounded-2xl border bg-card px-[clamp(0.5rem,0.2rem+1.4vw,0.75rem)] text-[clamp(0.75rem,0.6rem+0.75vw,0.875rem)] font-bold shadow-sm transition hover:bg-muted motion-safe:active:scale-[0.98]`}
              >
                <I className="size-[clamp(1rem,0.85rem+0.7vw,1.125rem)] shrink-0" aria-hidden />
                {label}
              </AccountLink>
            ))}
          </div>
        </nav>

        {/* ── Accounts ── each on its brand colour, with the handle a visitor recognises. */}
        {socials.length > 0 && (
          <section aria-labelledby="accounts-socials" className="mt-9">
            <h2 id="accounts-socials" className="mb-3 text-[clamp(0.6875rem,0.6rem+0.45vw,0.8125rem)] font-bold text-muted-foreground">
              تابعنا
            </h2>
            <ul className="flex flex-col gap-2">
              {socials.map((s) => {
                const I = CHANNEL_ICON[s.key] ?? IconExternal;
                const handle = getAccountHandle(s.href);
                return (
                  <li key={s.key}>
                    {/* `rel="me"` يربط الحسابَ بالموقع لمن يتحقّق من الهويّة. */}
                    <AccountLink
                      id={s.key}
                      href={s.href}
                      external
                      rel="me noopener noreferrer"
                      className="group flex min-h-[clamp(3.5rem,3rem+2.5vw,4rem)] items-center gap-[clamp(0.625rem,0.45rem+0.9vw,0.75rem)] rounded-2xl border bg-card p-[clamp(0.5rem,0.4rem+0.5vw,0.625rem)] pe-[clamp(0.75rem,0.5rem+1.2vw,1rem)] shadow-sm transition hover:border-foreground/20 hover:shadow-md motion-safe:active:scale-[0.99]"
                    >
                      <span className={`grid size-[clamp(2.375rem,2rem+1.9vw,2.75rem)] shrink-0 place-items-center rounded-xl ${CHANNEL_TILE[s.key] ?? "bg-muted text-foreground"}`}>
                        <I className="size-[clamp(1.125rem,0.95rem+0.8vw,1.25rem)]" aria-hidden />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-[clamp(0.875rem,0.75rem+0.6vw,1rem)] font-bold leading-snug">{s.label}</span>
                        {handle && (
                          <span dir="ltr" className="truncate text-end text-[clamp(0.75rem,0.67rem+0.4vw,0.8125rem)] text-muted-foreground">
                            {handle}
                          </span>
                        )}
                      </span>
                      <IconChevronLeft className="size-4 shrink-0 text-muted-foreground transition group-hover:-translate-x-0.5" aria-hidden />
                    </AccountLink>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
