import { redirect } from "next/navigation";
import { getArticleById, getArticleEngagementCounts } from "../actions/articles-actions";
import { getAllSettings } from "../../settings/actions/settings-actions";
import { getArticleDefaultsFromSettings } from "../../settings/helpers/get-article-defaults-from-settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  ArrowRight,
  Edit,
  FileText,
  Clock,
  Eye,
  MessageSquare,
  Tag,
  Calendar,
  Search,
  Settings,
  FolderOpen,
} from "lucide-react";
import { ArchiveArticleButton } from "./components/archive-article-button";
import { ArticleStatus } from "@prisma/client";
import { getStatusLabel, getStatusVariant } from "../helpers/status-utils";
import { ArticleSEOScoreBadge } from "./components/article-seo-score-badge";
import { ArticleViewFaqs } from "./components/article-view-faqs";
import { ArticleViewGallery } from "./components/article-view-gallery";
import { ArticleViewRelated } from "./components/article-view-related";
import { ArticleViewRelatedFrom } from "./components/article-view-related-from";
import { sanitizeHtmlContent } from "@/lib/sanitize-html";
import { PreviewToc } from "./components/article-toc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ArticleViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, settings, counts] = await Promise.all([getArticleById(id), getAllSettings(), getArticleEngagementCounts(id)]);

  if (!article) {
    redirect("/articles");
  }

  const articleDefaults = getArticleDefaultsFromSettings(settings);
  const a = { ...article, ...articleDefaults };

  const hasRelated = (a.relatedTo && a.relatedTo.length > 0) || (a.relatedFrom && a.relatedFrom.length > 0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* ── Header ── */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link href="/articles" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <h1 className="text-xl font-semibold leading-tight truncate">{a.title}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              {a.client?.name && <span>{a.client.name}</span>}
              {a.client?.name && a.category?.name && <span>·</span>}
              {a.category?.name && <span>{a.category.name}</span>}
              <span>·</span>
              <Badge variant={getStatusVariant(a.status)} className="text-xs">{getStatusLabel(a.status)}</Badge>
              <span>·</span>
              <span>{format(new Date(a.createdAt), "MMM d, yyyy")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ArticleSEOScoreBadge article={a} />
            <Button size="sm" asChild>
              <Link href={`/articles/${a.id}/edit`}>
                <Edit className="h-3.5 w-3.5 me-1.5" />
                Edit
              </Link>
            </Button>
            <ArchiveArticleButton
              articleId={a.id}
              isArchived={a.status === ArticleStatus.ARCHIVED}
            />
            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
              <Link href={`/articles/${a.id}/technical`}>
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground border rounded-lg p-3 bg-muted/30">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-blue-500" />
          <span className="font-medium text-foreground">{a.wordCount || 0}</span> words
        </div>
        {a.readingTimeMinutes && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>~{a.readingTimeMinutes} min read</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5 text-green-500" />
          <span>{counts.views} views</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
          <span>{counts.comments} comments</span>
        </div>
        {a.tags && a.tags.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-orange-500" />
            {a.tags.map((t: { tag: { name: string } }) => (
              <Badge key={t.tag.name} variant="outline" className="text-xs px-1.5 py-0">{t.tag.name}</Badge>
            ))}
          </div>
        )}
        {a.datePublished && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
            <span>Published: {format(new Date(a.datePublished), "MMM d, yyyy")}</span>
          </div>
        )}
      </div>

      {/* ── Live Preview with TOC Sidebar ── */}
      <Card>
        <CardContent className="p-0">
          <div className="flex gap-6 py-8 px-6" dir="rtl">
            {/* Main Content */}
            <div className="flex-1 min-w-0 max-w-3xl mx-auto">
              {/* Featured Image */}
              {a.featuredImage?.url && (
                <div className="aspect-video overflow-hidden rounded-lg mb-6 relative">
                  <Image
                    src={a.featuredImage.url}
                    alt={a.featuredImage.altText || a.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-right">{a.title}</h1>

              {/* Excerpt */}
              {a.excerpt && (
                <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed text-right">{a.excerpt}</p>
              )}

              {/* Author + Date + Reading Time */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b">
                {a.author?.name && <span>{a.author.name}</span>}
                <span>{format(new Date(a.datePublished || a.createdAt), "MMM d, yyyy")}</span>
                {a.readingTimeMinutes && <span>~{a.readingTimeMinutes} min read</span>}
              </div>

              {/* Article Content */}
              <div
                id="article-content"
                className="prose prose-base md:prose-lg max-w-none mb-8"
                style={{ lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(a.content) }}
              />

              {/* Gallery */}
              {a.gallery && a.gallery.length > 0 && (
                <div className="mb-8">
                  <ArticleViewGallery article={a} />
                </div>
              )}

              {/* FAQs */}
              {a.faqs && a.faqs.length > 0 && (
                <div className="mb-8">
                  <ArticleViewFaqs article={a} />
                </div>
              )}

              {/* Author Bio */}
              {a.author && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex gap-4 items-start">
                    <Avatar className="h-14 w-14 shrink-0">
                      {a.author.image && <AvatarImage src={a.author.image} alt={a.author.name} />}
                      <AvatarFallback className="text-lg">{a.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{a.author.name}</p>
                      {a.author.jobTitle && (
                        <p className="text-sm text-muted-foreground">{a.author.jobTitle}</p>
                      )}
                      {a.author.bio && (
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{a.author.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* TOC Sidebar */}
            <div className="hidden lg:block w-[220px] shrink-0">
              <PreviewToc content={a.content} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Related Articles ── */}
      {hasRelated && (
        <div className="space-y-4">
          <ArticleViewRelated article={a} />
          <ArticleViewRelatedFrom article={a} />
        </div>
      )}

      {/* ── SEO Summary + Link to Technical ── */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-500" />
            SEO Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">SEO Title</p>
              <p className="font-medium">{a.seoTitle || a.title}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">SEO Description</p>
              <p className="font-medium line-clamp-2">{a.seoDescription || a.excerpt || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Canonical URL</p>
              <p className="font-mono text-xs break-all text-blue-600">{a.canonicalUrl || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Slug</p>
              <p className="font-mono text-xs">/{a.slug}</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t flex justify-end">
            <Link href={`/articles/${a.id}/technical`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                View Technical Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
