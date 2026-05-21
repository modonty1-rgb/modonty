import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Pencil, ShieldCheck, ShieldX, AlertTriangle, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { SITE_BASE_URL } from "@/lib/gsc/client";
import { validateArticleFromDb } from "@/lib/seo/article-validator-db";
import { needsRegeneration, regenerateJsonLd } from "@/lib/seo/jsonld-storage";
import type { ValidationCheck } from "@/lib/seo/article-validator";
import { SendToClientButton } from "./components/send-to-client-button";
import { ReRunButton } from "./components/re-run-button";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ articleId: string }>;
}

/** Map a check ID to the article-editor tab where the user can fix it. */
function getFixTab(checkId: string): "basic" | "content" | "media" | "seo" | null {
  if (checkId === "title-length" || checkId === "meta-description" || checkId === "canonical") return "seo";
  if (checkId === "excerpt" || checkId === "word-count" || checkId === "article-body-text") return "content";
  if (checkId === "internal-links-count" || checkId === "internal-links-anchors") return "content";
  if (
    checkId === "featured-image" ||
    checkId === "featured-image-size" ||
    checkId === "featured-image-alt" ||
    checkId === "body-image-alt"
  )
    return "media";
  if (
    checkId === "author-present" ||
    checkId === "publisher-present" ||
    checkId === "publisher-logo" ||
    checkId === "status-indexable" ||
    checkId === "slug-valid" ||
    checkId === "date-published" ||
    checkId === "date-modified" ||
    checkId === "scheduled-at-future"
  )
    return "basic";
  return null;
}

function getFixLabel(tab: string): string {
  if (tab === "seo") return "SEO tab";
  if (tab === "content") return "Content tab";
  if (tab === "media") return "Media tab";
  if (tab === "basic") return "Basic tab";
  return tab;
}

export default async function QualityCheckPage({ params }: PageProps) {
  const { articleId } = await params;

  // Step 1 — Auto-fix JSON-LD if stale (so cache freshness checks reflect reality)
  if (await needsRegeneration(articleId)) {
    await regenerateJsonLd(articleId).catch(() => null);
  }

  // Step 2 — Fetch article with full validator shape
  const article = await db.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      content: true,
      excerpt: true,
      seoTitle: true,
      seoDescription: true,
      wordCount: true,
      articleBodyText: true,
      canonicalUrl: true,
      datePublished: true,
      dateModified: true,
      scheduledAt: true,
      updatedAt: true,
      jsonLdStructuredData: true,
      jsonLdLastGenerated: true,
      jsonLdValidationReport: true,
      nextjsMetadata: true,
      nextjsMetadataLastGenerated: true,
      featuredImageId: true,
      featuredImage: { select: { url: true, altText: true, width: true, height: true } },
      author: { select: { name: true } },
      client: {
        select: {
          name: true,
          slug: true,
          logoMedia: { select: { url: true, width: true, height: true } },
        },
      },
    },
  });
  if (!article) notFound();

  // Quality check is read-only for non-DRAFT articles. The Send button only
  // enables when article is in DRAFT (the actual gate transition state).
  const canSendToApproval = article.status === "DRAFT";

  // Step 3 — Run the 28-check validator
  const validation = validateArticleFromDb({
    id: article.id,
    slug: article.slug,
    title: article.title,
    url: `${SITE_BASE_URL}/articles/${article.slug}`,
    status: article.status,
    content: article.content,
    excerpt: article.excerpt,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    wordCount: article.wordCount,
    articleBodyText: article.articleBodyText,
    canonicalUrl: article.canonicalUrl,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    scheduledAt: article.scheduledAt,
    jsonLdStructuredData: article.jsonLdStructuredData,
    jsonLdLastGenerated: article.jsonLdLastGenerated,
    jsonLdValidationReport: article.jsonLdValidationReport,
    nextjsMetadata: article.nextjsMetadata,
    nextjsMetadataLastGenerated: article.nextjsMetadataLastGenerated,
    featuredImageId: article.featuredImageId,
    featuredImage: article.featuredImage
      ? {
          altText: article.featuredImage.altText,
          width: article.featuredImage.width,
          height: article.featuredImage.height,
        }
      : null,
    author: article.author ? { name: article.author.name } : null,
    client: article.client
      ? {
          name: article.client.name,
          logoMedia: article.client.logoMedia
            ? {
                url: article.client.logoMedia.url,
                width: article.client.logoMedia.width,
                height: article.client.logoMedia.height,
              }
            : null,
        }
      : null,
  });

  const failed = validation.checks.filter((c) => !c.passed);
  const passed = validation.checks.filter((c) => c.passed);
  const allPassed = failed.length === 0;
  const articleEditUrl = `/articles/${article.id}/edit`;

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      {/* Header */}
      <div className="space-y-1.5">
        <Link
          href="/articles/workflow/draft-to-approval"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Draft → Awaiting Approval
        </Link>
        <h1 className="text-xl font-semibold leading-tight">Quality Check</h1>
        <p className="text-sm font-medium" dir="rtl">
          {article.title}
        </p>
      </div>

      {/* Summary banner */}
      <Card
        className={`p-5 ${
          allPassed
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-red-500/40 bg-red-500/5"
        }`}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            {allPassed ? (
              <ShieldCheck className="h-8 w-8 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <ShieldX className="h-8 w-8 text-red-500 shrink-0 mt-0.5" />
            )}
            <div>
              <h2
                className={`text-lg font-bold ${
                  allPassed ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
                }`}
              >
                {allPassed
                  ? `✅ Ready to send — all ${validation.totalChecks} checks passed`
                  : `❌ ${failed.length} issue${failed.length === 1 ? "" : "s"} blocking the send`}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {allPassed
                  ? "This article meets all SEO requirements and is ready for client review."
                  : `Article passes ${validation.passedCount}/${validation.totalChecks} checks. Fix every issue below before sending — no overrides allowed.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ReRunButton articleId={article.id} />
            <Link href={articleEditUrl}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Edit article
              </Button>
            </Link>
            {canSendToApproval && (
              <SendToClientButton
                articleId={article.id}
                disabled={!allPassed}
                articleTitle={article.title}
              />
            )}
          </div>
        </div>
      </Card>

      {/* Article info strip */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-muted-foreground uppercase font-bold tracking-wide">Client</div>
            <div className="font-medium mt-0.5" dir="rtl">{article.client?.name || "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground uppercase font-bold tracking-wide">Author</div>
            <div className="font-medium mt-0.5">{article.author?.name || "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground uppercase font-bold tracking-wide">Last modified</div>
            <div className="font-medium mt-0.5">
              {new Intl.DateTimeFormat("en-GB", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(article.updatedAt)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground uppercase font-bold tracking-wide">Word count</div>
            <div className="font-medium mt-0.5">{article.wordCount ?? "—"}</div>
          </div>
        </div>
      </Card>

      {/* Issues */}
      {failed.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b bg-red-500/5">
            <h3 className="font-bold text-sm text-red-700 dark:text-red-400">
              ❌ Issues to fix ({failed.length})
            </h3>
          </div>
          <div className="divide-y">
            {failed.map((c) => (
              <CheckCard key={c.id} check={c} articleEditUrl={articleEditUrl} />
            ))}
          </div>
        </Card>
      )}

      {/* Passed */}
      {passed.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none">
            <Card className="p-4 hover:bg-accent/30 transition-colors">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                ✅ Passed ({passed.length})
                <span className="text-muted-foreground font-normal text-xs ms-auto">
                  Click to expand
                </span>
              </div>
            </Card>
          </summary>
          <Card className="overflow-hidden mt-2">
            <div className="divide-y">
              {passed.map((c) => (
                <div key={c.id} className="px-5 py-2.5 flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-muted-foreground">{c.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </details>
      )}

      {/* Bottom hint when ready */}
      {allPassed && canSendToApproval && (
        <Card className="p-5 border-emerald-500/40 bg-emerald-500/5">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-emerald-700 dark:text-emerald-400">All clear!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Click &quot;Send for Approval&quot; above to move this article to the client&apos;s review
                queue. The client will be notified.
              </p>
            </div>
          </div>
        </Card>
      )}
      {allPassed && !canSendToApproval && (
        <Card className="p-5 border-emerald-500/40 bg-emerald-500/5">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-emerald-700 dark:text-emerald-400">
                Article is technically clean ({article.status})
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                All {validation.totalChecks} SEO checks pass. Use the workflow page action button to advance this article.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function CheckCard({
  check,
  articleEditUrl,
}: {
  check: ValidationCheck;
  articleEditUrl: string;
}) {
  const fixTab = getFixTab(check.id);
  const isJsonLd = check.id.startsWith("jsonld-");

  return (
    <div className="px-5 py-4 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <XCircle
          className={`h-4 w-4 shrink-0 ${
            check.severity === "critical"
              ? "text-red-500"
              : check.severity === "high"
                ? "text-amber-500"
                : "text-slate-500"
          }`}
        />
        <span className="font-semibold text-sm">{check.label}</span>
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
            check.severity === "critical"
              ? "bg-red-500/15 text-red-700 dark:text-red-400"
              : check.severity === "high"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                : "bg-slate-500/15 text-slate-700 dark:text-slate-400"
          }`}
        >
          {check.severity}
        </span>
      </div>
      {check.detail && <div className="text-xs text-muted-foreground ms-6">{check.detail}</div>}
      {check.fix && (
        <div className="text-xs flex items-start gap-1.5 px-3 py-2 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 ms-6">
          <span className="font-bold shrink-0">💡 How to fix:</span>
          <span>{check.fix}</span>
        </div>
      )}
      <div className="ms-6">
        {isJsonLd ? (
          <Link
            href="/search-console"
            className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Open Search Console pipeline
          </Link>
        ) : fixTab ? (
          <Link
            href={articleEditUrl}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            <Pencil className="h-3 w-3" />
            Open article — fix in {getFixLabel(fixTab)}
          </Link>
        ) : (
          <Link
            href={articleEditUrl}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            <Pencil className="h-3 w-3" />
            Open article
          </Link>
        )}
      </div>
    </div>
  );
}
