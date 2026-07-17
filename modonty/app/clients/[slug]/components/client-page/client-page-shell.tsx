import { ClientHeroV2 } from "../shell-hero/client-hero-v2";
import { ClientSectionNav } from "../nav/client-section-nav";
import { ClientSectionMenu } from "../nav/client-section-menu";
import type { SectionItem } from "../nav/client-section-items";
import { ClientServicesSection } from "../sections/client-services-section";
import { ClientResultsSection } from "../sections/client-results-section";
import { ClientReviewsSection } from "../sections/client-reviews-section";
import { ClientGallerySection } from "../sections/client-gallery-section";
import { ClientTeamSection } from "../sections/client-team-section";
import { ClientAboutSection } from "../sections/client-about-section";
import { ClientArticlesSection } from "../sections/client-articles-section";
import { ClientDiscussionsSection } from "../sections/client-discussions-section";
import { ClientFaqSection } from "../sections/client-faq-section";
import { ClientContactSection } from "../sections/client-contact-section";
import { ClientQuickContact } from "../sidebar/client-quick-contact";
import { ClientHours, hasOpeningHours } from "../sidebar/client-hours";
import { ClientTrustCard } from "../sidebar/client-trust-card";
import { ClientNewsletterCard } from "../client-newsletter-card";
import { RelatedClients } from "../related-clients";
import { ClientFooterCta } from "../client-footer-cta";
import { ClientWhatsAppFab } from "../client-whatsapp-fab";
import { ClientBottomBar } from "../client-bottom-bar";
import { localizeCountry } from "../hero/utils";
import type { ClientPageState } from "../client-page-state";
import type { ClientReviewsData } from "../../helpers/client-reviews";

interface ShellArticle {
  id: string;
  slug: string;
  title: string;
  featuredImage?: { url: string } | null;
  category?: { name: string } | null;
  datePublished?: Date | null;
  readingTimeMinutes?: number | null;
  audioUrl?: string | null;
}

export interface ShellClient {
  id: string;
  name: string;
  slug: string;
  logoMedia?: { url: string } | null;
  heroImageMedia?: { url: string; width?: number | null; height?: number | null } | null;
  industry?: { name: string } | null;
  addressCity?: string | null;
  addressRegion?: string | null;
  addressCountry?: string | null;
  addressNeighborhood?: string | null;
  addressLatitude?: number | null;
  addressLongitude?: number | null;
  foundingDate?: Date | null;
  sameAs: string[];
  url?: string | null;
  phone?: string | null;
  email?: string | null;
  ctaMode: "NONE" | "FORM" | "LINK";
  ctaUrl?: string | null;
  ctaLabel?: string | null;
  isFeatured?: boolean | null;
  services: { title: string; description?: string | null; icon?: string | null }[];
  teamMembers: { name: string; role?: string | null; bio?: string | null; photoUrl?: string | null }[];
  achievements: { value: string; label: string; image?: string | null; description?: string | null }[];
  credentials: { name: string; authority?: string | null; year?: string | null; url?: string | null }[];
  introVideoUrl?: string | null;
  verificationImageUrl?: string | null;
  description?: string | null;
  seoDescription?: string | null;
  slogan?: string | null;
  legalName?: string | null;
  commercialRegistrationNumber?: string | null;
  legalForm?: string | null;
  vatID?: string | null;
  numberOfEmployees?: string | null;
  knowsLanguage?: string[];
  openingHoursSpecification?: unknown;
  gbpProfileUrl?: string | null;
  gbpPlaceId?: string | null;
  articles: ShellArticle[];
}

interface DiscussionComment {
  id: string;
  content: string;
  createdAt: Date;
  author: { name: string | null; image: string | null };
  article: { title: string; slug: string } | null;
}

interface RelatedClientItem {
  id: string;
  name: string;
  slug: string;
  logoMedia?: { url: string } | null;
  _count: { articles: number };
}

export interface ClientPageShellProps {
  client: ShellClient;
  stats: { followers: number; totalViews: number };
  pageState: ClientPageState; // "strong" | "sparse" (not-ready handled in page.tsx)
  reviews: ClientReviewsData;
  faqs: { id: string; question: string; answer: string }[];
  gallery: { id: string; url: string; altText: string | null; width: number | null; height: number | null }[];
  discussions: DiscussionComment[];
  relatedClients: RelatedClientItem[];
  user: { name: string | null; email: string | null } | null;
  initialIsFollowing: boolean;
  initialIsFavorited: boolean;
  /**
   * When false the hero block is skipped — it's rendered separately in the static
   * shell (ClientHeroBlock in page.tsx) so the real cover/name paint immediately and
   * never swap from a skeleton (kills above-the-fold CLS). Defaults to true.
   */
  renderHero?: boolean;
}

/**
 * Single-page client mini-site shell (mockup BUILD 15). Composes hero + sticky
 * scroll-spy nav + 2-col body (main sections + sidebar) + overlays. Server
 * Component; every content section is Server, only interactive islands are client.
 * Each optional section self-hides when empty; the nav lists only present sections.
 */
export function ClientPageShell({
  client,
  stats,
  pageState,
  reviews,
  faqs,
  gallery,
  discussions,
  relatedClients,
  user,
  initialIsFollowing,
  initialIsFavorited,
  renderHero = true,
}: ClientPageShellProps) {
  const articleCount = client.articles.length;

  // Map articles → the articles-section shape (latest 6).
  const posts = client.articles.slice(0, 6).map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    image: a.featuredImage?.url ?? null,
    category: a.category?.name ?? null,
    datePublished: a.datePublished ?? null,
    readingTime: a.readingTimeMinutes ?? null,
    views: null as number | null,
    hasAudio: !!a.audioUrl,
  }));
  const topics = Array.from(
    new Set(client.articles.map((a) => a.category?.name).filter((n): n is string => !!n))
  ).slice(0, 6);

  // Composed address line for the contact section. Only prefix «حي » when the
  // client's neighborhood value doesn't already start with it (avoids «حي حي …»).
  const neighborhood = client.addressNeighborhood?.trim();
  const neighborhoodLabel = neighborhood
    ? neighborhood.startsWith("حي")
      ? neighborhood
      : `حي ${neighborhood}`
    : null;
  const addressLine =
    [neighborhoodLabel, client.addressCity, localizeCountry(client.addressCountry)]
      .filter(Boolean)
      .join(" · ") || null;

  // Nav tab conditions MUST match each section's own render condition exactly,
  // else a tab points at an anchor that hid → dead scroll target.
  const hasServices = client.services.some((s) => s.title?.trim());
  const hasResults = client.achievements.some((a) => a.value?.trim() && a.label?.trim());
  const hasGallery = gallery.some((img) => img.url?.trim());
  const hasTeam = client.teamMembers.some((m) => m.name?.trim());
  const hasLegal = !!(
    client.legalName ||
    client.commercialRegistrationNumber ||
    client.legalForm ||
    client.vatID ||
    client.numberOfEmployees ||
    client.foundingDate ||
    (client.knowsLanguage && client.knowsLanguage.length > 0)
  );
  const hasAbout = !!(
    client.description?.trim() ||
    client.seoDescription?.trim() ||
    client.introVideoUrl ||
    client.credentials.length > 0 ||
    hasLegal
  );
  const hasDiscussions = discussions.length > 0;
  const hasContactSection = !!(
    (client.addressLatitude != null && client.addressLongitude != null) ||
    client.gbpProfileUrl ||
    client.gbpPlaceId ||
    addressLine
  );
  const hasTrust = !!(
    client.commercialRegistrationNumber ||
    client.legalName ||
    client.verificationImageUrl
  );
  const hasHours = hasOpeningHours(client.openingHoursSpecification);

  // Nav items — every section that actually renders, in mobile scroll order.
  // The mobile nav promotes the top-priority 3 to visible tabs and tucks the
  // rest behind «☰ المزيد»; desktop shows them all in a horizontal scroll bar.
  const navItems: SectionItem[] = [
    { id: "overview", label: "نظرة عامة", short: "البداية", icon: "🏠" },
    ...(hasServices ? [{ id: "services", label: "الخدمات", short: "الخدمات", icon: "🧩" }] : []),
    ...(hasResults ? [{ id: "results", label: "نتائج موثّقة", short: "النتائج", icon: "📈" }] : []),
    { id: "reviews", label: "آراء العملاء", short: "التقييمات", icon: "⭐" },
    ...(hasGallery ? [{ id: "gallery", label: "معرض الأعمال", short: "الأعمال", icon: "🖼️" }] : []),
    ...(hasTeam ? [{ id: "team", label: "فريق العمل", short: "الفريق", icon: "👥" }] : []),
    ...(hasAbout ? [{ id: "about", label: "عن الشركة", short: "عن الشركة", icon: "🏢" }] : []),
    ...(articleCount > 0 ? [{ id: "articles", label: "المقالات", short: "المقالات", icon: "📰" }] : []),
    ...(hasDiscussions ? [{ id: "discussions", label: "نقاشات القرّاء", short: "النقاشات", icon: "💬" }] : []),
    { id: "faq", label: "الأسئلة الشائعة", short: "الأسئلة", icon: "❓" },
    ...(hasContactSection ? [{ id: "contact", label: "الموقع والتواصل", short: "التواصل", icon: "📍" }] : []),
    ...(hasHours ? [{ id: "hours", label: "ساعات العمل", short: "الدوام", icon: "🕐" }] : []),
    ...(hasTrust ? [{ id: "trust", label: "الموثوقية", short: "الموثوقية", icon: "🛡️" }] : []),
    { id: "newsletter", label: "النشرة البريدية", short: "النشرة", icon: "📩" },
  ];

  return (
    <div className="w-full">
      {renderHero && (
        <div id="overview">
          <ClientHeroV2
            client={{
              id: client.id,
              name: client.name,
              slug: client.slug,
              logoMedia: client.logoMedia,
              heroImageMedia: client.heroImageMedia,
              industry: client.industry,
              addressCity: client.addressCity,
              addressRegion: client.addressRegion,
              addressCountry: client.addressCountry,
              foundingDate: client.foundingDate,
              sameAs: client.sameAs,
              url: client.url,
              phone: client.phone,
            }}
            stats={{
              followers: stats.followers,
              articles: articleCount,
              totalViews: stats.totalViews,
              rating: reviews.averageRating,
              reviewCount: reviews.reviewCount,
            }}
            pageState={pageState}
            featured={!!client.isFeatured}
            ctaMode={client.ctaMode}
            user={user}
            initialIsFollowing={initialIsFollowing}
          />
        </div>
      )}

      <ClientSectionNav items={navItems} />
      <ClientSectionMenu items={navItems} />

      <div className="px-4 py-5 sm:px-5">
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_290px]">
          {/* MAIN */}
          <div className="flex min-w-0 flex-col gap-[18px]">
            <ClientServicesSection services={client.services} />
            <ClientResultsSection achievements={client.achievements} />
            <ClientReviewsSection
              reviews={reviews.reviews.map((r) => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                author: { name: r.author?.name ?? null, image: r.author?.image ?? null },
              }))}
              averageRating={reviews.averageRating}
              reviewCount={reviews.reviewCount}
              googleUrl={client.gbpProfileUrl ?? null}
              slug={client.slug}
              isLoggedIn={!!user}
            />
            <ClientGallerySection images={gallery} />
            <ClientTeamSection teamMembers={client.teamMembers} />
            <ClientAboutSection
              videoUrl={client.introVideoUrl}
              aboutText={client.description || client.seoDescription}
              credentials={client.credentials.map((c) => ({
                name: c.name,
                authority: c.authority ?? null,
                year: c.year ?? null,
                url: c.url ?? null,
              }))}
              legal={{
                legalName: client.legalName,
                commercialRegistrationNumber: client.commercialRegistrationNumber,
                legalForm: client.legalForm,
                vatID: client.vatID,
                numberOfEmployees: client.numberOfEmployees,
                foundingDate: client.foundingDate,
                knowsLanguage: client.knowsLanguage,
              }}
            />
            {articleCount > 0 && (
              <ClientArticlesSection
                slug={client.slug}
                totalCount={articleCount}
                posts={posts}
                totals={{
                  views: stats.totalViews,
                  likes: 0,
                  comments: discussions.length,
                  shares: 0,
                }}
                topics={topics}
              />
            )}
            <ClientDiscussionsSection comments={discussions} />
            <ClientFaqSection faqs={faqs} slug={client.slug} />
            <ClientContactSection
              lat={client.addressLatitude ?? null}
              lng={client.addressLongitude ?? null}
              gbpProfileUrl={client.gbpProfileUrl ?? null}
              gbpPlaceId={client.gbpPlaceId ?? null}
              clientName={client.name}
              addressLine={addressLine}
            />
          </div>

          {/* SIDEBAR */}
          <aside className="flex flex-col gap-[18px] lg:sticky lg:top-[60px]">
            <ClientQuickContact phone={client.phone ?? null} email={client.email ?? null} clientId={client.id} />
            <ClientHours openingHours={client.openingHoursSpecification} />
            <ClientTrustCard
              name={client.name}
              legalName={client.legalName ?? null}
              commercialRegistrationNumber={client.commercialRegistrationNumber ?? null}
              issuingAuthority={null}
              vatID={client.vatID ?? null}
              addressLine={addressLine}
              foundingDate={client.foundingDate ?? null}
              verificationImageUrl={client.verificationImageUrl ?? null}
              maaroofUrl={null}
              verifiedAt={null}
            />
            <div id="newsletter" className="scroll-mt-[116px]">
              <ClientNewsletterCard clientId={client.id} clientName={client.name} />
            </div>
            <RelatedClients clients={relatedClients} clientId={client.id} />
          </aside>
        </div>
      </div>

      <div className="px-4 pb-6 sm:px-5">
        <ClientFooterCta clientId={client.id} />
      </div>

      <ClientWhatsAppFab phone={client.phone ?? null} clientId={client.id} />
      <ClientBottomBar
        clientId={client.id}
        clientName={client.name}
        clientSlug={client.slug}
        clientLogoUrl={client.logoMedia?.url ?? null}
        ctaMode={client.ctaMode}
        linkUrl={client.ctaUrl ?? null}
        ctaLabel={client.ctaLabel ?? null}
        phone={client.phone ?? null}
        email={client.email ?? null}
        user={user}
        initialIsFollowing={initialIsFollowing}
        initialIsFavorited={initialIsFavorited}
      />
    </div>
  );
}
