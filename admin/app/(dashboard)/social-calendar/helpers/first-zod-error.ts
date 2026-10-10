import type { ZodError } from "zod";

/** أوّل رسالة عربية من Zod — ما يراه الموظّف في الإشعار المنبثق بدل «بيانات غير صحيحة» العامّة. */
export function firstZodError(error: ZodError): string {
  return error.issues[0]?.message ?? "بيانات غير صحيحة";
}
