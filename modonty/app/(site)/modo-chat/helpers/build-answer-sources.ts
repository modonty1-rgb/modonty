import type { DocumentForChat } from "../data/cohere-client";
import type { PartnerForCard } from "../data/get-industry-scope";

type ScopeArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  client: { name: string; slug: string; ctaMode: string };
};

/**
 * The partners behind the matched articles, with whether they take bookings — this is what
 * turns an answer into a lead. Naming a doctor in prose and stopping there gave the visitor
 * nothing to act on: measured live, Modo recommended a doctor with no link and no way to book.
 */
export function buildAnswerSources(
  dbDocs: DocumentForChat[],
  scopeArticles: ScopeArticle[],
  scopePartners: PartnerForCard[]
) {
  const sourceArticles: { id: string; title: string; slug: string; excerpt: string | null; client: { name: string; slug: string } }[] = [];
  const partnerBySlug = new Map(scopePartners.map((p) => [p.slug, p]));
  const partners: {
    name: string; slug: string; canBook: boolean; whyRecommended: string;
    logo: string | null; city: string | null; credential: string | null; isVerified: boolean;
  }[] = [];
  if (dbDocs.length > 0) {
    const articleByTitle = new Map(scopeArticles.map((a) => [a.title, a]));
    const seenArticle = new Set<string>();
    const seenPartner = new Set<string>();
    for (const doc of dbDocs) {
      const firstLine = doc.text.split("\n\n")[0]?.trim();
      const article = firstLine ? articleByTitle.get(firstLine) : undefined;
      if (!article || seenArticle.has(article.id)) continue;
      seenArticle.add(article.id);
      sourceArticles.push({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt ?? null,
        client: { name: article.client.name, slug: article.client.slug },
      });
      if (!seenPartner.has(article.client.slug)) {
        seenPartner.add(article.client.slug);
        const full = partnerBySlug.get(article.client.slug);
        partners.push({
          name: article.client.name,
          slug: article.client.slug,
          canBook: article.client.ctaMode !== "NONE",
          // The article is the evidence for the recommendation — Khalid's rule: partner first,
          // article as proof underneath it.
          whyRecommended: article.title,
          logo: full?.logo ?? null,
          city: full?.city ?? null,
          credential: full?.credential ?? null,
          isVerified: full?.isVerified ?? false,
        });
      }
    }
  }
  return { sourceArticles, partners };
}
