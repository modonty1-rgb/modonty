import "server-only";

import type { ChatMessage, DocumentForChat } from "./cohere-client";

/**
 * مودو يكتب جوابه بـClaude Haiku (خالد ١٥ أكتوبر ٢٠٢٦: «بدل ما أكون معتمد على APIs ما هي ثابتة») —
 * نفس مفتاح رادار المحتوى. البحث في المقالات (embed · rerank) يبقى على Cohere: Claude لا يقدّم
 * embeddings، وتغييرها يعني إعادة تضمين كل المقالات.
 *
 * `MODO_CHAT_PROVIDER=cohere` يعيد الجواب لـCohere بلا نشر كود؛ وغياب المفتاح يفعل الشيء نفسه.
 */
export const CLAUDE_CHAT_MODEL = "claude-haiku-4-5-20251001";

/** ثلاث فقرات عربية (حدّ مودو) أقلّ من ٧٠٠ توكن — السقف يمنع جواباً طويلاً يُدفع ثمنه بلا قارئ. */
const MAX_TOKENS = 1024;

/** أقلّ من `maxDuration = 60` للمسار — يبقى وقتٌ لإطار «done» وبطاقة الشريك. */
const TIMEOUT_MS = 45_000;

/**
 * نافذة مودو تعرض النصّ كما هو — Claude يكتب Markdown من نفسه، فظهرت `**الفيمتو ليزك**` بنجومها
 * للقارئ (مقيس حيّاً ١٥ أكتوبر ٢٠٢٦: ثلاث مواضع في جوابٍ واحد). Command R لم يكن يفعلها.
 */
const PLAIN_TEXT_RULE =
  "\n\nالتنسيق: نصٌّ عادي بفقرات فقط. ممنوع أي رمز Markdown — لا ** ولا __ ولا # ولا جداول ولا قوائم بنجوم أو شرطات.";

export function isClaudeEnabled(): boolean {
  return process.env.MODO_CHAT_PROVIDER !== "cohere" && !!process.env.ANTHROPIC_API_KEY;
}

/**
 * رسائل مودو بصيغة Claude: رسالة النظام حقلٌ مستقل، والمستندات تُلحق بها بعنوان «المستندات المرفقة»
 * (القواعد تقول «أجب فقط من المستندات المرفقة»)، والمحادثة تبدأ بالقارئ وتتناوب — Claude يرفض غير ذلك.
 */
export function buildClaudeBody(messages: ChatMessage[], documents: DocumentForChat[] | undefined, stream: boolean) {
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const docs = documents?.length
    ? "\n\nالمستندات المرفقة:\n" + documents.map((d, i) => `<document index="${i + 1}">\n${d.text}\n</document>`).join("\n")
    : "";

  const turns: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of messages) {
    if (m.role === "system") continue;
    const last = turns[turns.length - 1];
    if (last && last.role === m.role) last.content += `\n\n${m.content}`;
    else turns.push({ role: m.role, content: m.content });
  }
  while (turns[0]?.role === "assistant") turns.shift();

  return {
    model: CLAUDE_CHAT_MODEL,
    max_tokens: MAX_TOKENS,
    temperature: 0.3,
    system: system + PLAIN_TEXT_RULE + docs,
    messages: turns,
    ...(stream && { stream: true }),
  };
}

export async function claudeFetch(body: ReturnType<typeof buildClaudeBody>): Promise<Response> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res;
}
