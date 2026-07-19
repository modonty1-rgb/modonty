import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus, CommentStatus, SubscriptionStatus } from "@prisma/client";
import { TagIcon } from "lucide-react";
import { db } from "@/lib/db";
import { getClientsGA4Stats } from "@/lib/analytics/ga4";
import { generateMetadataFromSEO, jsonLdHtmlFromString } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ClientCard } from "@/components/shared/client-card";

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
    if (!category) return { title: "فئة غير موجودة - مدونتي" };
    if (category.nextjsMetadata) {
      const stored = category.nextjsMetadata as Metadata;
      if (stored.title) return stored;
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
    return { title: "الفئات - مدونتي" };
  }
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  try {
    const [category, clients] = await Promise.all([
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
          articles: {
            some: { status: ArticleStatus.PUBLISHED, category: { slug } },
          },
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logoMedia: { select: { url: true } },
          heroImageMedia: { select: { url: true } },
          phone: true,
          addressCity: true,
          slogan: true,
          _count: { select: { articles: true } },
        },
      }),
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
            dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(category.jsonLdStructuredData) }}
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
              <Image
                src={category.socialImage}
                alt={category.socialImageAlt ?? category.name}
                fill
                priority
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
                <TagIcon className="h-8 w-8 text-primary/50" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-muted-foreground text-base max-w-xl mx-auto">{category.description}</p>
              )}
              <p className="mt-4 text-sm text-muted-foreground">{clients.length} شركة موثوقة</p>
            </div>
          </section>
        )}

        {/* Clients grid */}
        <div className="container mx-auto max-w-[1128px] px-4 py-10">
          {clients.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <TagIcon className="mx-auto mb-4 h-12 w-12 opacity-30" />
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
                  logoUrl={c.logoMedia?.url}
                  heroUrl={c.heroImageMedia?.url}
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
