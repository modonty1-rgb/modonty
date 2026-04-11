import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { generateMetadataFromSEO, generateBreadcrumbStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { ArticleStatus } from "@prisma/client";

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataFromSEO({
    title: "الوسوم",
    description: "تصفح جميع الوسوم في مودونتي واكتشف المقالات المصنّفة حسب المواضيع والاهتمامات",
    url: "/tags",
    type: "website",
  });
}

export default async function TagsPage() {
  await connection(); // dynamic — article publish dates require current time
  const tags = await db.tag.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: {
        select: {
          articles: {
            where: {
              article: {
                status: ArticleStatus.PUBLISHED,
                OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
              },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://modonty.com";

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "الرئيسية", url: "/" },
    { name: "الوسوم", url: "/tags" },
  ]);

  const collectionData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "الوسوم - مودونتي",
    description: "تصفح جميع الوسوم في مودونتي واكتشف المقالات المصنّفة حسب المواضيع",
    url: `${siteUrl}/tags`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: tags.length,
      itemListElement: tags.slice(0, 20).map((tag, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "DefinedTerm",
          name: tag.name,
          url: `${siteUrl}/tags/${tag.slug}`,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionData) }}
      />

      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الوسوم" },
        ]}
      />

      <div className="border-b bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto max-w-[1128px] px-4 py-10">
          <h1 className="text-3xl font-bold mb-2">الوسوم</h1>
          <p className="text-muted-foreground max-w-2xl">
            تصفح جميع الوسوم واكتشف المقالات المصنّفة حسب المواضيع والاهتمامات
          </p>
          <p className="text-sm text-muted-foreground mt-3">{tags.length} وسم</p>
        </div>
      </div>

      <div className="container mx-auto max-w-[1128px] px-4 py-8">
        <h2 className="sr-only">جميع الوسوم</h2>
        {tags.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">لا توجد وسوم حتى الآن.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="group flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                <span>{tag.name}</span>
                {tag._count.articles > 0 && (
                  <Badge
                    variant="secondary"
                    className="rounded-full text-xs group-hover:bg-primary-foreground/20 group-hover:text-primary-foreground"
                  >
                    {tag._count.articles}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
