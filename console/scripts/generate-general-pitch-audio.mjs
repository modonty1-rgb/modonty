/**
 * Generates MP3 audio for the /help/general sales-pitch using ElevenLabs TTS.
 * Multi-voice production — 3 voices assigned per section type:
 *   - Hazem  → sales/authority sections
 *   - Layla  → formal/religious sections (hadith, philosophy)
 *   - Sana   → warm/storytelling sections (welcome, story, vision)
 *
 * Reads sections from: console/public/help/audio/general-pitch/manifest.json
 * Writes MP3s to:      console/public/help/audio/general-pitch/section-XX.mp3
 * Updates manifest:    sets `file` to the generated MP3 filename per section.
 *
 * Usage:
 *   node scripts/generate-general-pitch-audio.mjs           # all sections
 *   node scripts/generate-general-pitch-audio.mjs 15        # one section by id
 *   node scripts/generate-general-pitch-audio.mjs 01 04 17  # multiple sections
 *
 * Requires: ELEVENLABS_API_KEY in console/.env.local
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONSOLE_ROOT = path.resolve(__dirname, "..");
const AUDIO_DIR = path.join(
  CONSOLE_ROOT,
  "public",
  "help",
  "audio",
  "general-pitch",
);
const MANIFEST_PATH = path.join(AUDIO_DIR, "manifest.json");
const ENV_PATH = path.join(CONSOLE_ROOT, ".env.local");

const TASHKEEL_REGEX = /[\u064B-\u0652\u0670\u0656-\u065F]/g;
const stripTashkeel = (s) => s.replace(TASHKEEL_REGEX, "");

// ─── VOICE ASSIGNMENT ─────────────────────────────────────────────────────────
// Per Khalid's direction (2026-05-14): dual-female + male production.
const VOICE_IDS = {
  hazem: "EGYKu1CV0vikeTYK5zoc", // Polished Arabic Customer Care — male, primary voice
  layla: "gVzwmdZzRgBrNjXaTmi5", // Formal MSA — female, religious/philosophical
  // Sana eliminated (2026-05-15) — voice too slow/monotone per Khalid's feedback
};

const VOICE_PER_SECTION = {
  // Layla — formal/religious only
  "03": "layla", // فلسفة الشعار
  "15": "layla", // فلسفة الحديث الشريف
  // Hazem — everything else (sales, storytelling, vision)
  "01": "hazem", // ترحيب
  "02": "hazem", // عملاء يبحثون
  "04": "hazem", // قصة مودونتي
  "05": "hazem", // أرض مستأجرة
  "06": "hazem", // وكالة
  "07": "hazem", // فريق داخلي
  "08": "hazem", // منظومتك الكاملة
  "12": "hazem", // منظومة سعودية
  "13": "hazem", // فريلانسر
  "14": "hazem", // كيف يشوفك Google
  "16": "hazem", // إعلانات ممولة
  "17": "hazem", // زائرك ممكن مش من بلدك
  "18": "hazem", // مودونتي 2030 — vision
};

// ──────────────────────────────────────────────────────────────────────────────

async function loadEnv() {
  const text = await fs.readFile(ENV_PATH, "utf-8");
  const env = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

async function synthesize(text, voiceId, apiKey) {
  // Keep tashkeel — it helps the voice pronounce specific words correctly
  // (e.g., the brand name مُدَوَّنَتِي). Stripping it broke the pronunciation.
  const cleanText = text.trim();
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    },
  );
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs ${response.status}: ${err.slice(0, 200)}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const env = await loadEnv();
  const apiKey = env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("❌ Missing ELEVENLABS_API_KEY in console/.env.local");
    process.exit(1);
  }

  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf-8"));
  await fs.mkdir(AUDIO_DIR, { recursive: true });

  const args = process.argv.slice(2);
  const filterIds =
    args.length > 0 ? new Set(args.map((a) => a.padStart(2, "0"))) : null;

  const targets = manifest.sections.filter((s) =>
    filterIds ? filterIds.has(s.id) : true,
  );

  if (filterIds && targets.length === 0) {
    console.error(`❌ No sections matched ids: ${[...filterIds].join(", ")}`);
    process.exit(1);
  }

  console.log(`🎙️  Generating ${targets.length} section(s) via ElevenLabs`);
  console.log(`🎤  Voices: Hazem · Layla · Sana`);
  console.log(`📁  Output: ${AUDIO_DIR}\n`);

  let done = 0;
  let failed = 0;
  let totalChars = 0;

  for (const sec of targets) {
    const voiceKey = VOICE_PER_SECTION[sec.id];
    if (!voiceKey) {
      console.log(`  [skip] ${sec.id} — no voice mapping`);
      continue;
    }
    const voiceId = VOICE_IDS[voiceKey];
    const outPath = path.join(AUDIO_DIR, `section-${sec.id}.mp3`);
    const plainText = stripTashkeel(sec.text).trim();
    totalChars += plainText.length;

    process.stdout.write(
      `  [${(++done).toString().padStart(2, " ")}/${targets.length}] ${sec.id} (${voiceKey.padEnd(5)}) ${plainText.length} chars ... `,
    );
    try {
      const audio = await synthesize(sec.text, voiceId, apiKey);
      await fs.writeFile(outPath, audio);
      const kb = (audio.length / 1024).toFixed(1);
      console.log(`✓ ${kb} KB`);
      sec.file = `section-${sec.id}.mp3`;
      sec.sizeKB = parseFloat(kb);
      sec.voiceId = voiceKey;
    } catch (e) {
      failed++;
      console.log(`✗ ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 300)); // small delay between requests
  }

  manifest.voice = `ElevenLabs:Hazem+Layla+Sana`;
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`\n✅ Done: ${done - failed} succeeded, ${failed} failed`);
  console.log(`📊 Characters used: ${totalChars}`);
  console.log(`📋 Manifest updated: ${MANIFEST_PATH}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
