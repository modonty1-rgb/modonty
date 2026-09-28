#!/usr/bin/env node
/**
 * Turns two files from هيئة تقويم التعليم والتدريب (ETEC) on the national open data platform into the
 * data the education page reads (`/modonty/education`):
 *
 *   schools  — «أداء طلبة مدارس منطقة … وفق مؤشر ترتيب …»: one file per region and test (26 on
 *              28 Sep 2026), joined into one CSV. Each row: a school's average and national rank.
 *   programs — «برامج مؤسسات التعليم العالي الوطني وفق حالة الاعتماد»: every university programme
 *              and its accreditation status.
 *
 * The platform rejects requests that are not from a browser, so the files are downloaded from the
 * publisher page (open.data.gov.sa, «هيئة تقويم التعليم والتدريب») and this runs once a year.
 *
 * Usage:
 *   node scripts/import-etec-education.mjs "<schools.csv>" "<programs.csv>"
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [schoolsFile, programsFile] = process.argv.slice(2);
if (!schoolsFile || !programsFile) {
  console.error('Usage: node scripts/import-etec-education.mjs "<schools.csv>" "<programs.csv>"');
  process.exit(1);
}

/** The whole file into rows — quoted fields may hold commas and line breaks (a few programme names do). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur); cur = "";
      if (row.some((f) => f.trim())) rows.push(row);
      row = [];
    } else cur += c;
  }
  row.push(cur);
  if (row.some((f) => f.trim())) rows.push(row);
  return rows;
}

const read = (file) => parseCsv(readFileSync(file, "utf8").replace(/^﻿/, ""));
const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();
const columns = (header, names) =>
  names.map((name) => {
    const i = header.findIndex((h) => clean(h) === name);
    if (i < 0) throw new Error(`Column «${name}» not found — the file's layout changed: ${header.map(clean).join(" | ")}`);
    return i;
  });

// ── Schools ───────────────────────────────────────────────────────────────────
const [sHead, ...sRows] = read(schoolsFile);
const [yearC, nameC, regionC, testC, trackC, genderC, avgC, rankC] = columns(sHead, [
  "العام الدراسي", "اسم المدرسة", "المنطقة", "نوع الاختبار", "تخصص الاختبار", "جنس المدرسة", "متوسط الدرجة", "الترتيب_المملكة",
]);

const totals = {};
const bySchool = new Map();
// Between 1444 and 1445 most schools gained a «- مسارات» / «- مقررات» suffix; matched on the full
// name only 135 schools had both years, on the name without it 3,403 (measured 28 Sep 2026).
const baseName = (name) => name.replace(/\s*-\s*(مسارات|مقررات)\s*$/, "").trim();
for (const r of sRows) {
  const year = Number(r[yearC]);
  const test = clean(r[testC]);
  const track = clean(r[trackC]);
  const gender = clean(r[genderC]);
  const avg = Number(r[avgC]);
  const rank = Number(r[rankC]);
  if (!year || !test || !track || !["M", "F"].includes(gender) || !Number.isFinite(avg) || !Number.isInteger(rank)) {
    throw new Error(`Unreadable school row: ${r.join(" | ")}`);
  }
  // The ministry ranks each year, test, track and school gender apart; the last rank is its size.
  const group = `${year}|${test}|${track}|${gender}`;
  totals[group] = Math.max(totals[group] ?? 0, rank);
  const name = clean(r[nameC]);
  const key = `${baseName(name)}|${clean(r[regionC])}|${gender}`;
  if (!bySchool.has(key)) bySchool.set(key, { name, nameYear: year, region: clean(r[regionC]), gender, results: [] });
  const school = bySchool.get(key);
  // The name the school carries in its latest year is the one the reader knows.
  if (year > school.nameYear) Object.assign(school, { name, nameYear: year });
  school.results.push([test, track, year, Math.round(avg * 10) / 10, rank]);
}
const years = [...new Set(sRows.map((r) => Number(r[yearC])))].sort();
const schools = {
  years,
  totals,
  schools: [...bySchool.values()].map((s) => [s.name, s.region, s.gender, s.results.sort((a, b) => b[2] - a[2])]),
};

// ── Programmes ────────────────────────────────────────────────────────────────
const [pHead, ...pRows] = read(programsFile);
const [pYearC, instC, campusC, cityC, degreeC, programC, statusC] = columns(pHead, [
  "السنة", "المؤسسة", "المقر", "المدينة", "الدرجة العلمية", "البرنامج", "حالة الاعتماد",
]);
// The file writes the same status two ways in places.
const STATUS = {
  "معتمد كامل": "full", "اعتماد كامل": "full",
  "معتمد مشروط": "conditional", "اعتماد مشروط": "conditional",
  "تحت الإجراء": "pending",
  "لم يعتمد": "rejected",
  "اعتماد منتهي": "expired",
  "لم يتقدم للاعتماد": "none", "لم يتقدم": "none",
};
const latest = new Map();
for (const r of pRows) {
  const status = STATUS[clean(r[statusC])];
  if (!status) throw new Error(`Unknown accreditation status «${clean(r[statusC])}» in: ${r.join(" | ")}`);
  const row = { year: Number(r[pYearC]), inst: clean(r[instC]), campus: clean(r[campusC]), city: clean(r[cityC]), degree: clean(r[degreeC]), program: clean(r[programC]), status };
  if (!row.year || !row.inst || !row.program) throw new Error(`Unreadable programme row: ${r.join(" | ")}`);
  const key = `${row.inst}|${row.campus}|${row.degree}|${row.program}`;
  if (!latest.has(key) || latest.get(key).year < row.year) latest.set(key, row);
}
const programs = [...latest.values()].map((p) => [p.inst, p.campus, p.city, p.degree, p.program, p.status, p.year]);

const dir = join(dirname(fileURLToPath(import.meta.url)), "../app/(site)/modonty/education/data");
writeFileSync(join(dir, "schools.json"), JSON.stringify(schools));
writeFileSync(join(dir, "programs.json"), JSON.stringify(programs));
console.log(`schools: ${sRows.length} results → ${schools.schools.length} schools · years ${years.join(", ")}`);
console.log(`programs: ${pRows.length} rows → ${programs.length} (latest year of each)`);
