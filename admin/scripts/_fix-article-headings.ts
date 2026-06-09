/**
 * TEMP one-off — convert bold-paragraph pseudo-headings (<p><strong>…</strong></p>)
 * into semantic <h2>/<h3> on a single article, so the Table of Contents + TL;DR +
 * SEO heading hierarchy work.
 *
 * Dry-run by default (prints the detected outline, writes NOTHING).
 * Pass --write to persist. Original content is backed up to c:\tmp first.
 *
 * Run:  pnpm --filter @modonty/admin exec tsx scripts/_fix-article-headings.ts
 *       pnpm --filter @modonty/admin exec tsx scripts/_fix-article-headings.ts --write
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load root .env.shared then admin/.env (DATABASE_URL wins from these).
for (const envPath of [resolve(__dirname, "../../.env.shared"), resolve(__dirname, "../.env")]) {
  try {
    const envFile = readFileSync(envPath, "utf-8");
    envFile.split("\n").forEach((line) => {
      if (line.trim().startsWith("#") || !line.includes("=")) return;
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        const k = key.trim();
        const v = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        if (!process.env[k] || k === "DATABASE_URL") process.env[k] = v;
      }
    });
  } catch {}
}

const SLUG = "ماهى-محركات-البحث-مثل-google-ولماذا-لاتظهر-بعض-المواقع-فى-نتائج-البحث";
const WRITE = process.argv.includes("--write");

// After reviewing the dry-run outline, list the 1-based indexes that should be <h3>
// (sub-headings). Everything else becomes <h2>. Empty = all <h2>.
const H3_INDEXES = new Set<number>([3, 4, 5, 7, 8, 9, 10]);

// A <p> whose ENTIRE content is a single <strong>/<b> run = a pseudo-heading.
// (won't match "<p><strong>lead-in:</strong> sentence</p>" — that keeps real text after the bold)
const HEADING_RE =
  /<p\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi;

function plain(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

const db = new PrismaClient();

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  const masked = url.replace(/(mongodb\+srv:\/\/)[^@]+@/, "$1***:***@");
  console.log(`DB: ${masked}`);
  if (!url.includes("modonty_dev")) {
    console.error("❌ ABORT — DB is not modonty_dev");
    process.exit(1);
  }

  const article = await db.article.findFirst({
    where: { slug: SLUG },
    select: { id: true, title: true, content: true },
  });
  if (!article) {
    console.error(`❌ Article not found for slug: ${SLUG}`);
    process.exit(1);
  }

  const content = article.content;
  const existingH2 = (content.match(/<h2\b/gi) || []).length;
  const existingH3 = (content.match(/<h3\b/gi) || []).length;
  const matches = [...content.matchAll(HEADING_RE)];

  console.log(`\nArticle: ${article.title}`);
  console.log(`id: ${article.id}`);
  console.log(`content length: ${content.length}`);
  console.log(`existing semantic headings → h2: ${existingH2} · h3: ${existingH3}`);
  console.log(`bold-paragraph pseudo-headings detected: ${matches.length}\n`);

  matches.forEach((m, i) => {
    const tag = H3_INDEXES.has(i + 1) ? "h3" : "h2";
    console.log(`  ${String(i + 1).padStart(2, " ")}. [${tag}] ${plain(m[2]).slice(0, 80)}`);
  });

  let idx = 0;
  const newContent = content.replace(HEADING_RE, (_full, _tag, inner) => {
    idx += 1;
    const tag = H3_INDEXES.has(idx) ? "h3" : "h2";
    return `<${tag}>${String(inner).trim()}</${tag}>`;
  });

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `c:\\tmp\\article-headings-backup-${ts}.html`;
  const previewPath = `c:\\tmp\\article-headings-preview-${ts}.html`;
  writeFileSync(backupPath, content, "utf-8");
  writeFileSync(previewPath, newContent, "utf-8");
  console.log(`\n💾 original backup → ${backupPath}`);
  console.log(`👁  transformed preview → ${previewPath}`);

  if (!WRITE) {
    console.log(`\n🔎 DRY RUN — nothing written to DB. Re-run with --write to persist.`);
    return;
  }

  await db.article.update({ where: { id: article.id }, data: { content: newContent } });
  console.log(`\n✅ WROTE ${matches.length} semantic headings to article ${article.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
