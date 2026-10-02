import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

export interface ClientPublishedFAQ {
  id: string;
  question: string;
  answer: string;
  articleId: string;
  articleTitle: string;
  articleSlug: string;
}

export async function getClientPublishedFaqs(clientSlug: string): Promise<ClientPublishedFAQ[]> {
  const faqs = await db.articleFAQ.findMany({
    where: {
      status: "PUBLISHED",
      answer: { not: null },
      article: {
        client: { slug: clientSlug },
        status: "PUBLISHED",
      },
    },
    orderBy: { position: "asc" },
    take: 20,
    select: {
      id: true,
      question: true,
      answer: true,
      article: {
        select: { id: true, title: true, slug: true },
      },
    },
  });

  return faqs
    .filter((f) => f.answer && f.answer.trim())
    .map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer!,
      articleId: f.article.id,
      articleTitle: f.article.title,
      articleSlug: f.article.slug,
    }));
}

export interface ClientPageFAQ {
  id: string;
  question: string;
  answer: string;
}

/**
 * Page-level FAQ (ClientFAQ) shown on the client mini-site — distinct from the
 * article-aggregated FAQ above. PUBLISHED + answered only; powers the page FAQ
 * accordion and the FAQPage JSON-LD.
 */
export async function getClientPageFaqs(clientSlug: string): Promise<ClientPageFAQ[]> {
  "use cache";
  cacheTag("faqs");
  cacheTag("clients");
  // Hours, not minutes (plan أ٦, 2 Oct 2026). «minutes» was the stopgap for a console that
  // could not bust modonty's cache; it can now — every console write to reviews, the page FAQ
  // and the gallery goes through regenerateClientSeo(), which calls revalidateModontyTag
  // ("clients") (console/.../regenerate-client-seo.ts). Left at minutes, this one helper
  // capped the WHOLE partner page at a one-minute life: measured on prod, `X-Vercel-Cache:
  // STALE` with `Age` back to 0 within minutes, and a 2.1 s first byte for the unlucky visitor.
  cacheLife("hours");
  const faqs = await db.clientFAQ.findMany({
    where: {
      status: "PUBLISHED",
      answer: { not: null },
      client: { slug: clientSlug },
    },
    orderBy: { position: "asc" },
    take: 30,
    select: { id: true, question: true, answer: true },
  });

  return faqs
    .filter((f) => f.answer && f.answer.trim())
    .map((f) => ({ id: f.id, question: f.question, answer: f.answer! }));
}
