import "server-only";

import { db } from "@/lib/db";
import { incrementCounters } from "@/lib/counters/increment-counters";

/** How many rows per document — for moving the cached counters by exactly what was removed. */
function countBy<T>(rows: T[], key: (row: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(key(row), (counts.get(key(row)) ?? 0) + 1);
  return counts;
}

async function decrement(collection: "articles" | "media", field: string, counts: Map<string, number>) {
  await Promise.all([...counts].map(([id, n]) => incrementCounters(collection, id, { [field]: -n })));
}

/**
 * حذف حساب قارئ — **مصدر واحد** لبابين: أكشن الإعدادات في الويب (`deleteAccount`) ونقطة التطبيق
 * `DELETE /api/mobile/v1/me`. الهويّة والتأكيد يفحصهما الباب؛ هنا الحذف وحده.
 *
 * كان الويب ينادي `db.user.delete` مباشرة: يفشل لكل حساب له صفّ `Account`/`Session` (علاقة إلزامية
 * بلا onDelete = Restrict في وضع علاقات بريزما على مونغو)، ويترك عدّادات المقالات والريلز منفوخة
 * بإعجابات ومفضّلات لم تعد موجودة. الترتيب هنا يعالج الاثنين.
 *
 * ما يُحذف (بيانات القارئ نفسه):
 *   جلسات التطبيق `ReaderSession` (تُلغى أوّلاً ثم تُحذف) · أجهزة الدفع `ReaderDevice` ·
 *   `Account` (جوجل/أبل) · `Session` · إعجابات/عدم إعجاب/مفضّلة المقالات (مع إنقاص `likesCount`
 *   `dislikesCount` `favoritesCount`) · إعجاب/مفضّلة الريلز `MediaReaction` (مع إنقاص عدّادات
 *   `media`) · متابعة/إعجاب/مفضّلة الشركاء (`ClientLike` `ClientDislike` `ClientFavorite`) ·
 *   تفاعلات التعليقات (`CommentLike` `CommentDislike` `ClientCommentLike` `ClientCommentDislike`
 *   `CommentReaction`) · تقييمات الشركاء `ClientReview` (العلاقة إلزامية Cascade) · إشعاراته
 *   `Notification` · `LeadScoring` · رموز التحقّق `VerificationToken` ومحاولات الدخول
 *   `MobileLoginAttempt` المفتاحة ببريده · ثم صفّ `User` نفسه (البريد · كلمة المرور · الجوال · التفضيلات).
 *
 * ما يبقى بلا صاحب (`userId`/`authorId` = null — العلاقة اختيارية SetNull في السكيما):
 *   التعليقات على المقالات والشركاء والريلز (نصّها يبقى كي لا تنكسر سلاسل الردود؛ تظهر بلا اسم) ·
 *   سجلّات التحليلات (`ArticleView` `ClientView` `Share` `Conversion` `CTAClick` `CampaignTracking`
 *   `EngagementDuration` `ArticleLinkClick` `FAQFeedback` `Analytics` `PageView`) · `ChatbotMessage` ·
 *   رسائل التواصل `ContactMessage` وطلبات الحجز `BookingRequest` (يملكها الشريك/الفريق؛ تحمل لقطة
 *   الاسم والبريد التي أرسلها القارئ بنفسه) · `Client.userId` لو كان مالكاً لصفحة شريك.
 *
 * لا يُمسّ: `NewsSubscriber`/`Subscriber` (اشتراك بريدي بموافقة مستقلّة، يُلغى من رابط الرسالة) ·
 * `AuditLog` (سجلّ الموظّفين).
 *
 * لا معاملة واحدة عن قصد: العدّادات تتحرّك بـ`$inc` خارج المعاملات (`incrementCounters`)، وأي
 * انقطاع في المنتصف يترك حساباً ما زال موجوداً تُعاد عليه العملية بأمان (كل خطوة تعيد المحاولة).
 */
export async function deleteAccountAs(userId: string): Promise<{ deleted: boolean }> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  if (!user) return { deleted: false };

  // 1. No app session survives the first step.
  await db.readerSession.updateMany({
    where: { userId, OR: [{ revokedAt: null }, { revokedAt: { isSet: false } }] },
    data: { revokedAt: new Date(), revokedReason: "AccountDeleted" },
  });
  await db.readerDevice.deleteMany({ where: { userId } });

  // 2. Reactions that feed cached counters — remove, then move each counter by what was removed.
  const [likes, dislikes, favorites, reelReactions] = await Promise.all([
    db.articleLike.findMany({ where: { userId }, select: { id: true, articleId: true } }),
    db.articleDislike.findMany({ where: { userId }, select: { id: true, articleId: true } }),
    db.articleFavorite.findMany({ where: { userId }, select: { id: true, articleId: true } }),
    db.mediaReaction.findMany({ where: { userId }, select: { id: true, mediaId: true, kind: true } }),
  ]);
  await Promise.all([
    db.articleLike.deleteMany({ where: { id: { in: likes.map((r) => r.id) } } }),
    db.articleDislike.deleteMany({ where: { id: { in: dislikes.map((r) => r.id) } } }),
    db.articleFavorite.deleteMany({ where: { id: { in: favorites.map((r) => r.id) } } }),
    db.mediaReaction.deleteMany({ where: { id: { in: reelReactions.map((r) => r.id) } } }),
  ]);
  await Promise.all([
    decrement("articles", "likesCount", countBy(likes, (r) => r.articleId)),
    decrement("articles", "dislikesCount", countBy(dislikes, (r) => r.articleId)),
    decrement("articles", "favoritesCount", countBy(favorites, (r) => r.articleId)),
    decrement("media", "likesCount", countBy(reelReactions.filter((r) => r.kind === "LIKE"), (r) => r.mediaId)),
    decrement("media", "favoritesCount", countBy(reelReactions.filter((r) => r.kind === "FAVORITE"), (r) => r.mediaId)),
  ]);

  // 3. The reader's other own rows.
  const mine = { where: { userId } };
  await Promise.all([
    db.clientLike.deleteMany(mine),
    db.clientDislike.deleteMany(mine),
    db.clientFavorite.deleteMany(mine),
    db.commentLike.deleteMany(mine),
    db.commentDislike.deleteMany(mine),
    db.clientCommentLike.deleteMany(mine),
    db.clientCommentDislike.deleteMany(mine),
    db.commentReaction.deleteMany(mine),
    db.clientReview.deleteMany({ where: { reviewerId: userId } }),
    db.notification.deleteMany(mine),
    db.leadScoring.deleteMany(mine),
    db.account.deleteMany(mine),
    db.session.deleteMany(mine),
  ]);

  // 4. Rows that belong to someone else's record — kept, detached.
  const detach = { where: { userId }, data: { userId: null } };
  const detachAuthor = { where: { authorId: userId }, data: { authorId: null } };
  await Promise.all([
    db.comment.updateMany(detachAuthor),
    db.clientComment.updateMany(detachAuthor),
    db.mediaComment.updateMany(detachAuthor),
    db.articleView.updateMany(detach),
    db.clientView.updateMany(detach),
    db.share.updateMany(detach),
    db.conversion.updateMany(detach),
    db.cTAClick.updateMany(detach),
    db.campaignTracking.updateMany(detach),
    db.engagementDuration.updateMany(detach),
    db.articleLinkClick.updateMany(detach),
    db.fAQFeedback.updateMany(detach),
    db.analytics.updateMany(detach),
    db.pageView.updateMany(detach),
    db.chatbotMessage.updateMany(detach),
    db.contactMessage.updateMany(detach),
    db.bookingRequest.updateMany(detach),
    db.client.updateMany(detach),
  ]);

  // 5. Rows keyed by the email, then the user, then the revoked app sessions.
  if (user.email) {
    const email = user.email.trim().toLowerCase();
    await Promise.all([
      db.verificationToken.deleteMany({ where: { identifier: user.email } }),
      db.mobileLoginAttempt.deleteMany({ where: { key: { startsWith: `reader:${email}|` } } }),
    ]);
  }
  await db.user.delete({ where: { id: userId } });
  await db.readerSession.deleteMany({ where: { userId } });

  return { deleted: true };
}
