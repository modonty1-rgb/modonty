#!/usr/bin/env node
/**
 * ────────────────────────────────────────────────────────────────────────────
 *  MODONTY · /story page · Audio Section Generator
 * ────────────────────────────────────────────────────────────────────────────
 *
 *  Generates ONE (or ALL) audio section(s) for the /story page on modonty.com
 *  via Google Gemini TTS (Kore voice).
 *
 *  Source of truth :  modonty/public/help/audio/general-pitch/manifest.json
 *  Output          :  modonty/public/help/audio/general-pitch/section-XX.wav
 *  Voice           :  Gemini 2.5 Flash TTS · "Kore" voice · 24kHz PCM → WAV
 *
 *  Usage:
 *    pnpm gen:section <id>     # generate one section by id (e.g. "20")
 *    pnpm gen:section all      # regenerate ALL sections (use with caution)
 *
 *  Pipeline (per section):
 *    1. Read manifest, find section by id
 *    2. Strip tashkeel from text
 *    3. Call Gemini Kore TTS
 *    4. Convert PCM → WAV (24kHz, mono, 16-bit)
 *    5. Remove old .wav (if exists)
 *    6. Write new .wav
 *    7. Update manifest: file, sizeKB, voiceId="kore"
 *
 *  Requires: GEMINI_API_KEY in .env.shared (monorepo root) OR .env.local
 * ────────────────────────────────────────────────────────────────────────────
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ─── PATHS ──────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODONTY_ROOT = path.resolve(__dirname, "..");
const MONOREPO_ROOT = path.resolve(MODONTY_ROOT, "..");
const MANIFEST_PATH = path.join(
  MODONTY_ROOT,
  "public",
  "help",
  "audio",
  "general-pitch",
  "manifest.json",
);
const AUDIO_DIR = path.dirname(MANIFEST_PATH);
const ENV_PATHS = [
  path.join(MODONTY_ROOT, ".env.local"),
  path.join(MONOREPO_ROOT, ".env.shared"),
];

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const VOICE_NAME = "Kore";
const VOICE_ID = "kore";
const MODEL_ID = "gemini-2.5-flash-preview-tts";
const TASHKEEL_REGEX = /[\u064B-\u0652\u0670\u0656-\u065F]/g;

// ─── HELPERS ────────────────────────────────────────────────────────────────
const stripTashkeel = (s) => s.replace(TASHKEEL_REGEX, "");

async function loadEnv() {
  for (const p of ENV_PATHS) {
    try {
      const text = await fs.readFile(p, "utf-8");
      for (const line of text.split("\n")) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
        }
      }
    } catch {
      // file may not exist — skip silently
    }
  }
}

function pcmToWav(pcm, sampleRate = 24000) {
  const channels = 1;
  const bits = 16;
  const byteRate = (sampleRate * channels * bits) / 8;
  const blockAlign = (channels * bits) / 8;
  const wav = Buffer.alloc(44 + pcm.length);
  let o = 0;
  wav.write("RIFF", o); o += 4;
  wav.writeUInt32LE(36 + pcm.length, o); o += 4;
  wav.write("WAVE", o); o += 4;
  wav.write("fmt ", o); o += 4;
  wav.writeUInt32LE(16, o); o += 4;
  wav.writeUInt16LE(1, o); o += 2;
  wav.writeUInt16LE(channels, o); o += 2;
  wav.writeUInt32LE(sampleRate, o); o += 4;
  wav.writeUInt32LE(byteRate, o); o += 4;
  wav.writeUInt16LE(blockAlign, o); o += 2;
  wav.writeUInt16LE(bits, o); o += 2;
  wav.write("data", o); o += 4;
  wav.writeUInt32LE(pcm.length, o); o += 4;
  pcm.copy(wav, o);
  return wav;
}

async function synthesize(text, apiKey) {
  const plain = stripTashkeel(text).trim();
  if (!plain) throw new Error("Text is empty after stripping tashkeel");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: plain }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } },
      },
    },
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Gemini ${resp.status}: ${errText.slice(0, 400)}`);
  }
  const data = await resp.json();
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error(`No audio in response: ${JSON.stringify(data).slice(0, 300)}`);
  const sr = parseInt(
    (part.inlineData.mimeType || "").match(/rate=(\d+)/)?.[1] ?? "24000",
    10,
  );
  return pcmToWav(Buffer.from(part.inlineData.data, "base64"), sr);
}

async function generateOne(manifest, sectionId) {
  const sec = manifest.sections.find((s) => s.id === sectionId);
  if (!sec) {
    const ids = manifest.sections.map((s) => s.id).join(", ");
    throw new Error(`Section "${sectionId}" not found. Available: ${ids}`);
  }
  if (!sec.text || !sec.text.trim()) {
    throw new Error(`Section "${sectionId}" has empty text`);
  }

  const plainLen = stripTashkeel(sec.text).trim().length;
  console.log(`🎙️  Section ${sectionId} · ${plainLen} chars · ${VOICE_NAME}`);

  const t0 = Date.now();
  const wav = await synthesize(sec.text, process.env.GEMINI_API_KEY);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  const filename = `section-${sectionId}.wav`;
  const outPath = path.join(AUDIO_DIR, filename);

  // Cleanup: remove old file if exists (avoids stale cache + clear signal)
  try {
    await fs.unlink(outPath);
    console.log(`   🧹 removed old ${filename}`);
  } catch {
    /* file didn't exist — fine */
  }

  await fs.writeFile(outPath, wav);
  const sizeKB = Math.round((wav.length / 1024) * 10) / 10;

  sec.file = filename;
  sec.sizeKB = sizeKB;
  sec.voiceId = VOICE_ID;

  console.log(`   ✅ ${filename} · ${sizeKB} KB · ${elapsed}s`);
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("❌ Usage: pnpm gen:section <id|all>");
    console.error("   Example: pnpm gen:section 20");
    process.exit(1);
  }

  await loadEnv();
  if (!process.env.GEMINI_API_KEY) {
    console.error(
      "❌ GEMINI_API_KEY missing. Add to .env.shared or modonty/.env.local",
    );
    process.exit(1);
  }

  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
  await fs.mkdir(AUDIO_DIR, { recursive: true });

  const ids =
    arg === "all"
      ? manifest.sections.map((s) => s.id)
      : [String(arg).padStart(2, "0")];

  console.log(`📦 Generating ${ids.length} section(s)...`);
  const t0 = Date.now();

  for (const id of ids) {
    try {
      await generateOne(manifest, id);
    } catch (err) {
      console.error(`   ❌ ${id}: ${err.message}`);
      // continue with next section instead of crashing the whole batch
    }
  }

  // Save manifest ONCE at the end (atomic)
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  const total = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n✨ Done in ${total}s · manifest updated`);
}

main().catch((err) => {
  console.error("\n❌ Fatal:", err.message);
  process.exit(1);
});
