"use server";

import { entityUrl } from "@modonty/shared/lib/seo/absolute-url";
import { db } from "@/lib/db";
import { MODONTY_AUTHOR_SLUG } from "@/lib/constants/modonty-author";
import { loadSiteUrl } from "@/lib/seo/site-url";

type ModontyAuthor = Awaited<ReturnType<typeof db.author.upsert>>;

export type ModontyAuthorLookup = {
  author: ModontyAuthor | null;
  error: string | null;
};

/** Keep deployment/database diagnostics useful without ever printing a connection password. */
function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/(mongodb(?:\+srv)?:\/\/)[^\s@/]+@/gi, "$1***@");
}

export async function getModontyAuthorLookup(): Promise<ModontyAuthorLookup> {
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

    return { author, error: null };
  } catch (error) {
    const primaryError = safeErrorMessage(error);
    try {
      const existingAuthor = await db.author.findUnique({
        where: { slug: MODONTY_AUTHOR_SLUG },
        include: {
          _count: { select: { articles: true } },
        },
      });
      if (existingAuthor) {
        return { author: existingAuthor, error: null };
      }
    } catch (fetchError) {
      const fallbackError = safeErrorMessage(fetchError);
      const diagnostic = `فشل إنشاء/قراءة Author slug=\"${MODONTY_AUTHOR_SLUG}\". الخطأ الأساسي: ${primaryError} | فشل البحث الاحتياطي: ${fallbackError}`;
      console.error(diagnostic);
      return { author: null, error: diagnostic };
    }

    const diagnostic = `فشل إنشاء/قراءة Author slug=\"${MODONTY_AUTHOR_SLUG}\". الخطأ الأساسي: ${primaryError} | البحث الاحتياطي لم يجد سجلًا بهذا الـslug.`;
    console.error(diagnostic);
    return { author: null, error: diagnostic };
  }
}

/** Existing callers only need the record; the Authors screen uses the diagnostic variant. */
export async function getModontyAuthor() {
  return (await getModontyAuthorLookup()).author;
}
