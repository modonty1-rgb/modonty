import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { logAction, SYSTEM_ACTOR } from "@/lib/audit/log-action";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { submitToIndexNow } from "@/lib/indexnow";
import { assertArticlePublishable } from "@/lib/seo/assert-article-publishable";
import { loadSiteUrl } from "@/lib/seo/site-url";

/**
 * **نشرُ مقال — بابٌ واحدٌ للزرّ وللكرون.**
 *
 * خالد (٢٠ سبتمبر ٢٠٢٦): «المفروض إنّه ينضغط زرّ بَبلش» — أي أنّ الكرون يفعل ما يفعله
 * الموظّف بالضبط، لا شيئاً أقلّ.
 *
 * ── لماذا خرج من السيرفر أكشن ──
 * كان المنطقُ داخل `transitionArticleAction`، وأوّلُ سطرٍ فيه `if (!session) return
 * "Unauthorized"`. والكرون بلا جلسة — فالاستخراجُ شرطُ عمل لا تحسينُ ترتيب.
 *
 * ولو نسخ الكرونُ المنطقَ لنفسه لصار للنشر بابان: بابٌ يفحص السيو والالتزام، وبابٌ
 * ينشر بلا فحصٍ عند منتصف الليل. والبابُ الثاني يُكتشف بعد أن يُنشر ما لا يصحّ.
 *
 * ── وما تفعله ولا تفعله ──
 * تفحص · تنشر · تسجّل · تُحدّث الكاش. ولا تتحقّق من هويّة المنادي — ذاك عملُ المنادي
 * نفسِه: السيرفر أكشن يفحص الجلسة، والمسارُ يفحص `CRON_SECRET`.
 */
export type PublishResult =
  | { ok: true; to: ArticleStatus }
  | { ok: false; error: string };

export async function publishArticle(
  articleId: string,
  /** `cron` حين يجري بلا إنسان — يُكتب في سجلّ التدقيق بهويّةٍ صريحة. */
  actor: "staff" | "cron",
): Promise<PublishResult> {
  const article = await db.article.findUnique({
    where: { id: articleId },
    select: {
      id: true, status: true, slug: true, title: true, content: true,
      excerpt: true, seoTitle: true, seoDescription: true,
      clientId: true, isClientSiteArticle: true,
    },
  });
  if (!article) return { ok: false, error: "المقال غير موجود." };

  if (article.status !== ArticleStatus.SCHEDULED) {
    return { ok: false, error: `المقال في حالة ${article.status} لا «مجدول».` };
  }

  // الوجهةُ من المقال لا من المنادي: مقالُ موقع العميل لا يُنشر على مدونتي أبداً.
  const toStatus = article.isClientSiteArticle
    ? ArticleStatus.PUBLISHED_ON_CLIENT_SITE
    : ArticleStatus.PUBLISHED;

  // بوّابةُ الجودة — تولّد JSON-LD والميتا ثمّ تقيس السيو الحقيقيّ عليهما.
  const gate = await assertArticlePublishable(articleId);
  if (!gate.ok) return { ok: false, error: gate.error };

  if (article.clientId) {
    const { checkCompliance } = await import("@/lib/seo/pre-publish-audit");
    const client = await db.client.findUnique({
      where: { id: article.clientId },
      select: { forbiddenKeywords: true, forbiddenClaims: true, intake: true },
    });
    const compliance = checkCompliance(
      {
        title: article.title,
        content: article.content,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        excerpt: article.excerpt,
      },
      client,
    );
    if (compliance.blocked) {
      return { ok: false, error: compliance.issues.map((i) => i.message).join(". ") };
    }
  }

  // `datePublished` ختمته البوّابةُ قبل التوليد، فالـJSON-LD المخزَّن يحمل نفس التاريخ.
  await db.article.update({ where: { id: articleId }, data: { status: toStatus } });

  await logAction(
    "article.publish",
    {
      entity: "Article",
      entityId: articleId,
      summary: article.title,
      metadata: { from: ArticleStatus.SCHEDULED, to: toStatus, actor },
    },
    actor === "cron" ? SYSTEM_ACTOR : undefined,
  );

  // إشعارُ محرّكات البحث — لمقالات مدونتي وحدها: رابطُ مقال العميل على نطاقه هو، ولسنا
  // مالكيه المتحقَّقين، فالإشعارُ يُرفض في أحسن الأحوال.
  if (toStatus === ArticleStatus.PUBLISHED) {
    try {
      const articleUrl = `${await loadSiteUrl()}/articles/${article.slug}`;
      const res = await submitToIndexNow([articleUrl]);
      if (!res.ok) console.warn("publishArticle: IndexNow not ok", res);
    } catch (error) {
      console.error("publishArticle: IndexNow failed", error);
    }
  }

  revalidatePath("/articles");
  revalidatePath("/articles/workflow");
  revalidatePath(`/articles/${article.slug}`);
  revalidateTag("article-status-counts", "max");
  if (toStatus === ArticleStatus.PUBLISHED) {
    await revalidateModontyTag("articles");
  }

  return { ok: true, to: toStatus };
}
