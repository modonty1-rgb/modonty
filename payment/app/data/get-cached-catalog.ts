import { cacheTag } from "next/cache";

import { getMarketCatalog, type MarketCatalog } from "@modonty/shared/lib/commercial/get-market-catalog";
import { getPaySectionContent, type PaySectionContent } from "@modonty/shared/lib/commercial/get-pay-section-content";
import { db } from "@/lib/db";

/**
 * كتالوج سوق واحد وكلام صفحته، مكاشَين تحت وسم `commercial-catalog` (PAY-C1).
 *
 * القارئان نفسهما اللذان تستعملهما شاشة المعاينة في الأدمن — فما يعتمده خالد هناك هو ما
 * يُقرأ هنا حرفاً بحرف. الفرق الوحيد هذه الطبقة: المعاينة تقرأ الصفّ الحيّ لأن غرضها إظهار
 * التعديل لحظة حفظه، وصفحة البيع تُكاش لأن زائراً واحداً لا يستأهل استعلامين لكل فتحة.
 *
 * ── لماذا `'use cache'` لا `unstable_cache` ──
 * تحقّقتُ من توثيق Next 16.2.9 عبر Context7 قبل الكتابة (البطاقة تشترط ذلك صراحةً):
 * `unstable_cache` موثَّق في صفحة اسمها `caching-without-cache-components.mdx` — أي أنه
 * نموذج ما **قبل** `cacheComponents`. ومدونتي تعمل به (`modonty/next.config.ts:108`
 * `cacheComponents: true`). فالواجهة المعتمدة هنا هي التوجيه `'use cache'` مع `cacheTag`
 * من `next/cache`، وهي التي يُبطلها `revalidateTag` بنفس الاسم.
 *
 * الوسم هو الحارس: كل أكشن كتابة في `commercial-plans/actions.ts` يمرّ بـ`revalidateCatalog`
 * التي تنادي `/api/revalidate/tag` بهذا الاسم (٢٥ استدعاءً · صفر أكشن يكتب بلا إبطال).
 * بدونه تبيع الصفحة بسعر الأمس — وهو أخطر ما يبيت قديماً في هذا المشروع.
 */

export const CATALOG_TAG = "commercial-catalog";

export async function getCachedMarketCatalog(market: string): Promise<MarketCatalog> {
  "use cache";
  cacheTag(CATALOG_TAG);
  return getMarketCatalog(db, market);
}

export async function getCachedPaySectionContent(market: string): Promise<PaySectionContent> {
  "use cache";
  cacheTag(CATALOG_TAG);
  return getPaySectionContent(db, market);
}
