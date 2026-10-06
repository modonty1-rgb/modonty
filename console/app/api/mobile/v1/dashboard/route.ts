import type { NextRequest } from "next/server";
import { ArticleStatus, ArticleFAQStatus, CommentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { arabicNumber } from "@/lib/mobile-api/arabic-format";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { countClientUnread } from "@/lib/mobile-api/client-inbox";
import { getClientSubscription } from "@/lib/subscription/get-client-subscription";

const subscriptionStatusLabels: Record<string, string> = { ACTIVE: "نشط", PENDING: "بانتظار التفعيل", EXPIRED: "منتهي", SUSPENDED: "معلّق", CANCELLED: "ملغي" };
const positiveStatuses = new Set(["ACTIVE"]);
const dangerStatuses = new Set(["EXPIRED", "CANCELLED"]);

/**
 * Home summary (S02) only.
 *
 * The subscription block here is the two-line card the home screen draws — status
 * and days left. Plan, price, dates and usage belong to `/subscription`, and the
 * referral copy belongs to `/referral`; neither is preloaded from this response.
 */
export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const clientId = session.clientId;
  const [sub, pendingApproval, pendingQuestions, pendingComments, pendingVideos, pendingBookings, unreadNotifications] = await Promise.all([
    // الحالةُ والأيّامُ من الطلب الساري — لا من نسخة الكرت.
    getClientSubscription(clientId),
    db.article.count({ where: { clientId, status: ArticleStatus.AWAITING_APPROVAL } }),
    db.articleFAQ.count({ where: { article: { clientId }, status: ArticleFAQStatus.PENDING, OR: [{ source: "user" }, { source: "chatbot" }] } }),
    db.comment.count({ where: { article: { clientId }, status: CommentStatus.PENDING } }),
    db.media.count({ where: { clientId, inReels: true, reelStatus: "PENDING_APPROVAL" } }),
    /**
     * الحجوزات التي **تنتظر فعلاً** فعلاً من العميل: قناة النموذج بحالة `new` وحدها.
     *
     * الجدول نفسه يحمل قناتين، وواتساب منها **ليست مهمّة**: العميل ضغط زرّ واتساب فوصلته
     * رسالة، والحديث انتقل إلى واتساب نفسه — ولا نحفظ رقمه («ما نحفظ رقمه، بس نثبّت لك إنه
     * تواصل»، `ar.ts:1150`). فعدّها هنا يضع في «مهام تحتاج إجراء» بنداً لا فعل فيه، وهو نفس
     * الوعد الكاذب الذي أزلناه من شريط العدّ. مكانها فلتر داخل شاشة الحجوزات، لا طابور المهام.
     *
     * و«مفتوح» = `new` **و**`contacted`: كان العدّ على `new` وحدها بينما الشاشة تعرض كل
     * الحالات، فيقول الصفّ «١» ويفتح العميل فيجد ستّة — رقمٌ وشاشةٌ يقيسان شيئين مختلفين.
     * و«تواصلت معه» شغلٌ **مفتوح** لا منتهٍ: كلّمتَه ولم تُغلق الطلب بعد. المغلق وحده
     * (`done` · `archived`) يخرج من العدّ ومن صدر الشاشة.
     */
    db.bookingRequest.count({ where: { clientId, channel: "form", status: { in: ["new", "contacted"] } } }),
    /**
     * شارة تاب التنبيهات، من أوّل رسمة.
     *
     * كانت تبدأ صفراً ولا تظهر إلا بعد أن يفتح العميل تاب التنبيهات — أي أنّ الشارة كانت
     * تفشل في الحالة الوحيدة التي وُجدت لها: تنبيه المستخدم بما لم يره بعد.
     *
     * الشرط من `client-inbox.ts` — نفس الدالّة التي تعدّ بها القائمة ووسم المقروء.
     */
    countClientUnread(clientId),
  ]);

  const daysRemaining = sub.daysLeft === null ? null : Math.max(sub.daysLeft, 0);
  /** مدّة الطلب الساري بالأيّام — حلقة «نبض» على الرئيسية تُرسم من الباقي على الكامل، لا من رقم مخترَع. */
  const durationDays = sub.startedAt && sub.endsAt ? Math.max(Math.round((sub.endsAt.getTime() - sub.startedAt.getTime()) / 86_400_000), 0) : null;
  const subscription = {
    daysRemaining,
    durationDays,
    status: sub.status,
    statusLabel: subscriptionStatusLabels[sub.status] ?? sub.status,
    statusTone: positiveStatuses.has(sub.status) ? "positive" : dangerStatuses.has(sub.status) ? "danger" : "warning",
  };

  /**
   * «مهام تحتاج إجراء» تحمل ما يحتاج إجراءً فعلاً — والصفر لا يحتاج.
   *
   * كانت الأربعة تُرسَل دائماً، فيظهر «مقالات بانتظار قرارك ٠» صفّاً قابلاً للضغط يفتح
   * شاشة فارغة. وقائمةٌ عنوانها «تحتاج إجراء» وفيها أصفار تفقد معناها: العين تمسح خمسة
   * صفوف لتجد اثنين فيهما عمل، بدل أن ترى العمل وحده. والشاشة تعرض بالفعل
   * «ما فيه مهام تنتظر منك شيئاً الآن» حين تفرغ القائمة — وهي الحالة الصحيحة لا صفوف الأصفار.
   */
  /**
   * `actionLabel` = زرّ بطل «نبض» حين يكون البند **أوّل** المهام: فعلٌ يقول ما سيحدث، بصيغة عدده.
   */
  const actionItems = ([
    { key: "approval", value: pendingApproval, label: "مقالات بانتظار قرارك", actionLabel: pendingApproval === 1 ? "مراجعة المقال" : pendingApproval === 2 ? "مراجعة المقالين" : "مراجعة المقالات" },
    { key: "questions", value: pendingQuestions, label: "أجب عن أسئلة القراء", actionLabel: pendingQuestions === 1 ? "الرد على السؤال" : "الرد على الأسئلة" },
    { key: "comments", value: pendingComments, label: "راجع التعليقات", actionLabel: pendingComments === 1 ? "مراجعة التعليق" : "مراجعة التعليقات" },
    // «راجع الطلّات» خرجت (٤ أكتوبر): `PENDING_APPROVAL` تنتظر موافقة فريق مدونتي لا العميل
    // (الويب نفسه يسمّيها كذلك، `gallery-manager.tsx`). فبندٌ هنا مهمّة ليست له ولا ينزل عدّها
    // بأيّ فعل منه. العدد باقٍ في `summary.pendingVideos` للعلم.
    { key: "bookings", value: pendingBookings, label: "طلبات تواصل تنتظرك", actionLabel: "فتح طلبات التواصل" },
  ] as const).filter((item) => item.value > 0);

  return ok({
    summary: { pendingApproval, pendingQuestions, pendingComments, pendingVideos, pendingBookings },
    unreadNotifications,
    actionItems,
    subscription,
    /**
     * البطاقة كانت تناقض الشاشة التي تفتحها، في الفعل وفي الوعد:
     *
     * 1. **«رشّح مدونتي»** تُقرأ «رشّح مدوّنتي أنا» — والفعل الحقيقي عكسه: ترشّح **صاحب نشاط**
     *    لخدمة مدونتي. وشاشة الإحالة نفسها تقول «رشّح عميلاً»، فالبطاقة كانت تخطئ في الفعل.
     * 2. **«واحصل على شهر مجاناً»** وعدٌ فوريّ بلا شرط، بينما الشرط مكتوب في الشاشة نفسها:
     *    «نضيف الشهر تلقائياً بعد الاشتراك والسداد». ووعدٌ لا يُوفى عند أول ترشيح يكلّف الثقة
     *    أكثر ممّا يكسب من ضغطات.
     *
     * فصار النصّ يقول من تُرشّح ومتى يصلك الشهر، ويطابق الشاشة التي يفتحها.
     */
    referral: { hook: "رشّح عميلاً — وشهر مجاني لك بعد اشتراكه" },
    review: {
      title: "الرئيسية",
      greetingPrefix: "مرحبًا،",
      greetingFallback: "بك",
      subtitle: "متابعة نشاطك اليوم",
      subscriptionLabel: "تفاصيل الاشتراك",
      // Guarded: `subscription` is null when the client row is missing, and a bare
      // optional chain used to render «undefined يوماً متبقياً».
      daysRemainingText: daysRemaining === null ? null : `${arabicNumber(daysRemaining)} يوماً متبقياً`,
      actionItemsTitle: "مهام تحتاج إجراء",
      // فوق أوّل مهمّة في بطل «نبض».
      firstActionLabel: "أوّلها",
      noActionItemsLabel: "ما فيه مهام تنتظر منك شيئاً الآن.",
      // سطر «عندك تنبيهات جديدة» أعلى الرئيسية — الضغط على الإشعار والتطبيق مقفول يفتح الرئيسية
      // (خلل Expo #49254)، فيجب أن يرى العميل التنبيه فوراً هنا (خالد ٦ أكتوبر ٢٠٢٦).
      unreadBannerTemplate: "عندك {count} تنبيه جديد — اضغط لعرضها",
    },
    /**
     * نصوص الغلاف — الرأس والقائمة الجانبية.
     *
     * كانت مكتوبة داخل `AppShell.tsx` مباشرةً («القائمة» · «حسابي» · «المساعدة والدعم» ·
     * «المظهر الفاتح/الداكن»)، وهو خرق صريح لقاعدة صفر هارد كود: الغلاف يظهر فوق كل تاب،
     * فنصّه المكتوب كان أوسع تسريب في التطبيق. يُحمَّل مع الرئيسية قبل رسم الغلاف.
     */
    shell: {
      menuLabel: "القائمة",
      brandLabel: "شعار مدونتي",
      accountLabel: "حسابي",
      closeMenuLabel: "إغلاق القائمة",
      darkModeLabel: "المظهر الداكن",
      // «نبض»: صفّ المظهر في قائمة الحساب = «المظهر» + مبدّل «فاتح | داكن» (الموكب ‎.mseg).
      themeLabel: "المظهر",
      lightShortLabel: "فاتح",
      darkShortLabel: "داكن",
      lightModeLabel: "المظهر الفاتح",
      supportLabel: "المساعدة والدعم",
    },
  });
}
