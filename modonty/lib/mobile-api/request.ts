import { ZodError, type ZodType, type ZodTypeDef } from "zod";

import { fail, MESSAGES } from "./http";

/**
 * نتيجة القراءة: قيمة مُتحقَّق منها **أو** ردّ خطأ جاهز. النوع معلَن صراحةً — المستنتَج من
 * `as const` كان يُبقي `response` في الفرعين فيصير `NextResponse | undefined` بعد `"response" in`،
 * فرسبت كل نقطة تستعمله في `tsc` (٢٣ خطأ).
 */
export type Parsed<T> = { readonly value: T } | { readonly response: Response };

/**
 * جسم JSON مُتحقَّق منه بـZod — نسخة `console/lib/mobile-api/request.ts`. الجسم الفارغ يُقرأ `{}`
 * (نقاط التتبّع جسمها اختياري)، والمخطّط وحده يقرّر ما هو مطلوب.
 */
export async function readBody<T>(request: Request, schema: ZodType<T, ZodTypeDef, unknown>): Promise<Parsed<T>> {
  try {
    const text = await request.text();
    return { value: schema.parse(text.trim() ? JSON.parse(text) : {}) };
  } catch (error) {
    return {
      response: fail("VALIDATION_ERROR", MESSAGES.invalidBody, error instanceof ZodError ? error.flatten() : undefined),
    };
  }
}

/** معاملات الرابط مُتحقَّق منها بـZod. القيم الفارغة تُعامل غائبة. */
export function readQuery<T>(request: Request, schema: ZodType<T, ZodTypeDef, unknown>): Parsed<T> {
  const params = new URL(request.url).searchParams;
  const raw: Record<string, string> = {};
  params.forEach((value, key) => {
    if (value !== "") raw[key] = value;
  });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { response: fail("VALIDATION_ERROR", MESSAGES.invalidBody, parsed.error.flatten()) };
  }
  return { value: parsed.data };
}

/** رقم الصفحة (offset) كما يقبله الويب: عدد صحيح ≥ ١. */
export const PAGE_MAX = 1000;
