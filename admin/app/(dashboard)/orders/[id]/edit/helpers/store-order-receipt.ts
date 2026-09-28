import "server-only";

import { readBunnyBackupConfig, uploadToBunny } from "@modonty/shared/lib/backup";
import { loadSharp } from "@/lib/utils/sharp-loader";

/**
 * يحفظ صورة سند الإيصال في مخزن Bunny الخاصّ ويرجع مسارها — يستدعيه «حفظ التعديل» وحده.
 *
 * المخزن `modonty-backups` بلا Pull Zone (مقيس من Bunny API: `PullZones attached: []`) فلا رابط
 * عامّ للسند، ويُعرض من `/orders/[id]/receipt` بعد التحقّق من الجلسة. الاسم ثابتٌ لكلّ طلب،
 * فالاستبدال يكتب فوقه. ومجلّد `order-receipts/` لا يمسّه تقليم النسخ (يقلّم أسماء التواريخ وحدها).
 */
export async function storeOrderReceipt(
  orderId: string,
  file: File,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  if (!file.type.startsWith("image/")) return { ok: false, error: "السند صورة فقط" };

  // المتصفّح يصغّرها قبل الإرسال (`shrink-image.ts`)؛ وهنا تُوحَّد WebP بعرضٍ أقصاه ٢٠٠٠.
  let body: Buffer;
  try {
    body = await loadSharp()(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return { ok: false, error: "تعذّرت قراءة صورة السند — جرّب صورة ثانية" };
  }

  const path = `order-receipts/${orderId}.webp`;
  try {
    await uploadToBunny(readBunnyBackupConfig(), path, body);
  } catch {
    return { ok: false, error: "ما انرفعت صورة السند — لم يُحفظ شيء، حاول مرة ثانية" };
  }
  return { ok: true, path };
}
