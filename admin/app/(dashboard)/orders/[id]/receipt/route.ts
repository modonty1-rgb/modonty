import { readBunnyBackupConfig } from "@modonty/shared/lib/backup";
import { db } from "@/lib/db";
import { checkSalesDesk } from "@/lib/require-sales-desk";

/**
 * يعرض صورة سند الإيصال من المخزن الخاصّ — بعد التحقّق من الجلسة، ولا تُخزَّن في أيّ كاش
 * مشترك. هنا لا في `api/` لأنّ صفحة الطلب وحدها تطلبه (قاعدة المجلّدات).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await checkSalesDesk();
  if (gate.status !== "ok") return new Response("غير مصرّح", { status: gate.status === "unauthenticated" ? 401 : 403 });

  const { id } = await params;
  const order = await db.checkoutOrder.findUnique({ where: { id }, select: { transferReceiptPath: true } });
  if (!order?.transferReceiptPath) return new Response("لا سند", { status: 404 });

  const config = readBunnyBackupConfig();
  const res = await fetch(`https://${config.hostname}/${config.zone}/${order.transferReceiptPath}`, {
    headers: { AccessKey: config.password },
    cache: "no-store",
  });
  if (!res.ok || !res.body) return new Response("تعذّر جلب السند", { status: 502 });

  return new Response(res.body, {
    headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store" },
  });
}
