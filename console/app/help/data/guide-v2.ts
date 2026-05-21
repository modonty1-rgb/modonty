/**
 * Guide structure — v2 (post-restructure).
 *
 * 5 tiers matching the Senior UX redesign:
 *   T1 — ما هو modonty (٣٠ ثانية)
 *   T2 — صفحتك على modonty.com ⭐⭐ (الأهم — البيت الرسمي للعميل)
 *   T3 — كيف يتفاعل زوارك ⭐ (٦ Before/After)
 *   T4 — صفحات الـ console (التشغيل اليومي)
 *   T5 — حسابك
 */

// ──────────────────────────────────────────────────────────────────────────
// TIER 1 — ما هو modonty (intro card)
// ──────────────────────────────────────────────────────────────────────────

export interface IntroStep {
  emoji: string;
  title: string;
  body: string;
}

export const tier1IntroSteps: IntroStep[] = [
  {
    emoji: "🎨",
    title: "فريقنا يجهّز كل شي",
    body: "نكتب المقال، نصمم كرياتيف خاص بك، ننتج Reels فيديو قصير + نسخة مسموعة، ونبني SEO كامل (Schema + Local + Knowledge Graph). أنت تسلّمنا شعارك، الباقي علينا.",
  },
  {
    emoji: "✓",
    title: "أنت توافق بنقرة",
    body: "تراجع المقال جاهز، تقترح تعديل لو حبّيت، أو توافق بنقرة. ما ينُشر شي إلا بإذنك — صلاحيتك الكاملة.",
  },
  {
    emoji: "🚀",
    title: "نُنشر ونوزّع لك",
    body: "خلال ٢٤ ساعة: المقال في صفحتك على مودونتي + ٨ قنوات Social Media + إيميل لمشتركينك. والنظام يبدأ يتتبّع كل زائر ويرسل لك تنبيهات Telegram لحظية.",
  },
];

// ──────────────────────────────────────────────────────────────────────────
// TIER 2 — صفحتك على modonty.com (Client page showcase)
// ──────────────────────────────────────────────────────────────────────────

export interface ClientPageBlock {
  id: string;
  title: string;
  body: string;
  managedFrom: string; // "تعدّلها من قسم X في console"
}

export const tier2ClientPageBlocks: ClientPageBlock[] = [
  {
    id: "hero",
    title: "اسم شركتك + شعارك",
    body: "أول ما يدخل أي زائر، يشوف اسم شركتك ولوجوك واضح في الأعلى. هذي هويتك الرسمية على modonty.",
    managedFrom: "تعدّلها من «بيانات شركتك» في console",
  },
  {
    id: "info",
    title: "معلومات شركتك",
    body: "السجل التجاري، العنوان، رقم التليفون، البريد، وروابط حساباتك الاجتماعية. كله ظاهر بشكل احترافي.",
    managedFrom: "تعدّلها من «بيانات شركتك» في console",
  },
  {
    id: "articles",
    title: "كل مقالاتك في مكان واحد",
    body: "زوارك يلاقوا كل المقالات اللي ينُشروا لك مرتّبة جنب بعضها — أحدثها فوق، مع صورة وعنوان جذّاب لكل واحد.",
    managedFrom: "بتظهر تلقائياً بعد ما توافق في «المقالات»",
  },
  {
    id: "reels",
    title: "Reels — فيديوهات قصيرة",
    body: "قسم خاص في صفحتك على «modonty.com/clients/[شركتك]/reels» — يعرض فيديوهات قصيرة مأخوذة من مقالاتك، تجذب الزوار اللي يفضّلون المحتوى المرئي السريع.",
    managedFrom: "ينتجها فريق Creative عندنا حسب باقتك",
  },
  {
    id: "newsletter",
    title: "نشرتك الخاصة",
    body: "صندوق اشتراك مخصّص باسمك — كل من يكتب إيميله هنا، يصير من مشتركيك أنت (مش modonty عام).",
    managedFrom: "تتابع المشتركين في «اللي اشتركوا في نشرتك»",
  },
  {
    id: "reviews",
    title: "تقييمات الزوار",
    body: "أي زائر يقدر يترك رأيه عن شركتك. الآراء ما تظهر إلا بعد ما توافق عليها — أنت مسيطر على سمعتك.",
    managedFrom: "تراجعها في «تقييم زوارك لشركتك»",
  },
  {
    id: "followers",
    title: "المتابعون والإعجابات",
    body: "social proof يبني الثقة — كل زائر يشوف عدد متابعينك ومعجبيك، فيحس إن شركتك معروفة.",
    managedFrom: "تشوف الأرقام في «الإحصائيات»",
  },
  {
    id: "contact",
    title: "تواصل معك",
    body: "زر «تواصل معنا» مخصّص لشركتك. أي رسالة تتكتب فيه تجي مباشرة لك (مش لـ modonty).",
    managedFrom: "ترد عليها من «رسائل من زوارك»",
  },
  {
    id: "qr",
    title: "QR Code لصفحتك",
    body: "في صفحتك على مودونتي رمز QR خاص بك. تحمّله بنقرة، تطبعه على بزنس كارد أو بروشور أو فاترينة، أو ترسله للزبائن في واتساب — يصوّروه ويوصلوا لصفحتك مباشرة.",
    managedFrom: "يُولَّد تلقائياً لكل عميل في صفحته",
  },
];

// ──────────────────────────────────────────────────────────────────────────
// TIER 3 — كيف يتفاعل زوارك (Before/After Engagement Cards) ⭐
// ──────────────────────────────────────────────────────────────────────────

export interface EngagementCard {
  id: string;
  emoji: string;
  title: string;
  /** What the visitor does on modonty.com */
  before: {
    image: string;
    caption: string;
  };
  /** How it surfaces in console */
  after: {
    image: string;
    caption: string;
  };
  /** One-line "why this matters" */
  insight: string;
}

export const tier3EngagementCards: EngagementCard[] = [
  {
    id: "like",
    emoji: "👍",
    title: "زائر يُعجب بمقالك",
    before: {
      image: "/help/engagement/02-like-share-bar.png",
      caption: "في صفحتك على مودونتي، الزائر يضغط زر الإعجاب على المقال.",
    },
    after: {
      image: "/help/14-analytics.png",
      caption: "العداد يزيد فوراً في صفحة الإحصائيات.",
    },
    insight: "كل إعجاب يخبرك إن محتواك وصل، وزوارك راضين — فريقنا يستخدم هذي الإشارة لكتابة مقالات شبيهة.",
  },
  {
    id: "comment",
    emoji: "💬",
    title: "زائر يعلّق على مقال",
    before: {
      image: "/help/engagement/04-comments.png",
      caption: "الزائر يكتب رأيه تحت المقال في صفحتك.",
    },
    after: {
      image: "/help/15-comments.png",
      caption: "التعليق يجيك «بانتظار الموافقة» في console + تنبيه على Telegram.",
    },
    insight: "ما ينشر شي إلا بعد ما توافق — أنت مسيطر تماماً على كل تعليق يظهر في صفحتك.",
  },
  {
    id: "question",
    emoji: "❓",
    title: "زائر يسأل سؤال عن مقال",
    before: {
      image: "/help/engagement/03-ask-client.png",
      caption: "الزائر يضغط «اسأل العميل» ويكتب سؤاله مباشرة.",
    },
    after: {
      image: "/help/16-questions.png",
      caption: "السؤال يجيك في console، ترد عليه بنقرة، يصله إيميل تلقائي بردك.",
    },
    insight: "ما تحتاج تفتح إيميلك — كل شي يحصل من console، والزائر يحس إنك متاح ومهتم.",
  },
  {
    id: "subscribe",
    emoji: "📧",
    title: "زائر يشترك في نشرتك",
    before: {
      image: "/help/engagement/05-subscribe.png",
      caption: "الزائر يكتب إيميله في صندوق «اشترك في نشرة العميل».",
    },
    after: {
      image: "/help/07-subscribers.png",
      caption: "يدخل قائمة مشتركيك في console — تقدر تنزّلها Excel أو ترسل لهم عروض.",
    },
    insight: "هؤلاء جمهورك المخلص — كل ما تنشر مقال جديد، يوصلهم إيميل تلقائي بدون ما تعمل شي.",
  },
  {
    id: "contact",
    emoji: "✉",
    title: "زائر يرسل رسالة «تواصل معنا»",
    before: {
      image: "/help/engagement/06-contact-form.png",
      caption: "الزائر يستخدم نموذج «تواصل معنا» على صفحتك.",
    },
    after: {
      image: "/help/13-support.png",
      caption: "الرسالة تظهر في «رسائل من زوارك»، ترد عليها مباشرة من هنا.",
    },
    insight: "أبسط نظام دعم عملاء — كل المحادثات محفوظة، تقدر ترجع لأي رسالة قديمة بسهولة.",
  },
  {
    id: "review",
    emoji: "⭐",
    title: "زائر يقيّم شركتك",
    before: {
      image: "/help/engagement/10-client-reviews.png",
      caption: "الزائر يكتب رأيه في قسم «آراء حول الشركة» على صفحتك.",
    },
    after: {
      image: "/help/10-client-comments.png",
      caption: "التقييم ينتظر موافقتك في «تقييم زوارك لشركتك» قبل ما يظهر للعالم.",
    },
    insight: "تقييماتك الحلوة = social proof يبني الثقة، وأنت تختار إيش يظهر — صفر مفاجآت.",
  },
  {
    id: "engaged-visitor",
    emoji: "🎯",
    title: "زائر متفاعل بقوة = جاهز للتواصل",
    before: {
      image: "/help/engagement/01-article-top.png",
      caption: "زائر يدخل عدة مقالات، يقرأ بتركيز، يضغط أزرار، يرجع تاني وتالت.",
    },
    after: {
      image: "/help/08-leads.png",
      caption: "النظام يحسب درجة تفاعله. لو زادت عن ٦٠٪ → يظهر في «العملاء المحتملين» كـ «جاهز للتواصل».",
    },
    insight: "أهم ميزة عندك — تعرف مين قريب يصير عميل قبل ما يكلّمك أصلاً. ركّز على المتفاعلين أكثر = مبيعات أسرع.",
  },
];

// ──────────────────────────────────────────────────────────────────────────
// TIER 4 — صفحات الـ console (التشغيل اليومي)
// ──────────────────────────────────────────────────────────────────────────

export interface ConsolePageGroup {
  emoji: string;
  title: string;
  pages: ConsolePage[];
}

export interface ConsolePage {
  id: string;
  title: string;
  image: string;
  body: string;
}

export const tier4ConsoleGroups: ConsolePageGroup[] = [
  {
    emoji: "📝",
    title: "محتواك",
    pages: [
      {
        id: "articles",
        title: "المقالات",
        image: "/help/04-articles.png",
        body: "كل المقالات اللي بنكتبها لك. بانتظار موافقتك · مجدولة · منشورة · الكل. اضغط أي مقال لتراجعه وتوافق.",
      },
      {
        id: "content-quota",
        title: "رصيدك الشهري",
        image: "/help/05-content.png",
        body: "كم مقال استخدمت من باقتك وكم باقي. الباقة تتجدد كل ٣٠ يوم من تاريخ اشتراكك.",
      },
      {
        id: "media",
        title: "الصور",
        image: "/help/06-media.png",
        body: "كل صور شركتك ومقالاتك في معرض واحد، مع فلاتر سريعة (شعار · صور مقالات · صور غلاف).",
      },
    ],
  },
  {
    emoji: "📊",
    title: "نتائجك",
    pages: [
      {
        id: "analytics",
        title: "الإحصائيات",
        image: "/help/14-analytics.png",
        body: "تفهم زوارك: مين هم، إمتى بيدخلون، إيش بيقروا، وآخر القسم توصيات عملية مثل «انشر يوم الأربعاء».",
      },
      {
        id: "site-health",
        title: "صحة موقعك",
        image: "/help/11-site-health.png",
        body: "فحص شامل لموقعك زي ما الطبيب يفحصك. الدرجة من ١٠٠، وقائمة بكل اللي تمام واللي محتاج تصليح.",
      },
    ],
  },
  {
    emoji: "👥",
    title: "جمهورك",
    pages: [
      {
        id: "subscribers",
        title: "اللي اشتركوا في نشرتك",
        image: "/help/07-subscribers.png",
        body: "قائمة المشتركين — مع تصدير Excel، وإيميلات تلقائية لما تنشر مقال جديد.",
      },
      {
        id: "leads",
        title: "العملاء المحتملون",
        image: "/help/08-leads.png",
        body: "زوارك المتفاعلين، مع درجة لكل واحد (عالي · متوسط · منخفض · جاهز للتواصل).",
      },
      {
        id: "comments",
        title: "تعليقات المقالات",
        image: "/help/15-comments.png",
        body: "تعليقات الزوار على مقالاتك. تراجع، توافق أو ترفض، وترد بنفسك.",
      },
      {
        id: "questions",
        title: "أسئلة الزوار",
        image: "/help/16-questions.png",
        body: "أسئلة مباشرة من زوار المقال (مع المساعد الذكي). ترد، يصلهم إيميل تلقائي.",
      },
      {
        id: "client-comments",
        title: "تقييم زوارك لشركتك",
        image: "/help/10-client-comments.png",
        body: "آراء وتقييمات على صفحتك العامة. ما تظهر إلا بعد ما توافق.",
      },
      {
        id: "faqs",
        title: "أسئلة وإجابات جاهزة",
        image: "/help/09-faqs.png",
        body: "أسئلة مقترحة من فريقنا والـ chatbot. توافق عليها، تظهر تحت مقالاتك (جوجل يحبّها).",
      },
    ],
  },
  {
    emoji: "🏢",
    title: "بياناتك",
    pages: [
      {
        id: "profile",
        title: "بيانات شركتك",
        image: "/help/02-profile.png",
        body: "ملف شركتك الكامل: اسم، عنوان، سجل تجاري، روابط. كل ما تكمّل، كل ما ظهرت أكثر في جوجل.",
      },
      {
        id: "seo-intake",
        title: "خبّرنا عن نشاطك",
        image: "/help/03-seo.png",
        body: "تخبرنا عن نشاطك وعميلك المثالي. فريق المحتوى يقراها قبل كتابة كل مقال لك.",
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────
// TIER 5 — حسابك
// ──────────────────────────────────────────────────────────────────────────

import type { LucideIcon } from "lucide-react";
import { Gem, Bell, Send as SendIcon, KeyRound } from "lucide-react";

export interface AccountSetting {
  emoji: string;
  icon: LucideIcon;
  title: string;
  body: string;
}

export const tier5AccountSettings: AccountSetting[] = [
  {
    emoji: "💎",
    icon: Gem,
    title: "باقتك",
    body: "اسم باقتك، سعرها، وامتى تنتهي — لو قاربت، نخبّرك قبل التجديد.",
  },
  {
    emoji: "🔔",
    icon: Bell,
    title: "التنبيهات",
    body: "اختار متى نخبّرك: مقال جديد، تعليق، رسالة دعم. علّم اللي تبيه فقط.",
  },
  {
    emoji: "📱",
    icon: SendIcon,
    title: "ربط Telegram",
    body: "تنبيهات فورية على جوّالك — زائر دخل صفحتك، علّق، اشترك. ربط بدقيقة.",
  },
  {
    emoji: "🔒",
    icon: KeyRound,
    title: "كلمة المرور",
    body: "غيّرها من آخر صفحة الإعدادات. ينصح بالتغيير كل ٦ أشهر.",
  },
];

// ──────────────────────────────────────────────────────────────────────────
// TIERS metadata for TOC
// ──────────────────────────────────────────────────────────────────────────

export interface Tier {
  id: string;
  num: string;
  title: string;
  subtitle: string;
}

export const tiers: Tier[] = [
  { id: "t0", num: "★", title: "منصة مودونتي الكاملة", subtitle: "ما تشتغل من خلف الكواليس" },
  { id: "t1", num: "١", title: "كيف تشتغل العملية", subtitle: "٣ خطوات بس" },
  { id: "t2", num: "٢", title: "صفحتك على مودونتي", subtitle: "البيت الرسمي لشركتك" },
  { id: "t3", num: "٣", title: "كيف يتفاعل زوارك", subtitle: "٢٥ نوع تفاعل" },
  { id: "t4", num: "٤", title: "صفحات الكونسول", subtitle: "التشغيل اليومي" },
  { id: "t5", num: "٥", title: "حسابك", subtitle: "إعدادات سريعة" },
];
