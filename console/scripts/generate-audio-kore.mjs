/**
 * Generates audio for general-pitch sections using Gemini 2.5 Flash TTS (Kore voice).
 * Saves WAV files (24kHz PCM) — modern browsers play WAV natively via <audio>.
 *
 * Reads section text from: console/public/help/audio/general-pitch/manifest.json
 * Writes WAV to:           console/public/help/audio/general-pitch/section-XX.wav
 * Updates manifest:        sets `file` to `section-XX.wav` for the generated section.
 *
 * Usage:
 *   node scripts/generate-audio-kore.mjs           # all sections
 *   node scripts/generate-audio-kore.mjs 06        # one section by id
 *   node scripts/generate-audio-kore.mjs 06 13 14  # multiple
 *
 * Requires: GEMINI_API_KEY in console/.env.local
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

const MODEL = "gemini-2.5-flash-preview-tts";
const VOICE = "Kore";

async function loadEnv() {
  const text = await fs.readFile(ENV_PATH, "utf-8");
  const env = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

/** Wrap raw PCM 16-bit mono into a WAV container */
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

async function synthesize(text, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: VOICE },
        },
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
    throw new Error(`Gemini TTS ${resp.status}: ${err.slice(0, 300)}`);
  }
  const data = await resp.json();
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) {
    throw new Error(`No audio in response: ${JSON.stringify(data).slice(0, 300)}`);
  }
  const mimeType = part.inlineData.mimeType || "";
  const pcm = Buffer.from(part.inlineData.data, "base64");
  const rateMatch = mimeType.match(/rate=(\d+)/);
  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
  return pcmToWav(pcm, sampleRate);
}

async function main() {
  const env = await loadEnv();
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ Missing GEMINI_API_KEY in console/.env.local");
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

  console.log(`🎙️  Generating ${targets.length} section(s) via Gemini TTS`);
  console.log(`🎤  Voice: ${VOICE} (${MODEL})`);
  console.log(`📁  Output: ${AUDIO_DIR}\n`);

  let done = 0;
  let failed = 0;
  let totalChars = 0;

  for (const sec of targets) {
    const outPath = path.join(AUDIO_DIR, `section-${sec.id}.wav`);
    const text = sec.text.trim();
    totalChars += text.length;

    process.stdout.write(
      `  [${(++done).toString().padStart(2, " ")}/${targets.length}] ${sec.id} ${text.length} chars ... `,
    );
    try {
      const wav = await synthesize(text, apiKey);
      await fs.writeFile(outPath, wav);
      const kb = (wav.length / 1024).toFixed(1);
      console.log(`✓ ${kb} KB`);
      sec.file = `section-${sec.id}.wav`;
      sec.sizeKB = parseFloat(kb);
      sec.voiceId = "kore";
    } catch (e) {
      failed++;
      console.log(`✗ ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`\n✅ Done: ${done - failed} succeeded, ${failed} failed`);
  console.log(`📊 Characters: ${totalChars}`);
  console.log(`📋 Manifest updated: ${MANIFEST_PATH}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("❌", err.message);
    process.exit(1);
  });
}
