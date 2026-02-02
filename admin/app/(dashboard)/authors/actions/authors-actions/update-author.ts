"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { MODONTY_AUTHOR_SLUG } from "@/lib/constants/modonty-author";
import { getModontyAuthor } from "./get-modonty-author";

export async function updateAuthor(
  id: string,
  data: {
    name: string;
    slug: string;
    jobTitle?: string;
    bio?: string;
    image?: string | null;
    imageAlt?: string | null;
    url?: string;
    email?: string;
    linkedIn?: string;
    twitter?: string;
    facebook?: string;
    sameAs?: string[];
    credentials?: string[];
    expertiseAreas?: string[];
    verificationStatus?: boolean;
    memberOf?: string[];
    seoTitle?: string;
    seoDescription?: string;
    socialImage?: string | null;
    socialImageAlt?: string | null;
    cloudinaryPublicId?: string | null;
    canonicalUrl?: string;
  },
) {
  try {
    const modontyAuthor = await getModontyAuthor();
    if (!modontyAuthor || modontyAuthor.id !== id) {
      return {
        success: false,
        error: "You can only edit the Modonty author.",
      };
    }

    if (data.slug !== MODONTY_AUTHOR_SLUG) {
      return {
        success: false,
        error: `The author slug must be "${MODONTY_AUTHOR_SLUG}".`,
      };
    }

    const updateData: {
      name: string;
      slug: string;
      jobTitle?: string;
      bio?: string;
      image?: string | null;
      imageAlt?: string | null;
      url?: string;
      email?: string | null;
      linkedIn?: string;
      twitter?: string;
      facebook?: string;
      sameAs?: string[];
      credentials?: string[];
      expertiseAreas?: string[];
      verificationStatus?: boolean;
      memberOf?: string[];
      seoTitle?: string;
      seoDescription?: string;
      socialImage?: string | null;
      socialImageAlt?: string | null;
      cloudinaryPublicId?: string | null;
      canonicalUrl?: string;
    } = {
      name: data.name,
      slug: data.slug,
      jobTitle: data.jobTitle,
      bio: data.bio,
      url: data.url,
      email: data.email || null,
      linkedIn: data.linkedIn,
      twitter: data.twitter,
      facebook: data.facebook,
      sameAs: data.sameAs || [],
      credentials: data.credentials || [],
      expertiseAreas: data.expertiseAreas || [],
      verificationStatus: data.verificationStatus || false,
      memberOf: data.memberOf || [],
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      canonicalUrl: data.canonicalUrl,
    };

    if (data.image !== undefined) {
      updateData.image = data.image;
    }
    if (data.imageAlt !== undefined) {
      updateData.imageAlt = data.imageAlt;
    }
    if (data.socialImage !== undefined) {
      updateData.socialImage = data.socialImage;
    }
    if (data.socialImageAlt !== undefined) {
      updateData.socialImageAlt = data.socialImageAlt;
    }
    if (data.cloudinaryPublicId !== undefined) {
      updateData.cloudinaryPublicId = data.cloudinaryPublicId;
    }

    const author = await db.author.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/authors");
    return { success: true, author };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update author";
    return { success: false, error: message };
  }
}

