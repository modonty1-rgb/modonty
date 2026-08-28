import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientsList } from "@/lib/queries/get-clients-list";
import { getModontyArticles } from "@/app/(site)/modonty/data/get-modonty-articles";
import { getModontyGallery } from "@/app/(site)/modonty/data/get-modonty-gallery";
import { getModontyReels } from "@/app/(site)/modonty/data/get-modonty-reels";
import { getModontyPhone } from "@/app/(site)/modonty/data/get-modonty-phone";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { getLegalEntity } from "@/lib/seo/organization-jsonld";
import { toLegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";
import { ModontyProfileHero } from "@/app/(site)/modonty/components/profile-hero/ModontyProfileHero";
import { ModontyArticlesFeed } from "@/app/(site)/modonty/components/articles-feed/ModontyArticlesFeed";
import { FEED_VIEWS, type FeedView } from "@/app/(site)/modonty/components/articles-feed/feed-views";
import { ModontyRightRail } from "@/app/(site)/modonty/components/right-rail/ModontyRightRail";
import { ModontyLeftRail } from "@/app/(site)/modonty/components/left-rail/ModontyLeftRail";
import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { MobileCtaBar } from "@/components/shared/mobile-cta-bar/MobileCtaBar";
import { FollowCtaButton } from "@/components/shared/mobile-cta-bar/FollowCtaButton";
import { IconHandshake } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";
import type { FeedPost } from "@/lib/types";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";
import { SITE_URL } from "@/constants";
import { buildPageAlternates } from "@/lib/seo/build-page-alternates";
import { buildShareTags } from "@/lib/seo/build-share-tags";
import { reveal } from "./helpers/reveal";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

// كان هنا `const MODONTY_CLIENT_SLUG = "مدونتي"` والصفحة تبحث بالـslug نصّاً.
// العمود الصحيح موجود منذ ٢٤ أغسطس (`Settings.coreClientId`) وخمسة مسارات تقرؤه —
// الرئيسية وشريط الناشر والرائج واستعلاما المقالات — وهذه الصفحة وحدها شذّت.
// والفخّ أن `slug` و`name` متطابقان اليوم، فتغيير الاسم من الأدمن كان سيكسرها لاحقاً
// لا فوراً: عطلٌ مؤجَّل، وهو أسوأ ما يُترك في الكود.

/**
 * `pagination` emits `<link rel="prev">` / `<link rel="next">` — the machine-readable half
 * of a paginated series, added 22 Aug 2026 once the feed grew an infinite scroll.
 *
 * It matters MORE with the scroll than without it. Next's own docs are blunt about the
 * limit: "content that requires user interaction or specific events to trigger will not be
 * visible to crawlers that do not execute JavaScript" — so everything the scroll appends is
 * invisible to a crawler, and the only trail left to article eleven is the paginated URLs.
 * The visible prev/next links carry that trail, these tags declare it.
 *
 * Each paginated URL keeps its own canonical; filtered views still consolidate through
 * the same page URL because `view` is intentionally excluded here.
 */
export async function generateMetadata({ searchParams }: ModontyPageProps): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  const page = Number.isFinite(Number(pageParam)) && Number(pageParam) > 1 ? Number(pageParam) : 1;
  const pageUrl = (target: number) => (target > 1 ? `${SITE_URL}/modonty?page=${target}` : `${SITE_URL}/modonty`);

  // Both reads are `use cache` and React dedups them against the page's own calls, so
  // asking here costs nothing — and a `rel="next"` that points past the last page is worse
  // than none at all.
  const [partners, coreClientId, { siteName }] = await Promise.all([
    getClientsList(),
    getCoreClientId(),
    getPageSeoDefaults(),
  ]);
  const profile = partners.find((partner) => partner.id === coreClientId);
  const total = profile ? (await getModontyArticles(profile.id)).length : 0;
  const hasNext = total > page * FEED_PAGE_SIZE;

  // Brand appended by hand in `<title>` (`absolute`); the share tags take the bare headline
  // because `og:site_name` already carries the brand on a card.
  const headline =
    page > 1 ? `مقالات مدونتي — الصفحة ${page.toLocaleString(SITE_LOCALE)}` : "مقالات مدونتي";
  const description = messages.seo.modontyPage.description;
  const path = page > 1 ? `/modonty?page=${page}` : "/modonty";

  return {
    // اللاحقة من `Settings.siteName` لا من الكود — وبغياب العمود يُشحن العنوان وحده،
    // لأن عنواناً بلا ماركة أهون من ماركة بالاسم القديم بعد تغييره من الأدمن.
    title: { absolute: siteName ? `${headline} | ${siteName}` : headline },
    description,
    // Its own canonical and the locales from Settings. It used to ship the canonical alone,
    // which in Next means the layout's alternates are replaced, not extended.
    alternates: await buildPageAlternates(path),
    pagination: {
      previous: page > 1 ? pageUrl(page - 1) : undefined,
      next: hasNext ? pageUrl(page + 1) : undefined,
    },
    // Shipped zero og:/twitter: until now — see `buildShareTags`. `og:url` follows the same
    // paged path as the canonical, so page 2 does not claim to be page 1.
    ...(await buildShareTags({ path, title: headline, description })),
  };
}

interface ModontyPageProps {
  searchParams: Promise<{ page?: string; view?: string }>;
}

/**
 * Sorting and filtering happen on the array the page already fetched, not in a second
 * query. `getModontyArticles` returns modonty's whole published set in one read — a
 * few dozen rows — so a per-view query would be a second round trip to reorder data
 * already in memory. Revisit if modonty's own output ever outgrows one page of results.
 */
function applyView(articles: FeedPost[], view: FeedView): FeedPost[] {
  if (view === "audio") return articles.filter((article) => article.hasAudio);
  if (view === "popular") return [...articles].sort((a, b) => b.views - a.views);
  return articles;
}

/**
 * modonty's own dedicated page — independent from `/about` (Khalid, 2026-08-16: «About
 * هذا موضوع ثاني»). Every field comes from modonty's own `Client` row, the same one every
 * partner card reads. Three-column shell, same widths/gaps as `/`, `/clients`, `/industries`
 * (Khalid, 2026-08-17). Right rail = about modonty (story card → `/story`, team card →
 * `/team`); left rail = the partners' side (testimonials → `/story`, the pinboard of our
 * article covers drawn at random per request, and modonty's own reels). Nothing opens in place — Khalid
 * rejected the drawer, then the popover, the same day.
 */
export default async function ModontyPage({ searchParams }: ModontyPageProps) {
  const { page: pageParam, view: viewParam } = await searchParams;
  const page = Number.isFinite(Number(pageParam)) && Number(pageParam) > 1 ? Number(pageParam) : 1;
  const view: FeedView = FEED_VIEWS.includes(viewParam as FeedView) ? (viewParam as FeedView) : "latest";
  const [partners, coreClientId, { siteName }] = await Promise.all([
    getClientsList(),
    getCoreClientId(),
    getPageSeoDefaults(),
  ]);
  const profile = partners.find((partner) => partner.id === coreClientId);
  if (!profile) notFound();
  const [articles, gallery, reels, legalEntity, whatsappPhone] = await Promise.all([
    getModontyArticles(profile.id),
    getModontyGallery(profile.id),
    getModontyReels(profile.id),
    getLegalEntity(),
    getModontyPhone(profile.id),
  ]);
  const legal = toLegalEntityDisplay(legalEntity);
  const visibleArticles = applyView(articles, view);
  const buildHref = (targetPage: number, targetView: FeedView) => {
    const params = new URLSearchParams();
    if (targetView !== "latest") params.set("view", targetView);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `/modonty?${query}` : "/modonty";
  };
  const buildPageHref = (targetPage: number) => buildHref(targetPage, view);
  // Switching the filter always returns to page 1 — page 3 of «الأحدث» is not page 3 of
  // «الأكثر قراءة», and landing on an empty page after a filter change reads as a bug.
  const viewHrefs = Object.fromEntries(FEED_VIEWS.map((option) => [option, buildHref(1, option)])) as Record<FeedView, string>;
  return (
    <>
    {/* `BreadcrumbList` — measured missing on 22 Aug while `/clients`, `/industries` and
        `/articles` all emitted theirs. The visible trail below was drawn without any markup
        behind it, so Google had no breadcrumb to show for this page. The two must ship
        together: the markup is what earns the trail in the result, the visible one is what
        the reader follows. */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLdHtml(
          generateBreadcrumbStructuredData([
            { name: "الرئيسية", url: "/" },
            // اسم هذا القسم هو اسم الموقع نفسه — فيُقرأ من الإعدادات لا يُكتب بيدٍ.
            { name: siteName ?? "", url: "/modonty" },
          ])
        ),
      }}
    />
    <ThreeColumnLayout
      header={
        <div className={`space-y-4 max-lg:space-y-2 ${reveal(0)}`}>
          <Breadcrumb
            items={[
              { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
              { label: siteName ?? "" },
            ]}
          />
          <ModontyProfileHero
            name={profile.name}
            logo={profile.logo}
            heroImage={profile.heroImage}
            services={profile.services}
          />
        </div>
      }
      right={
        // 21 Aug this rail was un-hidden on phones so its 683px (story · papers · team)
        // would reach a phone visitor at all. 22 Aug that is reversed FOR PHONES ONLY
        // (Khalid: «قصتنا والصف والكلام هذا كله ما له داعي هنا»): read through the
        // reader's eyes, none of the three answers «why keep reading» or «why come back» —
        // the commercial register, the address and the WhatsApp number reassure a business
        // owner deciding whether to buy, not someone who came to read. Nothing is lost:
        // the story lives at `/story`, the team at `/team`, both linked from the footer.
        // Desktop is untouched — at ≥1240px the rail is a column beside the feed, not
        // 683px stacked between the reader and the end of the page.
        <StickyRail
          label={messages.modonty.rightRailLabel}
          className={`order-2 w-full shrink-0 self-start max-lg:hidden lg:hidden min-[1240px]:order-none min-[1240px]:block min-[1240px]:sticky min-[1240px]:w-[300px] ${reveal(2)}`}
        >
          <ModontyRightRail legal={legal} clientId={profile.id} clientName={profile.name} whatsappPhone={whatsappPhone} />
        </StickyRail>
      }
      center={
        <div className={reveal(1)}>
          <ModontyArticlesFeed
            articles={visibleArticles}
            page={page}
            view={view}
            clientSlug={profile.slug}
            buildPageHref={buildPageHref}
            viewHrefs={viewHrefs}
          />
        </div>
      }
      left={
        // Mobile: stacks last (`order-3`) — feed → about us → our reels/gallery.
        <StickyRail
          label={messages.modonty.leftRailLabel}
          className={`order-3 w-full shrink-0 self-start lg:hidden min-[1240px]:order-none min-[1240px]:block min-[1240px]:sticky min-[1240px]:w-[300px] ${reveal(2)}`}
        >
          <ModontyLeftRail gallery={gallery} reels={reels} />
        </StickyRail>
      }
    />
    {/* Same shared bottom bar as the homepage — only this page's two asks change
        (Khalid, 21 Aug 2026): become a partner, or read who modonty is. */}
    {/* The two asks swapped on 22 Aug. «صِر شريكاً» held the solid button — 65px of every
        screen pointing a READER off the site into a sales funnel. The main ask on a
        reader's page is the one thing that turns them into someone who comes back, so
        «تابع مدونتي» takes it and the partner door keeps the quieter second slot
        (jbrseo.com, same destination as before — Khalid, 21 Aug: the funnel is there,
        not on /story). */}
    <MobileCtaBar
      ariaLabel={messages.modonty.ctaBarLabel}
      primarySlot={<FollowCtaButton />}
      secondary={{ href: "https://www.jbrseo.com", label: "صِر شريكاً", icon: IconHandshake, external: true }}
    />
    </>
  );
}
