import "server-only";
import { cacheTag, cacheLife } from "next/cache";

import { db } from "@/lib/db";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { getAiPrompt, renderPrompt } from "@modonty/shared/lib/ai/get-ai-prompt";

/**
 * برومبت مودو، جاهزاً للإرسال — الباب الوحيد بين مسارات الشات والنصّ.
 *
 * المسار لا يعرف النصّ ولا يبنيه: يطلب المفتاح ويعطي المتغيّرات. فتعديل شخصية مودو
 * من `/modonty/modo` في الأدمن يظهر للزائر بعد تفريغ الوسم، بلا نشر.
 *
 * **الاحتياط:** الصفّ الغائب أو المعطَّل يرجع إلى نصّ الكود في `prompt-defaults.ts` —
 * وهو ما يعمل اليوم. لا يُشغَّل النموذج بلا تعليمات أبداً.
 *
 * **الكاش:** القراءة مخزَّنة تحت وسم `ai-prompts`، والأدمن يفرّغه عند الحفظ. بدون ذلك
 * كان كل سؤال يكلّف قراءة صفٍّ إضافية — وهي رخيصة لكنها بلا مقابل.
 */
async function readPromptBody(key: string): Promise<{ body: string; source: "db" | "code" }> {
  "use cache";
  cacheTag("ai-prompts");
  cacheLife("hours");
  const p = await getAiPrompt(db, key);
  return { body: p.body, source: p.source };
}

/**
 * اسم المنصّة يأتي من `Settings.siteName` لا من ثابتٍ في الكود — وهو ما أسقط
 * `BRAND_AR` من مسار مودو. وبغياب العمود يبقى المتغيّر فارغاً بدل اسمٍ قديم:
 * جملةٌ ناقصة تُرى وتُصلَح، واسمٌ خاطئ يُقرأ ويُصدَّق.
 */
export async function resolveModoPrompt(
  key: "modo.identity" | "modo.category" | "modo.article",
  vars: Record<string, string | number | null | undefined> = {},
): Promise<string> {
  const [{ body }, { siteName }] = await Promise.all([readPromptBody(key), getPageSeoDefaults()]);
  const { text } = renderPrompt(body, { siteName: siteName ?? "", ...vars });
  return text;
}
