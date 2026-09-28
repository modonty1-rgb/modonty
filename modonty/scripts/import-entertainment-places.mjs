#!/usr/bin/env node
/**
 * Builds the entertainment page's family guide (`/modonty/entertainment`) from two official sources:
 *
 *   sta — هيئة السياحة on the national open data platform: «تجارب <city>» and «مطاعم <city>»
 *         (20 files, 10 destinations, English). Downloaded from the publisher page as one JSON
 *         bundle [{ title, id, updated, text }] — the platform rejects requests from servers.
 *   gea — هيئة الترفيه's events API (enjoy.sa/api/v1/odp/events/Get, listed on the same platform):
 *         the rows still active, as [name, city, start, end, family, opens, closes]. It answers a
 *         browser only, so the active rows are copied from one.
 *
 * Khalid (28 Sep 2026): a family guide — no cinema, concerts or anything doubtful. Rows whose name
 * or description is about those are left out here; the editor hides anything else from the admin.
 * Descriptions are translated to Arabic once, here, with Google Translate (the key in .env.local).
 *
 * Usage:
 *   node --env-file=.env.local scripts/import-entertainment-places.mjs "<sta-places.json>" "<gea-active-events.json>"
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [staFile, geaFile] = process.argv.slice(2);
const KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
if (!staFile || !geaFile || !KEY) {
  console.error('Usage: node --env-file=.env.local scripts/import-entertainment-places.mjs "<sta-places.json>" "<gea-active-events.json>"');
  process.exit(1);
}

/** The whole file into rows — quoted fields hold commas and line breaks. */
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

const clean = (s) => (s ?? "").replace(/�/g, " ").replace(/\s+/g, " ").trim();
const slug = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9؀-ۿ]+/g, "-").replace(/^-|-$/g, "");
// Up to the first space: a map link carries «lat,lng» inside its query, so a comma does not end it.
const firstUrl = (s) => (s ?? "").match(/https?:\/\/\S+/)?.[0]?.replace(/[",]+$/, "") ?? null;

/** Two sentences at most — the page lists places; the reader opens the link for the rest. */
function shorten(text, max = 320) {
  const t = clean(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "));
  return end > 80 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

// ── Cities ────────────────────────────────────────────────────────────────────
const CITIES = [
  ["riyadh", "الرياض"], ["jeddah", "جدة"], ["makkah", "مكة المكرمة"], ["madinah", "المدينة المنورة"],
  ["eastern", "المنطقة الشرقية"], ["taif", "الطائف"], ["abha", "أبها"], ["alula", "العلا"],
  ["diriyah", "الدرعية"], ["albaha", "الباحة"], ["red-sea", "البحر الأحمر"], ["buraydah", "بريدة"],
  ["jazan", "جازان"], ["yanbu", "ينبع"], ["sakaka", "سكاكا"],
];
const STA_CITY = [
  [/الرياض/, "riyadh"], [/جدة/, "jeddah"], [/العلا/, "alula"], [/ابها|أبها/, "abha"], [/الباحة/, "albaha"],
  [/الدرعية/, "diriyah"], [/الشرقية/, "eastern"], [/البحر الأحمر/, "red-sea"], [/الطائف/, "taif"], [/المدينة/, "madinah"],
];
const GEA_CITY = {
  "الرياض": "riyadh", "جدة": "jeddah", "مكة": "makkah", "المدينة المنورة": "madinah", "الطائف": "taif", "أبها": "abha",
  "بريدة": "buraydah", "جازان": "jazan", "ينبع": "yanbu", "سكاكا": "sakaka",
  "الدمام": "eastern", "الخبر": "eastern", "الجبيل": "eastern", "الظهران": "eastern", "القطيف": "eastern", "الأحساء": "eastern",
};

// ── Leave out ─────────────────────────────────────────────────────────────────
const EXCLUDE_NAME = /cinema|cinehouse|music|concert|lounge|beach club|club priv|arena|\bbar\b|night/i;
const EXCLUDE_TEXT = /\bconcerts?\b|live music|live band|\bDJs?\b|nightlife|night ?club|beach club/i;
const EXCLUDE_AR = /موسيق|حفل|غنائ|سينما|طرب/;
const excluded = [];

// ── هيئة السياحة ─────────────────────────────────────────────────────────────
const staPlaces = [];
for (const file of JSON.parse(readFileSync(staFile, "utf8"))) {
  const title = clean(file.title);
  const city = STA_CITY.find(([re]) => re.test(title))?.[1];
  if (!city) throw new Error(`No city for «${title}»`);
  const kind = /مطاعم|الاطعمة/.test(title) ? "restaurant" : "experience";
  const rows = parseCsv(file.text);
  // Medina's restaurants file has its own layout: a banner row, then Title · Page Path · Description · Booking · Google.
  const headerAt = rows.findIndex((r) => /^(NAME|Title)$/i.test(clean(r[1])) || /^Title$/i.test(clean(r[0])));
  const header = rows[headerAt].map(clean);
  const col = (...names) => header.findIndex((h) => names.some((n) => h.toUpperCase().startsWith(n)));
  const [nameC, descC, linkC, mapC] = [col("NAME", "TITLE"), col("DESCRIPTION"), col("SM/REFERENCE", "PAGE PATH"), col("LOCATION", "GOOGLE LINK")];
  if ([nameC, descC, mapC].some((i) => i < 0)) throw new Error(`Unexpected columns in «${title}»: ${header.join(" | ")}`);
  for (const r of rows.slice(headerAt + 1)) {
    const name = clean(r[nameC]);
    if (!name) continue;
    const description = clean(r[descC]);
    if (EXCLUDE_NAME.test(name) || EXCLUDE_TEXT.test(description)) {
      excluded.push(`${title} · ${name}`);
      continue;
    }
    staPlaces.push({
      id: `sta:${city}:${slug(name)}`,
      city,
      kind,
      nameEn: name,
      descriptionEn: shorten(description),
      link: firstUrl(r[linkC]),
      map: firstUrl(r[mapC]),
      source: file.id,
    });
  }
}

// ── هيئة الترفيه ─────────────────────────────────────────────────────────────
const DAY = 86_400_000;
const seen = new Set();
const geaPlaces = [];
for (const [rawName, cityAr, start, end, family, opens, closes] of JSON.parse(readFileSync(geaFile, "utf8"))) {
  const name = clean(rawName);
  const city = GEA_CITY[clean(cityAr)];
  // Places that stay open for months, not one-night shows.
  const lasting = (Date.parse(end) - Date.parse(start)) / DAY > 60;
  if (!family || !lasting || !city) continue;
  if (EXCLUDE_AR.test(name)) { excluded.push(`هيئة الترفيه · ${name}`); continue; }
  const id = `gea:${city}:${slug(name)}:${slug(clean(cityAr))}`;
  if (seen.has(id)) continue;
  seen.add(id);
  geaPlaces.push({ id, city, kind: "family", name, area: clean(cityAr), hours: `${opens} – ${closes}`, until: end });
}

// ── Translate ─────────────────────────────────────────────────────────────────
async function translate(texts) {
  const out = [];
  for (let i = 0; i < texts.length; i += 50) {
    const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${KEY}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q: texts.slice(i, i + 50), source: "en", target: "ar", format: "text" }),
    });
    if (!res.ok) throw new Error(`Translate ${res.status}: ${await res.text()}`);
    out.push(...(await res.json()).data.translations.map((t) => t.translatedText));
  }
  return out;
}
const names = await translate(staPlaces.map((p) => p.nameEn));
const descriptions = await translate(staPlaces.map((p) => p.descriptionEn || "-"));
staPlaces.forEach((p, i) => {
  p.name = names[i];
  p.description = p.descriptionEn ? descriptions[i] : null;
  delete p.descriptionEn;
});

const places = [...staPlaces, ...geaPlaces];
const used = new Set(places.map((p) => p.city));
const data = {
  updated: new Date().toISOString().slice(0, 10),
  cities: CITIES.filter(([key]) => used.has(key)).map(([key, name]) => ({ key, name })),
  places,
};
const out = join(dirname(fileURLToPath(import.meta.url)), "../../shared/lib/sectors/entertainment-places.json");
writeFileSync(out, JSON.stringify(data));
const chars = staPlaces.reduce((s, p) => s + p.nameEn.length, 0) + staPlaces.reduce((s, p) => s + (p.description ? p.description.length : 0), 0);
console.log(`sta: ${staPlaces.length} · gea family places: ${geaPlaces.length} · cities: ${data.cities.length} · ~${chars} chars translated`);
console.log(`left out (${excluded.length}):`);
for (const e of excluded) console.log(`  ${e}`);
