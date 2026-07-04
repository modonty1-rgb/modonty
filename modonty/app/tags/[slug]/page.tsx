import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus, CommentStatus, SubscriptionStatus } from "@prisma/client";
import { HashIcon } from "lucide-react";
import { db } from "@/lib/db";
import { getClientsGA4Stats } from "@/lib/analytics/ga4";
import { generateMetadataFromSEO } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ClientCard } from "@/components/shared/client-card";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const tags = await db.tag.findMany({ select: { slug: true } });
    if (!tags || tags.length === 0) return [{ slug: "__no_tags__" }];
    return tags.map((t) => ({ slug: t.slug }));
  } catch {
    return [{ slug: "__no_tags__" }];
  }
}

async function getTagForMetadata(slug: string) {
  "use cache";
  cacheTag("tags");
  cacheLife("hours");
  return db.tag.findUnique({
    where: { slug },
    select: {
      name: true,
      seoTitle: true,
      seoDescription: true,
      socialImage: true,
      nextjsMetadata: true,
    },
  });
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const tag = await getTagForMetadata(decodedSlug);
    if (!tag) return { title: "وسم غير موجود - مدونتي" };
    if (tag.nextjsMetadata) {
      const { robots: _r, ...stored } = tag.nextjsMetadata as Metadata & { robots?: unknown };
      if (stored.title) return stored;
    }
    return generateMetadataFromSEO({
      title: (tag.seoTitle || `شركاء وسم: ${tag.name}`)?.slice(0, 51),
      description:
        tag.seoDescription ||
        `استكشف الشركاء المتخصصين في "${tag.name}" على مدونتي`,
      url: `/tags/${decodedSlug}`,
      type: "website",
      image: tag.socialImage || undefined,
    });
  } catch {
    return { title: "الوسوم - مدونتي" };
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const [tag, clients] = await Promise.all([
      db.tag.findUnique({
        where: { slug: decodedSlug },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          socialImage: true,
          socialImageAlt: true,
        },
      }),
      db.client.findMany({
        where: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          articles: {
            some: {
              status: ArticleStatus.PUBLISHED,
              tags: { some: { tag: { slug: decodedSlug } } },
            },
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

    if (!tag) notFound();

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
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: "الوسوم", href: "/tags" },
            { label: tag.name },
          ]}
        />

        {/* Hero */}
        {tag.socialImage ? (
          <section className="relative border-b overflow-hidden">
            <div className="relative w-full max-w-[1200px] mx-auto aspect-[1200/630]">
              <Image
                src={tag.socialImage}
                alt={tag.socialImageAlt ?? tag.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{tag.name}</h1>
                {tag.description && (
                  <p className="text-white/80 text-base max-w-xl mx-auto">{tag.description}</p>
                )}
                <p className="mt-4 text-sm text-white/70">{clients.length} شركة موثوقة</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-gradient-to-b from-primary/5 to-background py-10 border-b">
            <div className="container mx-auto max-w-[1128px] px-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border bg-muted">
                <HashIcon className="h-8 w-8 text-primary/50" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{tag.name}</h1>
              {tag.description && (
                <p className="text-muted-foreground text-base max-w-xl mx-auto">{tag.description}</p>
              )}
              <p className="mt-4 text-sm text-muted-foreground">{clients.length} شركة موثوقة</p>
            </div>
          </section>
        )}

        {/* Clients grid */}
        <div className="container mx-auto max-w-[1128px] px-4 py-10">
          {clients.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <HashIcon className="mx-auto mb-4 h-12 w-12 opacity-30" />
              <p className="text-lg">لا توجد شركات بهذا الوسم بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((c, index) => (
                <ClientCard
                  key={c.id}
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
