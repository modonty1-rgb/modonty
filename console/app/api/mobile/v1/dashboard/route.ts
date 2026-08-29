import type { NextRequest } from "next/server";
import { ArticleStatus, ArticleFAQStatus, CommentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

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
  const [client, pendingApproval, pendingQuestions, pendingComments, pendingVideos, pendingBookings, unreadNotifications] = await Promise.all([
    db.client.findUnique({ where: { id: clientId }, select: { subscriptionStatus: true, subscriptionEndDate: true } }),
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
     * الشرط مطابق لـ`notifications/route.ts` حرفياً: على مونجو الحقل الغائب لا يساوي `null`،
     * فكلّ مستقبِل يحتاج ذراعين وإلّا رجع صفر (مقيس على `modonty_dev`: صفر من ٣).
     */
    db.notification.count({
      where: {
        clientId,
        readAt: null,
        AND: [
          { OR: [{ userId: null }, { userId: { isSet: false } }] },
          { OR: [{ staffId: null }, { staffId: { isSet: false } }] },
        ],
      },
    }),
  ]);

  const daysRemaining = client?.subscriptionEndDate ? Math.max(Math.ceil((client.subscriptionEndDate.getTime() - new Date().getTime()) / 86_400_000), 0) : null;
  const subscription = client ? {
    status: client.subscriptionStatus,
    statusLabel: subscriptionStatusLabels[client.subscriptionStatus] ?? client.subscriptionStatus,
    statusTone: positiveStatuses.has(client.subscriptionStatus) ? "positive" : dangerStatuses.has(client.subscriptionStatus) ? "danger" : "warning",
  } : null;

  /**
   * «مهام تحتاج إجراء» تحمل ما يحتاج إجراءً فعلاً — والصفر لا يحتاج.
   *
   * كانت الأربعة تُرسَل دائماً، فيظهر «مقالات بانتظار قرارك ٠» صفّاً قابلاً للضغط يفتح
   * شاشة فارغة. وقائمةٌ عنوانها «تحتاج إجراء» وفيها أصفار تفقد معناها: العين تمسح خمسة
   * صفوف لتجد اثنين فيهما عمل، بدل أن ترى العمل وحده. والشاشة تعرض بالفعل
   * «ما فيه مهام تنتظر منك شيئاً الآن» حين تفرغ القائمة — وهي الحالة الصحيحة لا صفوف الأصفار.
   */
  const actionItems = ([
    { key: "approval", value: pendingApproval, label: "مقالات بانتظار قرارك" },
    { key: "questions", value: pendingQuestions, label: "أجب عن أسئلة القراء" },
    { key: "comments", value: pendingComments, label: "راجع التعليقات" },
    { key: "videos", value: pendingVideos, label: "راجع الطلّات" },
    { key: "bookings", value: pendingBookings, label: "طلبات تواصل تنتظرك" },
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
      daysRemainingText: daysRemaining === null ? null : `${daysRemaining} يوماً متبقياً`,
      actionItemsTitle: "مهام تحتاج إجراء",
      noActionItemsLabel: "ما فيه مهام تنتظر منك شيئاً الآن.",
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
      brandLabel: "شعار مودونتي",
      accountLabel: "حسابي",
      closeMenuLabel: "إغلاق القائمة",
      darkModeLabel: "المظهر الداكن",
      lightModeLabel: "المظهر الفاتح",
      supportLabel: "المساعدة والدعم",
    },
  });
}
