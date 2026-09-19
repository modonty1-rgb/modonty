import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/db";
import { checkAdmin } from "@/lib/admin-guard";
import { ClientSiteWorkspace } from "./components/client-site-workspace";

/**
 * **راوتُ النشر على موقع العميل** (خالد ١٩ سبتمبر ٢٠٢٦: «أغلبيّتها شغل تكنيكال»).
 *
 * خرج من صفحة التعديل لأنّه شغلُ مرحلةٍ أخرى: يُضبط مرّةً عند الربط ثمّ لا يُلمس، بينما
 * بقيّةُ الصفحة تُحرَّر أسبوعيّاً. وتعليقُ `client-form-config.ts:185` يقوله أصلاً —
 * القسمُ لا يظهر عند الإنشاء لأنّه «قرارٌ لاحق».
 *
 * ومدخلُه من بطاقة الطلب في صفحة التعديل (خالد، نفس اليوم): «في الكرت اللي فيه مراجعة
 * الطلب وإرسال رسالة ترحيبيّة نضيف أكشن بوتون ثاني» — فلا قائمةَ تُبنى ولا راوتَ في
 * السايدبار، والمدخلُ من حيث تعرف العميلَ أصلاً.
 */
export const dynamic = "force-dynamic";

export default async function ClientSitePage({ params }: { params: Promise<{ id: string }> }) {
  const gate = await checkAdmin();
  if (gate.status === "unauthenticated") redirect("/login");
  if (gate.status === "forbidden") redirect("/");

  const { id } = await params;
  const client = await db.client.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      articlesBaseUrl: true,
      canPublishToOwnSite: true,
      apiKeySuspended: true,
      // مختومٌ من نقطة السحب لا من النموذج — يُقرأ هنا ولا يُرسَل أبداً.
      apiKeyLastUsedAt: true,
    },
  });
  if (!client) notFound();

  return (
    <ClientSiteWorkspace
      clientId={client.id}
      clientName={client.name}
      initial={{
        articlesBaseUrl: client.articlesBaseUrl,
        canPublishToOwnSite: client.canPublishToOwnSite ?? false,
        apiKeySuspended: client.apiKeySuspended ?? false,
      }}
      keyInfo={{ apiKeyLastUsedAt: client.apiKeyLastUsedAt ?? null }}
    />
  );
}
