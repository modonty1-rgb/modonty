import type { NextRequest } from "next/server";
import { ZodError, type ZodType } from "zod";
import { fail } from "@/lib/mobile-api/http";

export async function readBody<T>(request: NextRequest, schema: ZodType<T>) {
  try { return { value: schema.parse(await request.json()) } as const; }
  catch (error) { return { response: fail("VALIDATION_ERROR", "البيانات المرسلة غير صالحة.", error instanceof ZodError ? error.flatten() : undefined) } as const; }
}
