"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { MODONTY_AUTHOR_SLUG } from "@/lib/constants/modonty-author";
import { getModontyAuthor } from "./get-modonty-author";
import { buildModontyAuthorSeo } from "../../helpers/build-modonty-author-seo";
import { batchRegenerateJsonLd } from "@/lib/seo";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";

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

    // Cache author SEO data — one shared builder (used by the /seo maintenance step too).
    const settings = await getAllSettings();
    const { jsonLd, metadata } = buildModontyAuthorSeo(author, settings);

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

    await logAction("author.update", {
      entity: "Author",
      entityId: id,
      summary: author.name,
    });

    revalidatePath("/authors");
    revalidatePath("/articles");
    await revalidateModontyTag("authors");
    await revalidateModontyTag("articles");

    return { success: true, author };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update author";
    return { success: false, error: message };
  }
}
