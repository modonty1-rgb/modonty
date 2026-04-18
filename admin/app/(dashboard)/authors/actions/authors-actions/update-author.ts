"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { MODONTY_AUTHOR_SLUG } from "@/lib/constants/modonty-author";
import { getModontyAuthor } from "./get-modonty-author";
import { batchRegenerateJsonLd } from "@/lib/seo";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { auth } from "@/lib/auth";

const updateAuthorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string(),
  jobTitle: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().nullable().optional(),
  imageAlt: z.string().nullable().optional(),
  url: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  linkedIn: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  sameAs: z.array(z.string()).optional(),
  credentials: z.array(z.string()).optional(),
  expertiseAreas: z.array(z.string()).optional(),
  verificationStatus: z.boolean().optional(),
  memberOf: z.array(z.string()).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  socialImage: z.string().nullable().optional(),
  socialImageAlt: z.string().nullable().optional(),
  cloudinaryPublicId: z.string().nullable().optional(),
  canonicalUrl: z.string().optional(),
});

export async function updateAuthor(
  id: string,
  data: z.infer<typeof updateAuthorSchema>,
) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = updateAuthorSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid data" };
    }

    if (parsed.data.slug !== MODONTY_AUTHOR_SLUG) {
      return { success: false, error: `Slug must be "${MODONTY_AUTHOR_SLUG}".` };
    }

    const modontyAuthor = await getModontyAuthor();
    if (!modontyAuthor || modontyAuthor.id !== id) {
      return { success: false, error: "You can only edit the Modonty author." };
    }

    const d = parsed.data;

    const updateData: Record<string, unknown> = {
      name: d.name,
      slug: d.slug,
      jobTitle: d.jobTitle,
      bio: d.bio,
      url: d.url,
      email: d.email || null,
      linkedIn: d.linkedIn,
      twitter: d.twitter,
      facebook: d.facebook,
      sameAs: d.sameAs || [],
      credentials: d.credentials || [],
      expertiseAreas: d.expertiseAreas || [],
      verificationStatus: d.verificationStatus || false,
      memberOf: d.memberOf || [],
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
      canonicalUrl: d.canonicalUrl,
    };

    if (d.image !== undefined) updateData.image = d.image;
    if (d.imageAlt !== undefined) updateData.imageAlt = d.imageAlt;
    if (d.socialImage !== undefined) updateData.socialImage = d.socialImage;
    if (d.socialImageAlt !== undefined) updateData.socialImageAlt = d.socialImageAlt;
    if (d.cloudinaryPublicId !== undefined) updateData.cloudinaryPublicId = d.cloudinaryPublicId;

    const author = await db.author.update({
      where: { id },
      data: updateData,
    });

    // Cache author SEO data — read ALL settings for Organization data
    const settings = await getAllSettings();
    const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
    const authorUrl = d.canonicalUrl || d.url || `${siteUrl}/authors/${d.slug}`;

    // Build social profiles array
    const sameAs: string[] = [
      ...(d.linkedIn ? [d.linkedIn] : []),
      ...(d.twitter ? [d.twitter] : []),
      ...(d.facebook ? [d.facebook] : []),
      ...(d.sameAs || []),
    ];

    // Build rich Person JSON-LD with Organization from settings
    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: d.name,
      url: authorUrl,
      ...(author.image && { image: author.image }),
      ...(d.bio && { description: d.bio }),
      ...(d.jobTitle && { jobTitle: d.jobTitle }),
      ...(d.email && { email: d.email }),
      ...(sameAs.length > 0 && { sameAs }),
      ...(d.expertiseAreas && d.expertiseAreas.length > 0 && { knowsAbout: d.expertiseAreas }),
      ...(d.credentials && d.credentials.length > 0 && { hasCredential: d.credentials }),
      ...(d.memberOf && d.memberOf.length > 0 && {
        memberOf: d.memberOf.map((org) => ({ "@type": "Organization", name: org })),
      }),
    };

    // Add worksFor Organization from settings
    if (settings.siteName) {
      jsonLd.worksFor = {
        "@type": "Organization",
        name: settings.siteName,
        ...(siteUrl && { url: siteUrl }),
        ...(settings.logoUrl && { logo: settings.logoUrl }),
        ...(settings.brandDescription && { description: settings.brandDescription }),
      };
    }

    // Build metadata using ALL settings defaults
    const siteName = settings.siteName || "مدونتي";
    const inLanguage = settings.inLanguage || "ar";
    const ogLocale = settings.defaultOgLocale || "ar_SA";
    const twitterCard = settings.defaultTwitterCard || "summary_large_image";
    const metaRobots = settings.defaultMetaRobots || "index, follow";

    const metadata: Record<string, unknown> = {
      title: d.seoTitle || `${d.name} — ${siteName}`,
      description: d.seoDescription || d.bio || `Articles by ${d.name}`,
      robots: metaRobots,
      alternates: {
        canonical: `${siteUrl}/authors/${d.slug}`,
        languages: { [inLanguage]: `${siteUrl}/authors/${d.slug}` },
      },
      openGraph: {
        title: d.seoTitle || `${d.name} — ${siteName}`,
        description: d.seoDescription || d.bio || "",
        type: "profile",
        url: `${siteUrl}/authors/${d.slug}`,
        siteName,
        locale: ogLocale,
        ...(author.image && { images: [{ url: author.image, width: settings.defaultOgImageWidth || 1200, height: settings.defaultOgImageHeight || 630 }] }),
      },
      twitter: {
        card: twitterCard,
        title: d.seoTitle || `${d.name} — ${siteName}`,
        description: d.seoDescription || d.bio || "",
        ...(settings.twitterSite && { site: settings.twitterSite }),
        ...(settings.twitterCreator && { creator: settings.twitterCreator }),
        ...(author.image && { images: [author.image] }),
      },
    };

    await db.author.update({
      where: { id },
      data: {
        jsonLdStructuredData: JSON.stringify(jsonLd),
        jsonLdLastGenerated: new Date(),
        nextjsMetadata: JSON.parse(JSON.stringify(metadata)),
        nextjsMetadataLastGenerated: new Date(),
      },
    });

    // Cascade: regenerate JSON-LD + metadata for all author's articles
    try {
      const authorArticles = await db.article.findMany({
        where: { authorId: modontyAuthor.id },
        select: { id: true },
      });
      if (authorArticles.length > 0) {
        await batchRegenerateJsonLd(authorArticles.map((a) => a.id));
      }
    } catch {
      // Don't fail the author update if cascade fails
    }

    revalidatePath("/authors");
    revalidatePath("/articles");
    await revalidateModontyTag("articles");

    return { success: true, author };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update author";
    return { success: false, error: message };
  }
}
