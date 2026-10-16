import "server-only";

import { ArticleStatus, SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";

import { embedTexts } from "./embed-texts";
import type { EmbeddedChunk } from "./get-embedded-chunks";

/** Atlas Vector Search index on `article_chunks` — created by `scratch/modo-vector-index.mjs`. */
const VECTOR_INDEX = "chunk_vector";
/** Chunks handed to the reranker's shortlist; retrieval keeps its own top-10 out of these. */
const CANDIDATE_LIMIT = 40;
const NUM_CANDIDATES = 200;

/** An article the answer may cite, with the partner behind it — enough to render the card. */
export interface CorpusArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  client: {
    name: string;
    slug: string;
    ctaMode: string;
    industryId: string | null;
    logo: string | null;
    city: string | null;
    credential: string | null;
    isVerified: boolean;
  };
}

export interface CorpusSearch {
  /** The question's embedding — passed on so retrieval does not pay for it twice. */
  queryEmbedding: number[] | null;
  /** Closest chunks first, only from articles a visitor may read right now. */
  chunks: EmbeddedChunk[];
  articles: CorpusArticle[];
}

/**
 * **مودو يبحث في كل المقالات المنشورة** — لا في آخر ٣٠ مقالاً من صناعةٍ واحدة.
 *
 * خالد (١٦ أكتوبر ٢٠٢٦): «مودو المفروض يبحث في الارتكلز الموجودة عندنا، مش شرط تكون في الصناعات…
 * المعلومة تكون موجودة في أكثر من ارتكل». وقيس قبلها: سؤال CBC دخل صناعةً بلا مقالات فأجاب «ما عندي
 * جواب»، والصناعة الصحيحة كانت تُقرأ منها آخر ٣٠ مقالاً من ١٥٤.
 *
 * البحثُ فهرسُ Atlas Vector Search على أجزاء المقالات المخزّنة (`get-embedded-chunks.ts`)، فلا تُحمَّل
 * متّجهاتُ المكتبة كلّها في كلّ سؤال. ثمّ يُصفّى الناتج: مقالٌ منشور، حلّ موعده، لشريكٍ نشط — نفس
 * شروط ما يراه الزائر. وأجزاء الأسئلة الشائعة (`kind: "faq"`) تبقى في نطاق صناعتها كما كانت.
 */
export async function searchAllArticles(query: string): Promise<CorpusSearch> {
  const empty: CorpusSearch = { queryEmbedding: null, chunks: [], articles: [] };
  const [queryEmbedding] = await embedTexts([query], "search_query");
  if (!queryEmbedding) return empty;

  const raw = (await db.articleChunk.aggregateRaw({
    pipeline: [
      {
        $vectorSearch: {
          index: VECTOR_INDEX,
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: NUM_CANDIDATES,
          limit: CANDIDATE_LIMIT,
          filter: { kind: { $ne: "faq" } },
        },
      },
      { $project: { _id: 0, articleId: 1, text: 1, embedding: 1 } },
    ],
  })) as unknown as { articleId: { $oid: string } | string; text: string; embedding: number[] }[];

  const hits = raw.map((r) => ({
    articleId: typeof r.articleId === "string" ? r.articleId : r.articleId.$oid,
    text: r.text,
    embedding: r.embedding,
  }));
  if (!hits.length) return { ...empty, queryEmbedding };

  const rows = await db.article.findMany({
    where: {
      id: { in: [...new Set(hits.map((h) => h.articleId))] },
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
      client: { subscriptionStatus: SubscriptionStatus.ACTIVE },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      client: {
        select: {
          name: true,
          slug: true,
          ctaMode: true,
          industryId: true,
          addressCity: true,
          isVerified: true,
          logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
          credentials: { select: { name: true } },
        },
      },
    },
  });

  const articles: CorpusArticle[] = rows.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    client: {
      name: a.client.name,
      slug: a.client.slug,
      ctaMode: a.client.ctaMode,
      industryId: a.client.industryId,
      logo: mediaSrc(a.client.logoMedia) || null,
      city: a.client.addressCity,
      credential: a.client.credentials[0]?.name?.trim() || null,
      isVerified: a.client.isVerified,
    },
  }));
  const titleById = new Map(articles.map((a) => [a.id, a.title]));

  return {
    queryEmbedding,
    chunks: hits
      .filter((h) => titleById.has(h.articleId))
      .map((h) => ({ ...h, articleTitle: titleById.get(h.articleId)! })),
    articles,
  };
}
