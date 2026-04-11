import { Metadata } from "next";
import { notFound } from "next/navigation";
import NextImage from "next/image";
import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import Link from "@/components/link";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateBreadcrumbStructuredData } from "@/lib/seo";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

async function getAuthorArticles(authorId: string) {
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
        select: { url: true, altText: true },
      },
    },
    orderBy: { datePublished: "desc" },
    take: 20,
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) return { title: "Author Not Found" };

  // Use cached metadata if available
  if (author.nextjsMetadata && typeof author.nextjsMetadata === "object") {
    return author.nextjsMetadata as Metadata;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";
  const title = (author.seoTitle || `${author.name} — Author`)?.slice(0, 51);
  const description = author.seoDescription || author.bio || `Articles by ${author.name}`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/authors/${author.slug}` },
    openGraph: {
      title,
      description,
      type: "profile",
      url: `${siteUrl}/authors/${author.slug}`,
      ...(author.image && { images: [{ url: author.image }] }),
    },
  };
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) notFound();

  const articles = await getAuthorArticles(author.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";

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
    const jsonLd = {
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
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: "الكاتب" },
          ]}
        />

        {/* Author Header */}
        <div className="flex flex-col items-center text-center mt-8 mb-10 gap-4">
          <Avatar className="h-24 w-24 ring-2 ring-primary/30 shadow-lg">
            <AvatarImage src={author.image ?? undefined} alt={author.imageAlt || author.name} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-bold">
              {author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{author.name}</h1>
            {author.jobTitle && (
              <p className="text-muted-foreground mt-1">{author.jobTitle}</p>
            )}
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

        {/* Articles */}
        {articles.length > 0 && (
          <section aria-labelledby="author-articles-heading">
            <h2 id="author-articles-heading" className="text-xl font-semibold mb-6">المقالات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((article) => (
                <Link key={article.slug} href={`/articles/${article.slug}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                    {article.featuredImage && (
                      <div className="relative aspect-video bg-muted">
                        <NextImage
                          src={article.featuredImage.url}
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
          </section>
        )}
      </div>
    </>
  );
}
