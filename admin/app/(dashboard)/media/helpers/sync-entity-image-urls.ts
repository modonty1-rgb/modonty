import { db } from "@/lib/db";

/**
 * T2 dual-field integrity (Khalid 2026-07-31 — "هذه مصيبة، مش فجوة"):
 * entity forms save BOTH the Media relation and the raw URL string, but editing
 * the Media ROW itself (replace-file / type-or-client move) changes the row's URL
 * and leaves every referencing entity's string stale — its baked SEO then serves
 * a dead link. Called from updateMedia whenever the row's resolved URL changes:
 * rewrites the strings via the relations, patches Settings by old-URL match
 * (Settings has no relation columns), then regenerates every affected stored SEO.
 */
export async function syncEntityImageUrls(mediaId: string, newUrl: string, oldUrl: string | null) {
  const [tags, categories, industries, heroPages, socialPages] = await Promise.all([
    db.tag.findMany({ where: { socialImageMediaId: mediaId }, select: { id: true } }),
    db.category.findMany({ where: { socialImageMediaId: mediaId }, select: { id: true } }),
    db.industry.findMany({ where: { socialImageMediaId: mediaId }, select: { id: true } }),
    db.modonty.findMany({ where: { heroImageMediaId: mediaId }, select: { slug: true } }),
    db.modonty.findMany({ where: { socialImageMediaId: mediaId }, select: { slug: true } }),
  ]);

  await Promise.all([
    tags.length
      ? db.tag.updateMany({ where: { socialImageMediaId: mediaId }, data: { socialImage: newUrl } })
      : null,
    categories.length
      ? db.category.updateMany({ where: { socialImageMediaId: mediaId }, data: { socialImage: newUrl } })
      : null,
    industries.length
      ? db.industry.updateMany({ where: { socialImageMediaId: mediaId }, data: { socialImage: newUrl } })
      : null,
    heroPages.length
      ? db.modonty.updateMany({ where: { heroImageMediaId: mediaId }, data: { heroImage: newUrl } })
      : null,
    socialPages.length
      ? db.modonty.updateMany({
          where: { socialImageMediaId: mediaId },
          data: { socialImage: newUrl, ogImage: newUrl },
        })
      : null,
  ]);

  // Settings stores plain strings with no relation columns — patch by old-URL match.
  const SETTINGS_IMAGE_FIELDS = [
    "logoUrl",
    "logoIconUrl",
    "ogImageUrl",
    "certificateImageUrl",
    "categoriesPageImage",
    "tagsPageImage",
    "industriesPageImage",
  ] as const;
  let settingsTouched = false;
  if (oldUrl) {
    const settings = await db.settings.findFirst({
      select: Object.fromEntries([["id", true], ...SETTINGS_IMAGE_FIELDS.map((f) => [f, true])]),
    });
    if (settings) {
      const patch: Record<string, string> = {};
      for (const f of SETTINGS_IMAGE_FIELDS) {
        if ((settings as Record<string, unknown>)[f] === oldUrl) patch[f] = newUrl;
      }
      if (Object.keys(patch).length > 0) {
        await db.settings.update({ where: { id: settings.id as string }, data: patch });
        settingsTouched = true;
      }
    }
  }

  // Regenerate the baked SEO of every touched entity — best-effort each.
  const regen: Promise<unknown>[] = [];
  if (tags.length) {
    const { generateAndSaveTagSeo } = await import("@/lib/seo/tag-seo-generator");
    regen.push(...tags.map((t) => generateAndSaveTagSeo(t.id).catch(() => null)));
  }
  if (categories.length) {
    const { generateAndSaveCategorySeo } = await import("@/lib/seo/category-seo-generator");
    regen.push(...categories.map((c) => generateAndSaveCategorySeo(c.id).catch(() => null)));
  }
  if (industries.length) {
    const { generateAndSaveIndustrySeo } = await import("@/lib/seo/industry-seo-generator");
    regen.push(...industries.map((i) => generateAndSaveIndustrySeo(i.id).catch(() => null)));
  }
  const pageSlugs = [...new Set([...heroPages, ...socialPages].map((p) => p.slug))];
  if (pageSlugs.length) {
    const { generateModontyPageSEO } = await import(
      "@/app/(dashboard)/modonty/setting/actions/generate-modonty-page-seo"
    );
    regen.push(...pageSlugs.map((s) => generateModontyPageSEO(s).catch(() => null)));
  }
  if (settingsTouched) {
    const { regenerateTagsListingCache, regenerateCategoriesListingCache, regenerateIndustriesListingCache } =
      await import("@/lib/seo/listing-page-seo-generator");
    regen.push(
      regenerateTagsListingCache().catch(() => null),
      regenerateCategoriesListingCache().catch(() => null),
      regenerateIndustriesListingCache().catch(() => null)
    );
  }
  await Promise.all(regen);

  return {
    tags: tags.length,
    categories: categories.length,
    industries: industries.length,
    pages: pageSlugs.length,
    settings: settingsTouched,
  };
}
