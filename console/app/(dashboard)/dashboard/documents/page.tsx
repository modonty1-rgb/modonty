import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MyDocuments } from "./components/my-documents";

/**
 * **صفحةُ وثائق العميل في الكونسول** (خالد ١٩ سبتمبر ٢٠٢٦).
 *
 * الوثائقُ كانت واحدةً مقيَّدةً بتصنيف YMYL — يرفعها من `profile` داخل `ymylData`،
 * فلا يملك أن يضيف سجلّاً تجاريّاً أو شهادةً ضريبيّة. وصارت جدولاً مفتوحاً: يرفع ما
 * عنده ويسمّيه بما يعرفه.
 */
export const dynamic = "force-dynamic";

export default async function MyDocumentsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const docs = await db.clientDocument.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    select: { id: true, label: true, url: true, expiresAt: true, source: true },
  });

  return (
    <div dir="rtl" className="mx-auto max-w-4xl p-4 sm:p-6">
      <MyDocuments
        documents={docs.map((d) => ({ ...d, expiresAt: d.expiresAt?.toISOString() ?? null }))}
      />
    </div>
  );
}
