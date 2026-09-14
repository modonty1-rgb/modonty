import fs from "node:fs";

const p = "app/(public)/playbook/components/helpers/prohibitions-data.ts";
let s = fs.readFileSync(p, "utf8").replace(/\r/g, "");

// بندٌ يخالف قسم مجموعته: التصنيف بالمجموعة خشن، والبند هو ما يقع فيه الموظّف.
const OVERRIDES = {
  content: [
    "Orphan Pages",
    "Doorway Pages",
    "Hidden Text/Links",
    "Scam & Fraud",
    "Soft 404",
  ],
  design: [
    "Pop-ups تغطي المحتوى",
    "تصميم غير متجاوب",
  ],
};

let n = 0;
for (const [dept, needles] of Object.entries(OVERRIDES)) {
  for (const needle of needles) {
    const re = new RegExp(`(\\{ name: "[^"]*${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^"]*",)`);
    if (!re.test(s)) { console.log("✗ لم يُطابق:", needle); continue; }
    s = s.replace(re, `$1 dept: "${dept}",`);
    n++;
  }
}

// حقل اختياري على البند نفسه
s = s.replace(
  `export interface Prohibition {
  name: string;`,
  `export interface Prohibition {
  name: string;
  /** قسمٌ يخالف قسم المجموعة — البند هو ما يقع فيه الموظّف، لا عنوان المجموعة. */
  dept?: string;`,
);

fs.writeFileSync(p, s);
console.log("بنود مُعاد وسمها:", n);
const counts = {};
for (const [, cat, block] of s.matchAll(/category: "([^"]+)",\n    dept: "(\w+)",([\s\S]*?)(?=\n  \{\n    category:|\n\];)/g)) void 0;
for (const m of s.matchAll(/dept: "(\w+)"/g)) counts[m[1]] = (counts[m[1]] || 0) + 1;
console.log("وسوم القسم إجمالًا:", JSON.stringify(counts));
