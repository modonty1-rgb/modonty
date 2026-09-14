import fs from "node:fs";
import path from "node:path";

/**
 * تعريب ما يظهر للقارئ داخل JSX وحده — بين `>` و`<` — فلا تُمسّ المعرّفات ولا الأنواع
 * ولا أسماء الصفوف. الجولة الأولى عرّبت كل شيء فكسرت المتغيّرات، والثانية أعادتها كلّها.
 */
const MAP = [
  ["ROI Calculator", "حاسبة العائد"],
  ["Discovery Call", "مكالمة الاستكشاف"],
  ["Elevator Pitch", "التعريف القصير"],
  ["Full Demo", "العرض الكامل"],
  ["E-E-A-T", "الخبرة والمصداقية"],
  ["Big Idea", "الفكرة الكبرى"],
  ["BIG IDEA", "الفكرة الكبرى"],
  ["Watchlist", "قائمة المراقبة"],
  ["Resellers", "الوكلاء"],
  ["ICPs", "العملاء المثاليون"],
  ["SMBs", "الشركات الصغيرة والمتوسطة"],
  ["SWOT", "تحليل القوّة والضعف"],
  ["KPIs", "مؤشّرات الأداء"],
];

const root = "app/(public)/playbook";
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx$/.test(e.name)) files.push(p);
  }
})(root);

let total = 0;
const per = {};
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  // نصّ JSX: ما بين علامة إغلاق وفتح، بلا أقواس معقوفة (تعبير) ولا وسوم
  const out = src.replace(/>([^<>{}]+)</g, (m, text) => {
    let t = text;
    for (const [en, ar] of MAP) {
      if (!t.includes(en)) continue;
      const hits = t.split(en).length - 1;
      t = t.split(en).join(ar);
      per[en] = (per[en] || 0) + hits;
      total += hits;
    }
    return ">" + t + "<";
  });
  if (out !== src) fs.writeFileSync(f, out);
}
console.log("استبدالات في نصّ JSX:", total);
Object.entries(per).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log("  " + k.padEnd(18) + v));
