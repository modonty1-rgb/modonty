import { redirect } from "next/navigation";
import { getArticleById } from "../../actions/articles-actions";
import { getAllSettings } from "../../../settings/actions/settings-actions";
import { getArticleDefaultsFromSettings } from "../../../settings/helpers/get-article-defaults-from-settings";
import { Badge } from "@/components/ui/badge";
import { analyzeArticleSEO } from "../../analyzer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  FileText,
  Search,
  Share2,
  Code,
  Settings,
  Clock,
  Tag,
  History,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default async function ArticleTechnicalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, settings] = await Promise.all([getArticleById(id), getAllSettings()]);

  if (!article) {
    redirect("/articles");
  }

  const defaults = getArticleDefaultsFromSettings(settings);
  const a = { ...article, ...defaults };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "—";
    return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
  };

  const jsonLd = (() => {
    try {
      return a.jsonLdStructuredData ? JSON.stringify(JSON.parse(a.jsonLdStructuredData), null, 2) : null;
    } catch { return a.jsonLdStructuredData; }
  })();

  const metadata = (() => {
    try {
      return a.nextjsMetadata ? JSON.stringify(a.nextjsMetadata, null, 2) : null;
    } catch { return null; }
  })();

  return (
    <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/articles/${id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Technical Details</h1>
            <p className="text-sm text-muted-foreground truncate max-w-md">{a.title}</p>
          </div>
        </div>
        <Link href={`/articles/${id}`}>
          <Button variant="outline" size="sm">Back to Article</Button>
        </Link>
      </div>

      {/* ── Masonry Layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 [&>*]:h-full">

      {/* ── Article Info ── */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-500" />
            Article Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Article ID</p>
              <p className="font-mono text-xs break-all">{a.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Language</p>
              <Badge variant="outline" className="text-xs">{a.inLanguage || "ar-SA"}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Content Depth</p>
              <Badge variant="secondary" className="text-xs">{a.contentDepth || "—"}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Created</p>
              <p className="text-xs">{formatDate(a.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Last Updated</p>
              <p className="text-xs">{formatDate(a.updatedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Published</p>
              <p className="text-xs">{formatDate(a.datePublished)}</p>
            </div>
            {a.license && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">License</p>
                <p className="text-xs">{a.license}</p>
              </div>
            )}
            {a.tags && a.tags.length > 0 && (
              <div className="col-span-2 md:col-span-3">
                <p className="text-xs text-muted-foreground mb-1">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {a.tags.map((t: { tag: { name: string; id: string } }) => (
                    <Badge key={t.tag.id} variant="outline" className="text-xs gap-1">
                      <Tag className="h-2.5 w-2.5" />
                      {t.tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {a.versions && a.versions.length > 0 && (
              <div className="col-span-2 md:col-span-3">
                <p className="text-xs text-muted-foreground mb-1">
                  <History className="h-3 w-3 inline me-1" />
                  Versions ({a.versions.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {a.versions.map((v: { id: string; createdAt: Date }, i: number) => (
                    <Badge key={v.id} variant="secondary" className="text-[10px]">
                      v{a.versions.length - i} · {format(new Date(v.createdAt), "MMM d, h:mm a")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── SEO ── */}
      <Card className="border-blue-200 dark:border-blue-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-500" />
            SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">SEO Title</p>
              <p className="font-medium text-sm">{a.seoTitle || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Meta Robots</p>
              <Badge variant="outline" className="text-xs font-mono">{a.metaRobots || "index, follow"}</Badge>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-muted-foreground mb-0.5">SEO Description</p>
              <p className="text-sm text-muted-foreground">{a.seoDescription || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Canonical URL</p>
              <p className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all">{a.canonicalUrl || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Main Entity</p>
              <p className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all">{a.mainEntityOfPage || "—"}</p>
            </div>
            {a.seoKeywords && a.seoKeywords.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">SEO Keywords</p>
                <div className="flex flex-wrap gap-1">
                  {a.seoKeywords.map((k: string) => (
                    <Badge key={k} className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{k}</Badge>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(a.semanticKeywords) && a.semanticKeywords.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Semantic Keywords</p>
                <div className="flex flex-wrap gap-1">
                  {(a.semanticKeywords as Array<{ keyword: string }>).map((k) => (
                    <Badge key={k.keyword} variant="outline" className="text-xs">{k.keyword}</Badge>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(a.breadcrumbPath) && a.breadcrumbPath.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Breadcrumb</p>
                <div className="flex items-center gap-1 text-xs">
                  {(a.breadcrumbPath as Array<{ name: string; url: string }>).map((crumb, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-muted-foreground">›</span>}
                      <Badge variant="outline" className="text-[10px] font-normal">{crumb.name}</Badge>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Social & Protocols ── */}
      <Card className="border-purple-200 dark:border-purple-900 md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Share2 className="h-4 w-4 text-purple-500" />
            Social & Protocols
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">OG Type</p>
              <Badge variant="outline" className="text-xs">{a.ogType || "article"}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">OG Author</p>
              <p className="text-xs">{a.ogArticleAuthor || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Twitter Card</p>
              <Badge variant="outline" className="text-xs font-mono">{a.twitterCard || "summary_large_image"}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">OG Published</p>
              <p className="text-xs">{formatDate(a.ogArticlePublishedTime)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">OG Modified</p>
              <p className="text-xs">{formatDate(a.ogArticleModifiedTime)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">OG Locale</p>
              <Badge variant="outline" className="text-xs">{a.ogLocale || "ar_SA"}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Sitemap Priority</p>
              <Badge variant="secondary" className="text-xs">{a.sitemapPriority ?? "default"}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Change Frequency</p>
              <Badge variant="secondary" className="text-xs">{a.sitemapChangeFreq || "default"}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      </div>
      {/* ── End Grid ── */}

      {/* ── SEO Validation (full width) ── */}
      {/* ── SEO Analysis (same analyzer as main page) ── */}
      {(() => {
        const seoResult = analyzeArticleSEO(a as never);
        const cats = seoResult.categories as Record<string, { score: number; maxScore: number; items: Array<{ passed: boolean; label: string; reason: string }> }>;
        const failedItems = Object.values(cats).flatMap(c => c.items.filter(i => !i.passed));
        const passedItems = Object.values(cats).flatMap(c => c.items.filter(i => i.passed));

        return (
          <Card className={seoResult.percentage >= 90 ? "border-emerald-200 dark:border-emerald-900" : seoResult.percentage >= 70 ? "border-amber-200 dark:border-amber-900" : "border-red-200 dark:border-red-900"}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-blue-500" />
                  SEO Analysis
                </span>
                <Badge variant={seoResult.percentage >= 90 ? "default" : seoResult.percentage >= 70 ? "secondary" : "destructive"} className="text-lg px-3 py-1">
                  {seoResult.percentage}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {failedItems.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Needs Attention ({failedItems.length})</p>
                  {failedItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-xs">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {passedItems.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Passed ({passedItems.length})</p>
                  {passedItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* ── JSON-LD (full width) ── */}
      <Card className="border-emerald-200 dark:border-emerald-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Code className="h-4 w-4 text-emerald-500" />
            JSON-LD Structured Data
            {a.jsonLdLastGenerated && (
              <Badge variant="outline" className="text-[10px] font-normal ms-auto">
                <Clock className="h-2.5 w-2.5 me-1" />
                {format(new Date(a.jsonLdLastGenerated), "MMM d, h:mm a")}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jsonLd ? (
            <pre className="text-xs font-mono bg-muted/50 rounded-lg p-3 overflow-x-auto max-h-[400px] overflow-y-auto border" dir="ltr">
              {jsonLd}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">No JSON-LD generated yet. Save the article to generate.</p>
          )}
        </CardContent>
      </Card>

      {/* ── Metadata ── */}
      {metadata && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4 text-amber-500" />
              Metadata
              {a.nextjsMetadataLastGenerated && (
                <Badge variant="outline" className="text-[10px] font-normal ms-auto">
                  <Clock className="h-2.5 w-2.5 me-1" />
                  {format(new Date(a.nextjsMetadataLastGenerated), "MMM d, h:mm a")}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs font-mono bg-muted/50 rounded-lg p-3 overflow-x-auto max-h-[300px] overflow-y-auto border" dir="ltr">
              {metadata}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
