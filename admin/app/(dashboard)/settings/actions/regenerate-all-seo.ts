"use server";

export async function regenerateAllEntitySeoCache() {
  const [
    { batchGenerateCategorySeo },
    { batchGenerateTagSeo },
    { batchGenerateIndustrySeo },
  ] = await Promise.all([
    import("@/lib/seo/category-seo-generator"),
    import("@/lib/seo/tag-seo-generator"),
    import("@/lib/seo/industry-seo-generator"),
  ]);

  const [categories, tags, industries] = await Promise.all([
    batchGenerateCategorySeo(),
    batchGenerateTagSeo(),
    batchGenerateIndustrySeo(),
  ]);

  return { categories, tags, industries };
}
