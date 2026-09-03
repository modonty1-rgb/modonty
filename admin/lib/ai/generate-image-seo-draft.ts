import "server-only";

import { resolveAdminPrompt } from "./resolve-admin-prompt";
import type { ImageSeoAiContext } from "./gemini-image-seo";

/**
 * Gemini → BOTH SEO texts for one image in a SINGLE call.
 *
 * Separate from `generateImageSeoField`, deliberately (Khalid 2026-09-03: «اعمل دالة
 * مستقلة… اللي شغال سليم خليه زي ما هو»). That one backs the per-image button in the
 * SEO Images dialog and works; this one backs the per-client batch, where calling it
 * twice per image would double both the bill and the wall-clock for 25 images.
 *
 * The pair also has to agree with itself. Two independent calls can describe the same
 * picture from two different angles — a reception hall in the alt and a treatment room
 * in the description — and nothing downstream would catch it. One call, one context.
 *
 * Same source of truth as the single-field generator: the texts are written from the
 * owning client's DATA (field · city · services), never from analysing the pixels.
 * And the prompts stay the two rows Khalid edits from the admin — no new prompt key,
 * because `resolveAdminPrompt` accepts four and a fifth would have no row to read.
 */

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/** Google truncates past these, and `computeMediaSeoScore` grades against them. */
const ALT_MAX = 125;
const DESC_MAX = 160;

/**
 * What we ASK the model to aim for — not a cap.
 *
 * The hard 125 in `alt-to-filename.ts` stays untouched: that number is shared with
 * `sanitizeBunnyBase`, and its own comment warns that raising or lowering one without
 * the other makes the preview promise a name the file will not get. It also documents
 * why cutting is the worse failure — a name WE truncate loses those words for good.
 *
 * So the fix is upstream. The first run wrote 90+ character alts, and since the file
 * name is `altToFileBase(alt)` verbatim, the URL inherited every one of them:
 *   مختبرات-الأطباء-بالقاهرة-خدمة-عملاء-مميزة-ونتائج-تحاليل-طبية-سريعة-لزوار-القاهرة-من-السعودية-والخليج
 * Asking for a shorter sentence produces a shorter name with nothing truncated, and
 * still scores the full 50: `computeMediaSeoScore` gives it to any alt within 5–125.
 */
const ALT_TARGET_MIN = 40;
const ALT_TARGET_MAX = 80;

export interface ImageSeoDraft {
  altText: string;
  description: string;
}

/**
 * The alt texts the client's OTHER images already carry.
 *
 * Without them the model writes every image blind, and since all its material is the
 * same client record it lands on near-identical sentences — which collapse into the
 * SAME file name, because the name is `altToFileBase(alt)` and nothing else.
 *
 * That is not a hypothetical: measured on production 2026-09-03, from human-written
 * alt text alone, 12 of 29 clients already carry colliding names — 21 names over 52
 * rows, none of which can be renamed until a person separates them. A generator that
 * cannot see its siblings would only add to that pile.
 *
 * Prevention, not repair: telling the model what is taken is one call, while catching
 * the clash afterwards costs a second call AND leaves the first draft stored.
 */
export interface DraftSiblings {
  /** Existing alt texts for the same owner — the model must not restate these. */
  takenAlts: string[];
}

export async function generateImageSeoDraft(
  ctx: ImageSeoAiContext,
  siblings?: DraftSiblings,
): Promise<ImageSeoDraft> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY غير موجود في البيئة");

  const lines = [
    ctx.clientName && `- الاسم: ${ctx.clientName}`,
    ctx.industry && `- المجال: ${ctx.industry}`,
    ctx.city && `- المدينة: ${ctx.city}`,
    ctx.businessBrief && `- النشاط: ${ctx.businessBrief}`,
    ctx.targetAudience && `- الجمهور المستهدف: ${ctx.targetAudience}`,
    ctx.services?.length && `- الخدمات: ${ctx.services.join("، ")}`,
    ctx.keywords?.length && `- كلمات مفتاحية: ${ctx.keywords.join("، ")}`,
  ].filter(Boolean);

  const indexNote =
    typeof ctx.galleryIndex === "number" && ctx.galleryIndex > 0
      ? `هذه الصورة رقم ${ctx.galleryIndex} في المعرض — اجعلها بزاوية أو خدمة مختلفة عن بقية الصور حتى لا تتكرر النصوص.`
      : "نوّع الزاوية حتى لا تتشابه نصوص صور المعرض.";

  // One `spec` describing both fields, injected into the SAME prompt rows the
  // single-field generator uses. The instruction that they must not repeat each other
  // is the reason for asking for them together rather than twice.
  // The taken list is capped and trimmed: it is a "do not repeat" list, and a hundred
  // long sentences would crowd out the client's own data in the same prompt.
  const taken = (siblings?.takenAlts ?? [])
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .slice(0, 40);

  const spec = [
    "اكتب حقلين للصورة نفسها:",
    `1) altText — نص بديل من ${ALT_TARGET_MIN} إلى ${ALT_TARGET_MAX} حرفاً. جملة واحدة قصيرة`,
    "   تصف الصورة وتربطها بمجال العميل ومدينته. اسم ملف الصورة يُشتقّ من هذا النص حرفياً،",
    "   فالجملة الطويلة تُنتج رابطاً طويلاً غير مقروء. بلا حشو تسويقي ولا تعداد خدمات.",
    `2) description — وصف من 50 إلى ${DESC_MAX} حرفاً، أعمق قليلاً من النص البديل.`,
    "لا تكرر النص البديل داخل الوصف — الوصف يضيف زاوية أو تفصيلاً جديداً.",
    ...(taken.length
      ? [
          "",
          "النصوص التالية مستعملة بالفعل لصور أخرى لنفس العميل — اكتب نصاً مختلفاً عنها كلها،",
          "لا مرادفاً ولا إعادة صياغة، بل زاوية أو خدمة أو تفصيلاً آخر:",
          ...taken.map((t) => `- ${t}`),
        ]
      : []),
  ].join("\n");

  const art = ctx.article;
  const hasArticle = !!(art && (art.title || art.excerpt || art.body));

  let prompt: string;
  if (hasArticle) {
    const aLines = [
      art!.title && `- عنوان المقال: ${art!.title}`,
      art!.excerpt && `- المقتطف: ${art!.excerpt}`,
      art!.body && `- من محتوى المقال: ${art!.body.slice(0, 1200)}`,
      ctx.clientName && `- الناشر: ${ctx.clientName}${ctx.city ? ` — ${ctx.city}` : ""}`,
    ].filter(Boolean);

    prompt = await resolveAdminPrompt("admin.image.article", {
      articleLines: aLines.join("\n"),
      spec,
    });
  } else {
    prompt = await resolveAdminPrompt("admin.image.gallery", {
      clientLines: lines.join("\n") || "(لا تتوفر بيانات كافية)",
      indexNote,
      spec,
    });
  }

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
      // Both fields REQUIRED: a draft with one half missing would save a half-written
      // row and clear nothing, and the caller could not tell it apart from a good one.
      responseSchema: {
        type: "OBJECT",
        properties: {
          altText: { type: "STRING" },
          description: { type: "STRING" },
        },
        required: ["altText", "description"],
      },
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Gemini ${resp.status}: ${errText.slice(0, 200)}`);
  }

  const data = await resp.json();
  const raw: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("لم يرجع Gemini أي نص");

  let parsed: { altText?: string; description?: string };
  try {
    parsed = JSON.parse(raw) as { altText?: string; description?: string };
  } catch {
    throw new Error("رد Gemini ليس JSON صالحاً");
  }

  const altText = (parsed.altText || "").trim().slice(0, ALT_MAX);
  const description = (parsed.description || "").trim().slice(0, DESC_MAX);

  // An empty alt is not a usable draft: `altToFileBase` returns null for it, so the
  // image could never be named, and the 🤖 badge would sit on a row with nothing to
  // review. Fail loudly here rather than store a blank and call it done.
  if (!altText) throw new Error("رد Gemini بلا نص بديل");

  return { altText, description };
}
