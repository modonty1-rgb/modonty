/**
 * Read-only development diagnostic for articles owned by Modonty's core client.
 *
 * Run from the repository root:
 *   node scripts/report-core-client-articles.mjs
 *
 * Environment precedence deliberately matches the applications:
 * .env.shared < modonty/.env < modonty/.env.local.
 * It performs no create, update, or delete operations.
 */
import { createRequire } from "node:module";
import { resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const requireFromModonty = createRequire(resolve(repositoryRoot, "modonty", "package.json"));
const { config } = requireFromModonty("dotenv");
const { PrismaClient } = requireFromModonty("@prisma/client");

for (const envFile of [
  resolve(repositoryRoot, ".env.shared"),
  resolve(repositoryRoot, "modonty", ".env"),
  resolve(repositoryRoot, "modonty", ".env.local"),
]) {
  config({ path: envFile, override: true, quiet: true });
}

const db = new PrismaClient();

function display(value) {
  return value?.trim() || "— فارغ —";
}

async function main() {
  console.log("Reading the local development database (read-only)…");

  const settings = await db.settings.findFirst({
    select: { coreClientId: true },
  });

  if (!settings?.coreClientId) {
    throw new Error("Settings.coreClientId غير مضبوط في قاعدة التطوير.");
  }

  const coreClient = await db.client.findUnique({
    where: { id: settings.coreClientId },
    select: { id: true, name: true, slug: true },
  });

  if (!coreClient) {
    throw new Error("Settings.coreClientId يشير إلى عميل غير موجود.");
  }

  const articles = await db.article.findMany({
    where: { clientId: coreClient.id },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      featured: true,
      datePublished: true,
      excerpt: true,
      seoDescription: true,
    },
    orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
  });

  const missingExcerpt = articles.filter((article) => !article.excerpt?.trim());
  const seoOnly = missingExcerpt.filter((article) => article.seoDescription?.trim());

  console.log("\nCORE CLIENT ARTICLE REPORT (development, read-only)");
  console.log(`Core client: ${coreClient.name} (${coreClient.slug})`);
  console.log(`Core client ID: ${coreClient.id}`);
  console.log(`Articles: ${articles.length}`);
  console.log(`Missing excerpt: ${missingExcerpt.length}`);
  console.log(`SEO description present but excerpt missing: ${seoOnly.length}\n`);

  for (const [index, article] of articles.entries()) {
    console.log(`${index + 1}. ${article.title}`);
    console.log(`   id: ${article.id}`);
    console.log(`   slug: ${article.slug}`);
    console.log(`   status: ${article.status} | featured: ${article.featured ? "yes" : "no"}`);
    console.log(`   published: ${article.datePublished?.toISOString() ?? "—"}`);
    console.log(`   excerpt: ${display(article.excerpt)}`);
    console.log(`   seoDescription: ${display(article.seoDescription)}`);
    console.log("");
  }
}

try {
  await main();
} finally {
  await db.$disconnect();
}
