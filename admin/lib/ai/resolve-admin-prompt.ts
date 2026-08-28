import "server-only";

import { db } from "@/lib/db";
import { getAiPrompt, renderPrompt } from "@modonty/shared/lib/ai/get-ai-prompt";

/**
 * برومبتات الأدمن، جاهزةً للإرسال — الباب الوحيد بين مولّدات الأدمن والنصّ.
 *
 * المفاتيح الأربعة: `admin.article.system` · `admin.article.user` ·
 * `admin.image.article` · `admin.image.gallery`. الكود لا يعرف نصّها ولا يبنيه.
 *
 * لا كاش هنا عمداً: هذه النداءات تحدث بضغطة زرّ من موظّف، مرّاتٍ معدودة في اليوم،
 * والنداء نفسه يستغرق ثوانيَ عند النموذج. قراءةُ صفٍّ قبله لا تُقاس — بينما الكاش
 * كان سيؤخّر ظهور تعديلٍ حفظه خالد قبل ثانية.
 */
export type AdminPromptKey =
  | "admin.article.system"
  | "admin.article.user"
  | "admin.image.article"
  | "admin.image.gallery";

export async function resolveAdminPrompt(
  key: AdminPromptKey,
  vars: Record<string, string | number | null | undefined> = {},
): Promise<string> {
  const { body } = await getAiPrompt(db, key);
  const { text } = renderPrompt(body, vars);
  return text;
}
