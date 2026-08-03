"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { deleteOldImage } from "../../actions/delete-image";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { tagServerSchema } from "./tag-server-schema";
import { Prisma, ArticleStatus } from "@prisma/client";
import { computeReferenceSeoScore } from "@modonty/database/lib/seo/reference/seo-score";
import type { JsonLdValidationReport } from "@modonty/database/lib/seo/client/types";

export interface TagFilters {
  createdFrom?: Date;
  createdTo?: Date;
  minArticleCount?: number;
  maxArticleCount?: number;
  hasArticles?: boolean;
  search?: string;
}

export async function getTags(filters?: TagFilters) {
  try {
    const where: Prisma.TagWhereInput = {};

    if (filters?.createdFrom || filters?.createdTo) {
      where.createdAt = {};
      if (filters.createdFrom) {
        where.createdAt.gte = filters.createdFrom;
      }
      if (filters.createdTo) {
        where.createdAt.lte = filters.createdTo;
      }
    }

    if (filters?.hasArticles !== undefined) {
      if (filters.hasArticles) {
        where.articles = {
          some: {},
        };
      } else {
        where.articles = {
          none: {},
        };
      }
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { slug: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const tags = await db.tag.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        jsonLdLastGenerated: true,
        _count: { select: { articles: true } },
        // Read by the shared reference scorer (stripped before returning to the client).
        nextjsMetadata: true,
        jsonLdStructuredData: true,
        jsonLdValidationReport: true,
      },
      orderBy: { name: "asc" },
    });

    let filteredTags = tags;

    if (filters?.minArticleCount !== undefined || filters?.maxArticleCount !== undefined) {
      filteredTags = tags.filter((tag) => {
        const articleCount = tag._count.articles;
        if (filters.minArticleCount !== undefined && articleCount < filters.minArticleCount) {
          return false;
        }
        if (filters.maxArticleCount !== undefined && articleCount > filters.maxArticleCount) {
          return false;
        }
        return true;
      });
    }

    // Compute the SEO score from the shared reference scorer, then strip the heavy
    // metadata so only the number reaches the client table.
    return filteredTags.map(
      ({ nextjsMetadata, jsonLdStructuredData, jsonLdValidationReport, ...rest }) => ({
        ...rest,
        seoScore: computeReferenceSeoScore({
          name: rest.name,
          nextjsMetadata,
          jsonLdStructuredData,
          jsonLdValidationReport: (jsonLdValidationReport ?? null) as JsonLdValidationReport | null,
        }).score,
      }),
    );
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

export async function getTagById(id: string) {
  try {
    return await db.tag.findUnique({
      where: { id },
      include: {
        articles: {
          include: {
            article: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    return null;
  }
}

export async function getTagArticles(tagId: string) {
  try {
    const { getArticles } = await import("@/app/(dashboard)/articles/actions/articles-actions");
    const articles = await getArticles();
    const tag = await db.tag.findUnique({
      where: { id: tagId },
      include: {
        articles: {
          include: {
            article: true,
          },
        },
      },
    });
    
    if (!tag) return [];
    
    const articleIds = tag.articles.map((at) => at.articleId);
    return articles.filter((article) => articleIds.includes(article.id));
  } catch (error) {
    console.error("Error fetching tag articles:", error);
    return [];
  }
}

export async function createTag(data: {
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  socialImage?: string;
  socialImageAlt?: string;
  socialImageMediaId?: string;
  cloudinaryPublicId?: string;
}) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = tagServerSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

    // Slug uniqueness check
    const existing = await db.tag.findFirst({ where: { slug: data.slug.trim() }, select: { id: true } });
    if (existing) return { success: false, error: "This slug is already in use. Try a different one." };

    const tag = await db.tag.create({ data });
    await logAction("tag.create", { entity: "Tag", entityId: tag.id, summary: tag.name });
    revalidatePath("/tags");
    await revalidateModontyTag("tags");
    try { const { generateAndSaveTagSeo } = await import("@/lib/seo/tag-seo-generator"); await generateAndSaveTagSeo(tag.id); } catch (e) { console.error("Tag SEO gen failed:", e); }
    try { const { regenerateTagsListingCache } = await import("@/lib/seo/listing-page-seo-generator"); await regenerateTagsListingCache(); } catch (e) { console.error("Tags listing cache failed:", e); }
    return { success: true, tag };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create tag";
    return { success: false, error: message };
  }
}

export async function updateTag(
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    socialImage?: string | null;
    socialImageAlt?: string | null;
    socialImageMediaId?: string | null;
    cloudinaryPublicId?: string | null;
  }
) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = tagServerSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

    // Slug uniqueness check (exclude current)
    const existingSlug = await db.tag.findFirst({ where: { slug: data.slug.trim(), id: { not: id } }, select: { id: true } });
    if (existingSlug) return { success: false, error: "This slug is already in use. Try a different one." };

    const updateData: {
      name: string;
      slug: string;
      description?: string | null;
      seoTitle?: string | null;
      seoDescription?: string | null;
      canonicalUrl?: string | null;
      socialImage?: string | null;
      socialImageAlt?: string | null;
      socialImageMediaId?: string | null;
      cloudinaryPublicId?: string | null;
    } = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      canonicalUrl: data.canonicalUrl || null,
    };

    // Only update socialImage fields if they are explicitly provided (including null for removal)
    if (data.socialImage !== undefined) {
      updateData.socialImage = data.socialImage;
    }
    if (data.socialImageAlt !== undefined) {
      updateData.socialImageAlt = data.socialImageAlt;
    }
    if (data.socialImageMediaId !== undefined) {
      updateData.socialImageMediaId = data.socialImageMediaId;
    }
    if (data.cloudinaryPublicId !== undefined) {
      updateData.cloudinaryPublicId = data.cloudinaryPublicId;
    }

    const tag = await db.tag.update({ where: { id }, data: updateData });
    await logAction("tag.update", { entity: "Tag", entityId: tag.id, summary: tag.name });
    revalidatePath("/tags");
    // Regenerate the stored SEO BEFORE revalidating modonty — otherwise the page rebuilds
    // with the stale cached metadata (og:image lags one save behind; caught live 2026-07-31).
    try { const { generateAndSaveTagSeo } = await import("@/lib/seo/tag-seo-generator"); await generateAndSaveTagSeo(tag.id); } catch (e) { console.error("Tag SEO gen failed:", e); }
    try { const { regenerateTagsListingCache } = await import("@/lib/seo/listing-page-seo-generator"); await regenerateTagsListingCache(); } catch (e) { console.error("Tags listing cache failed:", e); }
    await revalidateModontyTag("tags");
    return { success: true, tag };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update tag";
    return { success: false, error: message };
  }
}

export async function deleteTag(id: string) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const tag = await db.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });

    if (!tag) {
      return { success: false, error: "Tag not found" };
    }

    if (tag._count.articles > 0) {
      return {
        success: false,
        error: `Cannot delete tag. This tag has ${tag._count.articles} article(s). Please delete or reassign the articles first.`,
      };
    }

    // Delete Cloudinary image before database deletion (non-blocking)
    await deleteOldImage("tags", id);

    await db.tag.delete({ where: { id } });

    await logAction("tag.delete", {
      entity: "Tag",
      entityId: id,
      summary: tag.name,
      metadata: { slug: tag.slug },
    });

    revalidatePath("/tags");
    await revalidateModontyTag("tags");
    try { const { regenerateTagsListingCache } = await import("@/lib/seo/listing-page-seo-generator"); await regenerateTagsListingCache(); } catch (e) { console.error("Tags listing cache failed:", e); }
    return { success: true };
  } catch (error) {
    console.error("Error deleting tag:", error);
    const message = error instanceof Error ? error.message : "Failed to delete tag";
    return { success: false, error: message };
  }
}

// getTagsStats removed — the list KPIs are computed client-side from the reference score
// (entity-standard #4: the card is the filter, one definition drives count + rows).

