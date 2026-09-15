import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Overview, OVERVIEW_MARKETS, isOverviewSlug } from "@/app/components/overview/Overview";
import { getCachedPaySectionContent } from "@/app/data/get-cached-catalog";

/**
 * الأوفرفيو بسوقٍ صريح في المسار — `/sa` و`/eg`.
 *
 * ليش وُجد (خالد ١٥ سبتمبر ٢٠٢٦): «الاي بي تبع الدوله يبتدي الكنترول من الصفحه
 * الرئيسيه مش من صفحه الباقات بس». فالبروكسي يعيد كتابة `/` إلى `/eg` للزائر
 * المصريّ، وهذا المسار هو ما يُخدَم له — بالجنيه من أوّل سطر.
 *
 * ⚠ وكان `/eg` يرجع **٤٠٤** قبل اليوم (قيس على اللوكل ١٥ سبتمبر): لا `page.tsx`
 * على هذا المقطع أصلاً، مع أن `app/[market]/` يحمل `plans` و`checkout` و`contract`.
 * فمن كتب `/eg` بيده — أو تبع رابطاً ناقصاً — سقط على صفحة خطأ.
 *
 * و`generateStaticParams` تبني النسختين وقت البناء: الصفحة تقرأ سوقها من المسار
 * لا من رأس الطلب، فتبقى ساكنةً تُسلَّم من الحافة كما كانت قبل أن تعرف السوق.
 */
export function generateStaticParams() {
  return Object.keys(OVERVIEW_MARKETS).map((market) => ({ market }));
}

/**
 * ⚠ لا `export const dynamicParams = false` هنا رغم أنه المعتاد لقائمةٍ مغلقة:
 * `cacheComponents: true` يرفضه ويُسقط البناء —
 *   «Route segment config "dynamicParams" is not compatible with
 *    nextConfig.cacheComponents. Please remove it.»
 * (قيس ١٥ سبتمبر ٢٠٢٦: كل مسارات الأوفرفيو رجعت **٥٠٠** حتى حُذف.)
 * وحراسة `isOverviewSlug` أدناه تؤدّي نفس الغرض: `/xx` يسقط على `notFound()`.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ market: string }>;
}): Promise<Metadata> {
  const { market } = await params;
  if (!isOverviewSlug(market)) return { title: "الباقات", robots: { index: false, follow: false } };
  const content = await getCachedPaySectionContent(OVERVIEW_MARKETS[market]);
  return {
    title: content.headline ?? "باقات مدونتي",
    description: content.subheadline ?? undefined,
    robots: { index: false, follow: false },
  };
}

export default async function MarketOverviewPage({
  params,
}: {
  params: Promise<{ market: string }>;
}) {
  const { market } = await params;
  if (!isOverviewSlug(market)) notFound();
  return <Overview slug={market} />;
}
