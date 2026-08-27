"use server";

import { entityUrl } from "@modonty/shared/lib/seo/absolute-url";
import { db } from "@/lib/db";
import { MODONTY_AUTHOR_SLUG } from "@/lib/constants/modonty-author";
import { loadSiteUrl } from "@/lib/seo/site-url";

export async function getModontyAuthor() {
  try {
    // Both URLs below used to be literals. They are written into a real row on first call and
    // then travel into the author's JSON-LD `url` and `canonicalUrl` — a guessed host here
    // becomes a published claim that no screen ever shows you.
    const siteUrl = await loadSiteUrl();
    const author = await db.author.upsert({
      where: { slug: MODONTY_AUTHOR_SLUG },
      update: {},
      create: {
        name: "Modonty",
        slug: MODONTY_AUTHOR_SLUG,
        url: siteUrl,
        // Publisher-framed, Arabic (the org — not a person). Shown on the public author page
        // + as the Organization description in JSON-LD. Editable in the admin.
        bio: "مدوّنتي منصّة سعودية لصناعة المحتوى والنشر الرقمي، تبني للعلامات حضوراً رقمياً موثوقاً عبر صفحات ومقالات محسّنة لمحرّكات البحث.",
        seoTitle: "مدوّنتي — منصّة المحتوى والنشر الرقمي",
        seoDescription:
          "مدوّنتي منصّة سعودية متخصّصة في صناعة المحتوى والنشر الرقمي، تبني حضوراً رقمياً موثوقاً للعلامات عبر مقالات وصفحات محسّنة لمحرّكات البحث.",
        canonicalUrl: entityUrl("authors", MODONTY_AUTHOR_SLUG, siteUrl),
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

