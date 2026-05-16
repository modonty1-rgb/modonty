/**
 * Generates ONE section of the /help/general sales pitch via Gemini TTS.
 * Use this to iterate on a single section without regenerating everything.
 *
 * Usage:
 *   node scripts/generate-section.mjs <section-id>
 *   node scripts/generate-section.mjs 01    # generates section 01 (ترحيب)
 *   node scripts/generate-section.mjs 04    # generates section 04 (قصة مودونتي)
 *
 * Output: console/public/help/audio/general-pitch/section-XX.wav
 *         + updates manifest.json (preserves other sections)
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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
const AUDIO_DIR = path.join(
  CONSOLE_ROOT,
  "public",
  "help",
  "audio",
  "general-pitch",
);
const ENV_PATH = path.join(CONSOLE_ROOT, ".env.local");

const VOICE_NAME = "Kore";
const MODEL_ID = "gemini-2.5-flash-preview-tts";

const TASHKEEL_REGEX = /[\u064B-\u0652\u0670\u0656-\u065F]/g;
const stripTashkeel = (s) => s.replace(TASHKEEL_REGEX, "");

const CATEGORIES = [
  { label: "المقدّمة", emoji: "👋", range: [1, 2] },
  { label: "مودونتي", emoji: "✨", range: [3, 5] },
  { label: "المقارنات", emoji: "⚖", range: [6, 7] },
  { label: "المنصّة", emoji: "🚀", range: [8, 10] },
  { label: "الخاتمة", emoji: "🎯", range: [11, 11] },
];

async function loadEnv() {
  const text = await fs.readFile(ENV_PATH, "utf-8");
  const env = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

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

function pcmToWav(pcm, sampleRate = 24000) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcm.length;
  const fileSize = 36 + dataSize;
  const wav = Buffer.alloc(44 + dataSize);
  let o = 0;
  wav.write("RIFF", o); o += 4;
  wav.writeUInt32LE(fileSize, o); o += 4;
  wav.write("WAVE", o); o += 4;
  wav.write("fmt ", o); o += 4;
  wav.writeUInt32LE(16, o); o += 4;
  wav.writeUInt16LE(1, o); o += 2;
  wav.writeUInt16LE(numChannels, o); o += 2;
  wav.writeUInt32LE(sampleRate, o); o += 4;
  wav.writeUInt32LE(byteRate, o); o += 4;
  wav.writeUInt16LE(blockAlign, o); o += 2;
  wav.writeUInt16LE(bitsPerSample, o); o += 2;
  wav.write("data", o); o += 4;
  wav.writeUInt32LE(dataSize, o); o += 4;
  pcm.copy(wav, o);
  return wav;
}

async function synthesize(text, apiKey, voiceName) {
  const plainText = stripTashkeel(text).trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: plainText }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName } },
      },
    },
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Gemini ${resp.status}: ${err.slice(0, 300)}`);
  }
  const data = await resp.json();
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) {
    throw new Error(`No audio in response: ${JSON.stringify(data).slice(0, 300)}`);
  }
  const rateMatch = (part.inlineData.mimeType || "").match(/rate=(\d+)/);
  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
  const pcm = Buffer.from(part.inlineData.data, "base64");
  return pcmToWav(pcm, sampleRate);
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("❌ Usage: node scripts/generate-section.mjs <section-id>");
    console.error("   Example: node scripts/generate-section.mjs 01");
    process.exit(1);
  }
  const sectionId = arg.padStart(2, "0");

  const env = await loadEnv();
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ Missing GEMINI_API_KEY in console/.env.local");
    process.exit(1);
  }

  const sections = await parseSections();
  const section = sections.find((s) => s.id === sectionId);
  if (!section) {
    console.error(`❌ Section "${sectionId}" not found. Available IDs:`);
    sections.forEach((s) => console.error(`   ${s.id} — ${s.label}`));
    process.exit(1);
  }

  await fs.mkdir(AUDIO_DIR, { recursive: true });
  const plainText = stripTashkeel(section.text).trim();

  console.log(`🎙️  Generating section ${sectionId}: ${section.label}`);
  console.log(`📝  ${plainText.length} chars · ${VOICE_NAME} · ${MODEL_ID}`);
  process.stdout.write(`   ... `);

  try {
    const wav = await synthesize(section.text, apiKey, VOICE_NAME);
    const outPath = path.join(AUDIO_DIR, `section-${sectionId}.wav`);
    await fs.writeFile(outPath, wav);
    const kb = (wav.length / 1024).toFixed(1);
    console.log(`✓ ${kb} KB`);

    // Load existing manifest, update only this section, save
    const manifestPath = path.join(AUDIO_DIR, "manifest.json");
    let manifest = { voice: `Gemini:${MODEL_ID}:${VOICE_NAME}`, sections: [] };
    try {
      manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));
    } catch {
      /* fresh manifest */
    }

    const newSectionEntry = {
      id: sectionId,
      label: section.label,
      file: `section-${sectionId}.wav`,
      sizeKB: parseFloat(kb),
      text: section.text.trim(),
      wordCount: section.text.trim().split(/\s+/).filter(Boolean).length,
    };

    // Rebuild manifest sections — keep existing + replace/add current one
    const allSectionsMap = new Map();
    for (const s of manifest.sections || []) allSectionsMap.set(s.id, s);
    allSectionsMap.set(sectionId, newSectionEntry);
    // Sort by ID
    const sortedSections = Array.from(allSectionsMap.values()).sort((a, b) =>
      a.id.localeCompare(b.id),
    );

    // Rebuild categories from CATEGORIES + sortedSections
    const categories = CATEGORIES.map((cat) => ({
      label: cat.label,
      emoji: cat.emoji,
      sectionIds: sortedSections
        .filter((s) => {
          const n = parseInt(s.id, 10);
          return n >= cat.range[0] && n <= cat.range[1];
        })
        .map((s) => s.id),
    })).filter((cat) => cat.sectionIds.length > 0);

    manifest = {
      voice: `Gemini:${MODEL_ID}:${VOICE_NAME}`,
      categories,
      sections: sortedSections,
    };

    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`📋 Manifest updated — ${sortedSections.length} sections total`);
    console.log(`\n✅ Done. Refresh browser to test.`);
  } catch (e) {
    console.log(`✗`);
    console.error(`\n❌ ${e.message}`);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
