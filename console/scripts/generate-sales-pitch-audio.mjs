/**
 * Generates MP3 audio for the sales-pitch script using ElevenLabs TTS.
 * Voice: Hazem (Polished Arabic Customer Care) — clean Saudi/Gulf accent.
 *
 * Reads sections from: console/app/help/console/voice-script/script.md
 * Output: console/public/help/audio/sales-pitch/section-XX.mp3 (one per section)
 *
 * Run: node scripts/generate-sales-pitch-audio.mjs
 *
 * NOTE: ElevenLabs handles Arabic natively and pronounces correctly WITHOUT
 * needing tashkeel. We strip tashkeel before sending — cleaner pronunciation.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONSOLE_ROOT = path.resolve(__dirname, "..");
const SCRIPT_PATH = path.join(
  CONSOLE_ROOT,
  "app",
  "help",
  "console",
  "voice-script",
  "script.md",
);
const AUDIO_DIR = path.join(
  CONSOLE_ROOT,
  "public",
  "help",
  "audio",
  "sales-pitch",
);
const ENV_PATH = path.join(CONSOLE_ROOT, ".env.local");

const TASHKEEL_REGEX = /[\u064B-\u0652\u0670\u0656-\u065F]/g;
const stripTashkeel = (s) => s.replace(TASHKEEL_REGEX, "");

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

async function synthesize(text, voiceId, apiKey) {
  // Strip tashkeel — ElevenLabs reads plain Arabic correctly and the tashkeel
  // marks can actually CONFUSE the voice (over-articulation).
  const plainText = stripTashkeel(text).trim();

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
        text: plainText,
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
    throw new Error(`ElevenLabs ${response.status}: ${err}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const env = await loadEnv();
  const apiKey = env.ELEVENLABS_API_KEY;
  const voiceId = env.ELEVENLABS_VOICE_ID;

  if (!apiKey) {
    console.error("❌ Missing ELEVENLABS_API_KEY in console/.env.local");
    process.exit(1);
  }
  if (!voiceId) {
    console.error("❌ Missing ELEVENLABS_VOICE_ID in console/.env.local");
    process.exit(1);
  }

  const sections = await parseSections();
  await fs.mkdir(AUDIO_DIR, { recursive: true });

  console.log(`🎙️  Generating ${sections.length} sales-pitch MP3s via ElevenLabs`);
  console.log(`🎤  Voice ID: ${voiceId}`);
  console.log(`📁  Output: ${AUDIO_DIR}\n`);

  let done = 0;
  let failed = 0;
  const manifest = [];
  let totalChars = 0;

  for (const sec of sections) {
    const outPath = path.join(AUDIO_DIR, `section-${sec.id}.mp3`);
    const plainText = stripTashkeel(sec.text).trim();
    totalChars += plainText.length;
    try {
      process.stdout.write(
        `  [${(++done).toString().padStart(2, " ")}/${sections.length}] ${sec.id} (${plainText.length} chars) ... `,
      );
      const audio = await synthesize(sec.text, voiceId, apiKey);
      await fs.writeFile(outPath, audio);
      const kb = (audio.length / 1024).toFixed(1);
      console.log(`✓ ${kb} KB`);
      manifest.push({
        id: sec.id,
        label: sec.label,
        file: `section-${sec.id}.mp3`,
        sizeKB: parseFloat(kb),
        text: sec.text.trim(),
        wordCount: sec.text.trim().split(/\s+/).length,
      });
    } catch (e) {
      failed++;
      console.log(`✗ ${e.message}`);
    }
    // Small delay between requests (ElevenLabs is rate-limited)
    await new Promise((r) => setTimeout(r, 250));
  }

  await fs.writeFile(
    path.join(AUDIO_DIR, "manifest.json"),
    JSON.stringify(
      { voice: `ElevenLabs:${voiceId}`, sections: manifest },
      null,
      2,
    ),
  );

  console.log(`\n✅ Done: ${done - failed} succeeded, ${failed} failed`);
  console.log(`📊 Total characters: ${totalChars} (credits consumed)`);
  console.log(
    `💳 Free tier remaining ~ ${Math.max(0, 10000 - totalChars)} chars`,
  );
  console.log(`📋 Manifest: ${path.join(AUDIO_DIR, "manifest.json")}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
