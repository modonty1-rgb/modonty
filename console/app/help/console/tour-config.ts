/**
 * Console Simulation Tour — screenshots with hotspots + driver.js tour over the hotspots.
 *
 * Each stop renders:
 *  - Page label + intro paragraph
 *  - Screenshot
 *  - 1-4 numbered hotspots overlaid on the screenshot
 *
 * The tour walks through every hotspot across every stop (driver.js spotlight on the
 * tiny hotspot element — popover stays small and never covers the screenshot content).
 */

/**
 * 3-tier visual priority — drives dot color so the eye knows what matters first.
 *  - critical:  key action or insight (red)
 *  - important: regular daily-use feature (amber)
 *  - optional:  context / orientation (blue)
 */
export type HotspotPriority = "critical" | "important" | "optional";

export interface Hotspot {
  /** local index within the stop — also used as driver.js anchor `${stopId}-h${n}` */
  n: number;
  /** y position 0-100 (% from top of image) */
  top: number;
  /**
   * x position 0-100 — measured from the visual START.
   * In RTL that's the right edge. So `right: 5` puts the dot near the right side.
   */
  right?: number;
  left?: number;
  title: string;
  description: string;
  /** importance — drives dot color; defaults to "optional" */
  priority?: HotspotPriority;
}

export interface SimulationStop {
  id: string;
  image: string;
  pageLabel: string;
  intro: string;
  hotspots: Hotspot[];
}

export const consoleSimulationStops: SimulationStop[] = [
  {
    id: "sim-login",
    image: "/help/engagement/00-login.png",
    pageLabel: "تسجيل الدخول",
    intro:
      "بعد ما تشترك معنا، الإدارة ترسل لك إيميل + كلمة مرور مؤقتة. من هذي الصفحة تبدأ رحلتك.",
    hotspots: [
      {
        n: 1,
        top: 38,
        right: 50,
        title: "إيميلك",
        description:
          "لازم يكون إيميل صحيح ومفعّل — كل التنبيهات والروابط هتوصلك عليه.",
        priority: "optional",
      },
      {
        n: 2,
        top: 48,
        right: 85,
        title: "كلمة المرور المؤقتة",
        description:
          "من الإدارة في رسالتها لك. بعد ما تدخل أول مرة، تقدر تغيّرها من إعدادات حسابك.",
        priority: "important",
      },
      {
        n: 3,
        top: 88,
        right: 95,
        title: "هدية لكل عميل تجلبه!",
        description:
          "اعرض الكونسول على صاحبك — أول ما يشترك بأي باقة، يجيك ٥ مقالات مجانية تنضاف لرصيدك تلقائياً. أفضل وسيلة تنمو فيها باقتك بدون تكاليف.",
        priority: "critical",
      },
    ],
  },

  {
    id: "sim-dashboard",
    image: "/help/01-dashboard.png",
    pageLabel: "الصفحة الرئيسية",
    intro: "نظرة سريعة على آخر ٣٠ يوم — أرقامك، أنشطتك، والتنبيهات اللي محتاجة انتباهك.",
    hotspots: [
      {
        n: 1,
        top: 4,
        right: 5,
        title: "اسم شركتك في الأعلى",
        description: "للتأكد إنك في حسابك الصحيح.",
        priority: "optional",
      },
      {
        n: 2,
        top: 28,
        right: 95,
        title: "أرقام شهرك",
        description: "كم مقال انتشر، كم زائر شاف موقعك، كم واحد اشترك جديد.",
        priority: "important",
      },
      {
        n: 3,
        top: 75,
        right: 5,
        title: "كروت التنبيهات",
        description: "أي تعليق أو رسالة أو مقال محتاج موافقتك — يطلع هنا أول ما تدخل.",
        priority: "critical",
      },
    ],
  },

  {
    id: "sim-profile",
    image: "/help/02-profile.png",
    pageLabel: "بيانات شركتك",
    intro: "ابدأ هنا — عبّي بياناتك الرسمية. كل ما عبّيت أكثر، كل ما ظهرت في جوجل أفضل.",
    hotspots: [
      {
        n: 1,
        top: 4,
        right: 95,
        title: "شريط التقدم",
        description: "يوريك كم عبّيت من بياناتك. هدفك توصله ١٠٠٪.",
        priority: "optional",
      },
      {
        n: 2,
        top: 35,
        right: 5,
        title: "البيانات الأساسية",
        description: "اسم شركتك، الاسم القانوني، الموقع، الشعار، وصف الشركة.",
        priority: "important",
      },
      {
        n: 3,
        top: 96,
        right: 50,
        title: "زر حفظ التغييرات",
        description: "اضغطه كل ما تخلّص جزء — التحديث يدخل فوراً.",
        priority: "critical",
      },
    ],
  },

  {
    id: "sim-seo",
    image: "/help/03-seo.png",
    pageLabel: "خبّرنا عن نشاطك (SEO Intake)",
    intro:
      "هنا تخبرنا عن نشاطك وعميلك المثالي. فريق المحتوى يقرا الإجابات قبل ما يكتب لك أي مقال.",
    hotspots: [
      {
        n: 1,
        top: 5,
        right: 95,
        title: "وصف نشاطك",
        description: "إيش تقدّم، إيش يميّزك، ومين عميلك المثالي.",
        priority: "critical",
      },
      {
        n: 2,
        top: 40,
        right: 5,
        title: "كلمات مفتاحية + جمهور",
        description: "الكلمات اللي عميلك يبحث عنها — تساعد فريقنا يكتب محتوى يطلع في جوجل.",
        priority: "important",
      },
    ],
  },

  {
    id: "sim-articles",
    image: "/help/04-articles.png",
    pageLabel: "المقالات",
    intro: "كل المقالات اللي بنكتبها لك. تراجع، توافق، أو تطلب تعديل — أنت في السيطرة.",
    hotspots: [
      {
        n: 1,
        top: 18,
        right: 95,
        title: "٤ تبويبات سريعة",
        description: "بانتظار الموافقة · مجدولة · منشور · الكل. ابدأ من «بانتظار الموافقة».",
        priority: "optional",
      },
      {
        n: 2,
        top: 60,
        right: 5,
        title: "بطاقة المقال",
        description: "اضغط أي بطاقة لتفتح المقال، تقراه، توافق، أو تطلب تعديل بالملاحظات.",
        priority: "critical",
      },
    ],
  },

  {
    id: "sim-content",
    image: "/help/05-content.png",
    pageLabel: "نشاط المحتوى — رصيدك الشهري",
    intro:
      "تابع كم مقال استخدمت وكم باقي. الباقة تتجدد كل ٣٠ يوم من تاريخ اشتراكك.",
    hotspots: [
      {
        n: 1,
        top: 18,
        right: 95,
        title: "شريط الرصيد",
        description: "عدد المقالات المتاحة + المستخدمة + المتبقية. ينُجدد كل ٣٠ يوم.",
        priority: "important",
      },
      {
        n: 2,
        top: 70,
        right: 5,
        title: "كروت الحالات",
        description: "منشور · قيد الكتابة · مسوّدات · مجدولة — تشوف كل مقال وأين هو في الـ workflow.",
        priority: "optional",
      },
    ],
  },

  {
    id: "sim-media",
    image: "/help/06-media.png",
    pageLabel: "الصور والملفات",
    intro: "كل صورك في معرض واحد — شعارات، صور مقالات، صور غلاف، وغير المستخدمة.",
    hotspots: [
      {
        n: 1,
        top: 10,
        right: 95,
        title: "فلاتر سريعة",
        description: "صفّي حسب النوع: شعار · صور مقالات · صور غلاف · غير مستخدمة.",
        priority: "optional",
      },
    ],
  },

  {
    id: "sim-analytics",
    image: "/help/14-analytics.png",
    pageLabel: "الإحصائيات ⭐",
    intro: "أهم صفحة — تفهم زوارك بأرقام حقيقية: مين هم، إيش يقروا، ومتى يدخلون.",
    hotspots: [
      {
        n: 1,
        top: 15,
        right: 95,
        title: "أرقام الزوار",
        description: "Sessions · مشاهدات · زوار فريدون · معدل الارتداد — كله من بيانات حقيقية.",
        priority: "important",
      },
      {
        n: 2,
        top: 60,
        right: 5,
        title: "أفضل المحتوى",
        description: "تعرف أي مقال يجذب أكثر، ومن أين يجي زوارك (جوجل / Social / مباشر).",
        priority: "critical",
      },
      {
        n: 3,
        top: 96,
        right: 50,
        title: "توصيات عملية",
        description: "نصائح جاهزة مثل «أفضل وقت للنشر» و «المواضيع اللي تجذب جمهورك».",
        priority: "important",
      },
    ],
  },

  {
    id: "sim-site-health",
    image: "/help/11-site-health.png",
    pageLabel: "صحة موقعك",
    intro:
      "زي طبيب يفحصك دورياً. Google PageSpeed + DNS + SSL + Security headers + SEO checks.",
    hotspots: [
      {
        n: 1,
        top: 15,
        right: 95,
        title: "الدرجة الإجمالية",
        description: "من ١٠٠ — كل ما الرقم أعلى كل ما موقعك أكثر صحة وأقرب لجوجل.",
        priority: "critical",
      },
      {
        n: 2,
        top: 70,
        right: 5,
        title: "تفاصيل كل فحص",
        description:
          "كل بند: تمام (أخضر) أو محتاج تصليح (برتقالي) أو مشكلة (أحمر) — مع شرح كيف تحلّه.",
        priority: "important",
      },
    ],
  },

  {
    id: "sim-subscribers",
    image: "/help/07-subscribers.png",
    pageLabel: "مشتركو النشرة",
    intro: "قائمة كل اللي اشتركوا في نشرتك من زوار موقعك.",
    hotspots: [
      {
        n: 1,
        top: 12,
        right: 95,
        title: "أعداد المشتركين",
        description: "نشط · وافق على الخصوصية · اشترك هذا الشهر · ألغى.",
        priority: "important",
      },
      {
        n: 2,
        top: 65,
        right: 5,
        title: "تصدير CSV",
        description: "نزّل القائمة Excel + كل مقال جديد يوصلهم تلقائياً.",
        priority: "optional",
      },
    ],
  },

  {
    id: "sim-leads",
    image: "/help/08-leads.png",
    pageLabel: "العملاء المحتملون ⭐",
    intro:
      "زوارك المتفاعلين — كل واحد له درجة من ١٠٠ تلقائياً. ركّز على درجة ٧٠+ هم الأقرب للشراء.",
    hotspots: [
      {
        n: 1,
        top: 12,
        right: 95,
        title: "اهتمام عالي (٧٠+)",
        description:
          "زوار قضوا وقت كبير + دخلوا صفحات كثيرة + تفاعلوا. «جاهز للتواصل» — تواصل معاهم.",
        priority: "critical",
      },
      {
        n: 2,
        top: 12,
        right: 5,
        title: "اهتمام متوسط (٤٠-٦٩)",
        description: "زوار مهتمين لكن لسه يستكشفون. مرّر لهم محتوى ملائم لتحويلهم لعملاء.",
        priority: "important",
      },
      {
        n: 3,
        top: 45,
        right: 95,
        title: "اهتمام منخفض (أقل من ٤٠)",
        description: "زوار عابرين — مش أولوية، لكن يعتبرون مصدر إحصائي مفيد.",
        priority: "optional",
      },
      {
        n: 4,
        top: 85,
        right: 5,
        title: "تفاصيل الزائر",
        description: "صفحات شافها، الوقت، التفاعلات، آخر نشاط — كل ما تحتاج لتفهم اهتمامه.",
        priority: "important",
      },
    ],
  },

  {
    id: "sim-questions",
    image: "/help/16-questions.png",
    pageLabel: "أسئلة الزوار",
    intro:
      "زائر يسأل سؤال على مقال أو يكلّم الـ chatbot → يوصل هنا. ترد بنقرة، يصله إيميل تلقائي.",
    hotspots: [
      {
        n: 1,
        top: 25,
        right: 95,
        title: "السؤال + الزائر",
        description: "تشوف السؤال، إيميل الزائر، وفي أي مقال طرح السؤال.",
        priority: "important",
      },
      {
        n: 2,
        top: 88,
        right: 5,
        title: "زر الرد",
        description: "اكتب الإجابة، اضغط رد — يوصل للزائر إيميل، والإجابة تظهر تحت المقال للجميع.",
        priority: "critical",
      },
    ],
  },

  {
    id: "sim-comments",
    image: "/help/15-comments.png",
    pageLabel: "تعليقات المقالات",
    intro:
      "أي تعليق على أي مقال — يوصل هنا «بانتظار الموافقة» قبل ما يظهر للجميع. أنت دائماً في السيطرة.",
    hotspots: [
      {
        n: 1,
        top: 18,
        right: 95,
        title: "تعليق بانتظار الموافقة",
        description: "اقرأ، قرّر: وافق · ارفض · ردّ بنفسك. ما يظهر شي إلا بعد إذنك.",
        priority: "critical",
      },
    ],
  },

  {
    id: "sim-client-comments",
    image: "/help/10-client-comments.png",
    pageLabel: "تقييم زوارك لشركتك",
    intro:
      "تقييمات الزوار على صفحتك العامة (مش على مقالات معيّنة). تقييماتك الإيجابية تبني سمعتك.",
    hotspots: [
      {
        n: 1,
        top: 18,
        right: 95,
        title: "تقييم جديد",
        description: "تشوف اسم الزائر، نص التقييم، النجوم — وتوافق قبل ما يظهر للعالم.",
        priority: "critical",
      },
    ],
  },

  {
    id: "sim-faqs",
    image: "/help/09-faqs.png",
    pageLabel: "الأسئلة الشائعة",
    intro:
      "أسئلة وإجابات جاهزة من فريقنا + من الـ chatbot — توافق بنقرة، تظهر تحت مقالاتك. جوجل يحبها.",
    hotspots: [
      {
        n: 1,
        top: 18,
        right: 95,
        title: "السؤال والإجابة",
        description: "كل بند فيه سؤال شائع + إجابة جاهزة. راجع، عدّل لو حابّ، ثم وافق.",
        priority: "important",
      },
    ],
  },

  {
    id: "sim-support",
    image: "/help/13-support.png",
    pageLabel: "رسائل من زوارك",
    intro: "أي رسالة من نموذج «تواصل معنا» في موقعك → تجي هنا. ترد بنقرة، الرد يوصله إيميل تلقائي.",
    hotspots: [
      {
        n: 1,
        top: 18,
        right: 95,
        title: "رسالة من زائر",
        description: "اقرأ، ردّ، الرد ينحفظ ويوصل الزائر إيميل — بدون ما تفتح إيميلك.",
        priority: "critical",
      },
    ],
  },

  {
    id: "sim-settings",
    image: "/help/12-settings.png",
    pageLabel: "الإعدادات + Telegram ⭐",
    intro: "أهم خطوة — اربط Telegram. أي تفاعل في موقعك يوصلك تنبيه فوري على جوّالك.",
    hotspots: [
      {
        n: 1,
        top: 12,
        right: 95,
        title: "باقتك الحالية",
        description: "اسم الباقة، الميزات، وتاريخ التجديد القادم.",
        priority: "optional",
      },
      {
        n: 2,
        top: 55,
        right: 5,
        title: "ربط Telegram",
        description:
          "اربط حسابك على Telegram مرة وحدة — أي تفاعل في موقعك يوصلك تنبيه فوري.",
        priority: "critical",
      },
      {
        n: 3,
        top: 90,
        right: 95,
        title: "تغيير كلمة المرور",
        description: "غيّر كلمة المرور المؤقتة لكلمة مرور قوية وآمنة.",
        priority: "important",
      },
    ],
  },
];
