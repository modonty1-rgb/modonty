"use server";

import { db } from "@/lib/db";
import { PROMPT_DEFAULTS } from "@modonty/shared/lib/ai/prompt-defaults";

/**
 * تعبئة جدول `ai_prompts` من نصوص الكود — **إنشاء فقط، بلا كتابة فوق**.
 *
 * تُشغَّل من Run-All في الأدمن لا من سكربت مستقلّ (سياسة المشروع)، فتصيب قاعدة
 * التطبيق نفسه: dev محليّاً، والإنتاج حين يضغطها خالد هناك.
 *
 * **لا تلمس صفّاً موجوداً أبداً.** إعادة التشغيل بعد أن يعدّل خالد برومبتاً من الشاشة
 * تعيد صفراً، لا تُرجع نصّه القديم. وهذا هو الفرق بين خطوة تعبئة وخطوة تدمير.
 *
 * ما يتغيّر في الوصف (العنوان · أين يظهر · ماذا ينكسر) يُحدَّث للصفوف الموجودة، لأنه
 * وصفٌ يملكه الكود لا نصٌّ يملكه المحرّر — وهذه الحقول لا تُحرَّر من الشاشة.
 */
export interface SeedAiPromptsOutcome {
  created: number;
  metaUpdated: number;
  untouched: number;
  keys: string[];
}

export async function seedAiPrompts(): Promise<SeedAiPromptsOutcome> {
  let created = 0;
  let metaUpdated = 0;
  let untouched = 0;
  const keys: string[] = [];

  for (const p of PROMPT_DEFAULTS) {
    const existing = await db.aiPrompt.findUnique({
      where: { key: p.key },
      select: { id: true, title: true, surface: true, onEmpty: true, provider: true, app: true },
    });

    if (!existing) {
      await db.aiPrompt.create({
        data: {
          key: p.key,
          app: p.app,
          provider: p.provider,
          title: p.title,
          surface: p.surface,
          body: p.body,
          requiredVars: [...p.requiredVars],
          onEmpty: p.onEmpty,
        },
      });
      created += 1;
      keys.push(p.key);
      continue;
    }

    // الوصف يملكه الكود — يُحدَّث بصمت. النصّ (`body`) لا يُمسّ.
    const stale =
      existing.title !== p.title ||
      existing.surface !== p.surface ||
      existing.onEmpty !== p.onEmpty ||
      existing.provider !== p.provider ||
      existing.app !== p.app;

    if (stale) {
      await db.aiPrompt.update({
        where: { key: p.key },
        data: { app: p.app, provider: p.provider, title: p.title, surface: p.surface, onEmpty: p.onEmpty },
      });
      metaUpdated += 1;
    } else {
      untouched += 1;
    }
  }

  return { created, metaUpdated, untouched, keys };
}
