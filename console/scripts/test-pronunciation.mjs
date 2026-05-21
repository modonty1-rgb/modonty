/**
 * Pronunciation Test Tool — ElevenLabs
 *
 * Tests how a word sounds with different tashkeel/spelling variations
 * across our 3 voices (Hazem, Layla, Sana).
 *
 * Usage:
 *   # Test 4 variations of "مودونتي" with Hazem (default voice)
 *   node scripts/test-pronunciation.mjs مودونتي مُودُونْتِي مَوْدُونْتِي "مو دونتي"
 *
 *   # Test with specific voice
 *   node scripts/test-pronunciation.mjs --voice sana مودونتي مُودُونْتِي
 *
 *   # Test all 3 voices for each variation (more expensive)
 *   node scripts/test-pronunciation.mjs --voice all مودونتي مُودُونْتِي
 *
 *   # Wrap each variation in a sentence for context
 *   node scripts/test-pronunciation.mjs --context "أهلاً بك في X" مودونتي مُودُونْتِي
 *
 * Output:
 *   console/public/help/audio/pronunciation-test/{voice}-{idx}-{label}.mp3
 *
 * Requires: ELEVENLABS_API_KEY in console/.env.local
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONSOLE_ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(
  CONSOLE_ROOT,
  "public",
  "help",
  "audio",
  "pronunciation-test",
);
const ENV_PATH = path.join(CONSOLE_ROOT, ".env.local");

const VOICES = {
  hazem: "EGYKu1CV0vikeTYK5zoc",
  layla: "gVzwmdZzRgBrNjXaTmi5",
  sana: "mRdG9GYEjJmIzqbYTidv",
};

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

async function synthesize(text, voiceId, apiKey) {
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
        text,
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

function safeFilename(s) {
  // Strip tashkeel and non-filesystem-safe chars for a clean filename
  return stripTashkeel(s)
    .replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, "_")
    .slice(0, 30);
}

function parseArgs(argv) {
  const args = { voice: "hazem", context: null, variations: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--voice") {
      args.voice = argv[++i];
    } else if (a === "--context") {
      args.context = argv[++i];
    } else {
      args.variations.push(a);
    }
  }
  return args;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error("❌ Usage: node scripts/test-pronunciation.mjs [--voice hazem|layla|sana|all] [--context \"sentence with X\"] <variation1> <variation2> ...");
    console.error("   Example: node scripts/test-pronunciation.mjs مودونتي مُودُونْتِي مَوْدُونْتِي");
    process.exit(1);
  }

  const { voice, context, variations } = parseArgs(argv);

  if (variations.length === 0) {
    console.error("❌ Provide at least one variation to test");
    process.exit(1);
  }

  const voiceKeys = voice === "all" ? Object.keys(VOICES) : [voice];
  for (const v of voiceKeys) {
    if (!VOICES[v]) {
      console.error(`❌ Unknown voice "${v}". Available: ${Object.keys(VOICES).join(", ")}, all`);
      process.exit(1);
    }
  }

  const env = await loadEnv();
  const apiKey = env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("❌ Missing ELEVENLABS_API_KEY in console/.env.local");
    process.exit(1);
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  // Auto-clean old tests — keep only the current run (per Khalid's rule 2026-05-15)
  try {
    const oldFiles = await fs.readdir(OUT_DIR);
    for (const f of oldFiles) {
      if (f.endsWith(".mp3")) {
        await fs.unlink(path.join(OUT_DIR, f));
      }
    }
    if (oldFiles.some((f) => f.endsWith(".mp3"))) {
      console.log(`🧹 Cleaned old test files\n`);
    }
  } catch {
    /* folder empty or missing */
  }

  console.log(`🎙️  Pronunciation test`);
  console.log(`📝  Variations: ${variations.length}`);
  console.log(`🎤  Voices: ${voiceKeys.join(", ")}`);
  if (context) console.log(`📖  Context: "${context}"`);
  console.log(`📁  Output: ${OUT_DIR}\n`);

  let totalChars = 0;
  let totalGenerated = 0;

  for (const voiceKey of voiceKeys) {
    console.log(`\n── Voice: ${voiceKey} ──`);
    for (let i = 0; i < variations.length; i++) {
      const variant = variations[i];
      const text = context ? context.replace(/X/g, variant) : variant;
      const idx = String(i + 1).padStart(2, "0");
      const safeName = safeFilename(variant);
      const filename = `${voiceKey}-${idx}-${safeName}.mp3`;
      const outPath = path.join(OUT_DIR, filename);

      process.stdout.write(`  [${idx}] "${variant}" → ${filename} ... `);
      try {
        const audio = await synthesize(text, VOICES[voiceKey], apiKey);
        await fs.writeFile(outPath, audio);
        const kb = (audio.length / 1024).toFixed(1);
        console.log(`✓ ${kb} KB`);
        totalChars += text.length;
        totalGenerated++;
      } catch (e) {
        console.log(`✗ ${e.message}`);
      }
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  console.log(`\n✅ Done: ${totalGenerated} clips generated`);
  console.log(`📊 Characters used: ${totalChars}`);
  console.log(`📁 Open: ${OUT_DIR}`);
  console.log(`\n💡 Tip: Open each MP3 in order. The one that says the word RIGHT is the winner.`);
  console.log(`   When you pick a winner, tell Claude:`);
  console.log(`   "اعتمد التشكيل: <الكلمة بالتشكيل>"`);
  console.log(`   وأنا أبدّلها في كل المنظومة وأعيد توليد الصوت.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
