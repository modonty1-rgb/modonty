/**
 * حارس البرومبت — يمسح المستودع ويجيب سؤالين:
 *   ١ · هل كل برومبت مسجَّل يُقرأ فعلاً بمفتاحه من القاعدة؟
 *   ٢ · هل تسلّل برومبت جديد مكتوباً في الكود بلا مفتاح؟
 *
 * القاعدة (خالد، ٢٨ أغسطس ٢٠٢٦): «أي برومبت جديد ولا أي AI بستخدمه في أي مكان في
 * البروجيكت، أبغى آخذ key واضح يكون هو البرومبت». وقاعدةٌ أخالفها بعد شهرين نسياناً
 * لا تُكتب بصوت أعلى — تتحوّل إلى فحص. هذا هو الفحص.
 *
 * التشغيل:  node documents/tasks/scan-prompts.mjs
 * المخرَج:  documents/tasks/prompts-inventory.json  →  تبويب «🤖 البرومبت» في SEO.html
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "../..");
const APPS = ["modonty", "admin", "console", "shared"];

const read = (rel) => {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
};
const norm = (p) => p.split(path.sep).join("/");

// ── ١ · السجلّ: يُقرأ من ملفّ الاحتياط نفسه، فلا تنشأ نسخة ثانية تتضارب ──────────
const defaultsSrc = read("shared/lib/ai/prompt-defaults.ts");
if (!defaultsSrc) { console.error("✗ shared/lib/ai/prompt-defaults.ts مفقود"); process.exit(1); }

const registry = [];
for (const m of defaultsSrc.matchAll(/\{\s*key:\s*"([^"]+)",\s*app:\s*"([^"]+)",\s*provider:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*surface:\s*"([^"]+)",\s*requiredVars:\s*\[([^\]]*)\],\s*onEmpty:\s*"([^"]+)",\s*body:\s*`([\s\S]*?)`,?\s*\}/g)) {
  const [, key, app, provider, title, surface, varsRaw, onEmpty, body] = m;
  registry.push({
    key, app, provider, title, surface, onEmpty, body,
    requiredVars: [...varsRaw.matchAll(/"([^"]+)"/g)].map((v) => v[1]),
  });
}

// ── ٢ · هل يُقرأ كل مفتاح فعلاً؟ ────────────────────────────────────────────────
const files = [];
for (const app of APPS) {
  const base = path.join(ROOT, app);
  if (!fs.existsSync(base)) continue;
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (/node_modules|\.next|\.turbo/.test(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.tsx?$/.test(e.name)) files.push(p);
    }
  })(base);
}

const problems = [];
const rows = registry.map((r) => {
  const callers = [];
  for (const p of files) {
    const rel = norm(path.relative(ROOT, p));
    if (rel.startsWith("shared/lib/ai/") || rel.includes("modo/actions/")) continue; // المكتبة والشاشة لا تُعدّ استهلاكاً
    const src = fs.readFileSync(p, "utf8");
    const idx = src.indexOf(`"${r.key}"`);
    if (idx < 0) continue;
    callers.push(`${rel}:${src.slice(0, idx).split("\n").length}`);
  }
  if (!callers.length) problems.push(`${r.key}: مسجَّل ولا يقرؤه أحد — إمّا يُحذف وإمّا يُربط.`);
  return { ...r, callers, chars: r.body.length, promptLines: r.body.split("\n").length, lang: /[؀-ۿ]/.test(r.body) ? "ar" : "en" };
});

// ── ٣ · الحارس: برومبت مكتوب في الكود بلا مفتاح ─────────────────────────────────
// دلائل نداء نموذج + قالبٍ نصّي طويل في نفس الملفّ = برومبت مضمَّن يُرجَّح أنه تسلّل.
const MODEL_CALL = /\b(chat\.completions|generateContent|cohere\.chat|messages:\s*\[\s*\{\s*role|preamble)\b/;
const leaks = [];
for (const p of files) {
  const rel = norm(path.relative(ROOT, p));
  if (rel.startsWith("shared/lib/ai/")) continue; // ملفّ الاحتياط مستثنى بالتعريف
  const src = fs.readFileSync(p, "utf8");
  if (!MODEL_CALL.test(src)) continue;
  // قالب نصّي فيه ≥٢٥ كلمة ولم يُقرأ من القاعدة
  for (const m of src.matchAll(/`([^`]{200,})`/g)) {
    const body = m[1];
    if (!/[؀-ۿ]{20,}|You are |Your task/i.test(body)) continue;
    if (/resolveAdminPrompt|resolveModoPrompt|getAiPrompt/.test(src.slice(Math.max(0, m.index - 400), m.index))) continue;
    leaks.push(`${rel}:${src.slice(0, m.index).split("\n").length} — قالب ${body.length} محرفاً داخل ملفّ يستدعي نموذجاً، بلا مفتاح.`);
  }
}
if (leaks.length) problems.push(...leaks.map((l) => `تسرّب: ${l}`));

// ── ٤ · كود ميت مقيس ────────────────────────────────────────────────────────────
const DEAD = [];
const seedSrc = read("admin/lib/openai-seed.ts");
if (seedSrc) {
  const importers = files.filter((p) => {
    const rel = norm(path.relative(ROOT, p));
    return rel !== "admin/lib/openai-seed.ts" && fs.readFileSync(p, "utf8").includes("openai-seed");
  });
  DEAD.push({
    file: "admin/lib/openai-seed.ts",
    prompts: 6,
    lines: seedSrc.split("\n").length,
    importers: importers.length,
    exports: [...seedSrc.matchAll(/export async function (\w+)/g)].map((m) => m[1]),
    why: "صفر مستورد في المستودع كلّه. وفيه كتلة «السياق الصناعي» مكرَّرة ستّ مرّات بصياغتين مختلفتين — انحراف نسخٍ ولصق، وهو بالضبط ما يمنعه الجدول الواحد.",
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
  storage: "جدول `ai_prompts` — الكود يقرأ بالمفتاح، ونصّ `prompt-defaults.ts` احتياطٌ لا مصدر",
  rows,
  dead: DEAD,
  problems,
};
fs.writeFileSync(path.join(here, "prompts-inventory.json"), JSON.stringify(out, null, 2) + "\n");

console.log("برومبتات مسجَّلة:", out.live, "|", Object.entries(byApp).map(([a, n]) => `${a} ${n}`).join(" · "));
console.log("المزوّدون:", out.providers.join(" · "), "| إجمالي المحارف:", out.chars);
for (const r of rows) console.log(`  ${r.key.padEnd(22)} ← ${r.callers.join(" · ") || "⚠️ بلا قارئ"}`);
if (DEAD.length) console.log("كود ميت:", DEAD.map((d) => `${d.file} (${d.prompts} برومبتات · ${d.lines} سطراً · ${d.importers} مستورد)`).join(", "));
if (problems.length) { console.log("\n⚠️ مشاكل:"); problems.forEach((p) => console.log("  ·", p)); process.exitCode = 1; }
else console.log("\n✅ كل برومبت يُقرأ بمفتاحه، وصفر برومبت مكتوب في الكود بلا مفتاح.");
