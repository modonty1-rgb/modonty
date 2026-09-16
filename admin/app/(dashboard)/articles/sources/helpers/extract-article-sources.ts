import { db } from "@/lib/db";

/**
 * كل رابطٍ خارجيّ في كل مقال — بكل حالاته لا المنشورة وحدها (خالد ١٦ سبتمبر ٢٠٢٦).
 *
 * السبب: المسوّدة الّتي فيها مصدرٌ رديء ستُنشر غداً. فالجرد الّذي يقرأ المنشور فقط
 * يمسك العطل بعد وقوعه، والّذي يقرأ الكلّ يمسكه قبله.
 *
 * والقراءة من `content` مباشرةً لا من جدولٍ للمصادر: المصادر ليست حقلاً في السكيما،
 * هي روابط `<a>` داخل نصّ المقال. فالاستخراج بتعبيرٍ نمطيّ هو الطريق الوحيد.
 */

export interface SourceUse {
  /** معرّف المقال — للربط بصفحته. */
  articleId: string;
  articleTitle: string;
  articleStatus: string;
  /** الرابط كما هو في النصّ. */
  href: string;
  /** نصّ الرابط الظاهر للقارئ. */
  anchor: string;
  /** هل يحمل `rel="nofollow"`؟ */
  nofollow: boolean;
}

export interface SourceDomain {
  domain: string;
  /** عدد مرّات الظهور في كل المقالات. */
  uses: number;
  /** عدد المقالات المختلفة الّتي تستعمله. */
  articles: number;
  /** كم رابطاً منها بلا `nofollow` — وهي الّتي تمرّر ثقةً للمصدر. */
  followed: number;
  samples: SourceUse[];
}

/** روابطٌ داخليّة لا تُحسب مصادر. */
const OWN = /(^|\.)modonty\.com$/i;

function hostOf(href: string): string | null {
  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

/**
 * يقرأ كل المقالات ويجمع نطاقاتها الخارجيّة.
 *
 * `content` حقلٌ كبير، فالقراءة تنتقي ما تحتاجه فقط وتُحدّ بـ`take` كي لا تُسحب
 * القاعدة كلّها إلى الذاكرة دفعةً واحدة.
 */
export async function extractArticleSources(): Promise<{
  domains: SourceDomain[];
  totalArticles: number;
  totalLinks: number;
}> {
  const articles = await db.article.findMany({
    select: { id: true, title: true, status: true, content: true },
    take: 2000,
  });

  const map = new Map<string, SourceDomain>();
  let totalLinks = 0;

  for (const article of articles) {
    const content = article.content ?? "";
    const seenInThisArticle = new Set<string>();

    for (const match of content.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
      const attrs = match[1] ?? "";
      const hrefMatch = attrs.match(/href\s*=\s*["']([^"']+)["']/i);
      if (!hrefMatch) continue;

      const domain = hostOf(hrefMatch[1]);
      if (!domain || OWN.test(domain)) continue;

      totalLinks++;
      const entry = map.get(domain) ?? {
        domain,
        uses: 0,
        articles: 0,
        followed: 0,
        samples: [],
      };

      const nofollow = /rel\s*=\s*["'][^"']*nofollow/i.test(attrs);
      entry.uses++;
      if (!nofollow) entry.followed++;
      if (!seenInThisArticle.has(domain)) {
        entry.articles++;
        seenInThisArticle.add(domain);
      }
      if (entry.samples.length < 8) {
        entry.samples.push({
          articleId: article.id,
          articleTitle: article.title,
          articleStatus: article.status,
          href: hrefMatch[1],
          anchor: (match[2] ?? "").replace(/<[^>]*>/g, "").trim().slice(0, 80),
          nofollow,
        });
      }
      map.set(domain, entry);
    }
  }

  return {
    domains: [...map.values()].sort((a, b) => b.uses - a.uses),
    totalArticles: articles.length,
    totalLinks,
  };
}
