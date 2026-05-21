/**
 * Rebuilds manifest.json (text + word count) without re-calling Azure.
 * Use after editing script.md if MP3s are already generated.
 * Run: node scripts/rebuild-pitch-manifest.mjs
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONSOLE_ROOT = path.resolve(__dirname, "..");
const SCRIPT_PATH = path.join(
  CONSOLE_ROOT, "app", "help", "console", "voice-script", "script.md",
);
const AUDIO_DIR = path.join(CONSOLE_ROOT, "public", "help", "audio", "sales-pitch");

async function parseSections() {
  const md = await fs.readFile(SCRIPT_PATH, "utf-8");
  const lines = md.split("\n");
  const sections = [];
  let current = null;
  for (const line of lines) {
    const headerMatch = line.match(/^##\s+\[([^\]]+)\]/);
    if (headerMatch) {
      if (current && current.text.trim()) sections.push(current);
      current = { id: String(sections.length + 1).padStart(2, "0"), label: headerMatch[1].trim(), text: "" };
      continue;
    }
    if (line.startsWith("## End")) {
      if (current && current.text.trim()) sections.push(current);
      current = null;
      break;
    }
    if (line.startsWith("---") || line.startsWith("#")) continue;
    if (current) {
      const clean = line.replace(/\*\*/g, "").replace(/^\s*>\s*/, "").replace(/^«|»$/g, "").trim();
      if (clean) current.text += clean + " ";
    }
  }
  return sections;
}

async function main() {
  const sections = await parseSections();
  const manifest = [];
  for (const sec of sections) {
    const filePath = path.join(AUDIO_DIR, `section-${sec.id}.mp3`);
    let sizeKB = 0;
    try {
      const stat = await fs.stat(filePath);
      sizeKB = parseFloat((stat.size / 1024).toFixed(1));
    } catch {
      console.warn(`⚠️  Missing audio file: section-${sec.id}.mp3`);
    }
    manifest.push({
      id: sec.id,
      label: sec.label,
      file: `section-${sec.id}.mp3`,
      sizeKB,
      text: sec.text.trim(),
      wordCount: sec.text.trim().split(/\s+/).length,
    });
  }
  await fs.writeFile(
    path.join(AUDIO_DIR, "manifest.json"),
    JSON.stringify({ voice: "ar-SA-HamedNeural", sections: manifest }, null, 2),
  );
  console.log(`✅ Manifest rebuilt with ${sections.length} sections (text included).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
