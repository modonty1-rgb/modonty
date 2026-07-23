import "server-only";

// Gemini → alt text + description for one gallery image, written PURELY from the owning
// client's data — the image itself is NOT analysed (the doctor uploads case photos; pixel
// analysis reads generic/wrong, the client's field/city/services are what matter). Same REST
// shape proven in this repo's working Gemini scripts. Key = GEMINI_API_KEY (.env.shared).

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export type ImageSeoField = "altText" | "description";

export interface ImageSeoAiContext {
  clientName?: string | null;
  industry?: string | null;
  city?: string | null;
  businessBrief?: string | null;
  targetAudience?: string | null;
  services?: string[];
  keywords?: string[];
  /** 1-based position in the gallery — used to push distinct angles across images. */
  galleryIndex?: number | null;
  /** When the image belongs to an article, its text is the PRIMARY source for alt/description. */
  article?: { title?: string | null; excerpt?: string | null; body?: string | null } | null;
}

export async function generateImageSeoField(
  ctx: ImageSeoAiContext,
  field: ImageSeoField,
): Promise<string> {
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

  const spec =
    field === "altText"
      ? "نص بديل (alt) من 5 إلى 125 حرفاً، وصفي مختصر يربط الصورة بمجال العميل ومدينته."
      : "وصف (description) من 50 إلى 160 حرفاً، أعمق قليلاً من النص البديل.";

  // Article-owned image → the article's topic is the PRIMARY source (Khalid 2026-07-23).
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

    prompt = `أنت كاتب محتوى سعودي محترف متخصص في سيو الصور. الصورة التالية تخص المقال أدناه — اكتب نصاً يعكس موضوع المقال نفسه.
مهم: لا تحلّل الصورة نفسها؛ استند لموضوع المقال.

بيانات المقال:
${aLines.join("\n")}

لا تخترع تفاصيل غير مؤكدة (أرقام، أسماء، جوائز). اكتب بلهجة سعودية خليجية طبيعية وواضحة.

اكتب: ${spec}
أعِد النتيجة بصيغة JSON فقط: { "text": "..." }`;
  } else {
    prompt = `أنت كاتب محتوى سعودي محترف متخصص في سيو الصور. هذه صورة من معرض أعمال العميل التالي.
مهم: لا تحلّل الصورة نفسها — اكتب بناءً على بيانات العميل أدناه فقط.

بيانات العميل:
${lines.join("\n") || "(لا تتوفر بيانات كافية)"}

${indexNote}
لا تخترع تفاصيل غير مؤكدة (أجهزة محددة، جوائز، أرقام، أسماء). اكتب بلهجة سعودية خليجية طبيعية وواضحة.

اكتب: ${spec}
أعِد النتيجة بصيغة JSON فقط: { "text": "..." }`;
  }

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: { text: { type: "STRING" } },
        required: ["text"],
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

  let parsed: { text?: string };
  try {
    parsed = JSON.parse(raw) as { text?: string };
  } catch {
    throw new Error("رد Gemini ليس JSON صالحاً");
  }

  const max = field === "altText" ? 125 : 160;
  return (parsed.text || "").trim().slice(0, max);
}
