import { notFound, redirect } from "next/navigation";

import { checkAdmin } from "@/lib/admin-guard";
import { buildWelcomePreview } from "./helpers/build-welcome-preview";
import { WelcomePreview } from "./components/welcome-preview";

/**
 * **راوتُ بيانات الدخول — مرحلتان** (خالد ١٩ سبتمبر ٢٠٢٦).
 *
 * `force-dynamic` ليس تفصيلاً: الصفحةُ تولّد كلمةَ مرورٍ جديدةً في كلّ فتح، فنسخةٌ
 * مخزَّنةٌ منها تعني عرضَ كلمةٍ قديمةٍ ثمّ إرسالَها — بينما القاعدةُ تحمل غيرَها.
 */
export const dynamic = "force-dynamic";

export default async function ClientWelcomePage({ params }: { params: Promise<{ id: string }> }) {
  const gate = await checkAdmin();
  if (gate.status === "unauthenticated") redirect("/login");
  if (gate.status === "forbidden") redirect("/");

  const { id } = await params;
  const preview = await buildWelcomePreview(id);
  if (!preview) notFound();

  return <WelcomePreview preview={preview} />;
}
