import { db } from "@/lib/db";

import { pushIf, type DeleteBlockers } from "./delete-blockers";

/**
 * ما يمنع الحذف النهائي لريل (خالد ١٦ أكتوبر ٢٠٢٦: «زي المقالات» — الفريق يسحب، والأدمن يحذف المسحوب).
 * - ما هو مسحوب: السحب قرار الفريق من صفحة الريلز أولاً.
 * - صورة في معرض العميل: الصفّ نفسه صورة المعرض، فحذفه يمسحها من صفحة العميل.
 * - مستعمل في مكان آخر (صورة مقال · شعار/غلاف/فيديو تعريف عميل): علاقاتها NoAction، فالحذف يكسرها.
 */
export async function getReelDeleteBlockers(ids: string[]): Promise<DeleteBlockers> {
  const rows = await db.media.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      reelStatus: true,
      inGallery: true,
      _count: {
        select: {
          featuredArticles: true,
          articleGallery: true,
          authorImages: true,
          authorSocialImages: true,
          categorySocialImages: true,
          tagSocialImages: true,
          industrySocialImages: true,
          modontyHeroImages: true,
          modontySocialImages: true,
          sectorHeroImages: true,
          sectorHeroMobileImages: true,
          logoClients: true,
          heroImageClients: true,
          mobileHeroImageClients: true,
          introVideoClients: true,
        },
      },
    },
  });
  const out: DeleteBlockers = new Map();
  for (const r of rows) {
    const why: string[] = [];
    if (r.reelStatus !== "ARCHIVED") why.push("ما هو مؤرشف — الفريق يأرشفه من صفحة الريلز أولاً");
    if (r.inGallery) why.push("صورته معروضة في معرض العميل — شيلها من المعرض أولاً");
    pushIf(why, r._count.featuredArticles + r._count.articleGallery, "مقال يستعمل صورته");
    pushIf(why, r._count.logoClients + r._count.heroImageClients + r._count.mobileHeroImageClients + r._count.introVideoClients, "عميل يستعمله شعاراً أو غلافاً أو فيديو تعريف");
    const c = r._count;
    pushIf(why, c.authorImages + c.authorSocialImages + c.categorySocialImages + c.tagSocialImages + c.industrySocialImages + c.modontyHeroImages + c.modontySocialImages + c.sectorHeroImages + c.sectorHeroMobileImages, "مكان في مدونتي يستعمله (كاتب · تصنيف · وسم · صناعة · صفحة)");
    out.set(r.id, why);
  }
  return out;
}
