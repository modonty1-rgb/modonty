import { analyzeArticleSEO } from "../app/(dashboard)/articles/analyzer";
import { db } from "../lib/db";
import { getAllSettings } from "../app/(dashboard)/settings/actions/settings-actions";
import { getArticleDefaultsFromSettings } from "../app/(dashboard)/settings/helpers/get-article-defaults-from-settings";

const MIN_SEO_SCORE = 60;

async function run() {
  const articles = await db.article.findMany({
    include: {
      client: true,
      author: true,
      category: true,
      tags: { include: { tag: true } },
      faqs: true,
      featuredImage: true,
      gallery: { include: { media: true } },
    },
  });

  const settings = await getAllSettings();
  const defaults = getArticleDefaultsFromSettings(settings);

  console.log("=== SEO Publish Gate Test ===\n");

  for (const article of articles) {
    const merged = { ...article, ...defaults };
    const result = analyzeArticleSEO(merged as never);
    const canPublish = result.percentage >= MIN_SEO_SCORE;
    const icon = canPublish ? "✅" : "🚫";
    console.log(`${icon} "${article.title}" — ${result.percentage}% ${canPublish ? "(CAN publish)" : "(BLOCKED — below 60%)"}`);
  }

  // Test with minimal data (would be blocked)
  const minimalData = {
    title: "Test",
    slug: "test",
    content: "",
    clientId: "xxx",
    authorId: "",
    status: "WRITING",
  };
  const minResult = analyzeArticleSEO(minimalData as never);
  const icon = minResult.percentage >= MIN_SEO_SCORE ? "✅" : "🚫";
  console.log(`\n${icon} Empty article — ${minResult.percentage}% ${minResult.percentage >= MIN_SEO_SCORE ? "(CAN publish)" : "(BLOCKED — below 60%)"}`);

  await db.$disconnect();
}
run();
