"use server";

import { absoluteUrl } from "@modonty/shared/lib/seo/absolute-url";
import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
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
import { auth } from "@/lib/auth";
import { articleServerSchema } from "../article-server-schema";
import { sanitizeHtmlContent } from "@/lib/sanitize-html";

export async function createArticle(data: ArticleFormData) {
  try {
    const session = await auth(); if (!session) return { success: false, error: "غير مصرح" };
    const parsed = articleServerSchema.safeParse(data);
    if (!parsed.success) {
      // Surface ALL failed fields by name — generic "String must contain at most N character(s)"
      // is useless to the admin when they don't know which field is too long.
      const errors = parsed.error.errors
        .map((e) => `${e.path.join(".") || "field"}: ${e.message}`)
        .join(" · ");
      return { success: false, error: `بيانات غير صحيحة — ${errors}` };
    }

    // ONE slug from here on — the schema's own normalised value.
    //
    // `articleServerSchema` already ends its slug rule with `.transform(slugify)`, and this
    // function then threw that away and used the raw `data.slug` everywhere: the uniqueness
    // check ran on `data.slug.trim()`, while the canonical, the breadcrumb and the stored row
    // all took the untouched input. So `"  my post  "` was checked as `"my post"`, stored with
    // its spaces, and its canonical became a `%20` url that could never match the page's own
    // address — a permanent canonical mismatch created at birth.
    //
    // `slugify` keeps Arabic (`\p{L}`), so the Arabic slugs this site runs on pass through
    // unchanged; it is spaces, slashes and stray punctuation that get normalised. Same
    // `parsed.data` pattern create-category.ts already follows.
    const slug = parsed.data.slug;

    // Validate slug uniqueness within client
    const existingArticle = await db.article.findFirst({
      where: { clientId: data.clientId, slug },
      select: { id: true },
    });
    if (existingArticle) {
      return { success: false, error: "هذا الرابط المختصر مستخدم بالفعل لهذا العميل" };
    }

    // No SEO gate here: create always starts non-published (status = WRITING; the edit form
    // cannot set PUBLISHED — see meta-section). Going live happens ONLY via transitionArticleAction,
    // which runs the single real gate (assertArticlePublishable). One gate, one score.

    const { getModontyAuthor } = await import(
      "@/app/(dashboard)/authors/actions/authors-actions"
    );
    const modontyAuthor = await getModontyAuthor();
    if (!modontyAuthor) {
      return {
        success: false,
        error: "Modonty author not found. Please ensure the author is set up.",
      };
    }

    const client = await db.client.findUnique({
      where: { id: data.clientId },
      select: { name: true, slug: true, canPublishToOwnSite: true, articlesBaseUrl: true },
    });

    // An article destined for the client's own website can only exist for a client we
    // can actually build URLs for. The «Client Articles» section only lists eligible
    // clients, but that is a UI convenience — this is the rule.
    const isClientSiteArticle = data.isClientSiteArticle === true;
    if (isClientSiteArticle) {
      if (!client?.canPublishToOwnSite || !(client.articlesBaseUrl ?? "").trim()) {
        return {
          success: false,
          error: "هذا العميل ما عنده إذن النشر على موقعه أو عنوان مقالاته فاضي.",
        };
      }

      // A link from the client's site back to ours is a backlink we want, not an
      // error to refuse (Khalid 2026-08-11). The writer decides every link himself
      // in the pre-save review; nothing is rejected on his behalf here.
    }

    const category = data.categoryId
      ? await db.category.findUnique({
          where: { id: data.categoryId },
          select: { name: true, slug: true },
        })
      : null;

    // Always derived from the content, never taken from the payload. A caller-supplied
    // count used to win, and a wrong one rode straight through to the reader, to the
    // JSON-LD, and to the reading-time filter on /articles — one live article stored 14
    // words for a 1,978-word body. No screen lets anyone type these, so nothing is lost.
    const wordCount = calculateWordCountImproved(data.content, data.inLanguage || "ar");
    const readingTimeMinutes = calculateReadingTime(wordCount);
    const contentDepth = determineContentDepth(wordCount);

    const seoTitle = data.seoTitle || generateSEOTitle(data.title, client?.name);
    const seoDescription =
      data.seoDescription || generateSEODescription(data.excerpt || "");

    // WHERE this article will live decides which domain its canonical URL is built
    // from — and it is decided at CREATE, while the piece is still a draft. A draft
    // carrying a modonty canonical that gets "fixed" at publish time is exactly the
    // trap this design avoids: the destination is known from the first save.
    const baseUrl = isClientSiteArticle
      ? (client?.articlesBaseUrl as string).replace(/\/+$/, "")
      : await loadSiteUrl();

    // Always regenerate canonical from current slug — never trust input value
    // (prior logic kept user-provided canonicalUrl, allowing stale/wrong URLs)
    const canonicalUrl = isClientSiteArticle
      ? absoluteUrl(`/${slug}`, baseUrl)
      : generateCanonicalUrl(slug, baseUrl);

    const breadcrumbPath = generateBreadcrumbPath(
      category?.name,
      category?.slug,
      data.title,
      slug
    );

    const datePublished =
      data.datePublished ||
      (data.status === ArticleStatus.PUBLISHED ? new Date() : null);

    const metaRobots =
      data.metaRobots ||
      (data.status === ArticleStatus.PUBLISHED ? "index, follow" : "noindex, follow");

    const sitemapPriority = data.sitemapPriority || (data.featured ? 0.8 : 0.5);

    const finalStatus = data.status ?? ArticleStatus.WRITING;

    const sanitizedContent = sanitizeHtmlContent(data.content);

    const article = await db.article.create({
      data: {
        title: data.title,
        slug,
        // The writer's summary, kept as written — see update-article.ts for why it must
        // not be overwritten with the truncated `seoDescription` derived from it.
        excerpt: data.excerpt?.trim() || null,
        content: sanitizedContent,
        clientId: data.clientId,
        categoryId: data.categoryId || null,
        authorId: modontyAuthor.id,
        // YMYL reviewer (optional at create; required by publish gate when client.isYmyl=true)
        reviewedById: data.reviewedById ?? null,
        status: finalStatus,
        scheduledAt: data.scheduledAt || null,
        featured: data.featured || false,
        isClientSiteArticle,
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
        ogArticlePublishedTime: datePublished,
        // Not `new Date()`. An article being created has not been MODIFIED — it has been
        // written. Stamping a modified time at birth put `article:modified_time` on a draft
        // that no one had edited, and made it differ from `datePublished` by the few
        // milliseconds between the two lines. Left absent, the generator falls back to the
        // row's own `dateModified`, which moves only on a real edit.
        ogArticleModifiedTime: null,
        canonicalUrl,
        breadcrumbPath: JSON.parse(JSON.stringify(breadcrumbPath)) as Prisma.InputJsonValue,
        semanticKeywords:
          data.semanticKeywords != null
            ? (JSON.parse(JSON.stringify(data.semanticKeywords)) as Prisma.InputJsonValue)
            : undefined,
        citations: data.citations ?? [],
        audioUrl: data.audioUrl || null,
      },
    });

    // Create all relations atomically — if any fails, all roll back
    await db.$transaction(async (tx) => {
      if (data.tags && data.tags.length > 0) {
        await tx.articleTag.createMany({
          data: data.tags.map((tagId) => ({
            articleId: article.id,
            tagId,
          })),
        });
      }

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

    // Both generators CATCH internally and RETURN { success:false, error } — they never
    // throw, so the old bare `catch` was unreachable and a failed generation left no log
    // at all. Read the result; see update-article.ts for the same rule.
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

    // Who started this article — the first line of its history.
    await logAction("article.create", {
      entity: "Article",
      entityId: article.id,
      summary: article.title,
      metadata: { status: article.status },
    });

    revalidatePath("/articles");
    revalidateTag("article-status-counts", "max");
    // modonty renders the stored blob — don't rebuild its pages on top of a blob that
    // failed to regenerate. Same rule as update-article.ts.
    if (seoFailures.length === 0) {
      await revalidateModontyTag("articles");
    }

    // Re-fetch updatedAt after SEO generation
    const freshArticle = await db.article.findUnique({ where: { id: article.id }, select: { id: true, title: true, slug: true, status: true, updatedAt: true } });
    return {
      success: true,
      article: freshArticle || article,
      seoWarning:
        seoFailures.length > 0
          ? `المقال انحفظ، لكن بيانات السيو ما تجدّدت — جوجل بيبقى يشوف العنوان والوصف القديم. (${seoFailures.join(" · ")})`
          : undefined,
    };
  } catch (error) {
    console.error("Error creating article:", error);
    const message =
      error instanceof Error ? error.message : "فشل في إنشاء المقال";
    return {
      success: false,
      error: message,
    };
  }
}

