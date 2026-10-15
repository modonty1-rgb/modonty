"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRadarFields } from "@/lib/idea-bank/get-radar-fields";

// المنافس مفتاحه نطاقه (`arageek.com`) — فالنقطة مسموحة
const Input = z.object({ field: z.string().regex(/^(sector|category|industry|competitor):[\w.-]{1,100}$/) });

/**
 * «ابحث الآن» لمجالٍ واحد — يُسجَّل طلباً يلتقطه الرادار خلال ٥ دقائق.
 * المجال يُتحقَّق منه في القاعدة (لا يُصدَّق اسمٌ آتٍ من المتصفّح)، ولا يُكرَّر طلبٌ قائم لنفس المجال.
 */
export async function requestFieldSearch(raw: unknown): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const staffId = (session?.user as { id?: string } | undefined)?.id;
  if (!staffId) return { success: false, error: "غير مصرح" };

  const parsed = Input.safeParse(raw);
  if (!parsed.success) return { success: false, error: "طلب غير صالح" };
  const [fieldType, fieldKey] = parsed.data.field.split(":");

  const field = (await getRadarFields()).find((f) => f.type === fieldType && f.key === fieldKey);
  if (!field) return { success: false, error: "المجال غير موجود" };

  const open = await db.ideaBankRequest.findFirst({
    where: { fieldType, fieldKey, status: { in: ["PENDING", "RUNNING"] } },
    select: { id: true },
  });
  if (open) return { success: false, error: "طلبٌ لهذا المجال قيد التنفيذ" };

  await db.ideaBankRequest.create({
    data: { fieldType, fieldKey, fieldName: field.name, requestedById: staffId },
    select: { id: true },
  });
  revalidatePath("/idea-bank");
  return { success: true };
}
