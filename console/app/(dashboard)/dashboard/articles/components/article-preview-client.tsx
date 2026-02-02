"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, MessageSquare, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { approveArticle, requestChanges } from "../actions/article-actions";
import { FeedbackForm } from "./feedback-form";
import type { ArticleWithAllData } from "../helpers/article-queries";
import Image from "next/image";

interface ArticlePreviewClientProps {
  article: ArticleWithAllData;
  clientId: string;
}

export function ArticlePreviewClient({ article, clientId }: ArticlePreviewClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["basic", "content"])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this article?")) return;

    setLoading(true);
    try {
      const result = await approveArticle(article.id, clientId);
      if (result.success) {
        router.push("/dashboard/articles");
        router.refresh();
      } else {
        alert(result.error || "Failed to approve article");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChanges = async (feedback: string) => {
    setLoading(true);
    try {
      const result = await requestChanges(article.id, clientId, feedback);
      if (result.success) {
        setShowFeedback(false);
        router.push("/dashboard/articles");
        router.refresh();
      } else {
        alert(result.error || "Failed to request changes");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({
    id,
    title,
    description,
  }: {
    id: string;
    title: string;
    description?: string;
  }) => {
    const isExpanded = expandedSections.has(id);
    return (
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="text-left">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/articles"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Articles
            </Link>
            <h1 className="text-2xl font-semibold leading-tight text-foreground">
              Article Preview
            </h1>
            <p className="text-muted-foreground mt-1">
              Review all article details before approval
            </p>
          </div>
          {article.status === "DRAFT" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFeedback(true)}
                disabled={loading}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
              <Button onClick={handleApprove} disabled={loading}>
                <Check className="h-4 w-4 mr-2" />
                {loading ? "Approving..." : "Approve Article"}
              </Button>
            </div>
          )}
        </div>

        <Card>
          <SectionHeader
            id="basic"
            title="Basic Content"
            description="Title, slug, excerpt, and metadata"
          />
          {expandedSections.has("basic") && (
            <CardContent className="pt-0 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <p className="text-foreground mt-1">{article.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Slug</label>
                <p className="text-foreground mt-1 font-mono text-sm">{article.slug}</p>
              </div>
              {article.excerpt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Excerpt
                  </label>
                  <p className="text-foreground mt-1">{article.excerpt}</p>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {article.wordCount && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Word Count
                    </label>
                    <p className="text-foreground mt-1">
                      {article.wordCount.toLocaleString()}
                    </p>
                  </div>
                )}
                {article.readingTimeMinutes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Reading Time
                    </label>
                    <p className="text-foreground mt-1">
                      {article.readingTimeMinutes} min
                    </p>
                  </div>
                )}
                {article.contentDepth && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Content Depth
                    </label>
                    <p className="text-foreground mt-1 capitalize">
                      {article.contentDepth}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Language
                  </label>
                  <p className="text-foreground mt-1 uppercase">{article.inLanguage}</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <SectionHeader
            id="content"
            title="Article Content"
            description={`Full article body (${article.contentFormat || "rich_text"})`}
          />
          {expandedSections.has("content") && (
            <CardContent className="pt-0">
              <div className="mb-2 text-xs text-muted-foreground">
                Format: {article.contentFormat || "rich_text"} ·{" "}
                {article.wordCount?.toLocaleString() || "—"} words ·{" "}
                {article.readingTimeMinutes || "—"} min read
              </div>
              <div
                className={`
                  prose prose-sm max-w-none dark:prose-invert
                  [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mb-4
                  [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3
                  [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2
                  [&_p]:mb-4 [&_p]:leading-relaxed
                  [&_ul]:list-disc [&_ul]:mr-6 [&_ul]:mb-4
                  [&_ol]:list-decimal [&_ol]:mr-6 [&_ol]:mb-4
                  [&_blockquote]:border-r-4 [&_blockquote]:border-primary [&_blockquote]:pr-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4
                  [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
                  [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:my-4
                  [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80
                  [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-4
                  [&_strong]:font-semibold [&_em]:italic
                `}
                dir={article.inLanguage === "ar" ? "rtl" : "ltr"}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </CardContent>
          )}
        </Card>

        <Card>
          <SectionHeader
            id="relationships"
            title="Relationships"
            description="Client, category, author, and tags"
          />
          {expandedSections.has("relationships") && (
            <CardContent className="pt-0 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Client</label>
                <p className="text-foreground mt-1">{article.client.name}</p>
              </div>
              {article.category && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Category
                  </label>
                  <p className="text-foreground mt-1">{article.category.name}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Author</label>
                <div className="mt-1">
                  <p className="text-foreground">{article.author.name}</p>
                  {article.author.bio && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {article.author.bio}
                    </p>
                  )}
                  {article.author.credentials.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Credentials: {article.author.credentials.join(", ")}
                    </p>
                  )}
                </div>
              </div>
              {article.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {article.tags.map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 text-xs rounded bg-muted text-foreground"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {article.featuredImage && (
          <Card>
            <SectionHeader
              id="featured-image"
              title="Featured Image"
              description="Main article image"
            />
            {expandedSections.has("featured-image") && (
              <CardContent className="pt-0">
                <div className="relative aspect-video w-full max-w-2xl rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={article.featuredImage.url}
                    alt={article.featuredImage.altText || article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                {article.featuredImage.altText && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Alt text: {article.featuredImage.altText}
                  </p>
                )}
                {article.featuredImage.caption && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Caption: {article.featuredImage.caption}
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {article.gallery.length > 0 && (
          <Card>
            <SectionHeader
              id="gallery"
              title="Image Gallery"
              description={`${article.gallery.length} image(s)`}
            />
            {expandedSections.has("gallery") && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {article.gallery.map((item) => (
                    <div
                      key={item.id}
                      className="relative aspect-video rounded-lg overflow-hidden bg-muted"
                    >
                      <Image
                        src={item.media.url}
                        alt={item.altText || item.media.altText || "Gallery image"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        <Card>
          <SectionHeader
            id="seo"
            title="SEO Meta Tags"
            description="Search engine optimization"
          />
          {expandedSections.has("seo") && (
            <CardContent className="pt-0 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  SEO Title
                </label>
                <p className="text-foreground mt-1">{article.seoTitle || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  SEO Description
                </label>
                <p className="text-foreground mt-1">{article.seoDescription || "—"}</p>
                {article.seoDescription && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {article.seoDescription.length} characters
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Meta Robots
                </label>
                <p className="text-foreground mt-1">{article.metaRobots || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Canonical URL
                </label>
                <p className="text-foreground mt-1 font-mono text-sm">
                  {article.canonicalUrl || "—"}
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <SectionHeader
            id="og"
            title="Open Graph"
            description="Social media sharing"
          />
          {expandedSections.has("og") && (
            <CardContent className="pt-0 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">OG Type</label>
                <p className="text-foreground mt-1">{article.ogType || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  OG Article Author
                </label>
                <p className="text-foreground mt-1">{article.ogArticleAuthor || "—"}</p>
              </div>
              {article.ogArticlePublishedTime && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    OG Published Time
                  </label>
                  <p className="text-foreground mt-1">
                    {new Date(article.ogArticlePublishedTime).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        <Card>
          <SectionHeader
            id="twitter"
            title="Twitter Cards"
            description="Twitter sharing metadata"
          />
          {expandedSections.has("twitter") && (
            <CardContent className="pt-0 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Twitter Card Type
                </label>
                <p className="text-foreground mt-1">{article.twitterCard || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Twitter Site
                </label>
                <p className="text-foreground mt-1">{article.twitterSite || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Twitter Creator
                </label>
                <p className="text-foreground mt-1">{article.twitterCreator || "—"}</p>
              </div>
            </CardContent>
          )}
        </Card>

        {article.faqs.length > 0 && (
          <Card>
            <SectionHeader
              id="faqs"
              title="FAQs"
              description={`${article.faqs.length} question(s)`}
            />
            {expandedSections.has("faqs") && (
              <CardContent className="pt-0 space-y-4">
                {article.faqs.map((faq) => (
                  <div key={faq.id} className="border-b border-border pb-4 last:border-0">
                    <h4 className="font-medium text-foreground mb-2">{faq.question}</h4>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        )}

        {article.relatedTo.length > 0 && (
          <Card>
            <SectionHeader
              id="related"
              title="Related Articles"
              description={`${article.relatedTo.length} article(s)`}
            />
            {expandedSections.has("related") && (
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {article.relatedTo.map((rel) => (
                    <li key={rel.id} className="text-sm">
                      <span className="text-foreground">{rel.related.title}</span>
                      {rel.relationshipType && (
                        <span className="text-muted-foreground ml-2">
                          ({rel.relationshipType})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        )}

        <Card>
          <SectionHeader
            id="technical"
            title="Technical SEO"
            description="Sitemap and technical settings"
          />
          {expandedSections.has("technical") && (
            <CardContent className="pt-0 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Sitemap Priority
                </label>
                <p className="text-foreground mt-1">
                  {article.sitemapPriority ?? "—"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Sitemap Change Frequency
                </label>
                <p className="text-foreground mt-1">
                  {article.sitemapChangeFreq || "—"}
                </p>
              </div>
              {article.breadcrumbPath && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Breadcrumb Path
                  </label>
                  <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(article.breadcrumbPath, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {article.jsonLdStructuredData && (
          <Card>
            <SectionHeader
              id="jsonld"
              title="JSON-LD Structured Data"
              description="Schema.org markup"
            />
            {expandedSections.has("jsonld") && (
              <CardContent className="pt-0">
                <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                  {article.jsonLdStructuredData}
                </pre>
                {article.jsonLdLastGenerated && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last generated:{" "}
                    {new Date(article.jsonLdLastGenerated).toLocaleString()}
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {(article.citations?.length ?? 0) > 0 && (
          <Card>
            <SectionHeader
              id="citations"
              title="Citations"
              description={`${article.citations?.length ?? 0} source(s)`}
            />
            {expandedSections.has("citations") && (
              <CardContent className="pt-0">
                <ul className="space-y-1">
                  {(article.citations ?? []).map((citation, index) => (
                    <li key={index} className="text-sm">
                      <a
                        href={citation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {citation}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        )}
      </div>

      {showFeedback && (
        <FeedbackForm
          articleTitle={article.title}
          onSubmit={handleRequestChanges}
          onCancel={() => setShowFeedback(false)}
        />
      )}
    </>
  );
}
