import "server-only";
import { promptDefault } from "./prompt-defaults";

/**
 * قراءة برومبت بمفتاحه — الباب الوحيد بين الكود والنصّ.
 *
 * الكود لا يعرف النصّ إطلاقاً: ينادي `getAiPrompt("modo.identity")` ويأخذ ما يرجع.
 * فتعديل شخصية مودو أو نبرة كاتب السيو صار تعديلاً في شاشة الأدمن، بلا نشر.
 *
 * **لماذا لا تكلّف الزائر شيئاً:** تُقرأ مرّة على السيرفر قبل نداء النموذج، والنداء
 * أصلاً يضرب القاعدة (يجيب المقال والتصنيف) ثم ينتظر النموذج مئات الملّي ثانية —
 * فقراءةُ صفٍّ واحد تضيع في الضجيج. وهذا الفرق بينها وبين لغة التنسيق (`SITE_LOCALE`)
 * التي تُنادى وسط الرسم في ٥٦ ملفاً، فبقيت ثابتاً في الكود.
 *
 * **الاحتياط (خالد، ٢٨ أغسطس):** الصفّ الغائب أو المعطَّل يرجع إلى نصّ الكود —
 * وهو ما يعمل على الإنتاج اليوم، لا حشوٌ مخترع. و`source` يقول أيّهما جاء، كي تعرض
 * شاشة الأدمن «من القاعدة» أو «من الكود» بدل أن يصير الاحتياط غطاءً صامتاً.
 *
 * لا `"use cache"` هنا عمداً: هذه المكتبة يستهلكها الأدمن ومدونتي معاً، وتوجيهات كاش
 * Next تخصّ التطبيق. كل تطبيق يلفّها بكاشه ووسمه (`ai-prompts`)، ويُفرَّغ عند الحفظ.
 */

export interface ResolvedPrompt {
  key: string;
  body: string;
  source: "db" | "code";
  requiredVars: string[];
  /** آخر تعديل في القاعدة — `null` حين يأتي النصّ من الكود. */
  updatedAt: Date | null;
}

/** أقلّ ما نحتاجه من عميل بريزما — فلا ترتبط المكتبة المشتركة بنسخة عميلٍ بعينها. */
export interface AiPromptReader {
  aiPrompt: {
    findUnique(args: {
      where: { key: string };
      select: { body: true; isActive: true; requiredVars: true; updatedAt: true };
    }): Promise<{ body: string; isActive: boolean; requiredVars: string[]; updatedAt: Date } | null>;
  };
}

export async function getAiPrompt(db: AiPromptReader, key: string): Promise<ResolvedPrompt> {
  const fallback = promptDefault(key); // يرمي على مفتاحٍ غير معروف — عطلُ برمجة لا حالةُ تشغيل

  let row = null;
  try {
    row = await db.aiPrompt.findUnique({
      where: { key },
      select: { body: true, isActive: true, requiredVars: true, updatedAt: true },
    });
  } catch {
    // القاعدة ساقطة أو الجدول لم يُنشأ بعد — الاحتياط هو سبب وجوده.
    row = null;
  }

  if (row?.isActive && row.body.trim()) {
    return {
      key,
      body: row.body,
      source: "db",
      requiredVars: row.requiredVars.length ? row.requiredVars : fallback.requiredVars,
      updatedAt: row.updatedAt,
    };
  }

  return { key, body: fallback.body, source: "code", requiredVars: fallback.requiredVars, updatedAt: null };
}

/**
 * استبدال `{name}` بقيمته. القيمة الغائبة تصير سلسلة فارغة **ويُبلَّغ عنها** في `missing`
 * — لأن متغيّراً ضائعاً يخرج للنموذج كنصٍّ ناقص لا كخطأ، فلا يُرى إلا في جواب رديء.
 *
 * لا تقييم ولا قالب: نصّ محرَّر من الأدمن لا يُنفَّذ أبداً، مهما كُتب فيه.
 */
export function renderPrompt(
  body: string,
  vars: Record<string, string | number | null | undefined>,
): { text: string; missing: string[] } {
  const missing: string[] = [];
  const text = body.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (_m, name: string) => {
    const v = vars[name];
    if (v === undefined || v === null) { missing.push(name); return ""; }
    return String(v);
  });
  return { text, missing };
}

/**
 * بوّابة الحفظ: هل يحمل النصّ كل متغيّراته الإلزامية؟
 * تُنادى في شاشة الأدمن قبل الكتابة — وترجع الأسماء الناقصة كي تسمّيها الرسالة،
 * فلا يقرأ المحرّر «فيه خطأ» ويبقى يخمّن أين.
 */
export function missingRequiredVars(body: string, requiredVars: string[]): string[] {
  const present = new Set([...body.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map((m) => m[1]));
  return requiredVars.filter((v) => !present.has(v));
}
