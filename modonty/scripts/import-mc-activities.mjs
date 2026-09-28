#!/usr/bin/env node
/**
 * Turns the Ministry of Commerce's quarterly «تعداد للأنشطة الاقتصادية حسب التصنيف الوطني» CSV into
 * the data the entrepreneurship page reads (`/modonty/entrepreneurship`).
 *
 * The file comes from the national open data platform (open.data.gov.sa, publisher «وزارة التجارة»).
 * Its servers reject requests that are not from a browser (every curl and headless call answered
 * «Request Rejected», 28 Sep 2026), so the page cannot fetch it live: someone downloads the new
 * quarter from the dataset page and runs this once.
 *
 * Usage:
 *   node scripts/import-mc-activities.mjs "<file.csv>" "<dataset page url>"
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [file, source] = process.argv.slice(2);
if (!file || !source) {
  console.error('Usage: node scripts/import-mc-activities.mjs "<file.csv>" "<dataset page url>"');
  process.exit(1);
}

/** One CSV line into fields — a few activity names carry commas inside quotes. */
function parseLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

const lines = readFileSync(file, "utf8").replace(/^﻿/, "").trim().split(/\r?\n/);
const header = parseLine(lines[0]);
const col = (name) => {
  const i = header.findIndex((h) => h.trim() === name);
  if (i < 0) throw new Error(`Column «${name}» not found — the ministry changed the file's layout: ${header.join(" | ")}`);
  return i;
};
const [quarterCol, yearCol, nameCol, codeCol, countCol] = [
  col("الربع السنوي"),
  col("السنة"),
  col("وصف النشاط الاقتصادي المستوى الثالث"),
  col("رمز النشاط الاقتصادي المستوى الثالث"),
  col("عدد السجلات التجارية"),
];

const rows = lines.slice(1).map((l) => {
  const f = parseLine(l);
  return { quarter: f[quarterCol], year: f[yearCol], name: f[nameCol].replace(/\s+/g, " ").trim(), code: f[codeCol].trim(), count: Number(f[countCol]) };
});
const bad = rows.filter((r) => !r.name || !r.code || !Number.isInteger(r.count));
if (bad.length) throw new Error(`${bad.length} rows could not be read, first: ${JSON.stringify(bad[0])}`);
const periods = new Set(rows.map((r) => `${r.year}-Q${r.quarter}`));
if (periods.size !== 1) throw new Error(`Expected one quarter, found ${[...periods].join(", ")}`);

const { year, quarter } = rows[0];
const data = {
  year: Number(year),
  quarter: Number(quarter),
  source,
  // Most registrations first — the page's ranks read straight off the index.
  activities: rows.sort((a, b) => b.count - a.count).map((r) => [r.code, r.name, r.count]),
};

const out = join(dirname(fileURLToPath(import.meta.url)), "../app/(site)/modonty/entrepreneurship/data/activities.json");
writeFileSync(out, JSON.stringify(data));
console.log(`${rows.length} activities · ${year} Q${quarter} · ${rows.reduce((s, r) => s + r.count, 0)} registrations → ${out}`);
