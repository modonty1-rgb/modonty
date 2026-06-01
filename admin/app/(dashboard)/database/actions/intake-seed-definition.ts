import type { IntakeQuestionType } from "@prisma/client";

/**
 * Canonical bootstrap definition of the client intake questionnaire — a 1:1
 * mirror of the (previously hardcoded) console form in
 * `console/app/(dashboard)/dashboard/seo/intake/components/intake-form.tsx`.
 *
 * This is a ONE-TIME seed source. After seeding, the DB rows are the source of
 * truth and the admin edits them freely. The seeder is idempotent and
 * create-only (skips any section/question/option whose key already exists), so
 * re-running it never overwrites admin customisations.
 *
 * Question `key` = the STABLE dotted path the answer is stored under in
 * `Client.intake` (e.g. "policy.forbiddenKeywords"). Never change a key.
 */

export interface SeedOption {
  value: string;
  label: string;
  marketScope?: "SA" | "EG" | null;
}

export interface SeedQuestion {
  key: string;
  label: string;
  type: IntakeQuestionType;
  helpText?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  visibility?: Record<string, unknown>;
  config?: Record<string, unknown>;
  options?: SeedOption[];
}

export interface SeedSection {
  key: string;
  title: string;
  description?: string;
  icon?: string;
  order: number;
  visibility?: Record<string, unknown>;
  questions: SeedQuestion[];
}

export interface SeedForm {
  key: string;
  title: string;
  description?: string;
  sections: SeedSection[];
}

// Plain helper so option lists where value === label stay terse.
const pill = (label: string, marketScope?: "SA" | "EG"): SeedOption => ({
  value: label,
  label,
  ...(marketScope ? { marketScope } : {}),
});

export const INTAKE_SEED: SeedForm = {
  key: "intake",
  title: "معلومات نشاطك",
  description:
    "قائمة الإجابات هذه هي القاعدة التي يبني عليها الفريق محتوى موقعك. كل ما كانت إجاباتك أوضح، المحتوى أقوى.",
  sections: [
    // ─── 1 · Business brief (most important) ──────────────────────────────
    {
      key: "business",
      title: "ملخص نشاطك",
      description: "فقرة 3-5 أسطر تصف نشاطك (تستخدم في About + JSON-LD)",
      icon: "FileText",
      order: 1,
      questions: [
        {
          key: "business.brief",
          label: "ملخص نشاطك",
          type: "TEXTAREA",
          placeholder:
            "مثال: كيما زون مصنع سعودي لمستحضرات التجميل بـ 15 سنة خبرة...",
        },
      ],
    },

    // ─── 2 · Story & expertise (E-E-A-T) ─────────────────────────────────
    {
      key: "story",
      title: "قصتك وخبرتك",
      description: "القصة الإنسانية + الشهادات + المواسم (E-E-A-T)",
      icon: "Heart",
      order: 2,
      questions: [
        {
          key: "story.foundingStory",
          label: "القصة الإنسانية وراء النشاط",
          type: "TEXTAREA",
          maxLength: 500,
          placeholder: "مثال: بدأت في مطبخ بيتي 2010 عندما لاحظت...",
        },
        {
          key: "story.expertise",
          label: "خبرتك / شهاداتك / جوائزك",
          type: "TEXTAREA",
          maxLength: 600,
          placeholder:
            "مثال: 15 سنة خبرة، شهادة ISO 22716، عملنا مع 200+ علامة...",
          helpText:
            "⚠️ ضع فقط الشهادات والجوائز الموثّقة — ستظهر للقرّاء وفي JSON-LD المرئي لـ Google.",
        },
        {
          key: "story.seasons",
          label: "مواسم تتغير فيها أعمالك",
          type: "MULTI_PILL",
          helpText: "تتبع السوق المختار في أعلى الصفحة.",
          options: [
            pill("رمضان"),
            pill("عيد الفطر"),
            pill("عيد الأضحى"),
            pill("الصيف"),
            pill("العودة للمدارس"),
            pill("الجمعة البيضاء"),
            pill("لا تأثير موسمي"),
            pill("اليوم الوطني السعودي", "SA"),
            pill("يوم التأسيس", "SA"),
            pill("موسم الرياض / جدة", "SA"),
            pill("شم النسيم", "EG"),
            pill("أعياد قبطية", "EG"),
            pill("مناسبات وطنية مصرية", "EG"),
          ],
        },
      ],
    },

    // ─── 3 · Ideal customer ───────────────────────────────────────────────
    {
      key: "audience",
      title: "عميلك المثالي",
      description: "صفه في جملة واحدة (السن + المهنة + المكان)",
      icon: "Users",
      order: 3,
      questions: [
        {
          key: "audience.description",
          label: "عميلك المثالي",
          type: "TEXTAREA",
          maxLength: 300,
          placeholder:
            "مثال: صاحبة محل تجميل، 28-45 سنة، مدن خليجية كبرى، تبحث عن منتجات حلال...",
        },
      ],
    },

    // ─── 4 · Customers & their problems ───────────────────────────────────
    {
      key: "customers",
      title: "عملاؤك ومشاكلهم",
      description: "المشكلة + الاعتراضات + FAQs + مرحلة الشراء",
      icon: "MessageCircleQuestion",
      order: 4,
      questions: [
        {
          key: "customers.bigProblem",
          label: "المشكلة الكبرى التي يأتيك العميل ليحلها",
          type: "TEXTAREA",
          maxLength: 200,
          placeholder: "مثال: العميل تعب من المنتجات المستوردة الباهظة...",
        },
        {
          key: "customers.objections",
          label: "الاعتراضات الشائعة (اختر ما ينطبق)",
          type: "MULTI_PILL",
          options: [
            pill("السعر مرتفع"),
            pill("الجودة غير ثابتة"),
            pill("الكمية الدنيا عالية"),
            pill("مدة التوصيل طويلة"),
            pill("صعوبة الاسترجاع"),
            pill("عدم وضوح التواصل"),
            pill("قلّة الخبرة المثبتة"),
            pill("عدم وجود ضمان"),
            pill("صعوبة التخصيص"),
            pill("شك في المصداقية"),
          ],
        },
        {
          key: "customers.faqs",
          label: "أهم 5-10 أسئلة يكررها عملاؤك (سؤال في كل سطر)",
          type: "TEXTAREA",
          placeholder: "كم أقل كمية تطلبون؟\nهل تنتجون بشعار خاص؟",
        },
        {
          key: "customers.funnelStage",
          label: "في أي مرحلة يصلك العميل عادة؟",
          type: "CHECKBOX",
          options: [
            { value: "awareness", label: "لا يعرف أن الخدمة موجودة" },
            { value: "consideration", label: "يقارن بين الخيارات" },
            { value: "decision", label: "جاهز للشراء" },
            { value: "mixed", label: "خليط من الكل" },
          ],
        },
      ],
    },

    // ─── 5 · Preferred content focus ──────────────────────────────────────
    {
      key: "goals",
      title: "اتجاه المحتوى المفضّل",
      description: "إيش نوع المحتوى الأكثر فائدة لنشاطك؟",
      icon: "Target",
      order: 5,
      questions: [
        {
          key: "goals.primary",
          label: "اختر التركيز الأساسي",
          type: "RADIO",
          options: [
            { value: "introductory", label: "تعريفي (يشرح من نحن وماذا نقدّم)" },
            { value: "educational", label: "تثقيفي (يعلّم القارئ في مجالنا)" },
            { value: "comparative", label: "مقارنات ودلائل اختيار" },
            { value: "technical", label: "متخصّص فنّي (للمتخصصين / B2B)" },
            { value: "local", label: "محلّي / إقليمي (مخصّص لمنطقة جغرافية)" },
            {
              value: "trust-building",
              label: "يبني الثقة والمصداقية (case studies, شهادات)",
            },
          ],
        },
      ],
    },

    // ─── 6 · Writing tone ─────────────────────────────────────────────────
    {
      key: "voice",
      title: "نبرة الكتابة",
      description: "اختر النبرة المناسبة لمحتواك",
      icon: "Mic2",
      order: 6,
      questions: [
        {
          key: "voice.tone",
          label: "النبرة الأساسية",
          type: "SELECT",
          options: [
            pill("ودّي ومحادثة"),
            pill("رسمي ومحترف"),
            pill("علمي ومدروس"),
            pill("بسيط ومباشر"),
            pill("فكاهي ومرح"),
            pill("فاخر ومتميّز"),
            pill("تعليمي ومرشد"),
          ],
        },
      ],
    },

    // ─── 7 · Content strategy ─────────────────────────────────────────────
    {
      key: "strategy",
      title: "استراتيجية المحتوى",
      description: "المنتج المركّز عليه + المواضيع + CTA + المصادر",
      icon: "Lightbulb",
      order: 7,
      questions: [
        {
          key: "strategy.mainProductFocus",
          label: "المنتج / الخدمة اللي تحب نركّز عليها في المحتوى",
          type: "TEXT",
          maxLength: 200,
          placeholder: "مثال: خط منتجات Hair Care الجديد",
        },
        {
          key: "strategy.topicIdeas",
          label: "أفكار مواضيع مقترحة (موضوع في كل سطر)",
          type: "TEXTAREA",
          placeholder: "كيف أختار شريك تصنيع؟\nالفرق بين الحلال وغير الحلال",
          helpText:
            "نختار من المواضيع المقترحة بناءً على البحث والمنافسة وما يخدم نشاطك أكثر — قد لا تُغطّى كلها.",
        },
        {
          key: "strategy.evidence",
          label: "بيانات / أرقام / شهادات يمكن استخدامها في المحتوى",
          type: "TEXTAREA",
          placeholder: "مثال: عملاء راضون 95% / 200+ علامة عملت معنا...",
          helpText:
            "⚠️ ضع فقط الأرقام والشهادات القابلة للإثبات — ستُنشر للقرّاء.",
        },
        {
          key: "strategy.preferredCta",
          label: "CTA المفضل في نهاية المقالات",
          type: "RADIO",
          options: [
            { value: "call", label: "📞 اتصال / واتساب" },
            { value: "form", label: "📝 نموذج تواصل" },
            { value: "appointment", label: "📅 حجز موعد / استشارة" },
            { value: "newsletter", label: "📧 اشتراك في النشرة" },
            { value: "product", label: "🛒 صفحة منتج محدد" },
            { value: "education", label: "📚 فقط تثقيف (بدون CTA)" },
          ],
        },
        {
          key: "strategy.citationSources",
          label: "مصادر للاستشهاد بها (اختر ما يناسبك)",
          type: "MULTI_PILL",
          helpText: "تتبع السوق المختار في أعلى الصفحة.",
          config: { allowCustom: true, storeAs: "joinedString" },
          options: [
            pill("هيئة الغذاء والدواء السعودية (SFDA)", "SA"),
            pill("وزارة الصحة السعودية", "SA"),
            pill("هيئة المواصفات والمقاييس (SASO)", "SA"),
            pill("الهيئة العامة للإحصاء (GASTAT)", "SA"),
            pill("البنك المركزي السعودي (SAMA)", "SA"),
            pill("هيئة الدواء المصرية (EDA)", "EG"),
            pill("وزارة الصحة المصرية", "EG"),
            pill("البنك المركزي المصري", "EG"),
            pill("الجهاز المركزي للإحصاء (CAPMAS)", "EG"),
            pill("منظمة الصحة العالمية (WHO)"),
            pill("Statista"),
            pill("المنظمة الدولية للتقييس (ISO)"),
          ],
        },
      ],
    },

    // ─── 8 · Content policy ───────────────────────────────────────────────
    {
      key: "policy",
      title: "سياسة المحتوى",
      description: "إيش الممنوع في محتواك (ضغطة فقط)",
      icon: "ShieldAlert",
      order: 8,
      questions: [
        {
          key: "policy.forbiddenKeywords",
          label: "كلمات ممنوعة شائعة",
          type: "MULTI_PILL",
          options: [
            pill("رخيص"),
            pill("مضمون 100%"),
            pill("فوري"),
            pill("سحري"),
            pill("الأرخص في السوق"),
            pill("بدون منافس"),
          ],
        },
        {
          key: "policy.forbiddenClaims",
          label: "ادعاءات تريد منا تجنّبها (اختر ما ينطبق)",
          type: "MULTI_PILL",
          helpText:
            "هذي اقتراحات شائعة — اختر فقط اللي يخصّ نشاطك. ما تختاره يُعتبر ممنوعاً في محتواك.",
          options: [
            pill("يعالج المرض"),
            pill("نتائج خلال 24 ساعة"),
            pill("بدون آثار جانبية"),
            pill("أفضل في العالم"),
            pill("موافقة طبية رسمية"),
          ],
        },
        {
          key: "policy.competitiveMentionsAllowed",
          label: "السماح بذكر المنافسين بالاسم في المقالات",
          type: "BOOLEAN",
        },
      ],
    },

    // ─── 9 · Competition ──────────────────────────────────────────────────
    {
      key: "competition",
      title: "المنافسة",
      description: "أقوى 3 منافسين + الفجوات اللي تشوفها",
      icon: "Swords",
      order: 9,
      questions: [
        {
          key: "competition.competitors",
          label: "المنافسون",
          type: "REPEATED_GROUP",
          config: {
            count: 3,
            itemLabel: "المنافس",
            fields: [
              { key: "name", type: "TEXT", placeholder: "اسم المنافس" },
              { key: "url", type: "TEXT", dir: "ltr", placeholder: "https://..." },
              {
                key: "edge",
                type: "TEXT",
                placeholder: "ما يفعلونه أفضل منك (خدمة، سعر، حضور رقمي، إلخ)",
              },
            ],
          },
        },
        {
          key: "competition.gaps",
          label: "الفجوات (اختياري)",
          type: "TEXT",
          placeholder: "مثال: عندهم مدونة فعّالة + صور احترافية",
        },
      ],
    },

    // ─── 10 · Google Business Profile ─────────────────────────────────────
    {
      key: "technical",
      title: "بطاقة شركتك على Google Maps",
      description: "رابط Google Business Profile (اختياري) — يفيد في البحث المحلي",
      icon: "MapPin",
      order: 10,
      questions: [
        {
          key: "technical.googleBusinessProfileUrl",
          label: "رابط Google Business Profile",
          type: "TEXT",
          placeholder:
            "https://g.page/your-business  أو  https://maps.app.goo.gl/...",
          config: { dir: "ltr", autoDetect: true },
        },
      ],
    },

    // ─── 11 · YMYL reviewer (conditional: regulated industries only) ──────
    {
      key: "ymyl",
      title: "مراجع المحتوى الحساس",
      description: "للقطاعات الحساسة فقط: طبي · صحة · مالي · قانوني",
      icon: "Stethoscope",
      order: 11,
      visibility: { ymylOnly: true },
      questions: [
        {
          key: "ymylReviewer.name",
          label: "الاسم الكامل",
          type: "TEXT",
          placeholder: "مثال: د. أحمد محمد العلي",
          helpText:
            "⚠️ تأكّد من صحة المؤهل والترخيص قبل الإدخال — ستظهر هذه المعلومات للقرّاء وفي JSON-LD المرئي لـ Google. أي ادعاء غير موثّق قد يعرّضك لمسؤولية قانونية.",
        },
        {
          key: "ymylReviewer.qualification",
          label: "المؤهل / الترخيص",
          type: "TEXT",
          placeholder: "مثال: طبيب أسنان مرخّص — رقم الترخيص 12345",
        },
        {
          key: "ymylReviewer.profileUrl",
          label: "رابط السيرة الذاتية / LinkedIn (اختياري)",
          type: "TEXT",
          placeholder: "https://linkedin.com/in/...",
          config: { dir: "ltr" },
        },
      ],
    },
  ],
};
