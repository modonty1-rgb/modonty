import { Metadata } from "next";
import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";
import { notFound } from "next/navigation";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { cacheTag, cacheLife } from "next/cache";
import Link from "next/link";
import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { ArticleStatus } from "@prisma/client";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { buildHreflangLanguages } from "@modonty/shared/lib/seo/build-hreflang-languages";
import { buildSiteEntityIds } from "@modonty/shared/lib/seo/site-entity-ids";

import { generateBreadcrumbStructuredData, jsonLdHtml, jsonLdHtmlFromString } from "@/lib/seo";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { SITE_URL, LOGO_URL, BRAND_AR, MODONTY_AUTHOR_SLUG } from "@/constants";
import { getPlatformSocialLinks } from "@/lib/settings/get-platform-social-links";
import { IconFacebook, IconLinkedin, IconTwitter, IconExternal, IconEmail } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FeedPagination } from "@/components/shared/pagination/FeedPagination";
import { FEED_ALTERNATE_TYPES } from "@/lib/seo/feed-alternate-types";

// Channel key → brand icon (registry only; no barrel lucide imports). Others fall back to a
// generic external-link glyph — the Arabic label carries the platform name.
const CHANNEL_ICON: Record<string, typeof IconExternal> = {
  facebook: IconFacebook,
  linkedin: IconLinkedin,
  twitter: IconTwitter,
};

const AUTHOR_PAGE_SIZE = 20;

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

function parseAuthorPage(value: string | string[] | undefined): number {
  const page = Number.parseInt(Array.isArray(value) ? value[0] : value || "", 10);
  return Number.isFinite(page) && page > 1 ? page : 1;
}

export async function generateStaticParams() {
  try {
    const authors = await db.author.findMany({ select: { slug: true } });
    if (!authors || authors.length === 0) {
      // Cache Components needs at least one param at build time.
      return [{ slug: "__no_authors__" }];
    }
    return authors.map((a) => ({ slug: a.slug }));
  } catch {
    return [{ slug: "__no_authors__" }];
  }
}

async function getAuthorBySlug(slug: string) {
  return db.author.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      firstName: true,
      lastName: true,
      bio: true,
      image: true,
      imageAlt: true,
      url: true,
      jobTitle: true,
      verificationStatus: true,
      email: true,
      linkedIn: true,
      twitter: true,
      facebook: true,
      sameAs: true,
      credentials: true,
      expertiseAreas: true,
      memberOf: true,
      seoTitle: true,
      seoDescription: true,
      canonicalUrl: true,
      jsonLdStructuredData: true,
      nextjsMetadata: true,
    },
  });
}

async function getAuthorArticles(authorId: string, page: number) {
  // Cached for the same reason as the helpers below — the publish-date guard reads the
  // clock, and Next 16 forbids the current time in an uncached prerender scope.
  "use cache";
  cacheTag("authors");
  cacheLife("hours");
  return db.article.findMany({
    where: {
      authorId,
      status: ArticleStatus.PUBLISHED,
      OR: [
        { datePublished: null },
        { datePublished: { lte: new Date() } },
      ],
    },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      datePublished: true,
      featuredImage: {
        select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true },
      },
    },
    orderBy: { datePublished: "desc" },
    skip: (page - 1) * AUTHOR_PAGE_SIZE,
    take: AUTHOR_PAGE_SIZE + 1,
  });
}

// Cached + EXCLUSIVE to metadata (not shared with the dynamic page) so the tags land
// in the prerendered shell <head> instead of being streamed into <body>.
async function getAuthorForMetadata(slug: string) {
  "use cache";
  cacheTag("authors");
  cacheLife("hours");
  return db.author.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      seoTitle: true,
      seoDescription: true,
      bio: true,
      image: true,
      nextjsMetadata: true,
    },
  });
}

export async function generateMetadata({ params, searchParams }: AuthorPageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const page = parseAuthorPage(query.page);
  const author = await getAuthorForMetadata(slug);

  // Arabic, like every other not-found title on this site — an English string here is what
  // Google would show for an ar-SA URL. `noindex` because there is nothing to index: the page
  // below calls notFound(), and proxy.ts answers 410 for a slug that no longer exists.
  if (!author) {
    return { title: "كاتب غير موجود", robots: { index: false, follow: false } };
  }

  // Use cached metadata if available.
  // `absolute` opts out of the root layout's `%s | مدونتي` template: the stored
  // title already embeds the brand (admin generator appends it), so letting the
  // template run again shipped «… | مدونتي | مدونتي» (GEO audit, بند ٥ب).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";
  const baseAuthorUrl = `${siteUrl}/authors/${author.slug}`;
  const authorUrl = page > 1 ? `${baseAuthorUrl}?page=${page}` : baseAuthorUrl;
  const articleChunk = await getAuthorArticles(author.id, page);
  const pagination = {
    previous: page > 1 ? (page === 2 ? baseAuthorUrl : `${baseAuthorUrl}?page=${page - 1}`) : undefined,
    next: articleChunk.length > AUTHOR_PAGE_SIZE ? `${baseAuthorUrl}?page=${page + 1}` : undefined,
  };

  if (author.nextjsMetadata && typeof author.nextjsMetadata === "object") {
    const stored = author.nextjsMetadata as Metadata;
    const canonicalUrl = page > 1 ? authorUrl : String(stored.alternates?.canonical ?? authorUrl);
    return {
      ...stored,
      ...(typeof stored.title === "string" && { title: { absolute: stored.title } }),
      // hreflang is read live, not inherited from the blob: blobs written before
      // 2026-08-15 carry a single locale because the generator hardcoded one.
      alternates: {
        ...stored.alternates,
        canonical: canonicalUrl,
        languages: buildHreflangLanguages(
          (await getPageSeoDefaults()).alternateLanguages,
          canonicalUrl,
          siteUrl,
        ),
        types: FEED_ALTERNATE_TYPES,
      },
      pagination,
    };
  }
  // Arabic fallbacks. These are the `<title>` and meta description of an indexed ar-SA page,
  // so an English one ("… — Author", "Articles by …") is not a neutral placeholder — it is what
  // Google shows in the results for an Arabic site. Measured on /authors/modonty, 25 Aug 2026.
  const title = (author.seoTitle || `${author.name} — كاتب في مدونتي`)?.slice(0, 51);
  const description = author.seoDescription || author.bio || `مقالات ${author.name} على مدونتي`;

  return {
    // Live titles may embed the brand too (seoTitle) — same template opt-out.
    title: { absolute: title },
    description,
    alternates: {
      canonical: authorUrl,
      languages: buildHreflangLanguages(
        (await getPageSeoDefaults()).alternateLanguages,
        authorUrl,
        siteUrl,
      ),
      types: FEED_ALTERNATE_TYPES,
    },
    pagination,
    openGraph: {
      title,
      description,
      type: "profile",
      url: authorUrl,
      ...(author.image && { images: [{ url: author.image }] }),
    },
  };
}

export default async function AuthorPage({ params, searchParams }: AuthorPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const page = parseAuthorPage(query.page);
  const author = await getAuthorBySlug(slug);

  if (!author) notFound();

  const articleChunk = await getAuthorArticles(author.id, page);
  const hasMore = articleChunk.length > AUTHOR_PAGE_SIZE;
  const articles = articleChunk.slice(0, AUTHOR_PAGE_SIZE);
  const siteUrl = SITE_URL;

  // Modonty is the platform-brand publisher → a rich "publisher profile" header with the
  // brand's official channels. A future individual writer keeps the simple person header.
  const isOrg = author.slug === MODONTY_AUTHOR_SLUG;
  const socialLinks = isOrg ? await getPlatformSocialLinks() : [];

  // Use cached JSON-LD if available, otherwise generate live
  let jsonLdString: string;
  if (author.jsonLdStructuredData) {
    jsonLdString = author.jsonLdStructuredData;
  } else {
    const sameAs: string[] = [
      ...(author.linkedIn ? [author.linkedIn] : []),
      ...(author.twitter ? [author.twitter] : []),
      ...(author.facebook ? [author.facebook] : []),
      ...(author.sameAs || []),
    ];
    // Modonty = the platform-brand Organization author (same @id as the site #organization
    // node + every article's author → one authoritative entity). A future individual writer
    // stays a Person, which is correct for a person.
    const jsonLd =
      author.slug === MODONTY_AUTHOR_SLUG
        ? {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": buildSiteEntityIds(siteUrl).organization,
            name: author.name,
            url: siteUrl,
            logo: { "@type": "ImageObject", url: LOGO_URL },
            ...(author.bio && { description: author.bio }),
            ...(author.email && { email: author.email }),
            ...(sameAs.length > 0 && { sameAs }),
          }
        : {
            "@context": "https://schema.org",
            "@type": "Person",
            name: author.name,
            ...(author.firstName && { givenName: author.firstName }),
            ...(author.lastName && { familyName: author.lastName }),
            ...(author.bio && { description: author.bio }),
            ...(author.image && { image: author.image }),
            url: `${siteUrl}/authors/${author.slug}`,
            ...(author.jobTitle && { jobTitle: author.jobTitle }),
            ...(author.email && { email: author.email }),
            ...(sameAs.length > 0 && { sameAs }),
            ...(author.expertiseAreas && author.expertiseAreas.length > 0 && { knowsAbout: author.expertiseAreas }),
            ...(author.credentials && author.credentials.length > 0 && { hasCredential: author.credentials }),
            ...(author.memberOf && author.memberOf.length > 0 && {
              memberOf: author.memberOf.map((org) => ({ "@type": "Organization", name: org })),
            }),
          };
    jsonLdString = JSON.stringify(jsonLd);
  }

  const breadcrumbJsonLd = generateBreadcrumbStructuredData([
    { name: "الرئيسية", url: "/" },
    { name: author.name, url: `/authors/${author.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(jsonLdString) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: "الكاتب" },
          ]}
        />

        {/* Publisher profile (Modonty = Organization) */}
        {isOrg ? (
          <section
            aria-label="عن الناشر"
            className="mt-8 mb-10 overflow-hidden rounded-2xl border bg-gradient-to-b from-primary/[0.07] via-background to-background"
          >
            <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-border">
                <OptimizedImage
                  media={asMedia(LOGO_URL)}
                  alt={author.imageAlt || author.name}
                  width={72}
                  height={72}
                  // Was missing entirely before the swap — the shared component turns that
                  // into a compile error instead of a silent 100vw assumption.
                  sizes="72px"
                  className="object-contain"
                  preload
                />
              </div>

              <div className="space-y-1">
                <h1 className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tight">
                  {author.name}
                  {author.verificationStatus && (
                    <span title="ناشر موثّق" className="inline-flex text-primary">
                      <VerifiedBadge className="h-6 w-6" label="ناشر موثّق" />
                    </span>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">{BRAND_AR} · منصّة محتوى</p>
              </div>

              {author.bio && (
                <p className="max-w-2xl leading-relaxed text-muted-foreground">{author.bio}</p>
              )}

              {socialLinks.length > 0 && (
                <nav aria-label="القنوات الرسمية" className="mt-1 flex flex-wrap justify-center gap-2">
                  {socialLinks.map((s) => {
                    const Icon = CHANNEL_ICON[s.key] ?? IconExternal;
                    return (
                      <a
                        key={s.key}
                        href={s.href}
                        target="_blank"
                        rel="me noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {s.label}
                      </a>
                    );
                  })}
                </nav>
              )}

              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="font-bold tabular-nums text-foreground">{articles.length}</span>
                مقال منشور
                {author.email && (
                  <>
                    <span className="mx-1 text-border">·</span>
                    <a href={`mailto:${author.email}`} className="inline-flex items-center gap-1 hover:text-primary">
                      <IconEmail className="h-3.5 w-3.5" />
                      تواصل
                    </a>
                  </>
                )}
              </div>
            </div>
          </section>
        ) : (
          /* Individual author (Person) */
          <div className="flex flex-col items-center text-center mt-8 mb-10 gap-4">
            <Avatar className="h-24 w-24 ring-2 ring-primary/30 shadow-lg">
              <AvatarImage src={author.image ?? undefined} alt={author.imageAlt || author.name} />
              <AvatarFallback className="text-2xl bg-secondary text-secondary-foreground font-bold">
                {author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{author.name}</h1>
              {author.jobTitle && <p className="text-muted-foreground mt-1">{author.jobTitle}</p>}
            </div>
            {author.bio && (
              <p className="text-muted-foreground max-w-xl leading-relaxed">{author.bio}</p>
            )}
            {author.expertiseAreas && author.expertiseAreas.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {author.expertiseAreas.map((area) => (
                  <span key={area} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <section aria-labelledby="author-articles-heading">
            <h2 id="author-articles-heading" className="text-xl font-semibold mb-6">
              {isOrg ? "أحدث ما نشرته مدوّنتي" : "المقالات"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((article) => (
                <Link key={article.slug} href={`/articles/${article.slug}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                    {article.featuredImage && (
                      <div className="relative aspect-video bg-muted">
                        <OptimizedImage
                          media={article.featuredImage}
                          alt={article.featuredImage.altText || article.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.excerpt}</p>
                      )}
                      {article.datePublished && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Intl.DateTimeFormat("ar-SA", { year: "numeric", month: "long", day: "numeric" }).format(new Date(article.datePublished))}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {(page > 1 || hasMore) && (
              <div className="mt-6">
                <FeedPagination
                  page={page}
                  hasMore={hasMore}
                  buildHref={(target) =>
                    target === 1 ? `/authors/${author.slug}` : `/authors/${author.slug}?page=${target}`
                  }
                  label="تنقّل بين صفحات مقالات الكاتب"
                />
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
