import { cacheTag } from "next/cache";

import { getFeatureMatrix, type FeatureMatrix } from "@modonty/shared/lib/commercial/get-feature-matrix";
import { db } from "@/lib/db";

import { CATALOG_TAG } from "./get-cached-catalog";

/**
 * مصفوفة المزايا تحت وسم الكتالوج نفسه — فتعديل ميزةٍ في الأدمن يُبطل الأوفرفيو وصفحة
 * الباقات معاً في نداءٍ واحد، ولا يبقى الجدول يعرض ميزةً حُذفت أمس.
 */
export async function getCachedFeatureMatrix(): Promise<FeatureMatrix> {
  "use cache";
  cacheTag(CATALOG_TAG);
  return getFeatureMatrix(db);
}
