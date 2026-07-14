/**
 * Dynamic llms.txt (llmstxt.org format) — replaces the static public/llms.txt that
 * went stale the day it was written (GEO audit 2026-07-13, بند ٤: frozen since
 * 2026-06-02, blind to every article published after it).
 *
 * Honesty note: Google Search officially IGNORES llms.txt (ai-optimization-guide).
 * We keep it for everyone else — answer engines and agents that do read it — and a
 * stale index is worse than none, so it now builds itself from the database.
 *
 * ⚠️ Next.js throws "conflicting public file and page file" if public/llms.txt still
 * exists — the static file MUST be deleted for this route to build.
 */
import { ArticleStatus, SubscriptionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/brand";

/** Markdown link labels break on square brackets — swap them, keep everything else. */
function mdText(s: string): string {
  return s.replace(/\[/g, "(").replace(/\]/g, ")").trim();
}

export async function GET() {
  const [articles, categories, industries, clients] = await Promise.all([
    db.article.findMany({
      // Same scheduled-article guard as sitemap/feed: future datePublished stays hidden.
      where: {
        status: ArticleStatus.PUBLISHED,
        OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
      },
      select: { title: true, slug: true, excerpt: true, datePublished: true },
      orderBy: { datePublished: "desc" },
      take: 20,
    }),
    db.category.findMany({ select: { name: true, slug: true }, orderBy: { name: "asc" }, take: 50 }),
    db.industry.findMany({ select: { name: true, slug: true }, orderBy: { name: "asc" }, take: 50 }),
    db.client.findMany({
      where: { subscriptionStatus: SubscriptionStatus.ACTIVE },
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
      take: 100,
    }),
  ]);

  const articleLines = articles.map((a) => {
    const desc = a.excerpt ? `: ${mdText(a.excerpt).slice(0, 120)}` : "";
    return `- [${mdText(a.title)}](${SITE_URL}/articles/${encodeURIComponent(a.slug)})${desc}`;
  });
  const categoryLines = categories.map(
    (c) => `- [${mdText(c.name)}](${SITE_URL}/categories/${encodeURIComponent(c.slug)})`
  );
  const industryLines = industries.map(
    (i) => `- [${mdText(i.name)}](${SITE_URL}/industries/${encodeURIComponent(i.slug)})`
  );
  const clientLines = clients.map(
    (c) => `- [${mdText(c.name)}](${SITE_URL}/clients/${encodeURIComponent(c.slug)})`
  );

  const body = `# Modonty

> Modonty (مدونتي) is a bilingual Arabic-first content platform and business directory focused on Saudi Arabia and Egypt. We publish SEO-optimized articles and detailed business profiles for Arabic-speaking audiences.

Modonty connects businesses with readers through high-quality content, structured data, and industry-specific classification. The platform supports Organization and LocalBusiness profiles with full contact, address, and social media integration.

- Primary language: Arabic (ar-SA)
- Secondary: Arabic Egypt (ar-EG)
- Content types: Articles, Business Profiles, Categories, Industries, Tags, FAQ
- Structured data: JSON-LD (Article, Organization, LocalBusiness, FAQPage, CollectionPage, BreadcrumbList, Person)

## Main Pages

- [Homepage](${SITE_URL}/): Featured articles, trending content, and platform overview
- [Categories](${SITE_URL}/categories): Browse all article categories
- [Clients](${SITE_URL}/clients): Business directory with detailed profiles
- [Trending](${SITE_URL}/trending): Most popular articles
- [About](${SITE_URL}/about): About the platform
- [Contact](${SITE_URL}/contact): Contact page
- [FAQ](${SITE_URL}/help/faq): Frequently asked questions

## Latest Articles

${articleLines.join("\n")}

## Categories

${categoryLines.join("\n")}

## Industries

${industryLines.join("\n")}

## Business Directory (${clients.length} active)

${clientLines.join("\n")}

## Legal

- [Terms of Service](${SITE_URL}/legal/user-agreement)
- [Privacy Policy](${SITE_URL}/legal/privacy-policy)
- [Cookie Policy](${SITE_URL}/legal/cookie-policy)
- [Copyright Policy](${SITE_URL}/legal/copyright-policy)

## Optional

- [Full Documentation](${SITE_URL}/llms-full.txt): Extended platform documentation
- [RSS Feed](${SITE_URL}/feed.xml): Latest published articles
- [Subscribe](${SITE_URL}/subscribe): Newsletter subscription
- [Sitemap](${SITE_URL}/sitemap.xml)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Same caching contract as image-sitemap: fresh within the hour, never blocking.
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
