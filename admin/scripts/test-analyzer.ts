import { analyzeArticleSEO } from "../app/(dashboard)/articles/analyzer";
import { normalizeInput } from "../app/(dashboard)/articles/analyzer/article-seo-analyzer/normalize-input";
import { transformArticleToFormData } from "../app/(dashboard)/articles/helpers/article-form-helpers";
import { db } from "../lib/db";
import { getAllSettings } from "../app/(dashboard)/settings/actions/settings-actions";
import { getArticleDefaultsFromSettings } from "../app/(dashboard)/settings/helpers/get-article-defaults-from-settings";

async function run() {
  // Test all articles
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

  for (const article of articles) {
    const mergedArticle = { ...article, ...defaults };
    const resultArticle = analyzeArticleSEO(mergedArticle as never);

    const transformedData = transformArticleToFormData(article as never);
    const initialFormData = {
      title: '', slug: '', excerpt: '', content: '', clientId: '', categoryId: '', authorId: '',
      status: 'WRITING', seoTitle: '', seoDescription: '', metaRobots: 'index, follow',
      twitterCard: 'summary_large_image', canonicalUrl: '', sitemapPriority: 0.5,
      sitemapChangeFreq: 'weekly', featuredImageId: null, tags: [] as string[], faqs: [] as {question:string;answer:string}[],
    };
    const formData = { ...initialFormData, ...transformedData, ...defaults };
    const resultForm = analyzeArticleSEO(formData as never);

    const match = resultArticle.percentage === resultForm.percentage ? "✓" : "✗";
    console.log(`${match} "${article.title}" — View: ${resultArticle.percentage}% | Form: ${resultForm.percentage}%`);
  }

  await db.$disconnect();
}
run();
