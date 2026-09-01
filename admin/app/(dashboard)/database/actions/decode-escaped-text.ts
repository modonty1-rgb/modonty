"use server";

import { db } from "@modonty/shared/lib/db";

/**
 * فكّ كيانات HTML المخزّنة في نصوص يكتبها مستخدم — أسئلة العملاء والمقالات والتعليقات.
 *
 * ── ما الذي كسر (مقيس على الإنتاج ٣١ أغسطس ٢٠٢٦) ─────────────────────────
 * خمس دوالّ `sanitize` كانت تهرّب `& < > " '` **قبل التخزين**. والحقول تُعرض
 * `{faq.question}` داخل JSX ورياكت يهرّب تلقائياً، فالنتيجة هروبٌ مرّتين. والأسوأ أن
 * `&` نفسه كان يُهرَّب، فكل حفظ يبني على السابق:
 *
 *     &quot;  ←  &amp;quot;  ←  &amp;amp;quot;  ←  …
 *
 * قِيس: ١٨ صفّاً مصابة، إحداها بسبع طبقات، والزائر يرى الحرف الخام بدل علامة تنصيص.
 * أُصلح المصدر بـ`shared/lib/strip-html-tags.ts` (حذف الوسم لا هروبه)، وهذه الخطوة
 * تنظّف ما كُتب قبل ذلك.
 *
 * الفكّ **متكرّر حتى الثبات** لأن الطبقات متداخلة: فكّة واحدة تترك `&amp;quot;` كما هي.
 * وسقفٌ عند عشر دورات يمنع أي دوران على مدخل غريب.
 *
 * ⚠️ لا تمسّ `FAQ` (مجموعة `faqs` العامّة): حقل `answer` فيها موسوم في السكيما
 * «can be HTML/rich text» ويُحقن بـ`dangerouslySetInnerHTML` في `/help/faq` —
 * فكّ كياناته يحوّل نصّاً معروضاً إلى وسمٍ ينفَّذ.
 */

const ENTITY = /&(amp|lt|gt|quot|#x27|#x2F|#39);/i;

function decodeOnce(s: string): string {
  return s
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&amp;/gi, "&");
}

/** يفكّ حتى يثبت النصّ — الطبقات متداخلة، والسقف يمنع الدوران. */
function decodeFully(s: string): string {
  let cur = s;
  for (let i = 0; i < 10; i++) {
    const next = decodeOnce(cur);
    if (next === cur) return cur;
    cur = next;
  }
  return cur;
}

type Target = { model: "clientFAQ" | "articleFAQ" | "comment"; fields: string[] };

const TARGETS: Target[] = [
  { model: "clientFAQ", fields: ["question", "answer"] },
  { model: "articleFAQ", fields: ["question", "answer"] },
  { model: "comment", fields: ["content"] },
];

export async function decodeEscapedText(): Promise<{
  scanned: number;
  fixed: number;
  byModel: Record<string, number>;
  maxLayers: number;
}> {
  let scanned = 0;
  let fixed = 0;
  let maxLayers = 0;
  const byModel: Record<string, number> = {};

  for (const { model, fields } of TARGETS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = (db as any)[model];
    if (!table) continue;

    const rows = await table.findMany({
      where: { OR: fields.map((f) => ({ [f]: { contains: "&" } })) },
      select: fields.reduce((a, f) => ({ ...a, [f]: true }), { id: true }),
      take: 2000,
    });

    for (const row of rows) {
      scanned += 1;
      const patch: Record<string, string> = {};
      for (const f of fields) {
        const v = row[f];
        if (typeof v !== "string" || !ENTITY.test(v)) continue;
        const clean = decodeFully(v);
        if (clean !== v) {
          patch[f] = clean;
          // عدّ الطبقات: كم فكّة لزمت حتى الثبات
          let layers = 0;
          let cur = v;
          while (layers < 10) {
            const nxt = decodeOnce(cur);
            if (nxt === cur) break;
            cur = nxt;
            layers += 1;
          }
          if (layers > maxLayers) maxLayers = layers;
        }
      }
      if (Object.keys(patch).length > 0) {
        await table.update({ where: { id: row.id }, data: patch });
        fixed += 1;
        byModel[model] = (byModel[model] ?? 0) + 1;
      }
    }
  }

  return { scanned, fixed, byModel, maxLayers };
}
