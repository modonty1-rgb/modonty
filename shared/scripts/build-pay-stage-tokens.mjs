/**
 * يولّد `shared/styles/pay-stage.css` من `modonty/app/globals.css`.
 *
 * لماذا مولَّد لا مكتوب بيد (خالد ١٣ سبتمبر ٢٠٢٦: «الألوان… الأدمن يختلف عن مدونتي
 * الرئيسية، استخدم نفس التوكن»): الملفّ كان ينسخ ١٤ توكناً بيدي من أصل ٤٥. الباقي —
 * `--ring` و`--input` و`--popover` و`--destructive` و`--radius` و`--star` وغيرها — كان
 * يسقط على ألوان الأدمن، فتُقرّ بطاقةٌ بلونٍ وتُطلق بآخر. ونسخةٌ يدوية ناقصة تبقى ناقصة،
 * فالحلّ ألّا تُكتب بيد أصلاً.
 *
 * ما يفعله: يأخذ كل كتلة `:root` و`.dark` في ملفّ مدونتي — بما فيها التي داخل
 * `@media (prefers-contrast: more)` — ويعيد كتابتها محصورةً في `.pay-stage`، فلا يتغيّر
 * بكسل واحد في الأدمن خارج إطار المعاينة.
 *
 * التشغيل: `node shared/scripts/build-pay-stage-tokens.mjs`
 * بعد أي تعديل على توكنات مدونتي. و`--check` يقارن ولا يكتب (يرجع 1 عند الانحراف).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(here, "../../modonty/app/globals.css");
const TARGET = resolve(here, "../styles/pay-stage.css");
/**
 * هدفٌ ثانٍ (PAY-S1): حزمة `payment` تطبيقٌ مستقلّ، فتحتاج التوكنات على `:root` لا محصورةً
 * في `.pay-stage`. ونفس المصدر ونفس المولّد — لأن النسخة اليدوية هي بعينها العطل الذي وُلد
 * هذا الملفّ لإصلاحه.
 */
const TARGET_APP = resolve(here, "../../payment/app/globals.css");

/** يقرأ كتلة `{ … }` متوازنة الأقواس ابتداءً من موضع `{`. */
function readBlock(css, braceIndex) {
  let depth = 0;
  for (let i = braceIndex; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return { body: css.slice(braceIndex + 1, i), end: i };
    }
  }
  throw new Error("قوسٌ غير مغلق في " + SOURCE);
}

/** كل تعريفات المتغيّرات في نصّ كتلة — بترتيبها وتعليقاتها كما هي. */
function declarations(body) {
  const out = [];
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(body)) !== null) out.push([m[1], m[2].trim()]);
  return out;
}

/** يجد كل ظهور للمحدّد `sel` على مستواه، ويعيد كتلته ومكانها. */
function blocksFor(css, sel) {
  const found = [];
  const re = new RegExp("(^|[{}\\s])" + sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{", "g");
  let m;
  while ((m = re.exec(css)) !== null) {
    const brace = css.indexOf("{", m.index + m[0].length - 1);
    const { body, end } = readBlock(css, brace);
    found.push({ start: m.index, end, decls: declarations(body) });
    re.lastIndex = end;
  }
  return found;
}

const css = readFileSync(SOURCE, "utf8");

// حدود `@media (prefers-contrast: more)` كي نعرف أي كتلة تقع داخلها.
const contrastAt = css.indexOf("@media (prefers-contrast: more)");
const contrastRange =
  contrastAt < 0 ? null : (() => {
    const brace = css.indexOf("{", contrastAt);
    const { end } = readBlock(css, brace);
    return [contrastAt, end];
  })();
const inContrast = (i) => contrastRange !== null && i > contrastRange[0] && i < contrastRange[1];

const root = blocksFor(css, ":root");
const dark = blocksFor(css, ".dark");

const pick = (list, contrast) =>
  list.filter((b) => inContrast(b.start) === contrast).flatMap((b) => b.decls);

const rootBase = pick(root, false);
const darkBase = pick(dark, false);
const rootContrast = pick(root, true);
const darkContrast = pick(dark, true);

const render = (decls) => decls.map(([k, v]) => `  ${k}: ${v};`).join("\n");

const output = `/**
 * ⚠ ملفٌّ مولَّد — لا يُحرَّر بيد.
 * المصدر: modonty/app/globals.css · المولّد: shared/scripts/build-pay-stage-tokens.mjs
 * لإعادة توليده: node shared/scripts/build-pay-stage-tokens.mjs
 *
 * توكنات مدونتي محصورةً في إطار المعاينة (PAY-G19). \`PaySection\` و\`PlanCard\` يقرآن توكنات
 * التطبيق المضيف، فبطاقةٌ تُعرض في الأدمن تأخذ أزرق لينكدإن لا أزرق مدونتي — تُقَرّ بلونٍ
 * وتُطلق بآخر. هنا تُحقن ألوان مدونتي داخل \`.pay-stage\` وحدها، والأدمن حولها لا يتغيّر.
 *
 * التوكنات ${rootBase.length} في الفاتح و${darkBase.length} في الداكن — كلّها، لا مختارات منها:
 * النسخة اليدوية السابقة حملت ١٤ فقط فسقط الباقي على ألوان الأدمن.
 */

.pay-stage {
${render(rootBase)}
}

/* الداكن يُطابَق على الجذر لا على الإطار: الأدمن يضع \`dark\` على <html> والإطار في داخله. */
.dark .pay-stage {
${render(darkBase)}
}
${
  rootContrast.length || darkContrast.length
    ? `
/* تباينٌ عالٍ — قارئٌ يخبرنا أنه يفقد الحدود، فتتحرّك نفس التوكنات التي تتحرّك في مدونتي. */
@media (prefers-contrast: more) {
  .pay-stage {
${render(rootContrast).replace(/^/gm, "  ")}
  }

  .dark .pay-stage {
${render(darkContrast).replace(/^/gm, "  ")}
  }
}
`
    : ""
}`;

/**
 * ملفّ أنماط حزمة `payment` — نفس التوكنات، لكن على `:root` و`.dark` كما في مدونتي، لأن
 * الحزمة تطبيقٌ كامل لا إطار معاينة داخل الأدمن.
 *
 * ولا يحمل من مدونتي إلا التوكنات وسطر الحدود: قواعد `article-body` والشريط اللاصق
 * والمشغّل الصوتي لا وجود لها في مسار الدفع، ونقلها يعني كوداً ميتاً من أوّل يوم.
 */
const appOutput = `/**
 * ⚠ ملفٌّ مولَّد — لا يُحرَّر بيد.
 * المصدر: modonty/app/globals.css · المولّد: shared/scripts/build-pay-stage-tokens.mjs
 * لإعادة توليده: node shared/scripts/build-pay-stage-tokens.mjs
 *
 * توكنات مدونتي كما هي، كي تكون صفحة الدفع بنفس ألوان المنصّة حرفاً بحرف — لا لوناً
 * قريباً منها. ${rootBase.length} توكناً في الفاتح و${darkBase.length} في الداكن.
 */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
${render(rootBase)}
  }

  .dark {
${render(darkBase)}
  }
${
  rootContrast.length || darkContrast.length
    ? `
  /* تباينٌ عالٍ — قارئٌ يخبرنا أنه يفقد الحدود، فتتحرّك نفس التوكنات التي تتحرّك في مدونتي. */
  @media (prefers-contrast: more) {
    :root {
${render(rootContrast).replace(/^/gm, "    ")}
    }

    .dark {
${render(darkContrast).replace(/^/gm, "    ")}
    }
  }
`
    : ""
}
  * {
    @apply border-border;
  }
}
`;

const targets = [
  { path: TARGET, text: output, name: "pay-stage.css" },
  { path: TARGET_APP, text: appOutput, name: "payment/app/globals.css" },
];

if (process.argv.includes("--check")) {
  let drifted = false;
  for (const t of targets) {
    let current = "";
    try {
      current = readFileSync(t.path, "utf8");
    } catch {
      console.error(`✗ ${t.name} غير موجود — شغّل المولّد.`);
      drifted = true;
      continue;
    }
    if (current === t.text) console.log(`✓ ${t.name} مطابق لتوكنات مدونتي`);
    else {
      console.error(`✗ ${t.name} منحرف عن modonty/app/globals.css — شغّل المولّد.`);
      drifted = true;
    }
  }
  if (drifted) process.exit(1);
} else {
  for (const t of targets) writeFileSync(t.path, t.text, "utf8");
  console.log(
    `✓ كُتب ملفّان — ${rootBase.length} توكناً فاتحاً · ${darkBase.length} داكناً` +
      (rootContrast.length ? ` · ${rootContrast.length}+${darkContrast.length} تباين عالٍ` : "") +
      `\n  ${targets.map((t) => t.name).join(" · ")}`,
  );
}
