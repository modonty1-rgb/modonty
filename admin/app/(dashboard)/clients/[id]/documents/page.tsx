import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/db";
import { checkAdmin } from "@/lib/admin-guard";
import { DocumentsGallery } from "./components/documents-gallery";

/**
 * **راوتُ وثائق العميل** (خالد ١٩ سبتمبر ٢٠٢٦).
 *
 * مدخلُه من بطاقة الطلب في صفحة التعديل، كأخيه `/site` — بابٌ واحدٌ من حيث تعرف
 * العميلَ أصلاً، بلا قائمةٍ في السايدبار.
 *
 * ── والأحدثُ أوّلاً ──
 * لا ترتيبَ بحالةٍ نحكم بها نحن (خالد ١٩ سبتمبر ٢٠٢٦: «ليه تعقيد… احنا ما بنفحص، احنا
 * بنرفع الداتا اللي موجودة»). فسقط ختمُ الفحص من الجدول والشاشة معاً.
 */
export const dynamic = "force-dynamic";

export default async function ClientDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const gate = await checkAdmin();
  if (gate.status === "unauthenticated") redirect("/login");
  if (gate.status === "forbidden") redirect("/");

  const { id } = await params;
  const client = await db.client.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!client) notFound();

  const docs = await db.clientDocument.findMany({
    where: { clientId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, label: true, url: true, note: true,
      expiresAt: true, source: true, createdAt: true,
    },
  });

  return (
    <DocumentsGallery
      clientId={client.id}
      clientName={client.name}
      // التواريخُ تُسلَّم نصّاً: مكوّنُ العميل لا يستقبل `Date` عبر حدّ الخادم.
      documents={docs.map((d) => ({
        ...d,
        expiresAt: d.expiresAt?.toISOString() ?? null,
        createdAt: d.createdAt.toISOString(),
      }))}
    />
  );
}
