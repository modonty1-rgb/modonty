import { db } from "@/lib/db";

/** آخر طلب «ابحث الآن» لمجالٍ واحد — ليرى الفريق هل هو في الطابور أو انتهى ومتى. */
export async function getFieldRequest(field: string) {
  const [fieldType, fieldKey] = field.split(":");
  if (!fieldType || !fieldKey) return null;
  return db.ideaBankRequest.findFirst({
    where: { fieldType, fieldKey },
    orderBy: { createdAt: "desc" },
    select: { status: true, created: true, error: true, createdAt: true, doneAt: true },
  });
}
