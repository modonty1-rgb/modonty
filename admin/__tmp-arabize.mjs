import fs from "node:fs";
import path from "node:path";

/**
 * تعريب مصطلحات البيع — المندوب يكلّم العميل بالعربية، فلا يقرأ التعليمات بالإنجليزية.
 * الترتيب مهمّ: الأطول أوّلًا كي لا يبتلع المختصرُ ما هو أطول منه.
 */
const MAP = [
  ["ROI Calculator", "حاسبة العائد"],
  ["Discovery Call", "مكالمة الاستكشاف"],
  ["Elevator Pitch", "التعريف القصير"],
  ["Full Demo", "العرض الكامل"],
  ["decision tree", "شجرة القرار"],
  ["E-E-A-T", "الخبرة والمصداقية"],
  ["Watchlist", "قائمة المراقبة"],
  ["Resellers", "الوكلاء"],
  ["Tier 1", "الفئة الأولى"],
  ["Tier 2", "الفئة الثانية"],
  ["Tier 3", "الفئة الثالثة"],
  ["Big Idea", "الفكرة الكبرى"],
  ["BIG IDEA", "الفكرة الكبرى"],
  ["ICPs", "العملاء المثاليون"],
  ["SMBs", "الشركات الصغيرة والمتوسطة"],
  ["SWOT", "تحليل القوّة والضعف"],
  ["KPIs", "مؤشّرات الأداء"],
];

const root = "app/(public)/playbook";
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) files.push(p);
  }
})(root);

let total = 0;
const per = {};
for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  const before = s;
  for (const [en, ar] of MAP) {
    // داخل النصّ المعروض فقط — لا في أسماء الصفوف ولا المعرّفات
    const re = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const hits = (s.match(re) || []).length;
    if (!hits) continue;
    s = s.replace(re, ar);
    per[en] = (per[en] || 0) + hits;
    total += hits;
  }
  if (s !== before) fs.writeFileSync(f, s);
}
console.log("استبدالات:", total);
Object.entries(per).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log("  " + k.padEnd(18) + v));
