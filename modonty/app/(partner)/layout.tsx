import type { ReactNode } from "react";

import { SessionProviderWrapper } from "@/app/layout/components/SessionProviderWrapper";

/**
 * صفحات الشريك (`/clients/[slug]`) تقرأ الجلسة — زرّ المتابعة والشريط السفليّ يعرفان
 * أمسجَّلٌ الزائر أم لا.
 *
 * أُنشئ هذا التخطيط حين نزل `SessionProviderWrapper` من الجذر (١٤ سبتمبر ٢٠٢٦): كان في
 * الجذر فينادي `auth()` لكل صفحة بما فيها صفحة البيع، وهي لغير المسجَّلين. فصار كلٌّ
 * يأخذ ما يحتاج: `(site)` و`(partner)` الجلسة، و`(pay)` بلا مصادقة.
 *
 * ولا ترويسة هنا: الشريك يركّب ترويسته داخل صفحاته.
 */
export default function PartnerLayout({ children }: { children: ReactNode }) {
  return <SessionProviderWrapper>{children}</SessionProviderWrapper>;
}
