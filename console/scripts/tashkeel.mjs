/**
 * Tashkeel CLI — adds full Arabic diacritics via Gemini 2.5 Flash.
 *
 * Preserves: English words, Latin/Arabic-Indic numbers, punctuation, structure.
 * Brand: forces مُدَوَّنَتِي spelling for our brand name.
 *
 * Usage:
 *   # Inline string
 *   node scripts/tashkeel.mjs "حياك الله في مدونتي"
 *
 *   # From file
 *   node scripts/tashkeel.mjs --file path/to/plain.txt
 *
 *   # From stdin (pipe)
 *   echo "النص الخام" | node scripts/tashkeel.mjs
 *
 *   # Save to file
 *   node scripts/tashkeel.mjs --file plain.txt --out tashkeeled.txt
 *
 *   # Quiet mode (only the tashkeeled text, no logs) — for piping
 *   node scripts/tashkeel.mjs --quiet "نص"
 *
 * Requires: GEMINI_API_KEY in console/.env.local
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONSOLE_ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(CONSOLE_ROOT, ".env.local");

const MODEL = "gemini-2.5-flash";
const API_URL = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

const SYSTEM_PROMPT = `أنت خبير لغة عربية سعودي متخصص في تشكيل النصوص الصوتية للهجة السعودية والمصرية، مع الحفاظ على الفصحى حين تكون مكتوبة فصحى.

مهمتك: إضافة التشكيل الصوتي الكامل (الفتحة، الضمة، الكسرة، السكون، الشدة، التنوين) لكل حرف عربي في النص، **بطريقة تنطق صح في محرك ElevenLabs TTS**.

قواعد صارمة لا يجوز كسرها:

1. **لا تغيّر أي كلمة عربية** — أعدها كما هي بنفس الأحرف، مع إضافة التشكيل فقط. ممنوع حذف أو إضافة حرف.
2. **لا تحذف أي كلمة، ولا تضف كلمة جديدة.**
3. **احتفظ بالكلمات العامية السعودية/المصرية بنطقها العامي** — لا تحوّلها لفصحى. أمثلة:
   - "تقول" → "تِقُول" (وليس تَقُولُ)
   - "تجيب" → "تِجِيب" (وليس تَجِيبُ)
   - "تيجي" → "تِيجِي"
   - "بزنسك" → "بـِزْنِسَكَ"
   - "حد" → "حَدّ" (بدون تنوين — تعني "أحد" بالعامي)
   - "يختفي" → "يِخْتَفِي" (في السياق العامي)
   - "خليني" → "خَلِّنِي"
   - "إيش" → "إِيشْ"
   - "بكره" → "بُكْرَة"
4. **الكلمات الإنجليزية تبقى كما هي بدون أي تعديل** — مثل: SEO, Schema, Presentation, JSON-LD, Core Web Vitals, Semrush.
5. **الأرقام تبقى كما هي** — سواء لاتينية (1000, 12, 2030) أو هندية (١٢٣٤).
6. **علامات الترقيم تبقى كما هي** — النقط، الفواصل، علامات الاستفهام والتعجب، النقطتين، الشرطات.
7. **اسم العلامة التجارية "مُدَوَّنَتِي"** يجب أن تظهر دائماً بهذا التشكيل بالضبط (مُدَوَّنَتِي) — حتى لو كانت مكتوبة "مدونتي" في النص الخام.
8. **التشكيل النحوي الكامل** للكلمات الفصحى — كل حرف عربي يحصل على حركته الصحيحة حسب موقعه الإعرابي.
9. **اترك الأسماء الممنوعة من الصرف** بتشكيلها الصحيح (مثل: مَكَّةَ المُكَرَّمَةِ، جِدَّةَ، القَاهِرَةَ، إِنْسْتَجْرَام).
10. **الجمل الفلسفية أو الدينية** بفصحى كاملة مشكّلة بتشكيل نحوي إعرابي.

**الفلسفة العامة:** اقرأ كل جملة في ذهنك بصوت سعودي، وضع التشكيل اللي يطابق النطق الطبيعي للمتحدث. لا تجبر فصحى على لهجة عامية.

أعد النص المُشكَّل فقط، بدون أي شرح، بدون أي تعليق، بدون أي مقدمة أو خاتمة.`;

async function loadEnv() {
  const text = await fs.readFile(ENV_PATH, "utf-8");
  const env = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

async function readStdin() {
  if (process.stdin.isTTY) return "";
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data;
}

function parseArgs(argv) {
  const args = { file: null, out: null, quiet: false, text: null };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--file") args.file = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--quiet" || a === "-q") args.quiet = true;
    else rest.push(a);
  }
  if (rest.length > 0) args.text = rest.join(" ");
  return args;
}

async function tashkeel(text, apiKey) {
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        parts: [{ text: `النص الخام للتشكيل:\n\n${text}` }],
      },
    ],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 8000,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  const res = await fetch(API_URL(apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err.slice(0, 400)}`);
  }

  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) {
    throw new Error(`Empty reply. Full response: ${JSON.stringify(data).slice(0, 400)}`);
  }
  return {
    text: reply.trim(),
    tokens: data.usageMetadata ?? {},
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const log = args.quiet ? () => {} : (...a) => console.error(...a);

  let inputText = args.text;
  if (!inputText && args.file) {
    inputText = await fs.readFile(args.file, "utf-8");
  }
  if (!inputText) {
    inputText = await readStdin();
  }
  inputText = inputText.trim();

  if (!inputText) {
    console.error("❌ No input. Provide text via arg, --file, or stdin.");
    console.error('   Example: node scripts/tashkeel.mjs "حياك الله"');
    process.exit(1);
  }

  const env = await loadEnv();
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ Missing GEMINI_API_KEY in console/.env.local");
    process.exit(1);
  }

  log(`🔤 Tashkeel via ${MODEL} — ${inputText.length} chars in...`);
  const t0 = Date.now();
  const { text, tokens } = await tashkeel(inputText, apiKey);
  const ms = Date.now() - t0;

  log(`✅ Done in ${ms}ms — ${text.length} chars out`);
  log(`📊 Tokens — in: ${tokens.promptTokenCount}, out: ${tokens.candidatesTokenCount}, total: ${tokens.totalTokenCount}`);

  if (args.out) {
    await fs.writeFile(args.out, text);
    log(`💾 Saved → ${args.out}`);
  } else {
    process.stdout.write(text + "\n");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("❌", err.message);
    process.exit(1);
  });
}

export { tashkeel, loadEnv };
