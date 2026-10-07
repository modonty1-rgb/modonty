import { ZodError, type ZodType, type ZodTypeDef } from "zod";

import { fail, MESSAGES } from "./http";

/**
 * جسم JSON مُتحقَّق منه بـZod — نسخة `console/lib/mobile-api/request.ts`. الجسم الفارغ يُقرأ `{}`
 * (نقاط التتبّع جسمها اختياري)، والمخطّط وحده يقرّر ما هو مطلوب.
 */
export async function readBody<T>(request: Request, schema: ZodType<T, ZodTypeDef, unknown>) {
  try {
    const text = await request.text();
    return { value: schema.parse(text.trim() ? JSON.parse(text) : {}) } as const;
  } catch (error) {
    return {
      response: fail("VALIDATION_ERROR", MESSAGES.invalidBody, error instanceof ZodError ? error.flatten() : undefined),
    } as const;
  }
}

/** معاملات الرابط مُتحقَّق منها بـZod. القيم الفارغة تُعامل غائبة. */
export function readQuery<T>(request: Request, schema: ZodType<T, ZodTypeDef, unknown>) {
  const params = new URL(request.url).searchParams;
  const raw: Record<string, string> = {};
  params.forEach((value, key) => {
    if (value !== "") raw[key] = value;
  });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { response: fail("VALIDATION_ERROR", MESSAGES.invalidBody, parsed.error.flatten()) } as const;
  }
  return { value: parsed.data } as const;
}

/** رقم الصفحة (offset) كما يقبله الويب: عدد صحيح ≥ ١. */
export const PAGE_MAX = 1000;
