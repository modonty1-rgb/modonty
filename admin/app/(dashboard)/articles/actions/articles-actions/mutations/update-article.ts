"use server";

import { absoluteUrl } from "@modonty/shared/lib/seo/absolute-url";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ArticleStatus, Prisma } from "@prisma/client";
import {
  calculateWordCountImproved,
  calculateReadingTime,
  determineContentDepth,
  generateSEOTitle,
  generateSEODescription,
  generateCanonicalUrl,
  generateBreadcrumbPath,
} from "../../../helpers/seo-helpers";
import { ArticleFormData, FAQItem } from "@/lib/types";
import { generateAndSaveNextjsMetadata } from "@/lib/seo/metadata-storage";
import { generateAndSaveJsonLd } from "@/lib/seo/jsonld-storage";
import { logAction } from "@/lib/audit/log-action";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { checkCompliance } from "@/lib/seo/pre-publish-audit";
import { auth } from "@/lib/auth";
import { articleServerSchema } from "../article-server-schema";
import { sanitizeHtmlContent } from "@/lib/sanitize-html";
import { isValidTransition } from "../../../helpers/article-status-machine";

export async function updateArticle(articleId: string, data: ArticleFormData) {
  try {
    const session = await auth(); if (!session) return { success: false, error: "غير مصرح" };
    const parsed = articleServerSchema.safeParse(data);
    if (!parsed.success) {
      // Surface ALL failed fields by name — see create-article.ts for rationale.
      const errors = parsed.error.errors
        .map((e) => `${e.path.join(".") || "field"}: ${e.message}`)
        .join(" · ");
      return { success: false, error: `بيانات غير صحيحة — ${errors}` };
    }

    const existingArticle = await db.article.findUnique({
      where: { id: articleId },
      select: { authorId: true, ogArticlePublishedTime: true, slug: true, clientId: true, datePublished: true, status: true, updatedAt: true, userVersion: true, title: true, content: true, excerpt: true, seoTitle: true, seoDescription: true, isClientSiteArticle: true, client: { select: { articlesBaseUrl: true } } },
    });

    if (!existingArticle) {
      return {
        success: false,
        error: "المقال غير موجود",
      };
    }

    // Same rule as create: the writer owns his links. A link pointing back at modonty
    // from the client's site is a backlink, and the pre-save review is where every
    // link gets decided — no destination is refused here.

    // Optimistic locking: reject only when ANOTHER USER edited via the form (not SEO/cron/system writes).
    // Uses userVersion (incremented only by this action) instead of updatedAt (which system ops also bump).
    if (typeof data.userVersion === "number" && existingArticle.userVersion !== data.userVersion) {
      return { success: false, error: "تم تعديل المقال بواسطة مستخدم آخر — يرجى تحديث الصفحة والمحاولة مجدداً" };
    }

    // Snapshot current version before overwriting
    await db.articleVersion.create({
      data: {
        articleId,
        title: existingArticle.title,
        content: existingArticle.content,
        excerpt: existingArticle.excerpt,
        seoTitle: existingArticle.seoTitle,
        seoDescription: existingArticle.seoDescription,
        createdBy: session.user?.id ?? null,
      },
    });

    // Validate status transition
    if (data.status && data.status !== existingArticle.status) {
      if (!isValidTransition(existingArticle.status, data.status)) {
        return {
          success: false,
          error: `لا يمكن تغيير الحالة من "${existingArticle.status}" إلى "${data.status}" — تأكد من اتباع تسلسل الحالات الصحيح`,
        };
      }
    }

    // Validate slug uniqueness within client when slug changed
    // The schema's normalised slug, not the raw input — same fix as create-article.ts, and
    // applied here because a create-only fix would leave every EDIT able to reintroduce the
    // untrimmed slug the create path now rejects.
    const slug = parsed.data.slug;

    if (slug && slug !== existingArticle.slug) {
      const existingSlug = await db.article.findFirst({
        where: { clientId: data.clientId || existingArticle.clientId, slug, id: { not: articleId } },
        select: { id: true },
      });
      if (existingSlug) {
        return { success: false, error: "هذا الرابط المختصر مستخدم بالفعل لهذا العميل" };
      }
    }

    const client = await db.client.findUnique({
      where: { id: data.clientId },
      select: {
        name: true,
        slug: true,
        forbiddenKeywords: true,
        forbiddenClaims: true,
        intake: true,
      },
    });

    // No SEO gate here. The form can't change status (see meta-section) — data.status === PUBLISHED
    // means an already-live article is being edited, not a first publish (that goes through the
    // single real gate in transitionArticleAction). Edits save; the unified score shows any
    // regression. Compliance still blocks banned content from staying live.
    if (data.status === ArticleStatus.PUBLISHED && client) {
      const compliance = checkCompliance(
        {
          title: data.title,
          content: data.content,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          excerpt: data.excerpt,
        },
        client
      );
      if (compliance.blocked) {
        return {
          success: false,
          error: compliance.issues.map((i) => i.message).join(". "),
        };
      }
    }

    const category = data.categoryId
      ? await db.category.findUnique({
          where: { id: data.categoryId },
          select: { name: true, slug: true },
        })
      : null;

    // Same rule as create: the content decides, not the payload. An edit that changed the
    // body while carrying an old count used to keep the old count for good.
    const wordCount = calculateWordCountImproved(data.content, data.inLanguage || "ar");
    const readingTimeMinutes = calculateReadingTime(wordCount);
    const contentDepth = determineContentDepth(wordCount);

    const seoTitle = data.seoTitle || generateSEOTitle(data.title, client?.name);
    const seoDescription =
      data.seoDescription || generateSEODescription(data.excerpt || "");

    // The destination is read from the ROW, never from the form: it is decided once at
    // creation and there is no control anywhere that changes it. Reading it from the
    // payload would make it something a crafted request could flip — and flipping it
    // rewrites the canonical URL of a page that may already be live on the client's
    // domain.
    const clientBaseUrl = (existingArticle.client?.articlesBaseUrl ?? "").replace(/\/+$/, "");
    const bakeOnClientSite = existingArticle.isClientSiteArticle && clientBaseUrl !== "";

    const baseUrl = bakeOnClientSite ? clientBaseUrl : await loadSiteUrl();
    // Always regenerate canonical from current slug — never trust DB value
    // (prior logic kept stale canonicalUrl when slug changed, breaking JSON-LD @id)
    const canonicalUrl = bakeOnClientSite
      ? absoluteUrl(`/${slug}`, baseUrl)
      : generateCanonicalUrl(slug, baseUrl);

    const breadcrumbPath = generateBreadcrumbPath(
      category?.name,
      category?.slug,
      data.title,
      slug
    );

    // A live article must carry a publish date. This was
    // `data.datePublished !== undefined ? data.datePublished : existingArticle.datePublished`
    // — it preserved a date but never established one, so a row reaching PUBLISHED through
    // this action stayed at `null`. Measured on modonty_dev 27 Aug 2026: 13 published
    // articles have no `datePublished`, and all 13 ship JSON-LD with no `datePublished` at
    // all. Google, Article: it is "The date and time the article was first published"; a
    // live page that cannot say when it was published loses the freshness signal entirely.
    //
    // Only stamped on the transition INTO a live state, and only when there is none —
    // an article that already has a date keeps it, so an edit never rewrites publication
    // history. `PUBLISHED_ON_CLIENT_SITE` counts: the page is live, on their domain.
    const goingLive =
      data.status === ArticleStatus.PUBLISHED ||
      data.status === ArticleStatus.PUBLISHED_ON_CLIENT_SITE;
    const datePublished =
      data.datePublished !== undefined
        ? data.datePublished
        : existingArticle.datePublished ?? (goingLive ? new Date() : null);

    const metaRobots =
      data.metaRobots ||
      (data.status === ArticleStatus.PUBLISHED ? "index, follow" : "noindex, follow");

    const sitemapPriority = data.sitemapPriority || (data.featured ? 0.8 : 0.5);

    if (
      data.status &&
      !Object.values(ArticleStatus).includes(data.status as ArticleStatus)
    ) {
      return {
        success: false,
        error: "قيمة الحالة غير صالحة — يرجى إعادة تحميل الصفحة والمحاولة مجدداً",
      };
    }

    const sanitizedContent = sanitizeHtmlContent(data.content);

    // Optimistic concurrency — explicit set (Prisma `{ increment }` is a no-op on MongoDB
    // documents that don't yet have the field; safer to compute next value ourselves).
    const nextUserVersion = (existingArticle.userVersion ?? 0) + 1;

    const article = await db.article.update({
      where: { id: articleId },
      data: {
        userVersion: nextUserVersion,
        title: data.title,
        slug,
        // The excerpt is the WRITER's summary and is shown to the reader on cards and
        // feeds. It used to be overwritten with `seoDescription` — which is DERIVED from
        // it by truncation — so every save fed a shorter cut of itself back in. Keep what
        // was written; an empty excerpt stays empty rather than borrowing the meta text.
        excerpt: data.excerpt?.trim() || null,
        content: sanitizedContent,
        clientId: data.clientId,
        categoryId: data.categoryId || null,
        authorId: existingArticle.authorId,
        // YMYL reviewer (drives JSON-LD reviewedBy + publish gate)
        reviewedById: data.reviewedById ?? null,
        status: data.status,
        scheduledAt: data.scheduledAt || null,
        featured: data.featured || false,
        featuredImageId: data.featuredImageId || null,
        datePublished,
        wordCount,
        readingTimeMinutes,
        contentDepth,
        lastReviewed: data.lastReviewed || null,
        mainEntityOfPage: canonicalUrl || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        ogArticleAuthor: data.ogArticleAuthor || null,
        ogArticlePublishedTime: existingArticle.ogArticlePublishedTime,
        ogArticleModifiedTime: new Date(),
        // dateModified must update on every edit so Google's lastmod reflects reality.
        // Otherwise sitemap.ts falls back to datePublished → Google never recrawls after edits.
        dateModified: new Date(),
        canonicalUrl,
        breadcrumbPath: JSON.parse(JSON.stringify(breadcrumbPath)) as Prisma.InputJsonValue,
        semanticKeywords:
          data.semanticKeywords != null
            ? (JSON.parse(JSON.stringify(data.semanticKeywords)) as Prisma.InputJsonValue)
            : ([] as Prisma.InputJsonValue),
        citations: data.citations ?? [],
        audioUrl: data.audioUrl || null,
      },
    });

    // Delete + re-create all relations atomically — if any fails, all roll back
    await db.$transaction(async (tx) => {
      await tx.articleTag.deleteMany({ where: { articleId: article.id } });
      if (data.tags && data.tags.length > 0) {
        await tx.articleTag.createMany({
          data: data.tags.map((tagId) => ({
            articleId: article.id,
            tagId,
          })),
        });
      }

      await tx.articleFAQ.deleteMany({ where: { articleId: article.id } });
      // Filter out incomplete FAQs (missing question OR answer) — prevents partial entries in DB
      const validFaqs = (data.faqs ?? []).filter(
        (f: FAQItem) => f.question?.trim() && f.answer?.trim(),
      );
      if (validFaqs.length > 0) {
        await tx.articleFAQ.createMany({
          data: validFaqs.map((faq: FAQItem, index: number) => ({
            articleId: article.id,
            question: faq.question,
            answer: faq.answer,
            position: faq.position ?? index,
          })),
        });
      }

      await tx.articleMedia.deleteMany({ where: { articleId: article.id } });
      if (data.gallery && data.gallery.length > 0) {
        await tx.articleMedia.createMany({
          data: data.gallery.map((item, index) => ({
            articleId: article.id,
            mediaId: item.mediaId,
            position: item.position ?? index,
            caption: item.caption || null,
            altText: item.altText || null,
          })),
        });
      }

      await tx.relatedArticle.deleteMany({ where: { articleId: article.id } });
      if (data.relatedArticles && data.relatedArticles.length > 0) {
        await tx.relatedArticle.createMany({
          data: data.relatedArticles.map((related) => ({
            articleId: article.id,
            relatedId: related.relatedId,
            relationshipType: related.relationshipType || "related",
          })),
        });
      }
    });

    // Both generators CATCH internally and RETURN { success:false, error } — they do not
    // throw. So the old `try { … } catch { console.error }` never fired: a failed
    // regeneration left no log, no warning, and still answered `success: true`.
    // Read the returned result, or the failure stays invisible.
    const seoFailures: string[] = [];
    try {
      const metadataResult = await generateAndSaveNextjsMetadata(article.id, {
        robots: metaRobots,
      });
      if (!metadataResult.success) {
        seoFailures.push(`الميتاداتا: ${metadataResult.error || "سبب غير معروف"}`);
      }

      const jsonLdResult = await generateAndSaveJsonLd(article.id);
      if (!jsonLdResult.success) {
        seoFailures.push(`البيانات المنظّمة: ${jsonLdResult.error || "سبب غير معروف"}`);
      }
    } catch (error) {
      seoFailures.push(error instanceof Error ? error.message : String(error));
    }
    if (seoFailures.length > 0) {
      console.error(
        "Failed to generate metadata/JSON-LD for article:",
        article.id,
        seoFailures.join(" · ")
      );
    }

    // ArticleVersion already snapshots WHAT changed; this line answers WHO, in the same
    // place as every other action, so one screen can tell the whole story.
    await logAction("article.update", {
      entity: "Article",
      entityId: article.id,
      summary: article.title,
      metadata: { status: article.status, version: nextUserVersion },
    });

    // Admin paths always refresh — the team must see what it just saved.
    revalidatePath("/articles");
    revalidatePath(`/articles/${article.id}`);
    revalidatePath(`/articles/${article.slug}`);
    // modonty does NOT: it renders the stored blob, so rebuilding it after a failed
    // regeneration publishes the new body under the old title. Leave the page on its
    // previous build until the blob is rebuilt.
    if (seoFailures.length === 0) {
      await revalidateModontyTag("articles");
    }

    // Re-fetch userVersion + updatedAt after SEO generation
    // (SEO ops bump updatedAt but NOT userVersion — keep userVersion fresh from this action)
    const freshArticle = await db.article.findUnique({ where: { id: article.id }, select: { id: true, title: true, slug: true, status: true, userVersion: true, updatedAt: true } });
    return {
      success: true,
      article: freshArticle || article,
      seoWarning:
        seoFailures.length > 0
          ? `المقال انحفظ، لكن بيانات السيو ما تجدّدت — جوجل بيبقى يشوف العنوان والوصف القديم. (${seoFailures.join(" · ")})`
          : undefined,
    };
  } catch (error) {
    console.error("Error updating article:", error);
    const message =
      error instanceof Error ? error.message : "فشل في تحديث المقال";
    return {
      success: false,
      error: message,
    };
  }
}

