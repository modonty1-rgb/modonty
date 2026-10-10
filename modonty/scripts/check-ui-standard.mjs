// Guard for documents/design/WEB-STANDARD-v1.md — run `pnpm check:ui` before pushing.
// Scans modonty's own TSX for values the 9 Oct 2026 audit removed, so they cannot creep back:
//   1. text under 13px (the caption minimum)       — text-[9..12.5px]
//   2. icons off the 16 · 20 · 24 scale             — icon components at 10 / 12 / 15 / 18 px
//   3. off-scale corner radii                        — rounded-[2/3/6/9/10/11/14px]
//   4. page headings outside the two roles           — <h1> with a raw size instead of text-h1 / text-display
// Weights need no rule: tailwind.config.ts maps every weight name onto 400 · 500 · 700.
// Exit code 1 when anything is found, so it can gate a push or CI.
import fs from "node:fs";
import path from "node:path";

const ROOTS = ["app", "components"];
// Pages kept off the two heading roles on purpose (see WEB-STANDARD-v1 review notes).
const H1_EXEMPT = /articles\/\[slug\]\/components\/article-header|story\/SalesPitchPage|\(partner\)|\(fullscreen\)\/reels/;

const RULES = [
  { name: "text under 13px", re: /(?<![\w-])text-\[(?:9|10|11|12)(?:\.\d+)?px\]/g },
  // A fluid size whose floor is under 0.8125rem (13px) shrinks below the caption minimum on phones.
  { name: "fluid text floor under 13px", re: /(?<![\w-])text-\[clamp\(0\.(?:[0-7]\d*|80\d*)rem/g },
  {
    name: "icon off the 16/20/24 scale",
    re: /<(?:Icon\w*|Modonty\w*Mark)\b[^>]*\b(?:h-2\.5 w-2\.5|size-2\.5|h-3 w-3|w-3 h-3|size-3|size-\[1[0258]px\]|h-\[1[58]px\] w-\[1[58]px\])\b[^>]*>/g,
  },
  { name: "off-scale radius", re: /(?<![\w-])rounded(?:-[a-z]{1,2})?-\[(?:2|3|6|9|10|11|14)px\]/g },
];

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith(".tsx")) files.push(p.split(path.sep).join("/"));
  }
};
ROOTS.forEach(walk);

const hits = [];
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const line = (i) => src.slice(0, i).split("\n").length;
  for (const r of RULES) for (const m of src.matchAll(r.re)) hits.push(`${f}:${line(m.index)}  ${r.name}  ${m[0].slice(0, 70)}`);
  if (!H1_EXEMPT.test(f)) {
    for (const m of src.matchAll(/<h1\b[^>]*className="([^"]*)"/g)) {
      const cls = m[1];
      if (/\bsr-only\b|\btext-(?:h1|display|base|sm)\b/.test(cls)) continue;
      if (/\btext-(?:xl|2xl|3xl|4xl|5xl|\[)/.test(cls)) hits.push(`${f}:${line(m.index)}  h1 outside text-h1/text-display  ${cls.slice(0, 60)}`);
    }
  }
}

if (hits.length) {
  console.error(`✗ ${hits.length} value(s) break WEB-STANDARD-v1:\n` + hits.join("\n"));
  process.exit(1);
}
console.log(`✓ WEB-STANDARD-v1 — ${files.length} files clean (text ≥13 · icons 16/20/24 · radius scale · h1 roles)`);
