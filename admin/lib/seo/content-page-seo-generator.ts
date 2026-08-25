"use server";

/**
 * Content Page SEO Generator — the ONLY writer of `Modonty.nextjsMetadata`.
 *
 * The content pages (about, contact, terms, the four legal pages, trust, story, audio, reels)
 * were the last surfaces on modonty still assembling their metadata on every request. Khalid,
 * 25 Aug 2026: every page reads ready-made data from the database — the admin generates, and
 * modonty only renders. This writes the same Metadata shape the listing blobs carry, from the
 * same Settings defaults, through the shared builder.
 */

import { buildContentPageMetadata } from "@modonty/shared/lib/seo/build-content-page-metadata";

import { db } from "@/lib/db";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { PAGE_CONFIGS } from "@/app/(dashboard)/modonty/setting/helpers/page-config";

import type { Prisma } from "@prisma/client";

/** Copy of last resort, used only until a page's row carries its own. */
const FALLBACKS: Record<string, { title: string; description: string; robots?: string }> = {
  about: { title: "من نحن", description: "تعرّف على مدونتي — منصّة المحتوى العربي لشركاء موثوقين." },
  contact: { title: "تواصل معنا", description: "اسأل، اقترح، أو اطلب شراكة — نردّ عليك بسرعة." },
  terms: { title: "الشروط والأحكام", description: "شروط استخدام منصّة مدونتي." },
  "user-agreement": { title: "اتفاقية المستخدم", description: "اتفاقية استخدام منصّة مدونتي." },
  "privacy-policy": { title: "سياسة الخصوصية", description: "كيف نتعامل مع بياناتك على مدونتي." },
  "cookie-policy": { title: "سياسة ملفات الارتباط", description: "ملفات الارتباط التي نستخدمها ولماذا." },
  "copyright-policy": { title: "سياسة حقوق النشر", description: "حقوق النشر والملكية الفكرية على مدونتي." },
  trust: { title: "الموثوقية", description: "من نحن رسمياً — السجل والعنوان ووسائل التواصل." },
  story: { title: "قصتنا", description: "كيف بدأت مدونتي وإلى أين تتّجه." },
  audio: {
    title: "استمع للقرآن الكريم كاملاً بعشرين قارئاً — ومقالات مدونتي مقروءة",
    description:
      "المصحف كامل ١١٤ سورة برواية حفص عن عاصم، بصوت العفاسي والسديس والمعيقلي والحصري والمنشاوي وغيرهم — اسمع أي سورة بأي قارئ، ومعها النسخ الصوتية من مقالات مدونتي.",
  },
  reels: {
    // No brand here — the layout's title template appends "| مدونتي", and this string
    // carried "مُدَوَّنَتِي" as well, so the tag read the brand twice in two spellings.
    title: "الريلز",
    description: "مقاطع قصيرة من مقالات شركاء مدونتي — شاهدها كاملة الشاشة.",
    // Indexable: `app/sitemap.ts` lists /reels, so a noindex default made the site contradict
    // itself, and its `nofollow` half blocked the crawl into the watch pages. Closing it again
    // is a switch on the page's row, not an edit here.
  },
};

export async function regenerateContentPageCache(slug: string): Promise<{ success: boolean; error?: string }> {
  try {
    const config = PAGE_CONFIGS.find((c) => c.slug === slug);
    if (!config) return { success: false, error: `Unknown content page "${slug}"` };

    const settings = (await getAllSettings()) as unknown as Record<string, unknown>;
    const siteUrl = ((settings.siteUrl as string) || "https://www.modonty.com").replace(/\/$/, "");
    const row = await db.modonty.findUnique({ where: { slug } });
    const fallback = FALLBACKS[slug] ?? { title: config.label, description: config.description };

    const metadata = buildContentPageMetadata({
      row,
      settings,
      siteUrl,
      path: config.modontyPath,
      fallbackTitle: fallback.title,
      fallbackDescription: fallback.description,
      fallbackRobots: fallback.robots,
      fallbackOgImage: (settings.ogImageUrl as string) ?? null,
    });

    // A page with no row yet gets one, so its blob exists from the first generate.
    await db.modonty.upsert({
      where: { slug },
      update: {
        nextjsMetadata: metadata as unknown as Prisma.InputJsonValue,
        metaLastGenerated: new Date(),
      },
      create: {
        slug,
        title: fallback.title,
        content: "",
        nextjsMetadata: metadata as unknown as Prisma.InputJsonValue,
        metaLastGenerated: new Date(),
      },
    });

    await revalidateModontyTag("pages");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function regenerateAllContentPageCaches(): Promise<{ results: Record<string, boolean> }> {
  const results: Record<string, boolean> = {};
  for (const config of PAGE_CONFIGS) {
    const r = await regenerateContentPageCache(config.slug);
    results[config.slug] = r.success;
  }
  await revalidateModontyTag("pages");
  return { results };
}
