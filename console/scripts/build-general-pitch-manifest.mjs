/**
 * Builds the manifest.json for the /help/general page sales pitch.
 * Reads: modonty/scripts/voice/general-pitch/script.md (source of truth — owned by modonty/story page)
 * Writes: console/public/help/audio/general-pitch/manifest.json
 *
 * Text-only (no MP3 generation). The browser uses Web Speech API to play it live.
 * Once the script is finalized, we'll generate MP3s via ElevenLabs to lock the voice.
 *
 * Run: node scripts/build-general-pitch-manifest.mjs
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONSOLE_ROOT = path.resolve(__dirname, "..");
const MONOREPO_ROOT = path.resolve(CONSOLE_ROOT, "..");
const SCRIPT_PATH = path.join(
  MONOREPO_ROOT,
  "modonty",
  "scripts",
  "voice",
  "general-pitch",
  "script.md",
);
const OUT_DIR = path.join(CONSOLE_ROOT, "public", "help", "audio", "general-pitch");

async function parseSections() {
  const md = await fs.readFile(SCRIPT_PATH, "utf-8");
  const lines = md.split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    const headerMatch = line.match(/^##\s+\[([^\]]+)\]/);
    if (headerMatch) {
      if (current && current.text.trim()) sections.push(current);
      const label = headerMatch[1].trim();
      const id = String(sections.length + 1).padStart(2, "0");
      current = { id, label, text: "" };
      continue;
    }
    if (line.startsWith("## End")) {
      if (current && current.text.trim()) sections.push(current);
      current = null;
      break;
    }
    if (line.startsWith("---") || line.startsWith("#")) continue;
    if (current) {
      const clean = line
        .replace(/\*\*/g, "")
        .replace(/^\s*>\s*/, "")
        .replace(/^«|»$/g, "")
        .trim();
      if (clean) current.text += clean + " ";
    }
  }
  return sections;
}

/** 2-level grouping: main categories shown on top, individual sections below */
const CATEGORIES = [
  { label: "المقدّمة", emoji: "👋", range: [1, 2] },
  { label: "مودونتي", emoji: "✨", range: [3, 5] },
  { label: "المقارنات", emoji: "⚖", range: [6, 7] },
  { label: "المنصّة", emoji: "🚀", range: [8, 10] },
  { label: "الخاتمة", emoji: "🎯", range: [11, 11] },
];

async function main() {
  const sections = await parseSections();
  await fs.mkdir(OUT_DIR, { recursive: true });

  const categories = CATEGORIES.map((cat) => ({
    label: cat.label,
    emoji: cat.emoji,
    sectionIds: sections
      .filter((s) => {
        const n = parseInt(s.id, 10);
        return n >= cat.range[0] && n <= cat.range[1];
      })
      .map((s) => s.id),
  })).filter((cat) => cat.sectionIds.length > 0);

  const manifest = {
    voice: "browser-tts",
    categories,
    sections: sections.map((s) => ({
      id: s.id,
      label: s.label,
      text: s.text.trim(),
      wordCount: s.text.trim().split(/\s+/).filter(Boolean).length,
    })),
  };

  await fs.writeFile(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  console.log(`✅ Manifest built with ${sections.length} sections`);
  console.log(`📊 Total words: ${manifest.sections.reduce((s, sec) => s + sec.wordCount, 0)}`);
  console.log(`📋 ${path.join(OUT_DIR, "manifest.json")}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
