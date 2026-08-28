"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { PROMPT_DEFAULTS } from "@modonty/shared/lib/ai/prompt-defaults";
import { missingRequiredVars } from "@modonty/shared/lib/ai/get-ai-prompt";

/**
 * برومبتات مودو — قراءة وحفظ.
 *
 * الشاشة تعرض **الحالة الفعلية** لا الأمنية: كل بطاقة تقول «من القاعدة» أو «من الكود»،
 * لأن الاحتياط بلا وسمٍ يصير غطاءً صامتاً — تعدّل صفّاً معطَّلاً وتظنّ التغيير وصل.
 */

export interface PromptRow {
  key: string;
  title: string;
  surface: string;
  provider: string;
  requiredVars: string[];
  onEmpty: string;
  /** النصّ المعروض — من القاعدة إن وُجد ونشط، وإلا نصّ الكود. */
  body: string;
  source: "db" | "code";
  isActive: boolean;
  updatedAt: string | null;
  /** نصّ الكود دائماً — لعرض «ارجع للأصل» ومقارنة ما تغيّر. */
  codeBody: string;
}

/** برومبتات تطبيق واحد، مرتّبةً كترتيبها في الكود لا كترتيب الإدخال. */
export async function getPromptsForApp(app: "modonty" | "admin"): Promise<PromptRow[]> {
  const defaults = PROMPT_DEFAULTS.filter((p) => p.app === app);
  const rows = await db.aiPrompt.findMany({
    where: { key: { in: defaults.map((d) => d.key) } },
    select: { key: true, body: true, isActive: true, requiredVars: true, updatedAt: true },
  });
  const byKey = new Map(rows.map((r) => [r.key, r]));

  return defaults.map((d) => {
    const row = byKey.get(d.key);
    const live = row?.isActive && row.body.trim() ? row : null;
    return {
      key: d.key,
      title: d.title,
      surface: d.surface,
      provider: d.provider,
      requiredVars: [...d.requiredVars],
      onEmpty: d.onEmpty,
      body: live ? live.body : d.body,
      source: live ? "db" : "code",
      isActive: row ? row.isActive : false,
      updatedAt: row?.updatedAt.toISOString() ?? null,
      codeBody: d.body,
    };
  });
}

export interface SavePromptResult {
  ok: boolean;
  error?: string;
  /** أسماء المتغيّرات الناقصة — تُسمّى في الرسالة كي لا يخمّن المحرّر أين العطل. */
  missing?: string[];
}

/**
 * الحفظ يمرّ ببوّابتين قبل الكتابة:
 *  ١ · نصّ فارغ مرفوض — الفراغ يُسقط البرومبت إلى نصّ الكود بلا أن يعرف أحد.
 *  ٢ · متغيّر إلزامي ناقص مرفوض، **والرسالة تسمّيه**. حذفُ `{categoryName}` بالغلط
 *      يفقد البرومبت سياقه بصمت، ولا يظهر إلا في جواب رديء للزائر بعد أسبوع.
 */
export async function saveAiPrompt(key: string, body: string): Promise<SavePromptResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "غير مصرّح — سجّل الدخول." };

  const def = PROMPT_DEFAULTS.find((p) => p.key === key);
  if (!def) return { ok: false, error: `مفتاح غير معروف: ${key}` };

  const text = body.trim();
  if (!text) {
    return { ok: false, error: "النصّ فارغ. البرومبت الفارغ يُسقط المساعد إلى نصّ الكود بلا إشعار — احذف السطر من الشاشة إن أردت التعطيل." };
  }

  const missing = missingRequiredVars(text, def.requiredVars);
  if (missing.length) {
    return {
      ok: false,
      missing,
      error: `المتغيّرات الإلزامية ناقصة: ${missing.map((m) => `{${m}}`).join(" · ")}. بدونها يفقد البرومبت سياقه ويجيب عن الموضوع عموماً.`,
    };
  }

  await db.aiPrompt.upsert({
    where: { key },
    update: { body: text, isActive: true, updatedById: session.user.id, requiredVars: [...def.requiredVars] },
    create: {
      key,
      app: def.app,
      provider: def.provider,
      title: def.title,
      surface: def.surface,
      onEmpty: def.onEmpty,
      body: text,
      requiredVars: [...def.requiredVars],
      updatedById: session.user.id,
    },
  });

  revalidatePath("/modonty/modo");
  // مودو يقرأ من مدونتي — الكاش هناك يجب أن يسقط، وإلا بقي الزائر على النصّ القديم.
  try { await revalidateModontyTag("ai-prompts"); } catch { /* الحفظ نجح؛ التفريغ يُعاد بالمحاولة */ }
  return { ok: true };
}

/** إرجاع البرومبت إلى نصّ الكود — مخرجٌ آمنٌ بعد تعديلٍ أفسد الجواب. */
export async function resetAiPromptToCode(key: string): Promise<SavePromptResult> {
  const def = PROMPT_DEFAULTS.find((p) => p.key === key);
  if (!def) return { ok: false, error: `مفتاح غير معروف: ${key}` };
  return saveAiPrompt(key, def.body);
}
