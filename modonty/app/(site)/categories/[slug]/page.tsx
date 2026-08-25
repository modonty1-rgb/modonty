import type { Metadata } from "next";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { notFound } from "next/navigation";
import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus, CommentStatus, SubscriptionStatus } from "@prisma/client";
import { IconCategory } from "@/lib/icons";
import { db } from "@/lib/db";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { getClientsGA4Stats } from "@/lib/analytics/ga4";
import { generateMetadataFromSEO, localizedStoredBreadcrumbJsonLd } from "@/lib/seo";
import { messages } from "@/lib/i18n/messages";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ClientCard } from "@/components/client/client-card";
import { ReadArticlesLink } from "@/components/shared/read-articles-link/ReadArticlesLink";
import { FEED_ALTERNATE_TYPES } from "@/lib/seo/feed-alternate-types";

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const categories = await db.category.findMany({ select: { slug: true } });
    if (!categories || categories.length === 0) return [{ slug: "__no_categories__" }];
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [{ slug: "__no_categories__" }];
  }
}

// The count reads the clock (scheduled articles), and Next 16 forbids the current time in an
// uncached prerender scope — so it lives in its own cached function, like getCategoryForMetadata.
async function countCategoryArticles(slug: string) {
  "use cache";
  cacheTag("categories");
  cacheLife("hours");
  return db.article.count({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
      category: { slug },
    },
  });
}

async function getCategoryForMetadata(slug: string) {
  "use cache";
  cacheTag("categories");
  cacheLife("hours");
  return db.category.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
      socialImage: true,
      nextjsMetadata: true,
    },
  });
}

export async function generateMetadata({ params }: CategoryDetailPageProps): Promise<Metadata> {
  try {
    const { slug: rawSlug } = await params;
    const slug = decodeURIComponent(rawSlug);
    const category = await getCategoryForMetadata(slug);
    if (!category) return { title: "فئة غير موجودة" };
    if (category.nextjsMetadata) {
      const stored = category.nextjsMetadata as Metadata;
      // Blob as baked, plus the feed link — admin never writes `alternates.types`, and
      // returning the blob sets `alternates`, which replaces the root layout's copy in Next
      // instead of merging with it.
      if (stored.title) {
        return { ...stored, alternates: { ...stored.alternates, types: FEED_ALTERNATE_TYPES } };
      }
    }
    return generateMetadataFromSEO({
      title: (category.seoTitle || category.name)?.slice(0, 51),
      description:
        category.seoDescription ||
        category.description ||
        `استكشف شركاء متخصصين في ${category.name} على مدونتي`,
      keywords: [category.name],
      url: `/categories/${slug}`,
      type: "website",
      image: category.socialImage || undefined,
    });
  } catch {
    return { title: "الفئات" };
  }
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  // Modonty is the platform, not one of the partners this page lists. Cached for hours and
  // busted by the `settings` tag, so this is not a per-visit round-trip before the fan-out.
  const coreClientId = await getCoreClientId();

  try {
    const [category, clients, articleCount] = await Promise.all([
      db.category.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          socialImage: true,
          socialImageAlt: true,
          jsonLdStructuredData: true,
        },
      }),
      db.client.findMany({
        where: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          ...(coreClientId ? { id: { not: coreClientId } } : {}),
          articles: {
            some: { status: ArticleStatus.PUBLISHED, category: { slug } },
          },
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
          heroImageMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
          phone: true,
          addressCity: true,
          slogan: true,
          _count: { select: { articles: true } },
        },
      }),
      // How many articles this category actually holds — the read-link stays hidden at zero.
      countCategoryArticles(slug),
    ]);

    if (!category) notFound();

    const clientIds = clients.map((c) => c.id);

    const [ga4Stats, ratingsRaw] = await Promise.all([
      getClientsGA4Stats(),
      clientIds.length > 0
        ? db.clientReview.groupBy({
            by: ["clientId"],
            where: { clientId: { in: clientIds }, status: CommentStatus.APPROVED },
            _avg: { rating: true },
          })
        : Promise.resolve([]),
    ]);

    const ratingMap = new Map(ratingsRaw.map((r) => [r.clientId, r._avg.rating ?? 0]));

    return (
      <>
        {/* CollectionPage JSON-LD — DB cache (@graph: CollectionPage/BreadcrumbList/DefinedTerm/Organization),
            same serve-the-stored pattern as the client page. Emitted only when generated. */}
        {category.jsonLdStructuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: localizedStoredBreadcrumbJsonLd(category.jsonLdStructuredData, {
                Home: messages.chrome.footer.home,
                Categories: messages.chrome.menuItems.categories,
              }),
            }}
          />
        )}
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: "الفئات", href: "/categories" },
            { label: category.name },
          ]}
        />

        {/* Hero */}
        {category.socialImage ? (
          <section className="relative border-b overflow-hidden">
            <div className="relative w-full max-w-[1200px] mx-auto aspect-[1200/630]">
              <OptimizedImage
                media={asMedia(category.socialImage, category.socialImageAlt ?? category.name)}
                alt={category.socialImageAlt ?? category.name}
                fill
                preload
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{category.name}</h1>
                {category.description && (
                  <p className="text-white/80 text-base max-w-xl mx-auto">{category.description}</p>
                )}
                <p className="mt-4 text-sm text-white/70">{clients.length} شركة موثوقة</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-gradient-to-b from-primary/5 to-background py-10 border-b">
            <div className="container mx-auto max-w-[1128px] px-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border bg-muted">
                <IconCategory className="h-8 w-8 text-primary/50" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-muted-foreground text-base max-w-xl mx-auto">{category.description}</p>
              )}
              <p className="mt-4 text-sm text-muted-foreground">{clients.length} شركة موثوقة</p>
            </div>
          </section>
        )}

        {/* The way out for a visitor who came to read, not to shop — this page lists partners. */}
        <ReadArticlesLink
          label={category.name}
          href={`/articles?category=${encodeURIComponent(category.slug)}`}
          count={articleCount}
        />

        {/* Clients grid */}
        <div className="container mx-auto max-w-[1128px] px-4 py-10">
          {clients.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <IconCategory className="mx-auto mb-4 h-12 w-12 opacity-30" />
              <p className="text-lg">لا توجد شركات في هذه الفئة بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((c, index) => (
                <ClientCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  slug={c.slug}
                  logoUrl={mediaSrc(c.logoMedia) ?? undefined}
                  heroUrl={mediaSrc(c.heroImageMedia) ?? undefined}
                  slogan={c.slogan}
                  addressCity={c.addressCity}
                  averageRating={ratingMap.get(c.id) ?? 0}
                  articleCount={c._count.articles}
                  googleTotal={ga4Stats[c.slug]?.total ?? 0}
                  phone={c.phone}
                  priority={index < 3}
                />
              ))}
            </div>
          )}
        </div>
      </>
    );
  } catch {
    notFound();
  }
}
