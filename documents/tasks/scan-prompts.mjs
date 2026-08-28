/**
 * جرد برومبتات الذكاء الاصطناعي في المستودع — مدونتي · الأدمن · الكونسول · المشترك.
 *
 * خالد (٢٨ أغسطس ٢٠٢٦): «اعمل جرد كامل… عشان أنا أبغى أحولها كلها تقرأ من الداتابيز».
 *
 * السجلّ أدناه **مكتوب بيد ومقيس**، لا مستنتَج: البرومبت ليس نمطاً واحداً يُمسك بتعبير
 * نمطي — منه ما يُبنى في دالّة، ومنه ما يُركَّب داخل نداء المزوّد. لكن السكربت **يتحقّق**
 * من كل مدخل عند كل تشغيل: الملفّ موجود؟ السطر ما زال يحمل نصّه؟ الدالّة ما زالت تُستدعى؟
 * فإن انزاح سطر أو حُذف برومبت، يصرخ الجرد بدل أن يكذب بصمت.
 *
 * التشغيل:  node documents/tasks/scan-prompts.mjs
 * المخرَج:  documents/tasks/prompts-inventory.json  →  تبويب «🤖 البرومبت» في SEO.html
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "../..");

/**
 * كل مدخل يحمل ما يلزم لتحويله إلى صفّ في القاعدة:
 *  key          المفتاح المقترح في جدول `AiPrompt`
 *  anchor       نصّ يجب أن يظهر في الملفّ — به يُتحقَّق أن السطر لم ينزح
 *  vars         المتغيّرات التي **يجب** أن يحملها النصّ بعد النقل (العقد)
 *  entry        من يستدعيه فعلاً (نقطة الدخول)، لا الدالّة الوسيطة
 *  onEmpty      ماذا يحدث لو صار الصفّ فارغاً — يحدّد حارس ما قبل النداء
 */
const REGISTRY = [
  // ── مدونتي · مودو (Cohere) ────────────────────────────────────────────────
  {
    key: "modo.identity",
    app: "modonty",
    provider: "Cohere",
    surface: "مودو شات — سؤال عن نفسه",
    file: "modonty/app/(site)/modo-chat/helpers/build-identity-prompt.ts",
    fn: "buildIdentityPrompt",
    anchor: 'أنت "مودو"، مساعد منصّة',
    vars: ["BRAND_AR"],
    entry: [
      "modonty/app/(site)/modo-chat/api/chat/route.ts:324",
      "modonty/app/(site)/modo-chat/api/article/[slug]/route.ts:270",
    ],
    what: "التحيّة و«مين أنت؟» — لا مستندات خلفها، فلها برومبت ثالث خاصّ.",
    onEmpty: "مودو يجاوب كنموذج خام: يقول «أنا نموذج لغوي» ويخترع خدمات.",
  },
  {
    key: "modo.category",
    app: "modonty",
    provider: "Cohere",
    surface: "مودو شات — سؤال داخل تصنيف",
    file: "modonty/app/(site)/modo-chat/helpers/build-category-db-prompt.ts",
    fn: "buildCategoryDbPrompt",
    anchor: "مساعد متخصص حصراً في موضوع",
    vars: ["BRAND_AR", "categoryName"],
    entry: ["modonty/app/(site)/modo-chat/api/chat/route.ts:324"],
    what: "الوضع الصارم: يجيب من مقالات المنصّة وحدها، وبغيابها يقول الجملة المحدَّدة.",
    onEmpty: "تسقط قاعدة «لا معرفة خارجية» — مودو يجيب من معرفته العامّة كأنها محتوانا.",
  },
  {
    key: "modo.article",
    app: "modonty",
    provider: "Cohere",
    surface: "مودو شات — قارئ داخل مقال",
    file: "modonty/app/(site)/modo-chat/helpers/build-article-db-prompt.ts",
    fn: "buildArticleDbPrompt",
    anchor: "تساعد القارئ في فهم مقال",
    vars: ["BRAND_AR", "articleTitle", "categoryName"],
    entry: ["modonty/app/(site)/modo-chat/api/article/[slug]/route.ts:271"],
    what: "الإجابة من نصّ هذا المقال وحده — أضيق نطاقاً من برومبت التصنيف.",
    onEmpty: "يفقد ربطه بالمقال، فيجيب عن الموضوع عموماً لا عمّا يقرؤه الزائر أمامه.",
  },

  // ── الأدمن · توليد المقال (OpenAI) ────────────────────────────────────────
  {
    key: "admin.article.system",
    app: "admin",
    provider: "OpenAI",
    surface: "توليد مقال — رسالة النظام",
    file: "admin/lib/openai-article-generator.ts",
    fn: "generateComprehensiveArticleData",
    anchor: "You are a senior Arabic article editor",
    vars: [],
    entry: ["admin/app/(dashboard)/articles/actions/generate-article-ai.ts:3"],
    what: "يحدّد دور المحرّر ولغته ومعايير السيو. مكتوب بالإنجليزية.",
    onEmpty: "يختفي الدور والمعايير — المخرَج يفقد بنية العناوين وتكامل الكلمات المفتاحية.",
    note: "البرومبت الوحيد الإنجليزي في المستودع.",
  },
  {
    key: "admin.article.user",
    app: "admin",
    provider: "OpenAI",
    surface: "توليد مقال — رسالة الطلب",
    file: "admin/lib/openai-article-generator.ts",
    fn: "generateComprehensiveArticleData",
    anchor: "اكتب مقالاً احترافياً باللغة العربية",
    vars: ["keywords", "clientName", "categoryName", "length", "targetWordCount"],
    entry: ["admin/app/(dashboard)/articles/actions/generate-article-ai.ts:3"],
    what: "الطلب نفسه: الكلمات المفتاحية والعميل والتصنيف والطول المستهدف.",
    onEmpty: "لا طلب أصلاً — النداء يرجع محتوى بلا موضوع.",
  },

  // ── الأدمن · سيو الصور (Gemini) ───────────────────────────────────────────
  {
    key: "admin.image.article",
    app: "admin",
    provider: "Gemini",
    surface: "سيو صورة داخل مقال",
    file: "admin/lib/ai/gemini-image-seo.ts",
    fn: "generateImageSeoField",
    anchor: "الصورة التالية تخص المقال أدناه",
    vars: ["aLines", "spec"],
    entry: ["admin/app/(dashboard)/media/actions/generate-image-seo-ai.ts:5"],
    what: "نصّ بديل ووصف للصورة مستنداً إلى موضوع المقال لا إلى تحليل الصورة.",
    onEmpty: "يختفي قيد «لا تخترع تفاصيل» — نصوص بديلة فيها أرقام وجوائز موهومة تصل جوجل.",
  },
  {
    key: "admin.image.gallery",
    app: "admin",
    provider: "Gemini",
    surface: "سيو صورة في معرض الشريك",
    file: "admin/lib/ai/gemini-image-seo.ts",
    fn: "generateImageSeoField",
    anchor: "هذه صورة من معرض أعمال العميل",
    vars: ["lines", "indexNote", "spec"],
    entry: ["admin/app/(dashboard)/media/actions/generate-image-seo-ai.ts:5"],
    what: "نفس المهمّة لصور المعرض، مستندةً إلى بيانات العميل.",
    onEmpty: "نفس الخطر، وعلى صفحات الشركاء التي تُفهرس.",
  },
];

/** كود ميت مقيس — يُعرض كي لا يدخل الهيكل الجديد، ويُحذف بأمر خالد. */
const DEAD = [
  {
    file: "admin/lib/openai-seed.ts",
    prompts: 6,
    lines: 609,
    exports: [
      "generateArticleWithOpenAI",
      "generateCategoriesWithOpenAI",
      "generateTagsWithOpenAI",
      "generateIndustriesWithOpenAI",
      "generateArticleTitlesWithOpenAI",
      "generateFAQTemplatesWithOpenAI",
    ],
    why: "صفر مستورد في المستودع كلّه، وصفر مستهلك لكل تصدير من الستّة. وفيه كتلة «السياق الصناعي» مكرَّرة ستّ مرّات بصياغتين مختلفتين — انحراف نسخٍ ولصق، وهو بالضبط ما يمنعه الجدول الواحد.",
  },
];

// ── التحقّق: كل مدخل ما زال موجوداً في مكانه ────────────────────────────────
const read = (rel) => {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
};

const rows = [];
const problems = [];

for (const e of REGISTRY) {
  const src = read(e.file);
  if (src === null) { problems.push(`${e.key}: الملفّ مفقود — ${e.file}`); continue; }
  const lines = src.split(/\r?\n/);
  const at = lines.findIndex((l) => l.includes(e.anchor));
  if (at < 0) { problems.push(`${e.key}: النصّ المرجعي لم يعد في ${e.file} — «${e.anchor}»`); continue; }

  // حجم البرومبت: من سطر المرساة حتى نهاية القالب النصّي.
  let end = at;
  for (let i = at; i < lines.length && i < at + 80; i++) {
    end = i;
    if (i > at && /`\s*;?\s*$/.test(lines[i])) break;
  }
  const body = lines.slice(at, end + 1).join("\n");

  // المتغيّرات فعلياً في النصّ — عقدٌ يُتحقَّق منه لا ادّعاء.
  const inBody = [...new Set((body.match(/\$\{([^}]+)\}/g) || []).map((v) => v.slice(2, -1).trim().split(/[.?\s[(]/)[0]))];
  const missing = e.vars.filter((v) => !inBody.includes(v));

  // نقطة الدخول ما زالت تستدعيه؟
  const deadEntry = e.entry.filter((ref) => {
    const s = read(ref.split(":")[0]);
    return s === null || !s.includes(e.fn);
  });
  if (deadEntry.length) problems.push(`${e.key}: نقطة دخول لم تعد تستدعي ${e.fn} — ${deadEntry.join(", ")}`);

  rows.push({
    ...e,
    line: at + 1,
    endLine: end + 1,
    chars: body.length,
    promptLines: end - at + 1,
    varsInBody: inBody,
    varsMissing: missing,
    lang: /[؀-ۿ]/.test(body) ? "ar" : "en",
  });
}

const byApp = {};
for (const r of rows) byApp[r.app] = (byApp[r.app] || 0) + 1;

const out = {
  generatedBy: "documents/tasks/scan-prompts.mjs",
  live: rows.length,
  byApp,
  providers: [...new Set(rows.map((r) => r.provider))],
  chars: rows.reduce((s, r) => s + r.chars, 0),
  rows,
  dead: DEAD,
  problems,
};

fs.writeFileSync(path.join(here, "prompts-inventory.json"), JSON.stringify(out, null, 2) + "\n");

console.log("برومبتات حيّة:", out.live, "|", Object.entries(byApp).map(([a, n]) => `${a} ${n}`).join(" · "));
console.log("المزوّدون:", out.providers.join(" · "), "| إجمالي المحارف:", out.chars);
console.log("كود ميت:", DEAD.map((d) => `${d.file} (${d.prompts} برومبتات · ${d.lines} سطراً)`).join(", "));
if (problems.length) { console.log("\n⚠️ مشاكل:"); problems.forEach((p) => console.log("  ·", p)); }
else console.log("التحقّق: كل مدخل في مكانه، ونقاط الدخول تستدعيه.");
const varProblems = rows.filter((r) => r.varsMissing.length);
if (varProblems.length) varProblems.forEach((r) => console.log("  · متغيّر معلَن وغير موجود في النصّ:", r.key, r.varsMissing.join(", ")));
