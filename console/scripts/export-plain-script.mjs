/**
 * Strips Arabic tashkeel from script.md and writes a clean copy to:
 *   voice-script/script-plain.md
 *
 * Use this whenever you want to:
 *   1. Send the script to ChatGPT/Claude for retashkeeling
 *   2. Read/edit the text without diacritics getting in the way
 *
 * Run: node scripts/export-plain-script.mjs
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONSOLE_ROOT = path.resolve(__dirname, "..");
const SRC = path.join(CONSOLE_ROOT, "app", "help", "console", "voice-script", "script.md");
const OUT = path.join(CONSOLE_ROOT, "app", "help", "console", "voice-script", "script-plain.md");

const TASHKEEL_REGEX = /[\u064B-\u0652\u0670\u0656-\u065F]/g;

async function main() {
  const md = await fs.readFile(SRC, "utf-8");
  const plain = md.replace(TASHKEEL_REGEX, "");

  // Embed a ready-to-use Claude prompt at the top so the user can copy
  // the WHOLE file → paste into Claude → get back the tashkeeled version directly.
  const header = `# 📋 تعليمات للذكاء الاصطناعي (Claude / ChatGPT / Gemini)

أنت خبير لغوي عربي. مهمّتك: **تشكيل النص العربي الموجود تحت** بشكل احترافي ودقيق، عشان يُقرأ بواسطة Azure Neural Text-to-Speech بصوت سعودي طبيعي (\`ar-SA-HamedNeural\`).

## شروط التشكيل (مهمّة جداً):

1. **اللهجة:** عاميّة سعودية/مصرية طبيعية — **مش فصحى**. حافظ على روح الكلام الكاجوال.
2. **التشكيل الكامل:** كل كلمة لازم يكون عليها تشكيل (فَتْحَة، ضَمَّة، كَسْرَة، شَدَّة، سُكُون، تَنْوِين) — بدون استثناء.
3. **الكلمات الإنجليزية والبرند:** شكّلها كما تُنطق بالعربية. مثلاً:
   - **مدونتي** → مَدَوَّنَتِي
   - **كونسول** → كُونْسُول
   - **تليجرام** → تِلِيجْرَام
   - **واتساب** → وَاتْسَآبْ
   - **إنستجرام** → إِنْسْتَجْرَام
   - **يوتيوب** → يُوتْيُوب
   - **تيك توك** → تِيك تُوك
   - **لينكدإن** → لِينْكِدْإِن
   - **فيسبوك** → فِيسْبُوك
   - **إكس** → إِكْس
   - **سيو** → سِيُو
   - **إيميل** → إِيمِيل
   - **جوجل** → جُوجِل
4. **البنية:** أبقِ نفس البنية بالظبط — كل \`## [N. ...]\` و \`---\` يبقى مكانه.
5. **الخرج:** أرجع **فقط النص المشكّل بنفس البنية**، بدون أي تعليق إضافي، بدون مقدّمة، بدون شرح.

---

# 📝 النص المطلوب تشكيله:

`;

  await fs.writeFile(OUT, header + plain);
  console.log(`✅ Plain script exported → ${OUT}`);
  console.log(`   ${plain.length} chars, ${plain.split(/\s+/).filter(Boolean).length} words`);
}

main().catch((e) => { console.error(e); process.exit(1); });
