import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { generateMetadataFromSEO } from "@/lib/seo";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { getArticleDefaultsFromSettings } from "@/app/(dashboard)/settings/helpers/get-article-defaults-from-settings";
import Link from "next/link";
import Image from "next/image";
import { formatRelativeTime } from "@/helpers/utils/format-relative-time";
import { GTMClientTracker } from "@/components/gtm/GTMClientTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PreviewValidationSection } from "../../components/preview/preview-validation-section";
import { AnalyticsSection } from "../../components/preview/analytics-section";
import { getPreviewArticle, getMoreFromAuthor, getMoreFromClient } from "../helpers/preview-article-data";
import { PreviewBreadcrumb } from "../components/preview-breadcrumb";
import { PreviewReadingProgress } from "../components/preview-reading-progress";
import { PreviewTags } from "../components/preview-tags";
import { PreviewToc } from "../components/preview-toc";
import { PreviewAuthorBio } from "../components/preview-author-bio";
import { PreviewGallery } from "../components/preview-gallery";
import { PreviewCitations } from "../components/preview-citations";
import { PreviewCommentsStub } from "../components/preview-comments-stub";
import { PreviewNewsletterStub } from "../components/preview-newsletter-stub";
import { PreviewMoreFromAuthor } from "../components/preview-more-from-author";
import { PreviewMoreFromClient } from "../components/preview-more-from-client";
import { PreviewManualRelated } from "../components/preview-manual-related";
import { PreviewRelatedStub } from "../components/preview-related-stub";

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PreviewPageProps): Promise<Metadata> {
  try {
    const { id } = await params;

    const article = await db.article.findUnique({
      where: { id },
      select: {
        nextjsMetadata: true,
        nextjsMetadataLastGenerated: true,
        seoTitle: true,
        title: true,
        seoDescription: true,
        excerpt: true,
        canonicalUrl: true,
        slug: true,
        featuredImageId: true,
        clientId: true,
      },
    });

    if (!article) return { title: "مقال غير موجود - مودونتي" };

    if (article.nextjsMetadata) {
      try {
        const stored = article.nextjsMetadata as Metadata;
        if (stored.title) {
          return {
            ...stored,
            robots: {
              index: false,
              follow: false,
              googleBot: {
                index: false,
                follow: false,
                "max-video-preview": -1,
                "max-image-preview": "large" as const,
                "max-snippet": -1,
              },
            },
          };
        }
      } catch {
        console.warn("Invalid stored metadata for article:", id);
      }
    }

    const articleForGeneration = await db.article.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            name: true,
            logoMedia: { select: { url: true } },
            ogImageMedia: { select: { url: true } },
          },
        },
        author: { select: { name: true } },
        category: { select: { name: true } },
        featuredImage: { select: { url: true, altText: true } },
      },
    });

    if (!articleForGeneration) return { title: "مقال غير موجود - مودونتي" };

    const settings = await getAllSettings();
    const articleDefaults = getArticleDefaultsFromSettings(settings);

    const title = articleForGeneration.seoTitle || articleForGeneration.title;
    const description = articleForGeneration.seoDescription || articleForGeneration.excerpt || "";
    const image =
      articleForGeneration.featuredImage?.url ||
      articleForGeneration.client?.ogImageMedia?.url ||
      articleForGeneration.client?.logoMedia?.url ||
      undefined;

    return generateMetadataFromSEO(
      {
        title,
        description,
        image,
        url: articleForGeneration.canonicalUrl || `/articles/${articleForGeneration.slug}`,
        type: "article",
        locale: articleDefaults.ogLocale || "ar_SA",
      },
      { robots: "noindex,nofollow" }
    );
  } catch (error) {
    console.error("Error generating metadata:", error);
    return { title: "مقال - مودونتي" };
  }
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;

  try {
    if (!id || typeof id !== "string") {
      console.warn("[Preview] Missing or invalid id param:", id);
      notFound();
    }

    const [articleRaw, settings] = await Promise.all([
      getPreviewArticle(id),
      getAllSettings(),
    ]);
    if (!articleRaw) {
      console.warn("[Preview] Article not found for id:", id);
      notFound();
    }
    const articleDefaults = getArticleDefaultsFromSettings(settings);
    const article = { ...articleRaw, ...articleDefaults };

    const [moreFromAuthor, moreFromClient] = await Promise.all([
      article.authorId ? getMoreFromAuthor(article.authorId, id) : Promise.resolve([]),
      article.clientId ? getMoreFromClient(article.clientId, id) : Promise.resolve([]),
    ]);

    let jsonLdGraph: object | null = null;
    if (article.jsonLdStructuredData) {
      try {
        jsonLdGraph = JSON.parse(article.jsonLdStructuredData);
      } catch {
        console.error("Failed to parse cached JSON-LD for article:", id);
      }
    }

    const count = article._count;
    const commentsCount = 0;

    return (
      <>
        {jsonLdGraph && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
          />
        )}

        {article.client && (
          <GTMClientTracker
            clientContext={{
              client_id: article.client.id,
              client_slug: article.client.slug ?? undefined,
              client_name: article.client.name,
            }}
            articleId={article.id}
            pageTitle={article.seoTitle || article.title}
          />
        )}

        <PreviewReadingProgress />
        <PreviewBreadcrumb
          clientName={article.client?.name ?? null}
          clientId={article.client?.id ?? null}
          title={article.title}
        />

        <div className="min-h-screen bg-background">
          <div className="container mx-auto max-w-[1128px] px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex-1">
            <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start gap-6 md:gap-8">
              <div className="w-full min-w-0">
                <article>
                  <header className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-semibold mb-4">
                      {article.title}
                    </h1>

                    {article.excerpt && (
                      <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <span>{article.author?.name}</span>
                      </div>
                      <time
                        dateTime={(article.datePublished ?? article.createdAt).toISOString()}
                        suppressHydrationWarning
                      >
                        {article.datePublished
                          ? formatRelativeTime(article.datePublished)
                          : formatRelativeTime(article.createdAt)}
                      </time>
                      {article.readingTimeMinutes != null && (
                        <span>⏱️ {article.readingTimeMinutes} دقيقة قراءة</span>
                      )}
                      {article.wordCount != null && <span>📝 {article.wordCount} كلمة</span>}
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
                      <span>{commentsCount} تعليقات</span>
                      <span>·</span>
                      <span>{(count?.views ?? 0).toLocaleString()} مشاهدة</span>
                    </div>

                    {article.featuredImage && (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
                        <Image
                          src={article.featuredImage.url}
                          alt={article.featuredImage.altText || article.title}
                          fill
                          className="object-cover"
                          priority
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 800px, 1200px"
                        />
                      </div>
                    )}

                    <PreviewTags
                      client={article.client}
                      category={article.category}
                      tags={article.tags}
                    />
                  </header>

                    <div
                      id="article-content"
                      className="prose prose-base md:prose-lg max-w-none mb-8 md:mb-12"
                      style={{ lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />

                    {article.author && (
                      <PreviewAuthorBio
                        author={{
                          name: article.author.name,
                          slug: article.author.slug,
                          image: article.author.image,
                          jobTitle: article.author.jobTitle,
                          bio: article.author.bio,
                        }}
                      />
                    )}

                    <PreviewGallery
                      gallery={(article.gallery ?? []).map((g) => ({
                        id: g.id,
                        media: {
                          url: g.media.url,
                          altText: g.media.altText,
                          caption: g.media.caption,
                        },
                      }))}
                    />

                    {article.faqs && article.faqs.length > 0 && (
                      <section className="my-8 md:my-12" aria-labelledby="faq-heading">
                        <h2 id="faq-heading" className="text-xl font-semibold mb-6">
                          الأسئلة الشائعة
                        </h2>
                        <div className="space-y-4">
                          {article.faqs.map((faq) => (
                            <Card key={faq.id}>
                              <CardHeader>
                                <CardTitle className="text-lg">{faq.question}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-muted-foreground leading-relaxed">
                                  {faq.answer}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </section>
                    )}

                    <PreviewCitations citations={article.citations ?? []} />

                    <PreviewCommentsStub />
                    <PreviewNewsletterStub />

                    {article.author && moreFromAuthor.length > 0 && (
                      <PreviewMoreFromAuthor
                        articles={moreFromAuthor}
                        authorName={article.author.name}
                      />
                    )}

                    {article.client && moreFromClient.length > 0 && (
                      <PreviewMoreFromClient
                        articles={moreFromClient}
                        clientName={article.client.name}
                      />
                    )}

                    {(article.relatedTo ?? []).length > 0 ? (
                      <PreviewManualRelated related={article.relatedTo ?? []} />
                    ) : (
                      <PreviewRelatedStub />
                    )}

                    <footer className="my-8 md:my-12 pt-6 md:pt-8 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          {article.client && (
                            <p className="text-sm text-muted-foreground">
                              نشر بواسطة{" "}
                              <Link
                                href={`/clients/${article.client.id}`}
                                className="text-primary underline"
                              >
                                {article.client.name}
                              </Link>
                            </p>
                          )}
                          {article.dateModified && (
                            <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
                              آخر تحديث: {formatRelativeTime(article.dateModified)}
                            </p>
                          )}
                          {article.lastReviewed && (
                            <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
                              آخر مراجعة: {formatRelativeTime(article.lastReviewed)}
                            </p>
                          )}
                          {article.contentDepth && (
                            <p className="text-xs text-muted-foreground mt-1">
                              عمق المحتوى: {article.contentDepth}
                            </p>
                          )}
                          {article.license && (
                            <p className="text-xs text-muted-foreground mt-1">
                              الرخصة: {article.license}
                            </p>
                          )}
                        </div>
                      </div>
                    </footer>
                  </article>

                <AnalyticsSection articleId={article.id} />
                <PreviewValidationSection articleId={article.id} />
              </div>

              <aside
                className="hidden lg:block lg:max-w-[280px] shrink-0"
                role="complementary"
                aria-label="جدول المحتويات"
              >
                <PreviewToc content={article.content} />
              </aside>
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("[Preview] Error fetching article:", error);
    notFound();
  }
}
