import type { Metadata } from "next";

import { Overview } from "./components/overview/Overview";
import { getCachedPaySectionContent } from "./data/get-cached-catalog";

/**
 * جذر النطاق — نسخة السعودية من الأوفرفيو، وهي أيضاً الافتراضية لكل بلدٍ سوى مصر.
 *
 * والمصريّ يصل إلى هذا العنوان نفسه ويستلم نسخة مصر: البروكسي **يعيد كتابة** `/`
 * إلى `/eg` (`proxy.ts`) — إعادة كتابةٍ لا تحويل، فالعنوان في شريط المتصفّح يبقى
 * `/` ولا قفزةً يدفع ثمنها. والنسختان ساكنتان، تُبنيان مرّةً وتُسلَّمان من الحافة.
 *
 * ولماذا لا `redirect` بالبلد: قفزةٌ إضافية على أوّل صفحةٍ في المسار — أغلى صفحةٍ
 * على الأداء — ثم عنوانٌ فيه `/sa` لكل زائرٍ سعوديّ بلا فائدةٍ له.
 */
export async function generateMetadata(): Promise<Metadata> {
  const content = await getCachedPaySectionContent("SA");
  return {
    title: content.headline ?? "باقات مدونتي",
    description: content.subheadline ?? undefined,
    // لا تُفهرس قبل أن تبيع (PAY-F5 يفتح الفهرسة بعد أوّل عملية حقيقية).
    robots: { index: false, follow: false },
  };
}

export default function RootOverviewPage() {
  return <Overview slug="sa" />;
}
