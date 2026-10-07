import type { ApiError } from '@/services/errors';

/**
 * أخطاء الحقول كما يرجعها الخادم (`details.fieldErrors` من Zod flatten) — القواعد ونصوصها العربية
 * للخادم وحده؛ التطبيق يعرضها تحت حقلها ولا يكرّر القاعدة.
 */
export function fieldErrors(error: ApiError | null): Record<string, string> {
  const details = error?.details as { fieldErrors?: Record<string, string[] | undefined> } | undefined;
  const out: Record<string, string> = {};
  for (const [key, messages] of Object.entries(details?.fieldErrors ?? {})) {
    if (messages?.[0]) out[key] = messages[0];
  }
  return out;
}
