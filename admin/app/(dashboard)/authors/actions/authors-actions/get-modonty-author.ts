"use server";

import { db } from "@/lib/db";
import { MODONTY_AUTHOR_SLUG } from "@/lib/constants/modonty-author";

export async function getModontyAuthor() {
  try {
    const author = await db.author.upsert({
      where: { slug: MODONTY_AUTHOR_SLUG },
      update: {},
      create: {
        name: "Modonty",
        slug: MODONTY_AUTHOR_SLUG,
        url: "https://modonty.com",
        bio: "Modonty is a leading content platform providing high-quality articles and insights.",
        seoTitle: "Modonty - Author Profile",
        seoDescription: "Learn more about Modonty, the author behind all content on Modonty.com",
        canonicalUrl: "https://modonty.com",
        verificationStatus: true,
      },
      include: {
        _count: { select: { articles: true } },
      },
    });

    return author;
  } catch (error) {
    try {
      const existingAuthor = await db.author.findUnique({
        where: { slug: MODONTY_AUTHOR_SLUG },
        include: {
          _count: { select: { articles: true } },
        },
      });
      if (existingAuthor) {
        return existingAuthor;
      }
    } catch (fetchError) {
      console.error("Error fetching existing Modonty author:", fetchError);
    }
    console.error("Error fetching/creating Modonty author:", error);
    return null;
  }
}

