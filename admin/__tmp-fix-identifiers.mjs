import fs from "node:fs";
import path from "node:path";

/**
 * إصلاح ما كسره التعريب: الاستبدال دخل أسماء المتغيّرات والأنواع لا النصّ وحده.
 * الترجمة الصحيحة تبقى داخل السلاسل النصّية، وتُردّ خارجها إلى الإنجليزية.
 */
const BACK = [
  ["العملاء المثاليون", "ICPs"],
  ["الشركات الصغيرة والمتوسطة", "SMBs"],
  ["تحليل القوّة والضعف", "SWOT"],
  ["مؤشّرات الأداء", "KPIs"],
  ["قائمة المراقبة", "Watchlist"],
  ["الوكلاء", "Resellers"],
  ["الخبرة والمصداقية", "EEAT"],
  ["الفكرة الكبرى", "BigIdea"],
  ["مكالمة الاستكشاف", "DiscoveryCall"],
  ["التعريف القصير", "ElevatorPitch"],
  ["العرض الكامل", "FullDemo"],
  ["حاسبة العائد", "RoiCalculator"],
  ["شجرة القرار", "DecisionTree"],
  ["الفئة الأولى", "Tier1"],
  ["الفئة الثانية", "Tier2"],
  ["الفئة الثالثة", "Tier3"],
];

const root = "app/(public)/playbook";
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) files.push(p);
  }
})(root);

// يقسم السطر إلى مقاطع: داخل سلسلة نصّية (تُترك) وخارجها (يُردّ)
function fixLine(line) {
  const parts = line.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/);
  return parts
    .map((seg, i) => {
      if (i % 2 === 1) return seg; // داخل سلسلة نصّية
      let out = seg;
      for (const [ar, en] of BACK) out = out.split(ar).join(en);
      return out;
    })
    .join("");
}

let touched = 0;
let lines = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const fixed = src.split("\n").map((l) => {
    const n = fixLine(l);
    if (n !== l) lines++;
    return n;
  }).join("\n");
  if (fixed !== src) {
    fs.writeFileSync(f, fixed);
    touched++;
    console.log("  " + f);
  }
}
console.log("ملفات:", touched, "| أسطر:", lines);
