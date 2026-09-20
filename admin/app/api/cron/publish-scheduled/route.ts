import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { publishArticle } from "@/lib/articles/publish-article";
import { sendAdminTelegram, escapeTgHtml } from "@modonty/shared/lib/telegram/client";

/**
 * **الكرون يضغط «انشر» بدل الموظّف.**
 *
 * خالد (٢٠ سبتمبر ٢٠٢٦): «حالة الجدولة آخر مرحلة — المفروض إنّه ينضغط زرّ بَبلش».
 *
 * ── مَن يُنشر: مَن له موعدٌ حلّ، لا غير ──
 * خالد (٢٠ سبتمبر ٢٠٢٦): «الاسكيجوال هذي هي اللي المفروض يشتغل عليها الكرون، بس إنّ هذي
 * خلاص أوريدي تمّت جدولتها».
 *
 * وكان الاستعلامُ يشمل `scheduledAt: null` و`isSet: false` — أي أنّ ما وافق عليه العميل
 * ولم يُحدَّد له موعدٌ يُنشر في أوّل دورة. وقد وقع: مقالٌ خرج للعالم ولم يجدوله أحد.
 *
 * فالموعدُ **شرطٌ** لا زينة: بلا `scheduledAt` لا يلمسه الكرون، ويبقى في الطابور حتّى
 * يحدّد له موظّفٌ موعداً أو يضغط «Publish Now» بيده. والنشرُ للعالم لا يُسترجع، والصمتُ
 * لا يصلح إذناً له.
 *
 * ولا حاجة لفرع `isSet: false` بعد اليوم: `{ lte: now }` مقارنةٌ لا مساواةٌ بـ`null`،
 * والحقلُ الغائبُ لا يطابقها أصلاً — وهو المطلوب.
 *
 * ── ولماذا سقف ──
 * دورةٌ واحدة قد تصادف عشرات المقالات (أوّلُ تشغيلٍ خاصّة)، وكلُّ نشرٍ يولّد JSON-LD
 * ويُشعر محرّكات البحث. فيُؤخذ الأقدمُ أوّلاً وتُترك البقيّةُ للدورة التالية بعد ربع ساعة.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

/** الأقدمُ أوّلاً — ومَن ينتظر منذ أمسٍ أولى ممّن وافق قبل دقيقة. */
const BATCH = 20;

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  const provided = request.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  if (provided !== expected) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = await db.article.findMany({
    where: {
      status: ArticleStatus.SCHEDULED,
      // **الموعدُ شرطٌ لا زينة** — انظر التعليق أعلاه.
      scheduledAt: { lte: now },
    },
    orderBy: { scheduledAt: "asc" },
    take: BATCH,
    select: { id: true, title: true },
  });

  const published: string[] = [];
  const failed: { title: string; error: string }[] = [];

  for (const article of due) {
    // مقالٌ يسقط لا يوقف البقيّة: كلٌّ مستقلٌّ عن الآخر، والبوّابةُ تخصّه وحده.
    try {
      const res = await publishArticle(article.id, "cron");
      if (res.ok) published.push(article.title);
      else failed.push({ title: article.title, error: res.error });
    } catch (error) {
      failed.push({ title: article.title, error: error instanceof Error ? error.message : "خطأ غير متوقَّع" });
    }
  }

  // تنبيهٌ عند العمل أو الفشل فقط — دورةٌ فارغةٌ كلَّ ربع ساعة لا تُرسَل، وإلّا صار
  // التنبيهُ ضجيجاً يُكتم فيُكتم معه ما يهمّ.
  if (published.length || failed.length) {
    const lines = [
      `🗞️ <b>النشر المجدول</b> — نُشر ${published.length}${failed.length ? ` · فشل ${failed.length}` : ""}`,
      ...published.map((t) => `✅ ${escapeTgHtml(t)}`),
      ...failed.map((f) => `⛔ ${escapeTgHtml(f.title)}\n   ${escapeTgHtml(f.error)}`),
    ];
    sendAdminTelegram(lines.join("\n")).catch(() => null);
  }

  return Response.json({
    ok: true,
    at: now.toISOString(),
    candidates: due.length,
    published: published.length,
    failed,
  });
}
