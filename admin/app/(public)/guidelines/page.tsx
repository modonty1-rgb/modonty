import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import {
  Image as ImageIcon,
  FileText,
  Pen,
  Building2,
  Folder,
  Tag,
  Factory,
  Mail,
  BarChart3,
  BookOpen,
  ChevronLeft,
  Code2,
  Palette,
  PenLine,
  CheckCircle2,
  ArrowLeft,
  XCircle,
  Hash,
  AlignLeft,
  Link2,
  Search,
  TrendingUp,
  Cpu,
  Users,
  Activity,
  Bot,
  UserCheck,
  ExternalLink,
  Wrench,
  Star,
  DollarSign,
  AlertCircle,
} from "lucide-react";

// ─── Designer quick rules ────────────────────────────────────────────────────
const designerRules = [
  { rule: "الصورة الرئيسية للمقال", spec: "1920 × 1080 — نسبة 16:9 بالضبط" },
  { rule: "لوجو العميل", spec: "500 × 500 — مربع + PNG بخلفية شفافة" },
  { rule: "غلاف صفحة العميل", spec: "2400 × 400 — بنر عريض 6:1" },
  { rule: "صور البطاقات والمعرض", spec: "1200 × 675 — نسبة 16:9" },
  { rule: "صورة الكاتب", spec: "500 × 500 — مربع 1:1 — الوجه في المنتصف دائماً" },
];

// ─── SEO guide for content writers ──────────────────────────────────────────
const seoSections = [
  {
    icon: Hash,
    title: "الخطوة 1 — Basic: العنوان والملخص والرابط",
    color: "text-emerald-400",
    rules: [
      {
        label: "Title — عنوان المقال",
        do: "بين 50 و 60 حرف — ضع الكلمة المفتاحية في بداية العنوان. النظام يعرض عداد الحروف مباشرة",
        dont: "لا تكتب عنواناً عاماً مثل «مقال جديد» — ولا تكرر نفس العنوان في مقالين",
      },
      {
        label: "Excerpt — ملخص المقال",
        do: "بين 140 و 160 حرف — هذا الملخص يظهر في بطاقات المقالات وقوائم التصفح على الموقع",
        dont: "لا تتركه فارغاً — الملخص الفارغ يُعرض اسم العميل فقط",
      },
      {
        label: "Slug — رابط المقال",
        do: "يتولّد تلقائياً — راجعه وتأكد أنه بالإنجليزي وبه كلمات مفتاحية",
        dont: "لا تواريخ، لا أرقام عشوائية، لا عربي في الرابط",
      },
    ],
  },
  {
    icon: AlignLeft,
    title: "الخطوة 2 — Content: المحتوى",
    color: "text-violet-400",
    rules: [
      {
        label: "العناوين الفرعية H2 و H3",
        do: "استخدم أزرار H2 و H3 في شريط المحرر — قسّم المقال بعناوين واضحة، ضع كلمات مفتاحية فيها",
        dont: "لا تكتب المقال كتلة نص واحدة بدون عناوين — يضر بالقراءة وبـ SEO",
      },
      {
        label: "الكلمة المفتاحية في المحتوى",
        do: "الكلمة المفتاحية تظهر في أول 100 كلمة وتتكرر بشكل طبيعي وفي السياق — بدون نسبة مئوية محددة",
        dont: "لا تكررها بشكل مصطنع — جوجل يعاقب على حشو الكلمات المفتاحية ولا يعترف بمفهوم «نسبة الكثافة»",
      },
      {
        label: "طول المقال",
        do: "800 كلمة حد أدنى — 1500+ للمواضيع التنافسية. فقرات قصيرة 3-5 أسطر",
        dont: "المقالات أقل من 500 كلمة نادراً تظهر في الصفحة الأولى",
      },
    ],
  },
  {
    icon: Search,
    title: "الخطوة 3 — SEO: حقول محركات البحث",
    color: "text-blue-400",
    rules: [
      {
        label: "SEO Title — عنوان جوجل",
        do: "50 إلى 60 حرف — هذا هو العنوان الذي يظهر في نتائج جوجل. يختلف عن عنوان المقال",
        dont: "لا تتركه فارغاً — جوجل يستخدم عنوان المقال بدلاً منه وقد لا يكون مثالياً",
      },
      {
        label: "SEO Description — وصف جوجل",
        do: "140 إلى 160 حرف — هذا هو الوصف الذي يظهر تحت الرابط في جوجل. جملة تشويقية تدفع للنقر",
        dont: "لا تنسخ الـ Excerpt هنا مباشرة — اكتب جملة مخصصة لجوجل تحتوي الكلمة المفتاحية",
      },
      {
        label: "SEO Keywords — الكلمات المفتاحية",
        do: "أضف الكلمة المفتاحية الرئيسية أولاً ثم كلمات ثانوية مرتبطة — مثال: «تسويق المحتوى», «كتابة مقالات SEO»",
        dont: "لا تضع عشرات الكلمات غير المرتبطة — 3 إلى 5 كلمات مفتاحية محددة أفضل من 20 عامة",
      },
    ],
  },
  {
    icon: Link2,
    title: "الروابط والصور",
    color: "text-amber-400",
    rules: [
      {
        label: "الروابط الداخلية",
        do: "استخدم زر الرابط 🔗 في المحرر لإضافة 2-3 روابط لمقالات أخرى داخل نفس الموقع",
        dont: "لا تنشر مقالاً بدون أي رابط داخلي — يضعف بنية الموقع ويقلل وقت القراءة",
      },
      {
        label: "Alt Text للصور",
        do: "عند إضافة صورة من زر 🖼️ في المحرر — اكتب وصفاً حقيقياً للصورة يتضمن الكلمة المفتاحية",
        dont: "لا تترك Alt Text فارغاً ولا تكتب «صورة» — جوجل يقرأ الـ Alt Text لفهم محتوى الصورة",
      },
      {
        label: "قبل النشر",
        do: "نقطة SEO لازم 60% أو أكثر — راجع الـ SEO HEALTH في أعلى الصفحة قبل النشر",
        dont: "لا تنشر بنقطة أقل من 60% — النظام سيمنع النشر ويجب تحسين الحقول الناقصة",
      },
    ],
  },
];

// ─── SEO Specialist guide — 3 pillars ────────────────────────────────────────
const seoPillars = [
  {
    id: "technical",
    pillar: "Technical SEO",
    pillarAr: "البنية التقنية",
    responsibility: "النظام يتولاه — أنت تراجعه",
    responsibilityIcon: Bot,
    headerColor: "border-violet-500/20 bg-violet-500/[0.05]",
    badgeColor: "border-violet-500/30 text-violet-400",
    titleColor: "text-violet-400",
    dividerColor: "divide-violet-500/10",
    note: "هذا القسم يتولاه النظام تلقائياً. مسؤوليتك: تفهم كيف يعمل، وتتأكد من اكتمال البيانات.",
    noteColor: "bg-violet-500/[0.05] border-violet-500/20 text-violet-300",
    sections: [
      {
        icon: Cpu,
        title: "ما يولّده النظام — لا تكرره",
        rules: [
          {
            label: "Schema Markup — JSON-LD",
            do: "النظام يولّد: Article + Person (الكاتب) + Organization (العميل) في كل مقال منشور. جوجل يقرأه تلقائياً",
            dont: "لا تضيف Schema يدوياً في المحتوى — الكود يتكرر ويسبب تضارباً. النظام يتولى كل شيء",
          },
          {
            label: "Canonical + OG Image + Sitemap",
            do: "الـ canonical يُولّد من الـ Slug. صورة OG من بيانات المقال. الـ Sitemap يتحدث فور النشر",
            dont: "لا تعدّلهم يدوياً — فقط تأكد أن الـ Slug صحيح لأنه هو أساس الـ canonical URL",
          },
          {
            label: "Settings Cascade — الإعدادات العامة",
            do: "إعدادات الموقع (الاسم، الوصف، الشعار) تنعكس تلقائياً على كل الكيانات. غيّر مرة وينعكس على الكل",
            dont: "لا تحدّث SEO كل كيان يدوياً إذا كان التغيير عاماً — استخدم Settings Cascade من صفحة الإعدادات",
          },
        ],
      },
      {
        icon: AlertCircle,
        title: "الإندكس والكانونيكال — الأخطاء الصامتة القاتلة",
        rules: [
          {
            label: "تعارض Canonical + noindex",
            do: "canonical يقول «هذه الصفحة الأصلية» — noindex يقول «لا تفهرس هذه الصفحة». الاثنان معاً على نفس الصفحة = تعارض مباشر يُربك جوجل. تحقق عبر GSC > URL Inspection",
            dont: "لا تضع noindex على صفحة تحمل canonical تشير لنفسها — جوجل سيتجاهل الصفحة كلياً وتختفي من نتائج البحث",
          },
          {
            label: "Canonical إلى صفحة redirect أو محذوفة",
            do: "الـ canonical لازم يشير لصفحة حية تعيد 200. إذا غيّرت Slug مقال موجود تحقق أن الـ canonical تحدّث — الـ Slug هو أساس الـ canonical في هذا النظام",
            dont: "لا تغيّر Slug مقال منشور إلا بعد إعداد redirect من القديم للجديد — canonical يشير لـ 301 = جوجل يتجاهله ويفقد الصفحة سلطتها",
          },
          {
            label: "تعارض www vs non-www و HTTP vs HTTPS",
            do: "اختر نسخة واحدة فقط: www أو non-www، HTTPS دائماً. تأكد أن canonical في كل صفحة يحمل نفس النسخة بالضبط",
            dont: "لا تترك الموقع يُعاد توجيهه بدون canonical موحّد — جوجل يعتبر modonty.com و www.modonty.com صفحتين مختلفتين وتتنافسان على نفس الكلمة",
          },
          {
            label: "Noindex في Sitemap — تعارض صريح",
            do: "الـ Sitemap يقول لجوجل «افهرس هذه الصفحات». الـ noindex يقول «لا تفهرسها». الصفحة لازم إما في الـ Sitemap بدون noindex أو خارجه مع noindex",
            dont: "لا تُدرج صفحة في الـ Sitemap وعليها noindex — جوجل ينبّه على هذا في GSC > Coverage > Excluded ويهدر الـ Crawl Budget",
          },
          {
            label: "Orphan Pages — صفحات بلا روابط",
            do: "كل صفحة منشورة لازم يصلها رابط داخلي واحد على الأقل من صفحة أخرى. استخدم Screaming Frog أو Ahrefs > Site Audit لاكتشاف الـ Orphan Pages",
            dont: "لا تنشر مقالاً بدون ربطه بمقال أو صفحة أخرى — الـ Googlebot يزحف بالروابط. صفحة بلا روابط = صفحة مخفية عن جوجل حتى لو في الـ Sitemap",
          },
          {
            label: "Duplicate Content — المحتوى المكرر",
            do: "كل مقال محتواه فريد. إذا لزم وجود محتوى مشابه في عدة صفحات، استخدم canonical تشير للنسخة الأصلية على النسخ الثانوية",
            dont: "لا تنشر نفس المحتوى بعناوين مختلفة أو في فئات متعددة بدون canonical — جوجل يُضعف الاثنتين بدلاً من تقوية الأصلية",
          },
        ],
      },
      {
        icon: Users,
        title: "الكيانات — E-E-A-T وسلطة الموقع",
        rules: [
          {
            label: "الكتّاب — Person Entity",
            do: "كل كاتب = Person في JSON-LD. أضف: الاسم الكامل، السيرة، الصورة، روابط التواصل. يبني Author Authority",
            dont: "لا تترك ملف الكاتب فارغاً — مقالات بدون بيانات كاتب كاملة تضعف الـ E-E-A-T وثقة جوجل",
          },
          {
            label: "العملاء — Organization Entity",
            do: "كل عميل = Organization في JSON-LD. أضف: الاسم، الوصف، الموقع، الشعار، القطاع. يظهر في Knowledge Panel",
            dont: "لا تترك بيانات العميل منقوصة — Organization schema ناقص = فرصة ضائعة في نتائج جوجل",
          },
          {
            label: "الفئات والوسوم — URL Structure",
            do: "الفئات تبني /category/[slug] والوسوم /tag/[slug]. اختر أسماء فئات بكلمات مفتاحية ذات حجم بحث فعلي",
            dont: "لا تنشئ فئات عشوائية بدون بحث — فئة بمحتوى قليل وبحث ضعيف تضعف بنية الموقع كله",
          },
        ],
      },
    ],
  },
  {
    id: "onpage",
    pillar: "On-Page SEO",
    pillarAr: "تحسين الصفحة",
    responsibility: "شغلك المباشر في الأدمن",
    responsibilityIcon: UserCheck,
    headerColor: "border-blue-500/20 bg-blue-500/[0.05]",
    badgeColor: "border-blue-500/30 text-blue-400",
    titleColor: "text-blue-400",
    dividerColor: "divide-blue-500/10",
    note: "هذا ما تملكه مباشرة في الأدمن. كل مقال يمر عليك قبل النشر.",
    noteColor: "bg-blue-500/[0.05] border-blue-500/20 text-blue-300",
    sections: [
      {
        icon: Search,
        title: "الخطوة 0 — بحث الكلمات المفتاحية قبل أي شيء",
        rules: [
          {
            label: "Keyword Difficulty — صعوبة الترتيب",
            do: "قبل استهداف أي كلمة تحقق من KD% عبر Semrush أو Ahrefs. مقياس Semrush: 0-14 سهل جداً · 15-29 سهل (مناسب للمواقع الجديدة) · 30-49 ممكن · 50+ صعب. موقع جديد أو صغير: ابدأ بـ KD أقل من 30",
            dont: "لا تستهدف كلمة KD 70%+ وأنت في بداية الطريق — ستعمل 3 أشهر وتكون في الصفحة العشرين. ابدأ بالكلمات القابلة للربح أولاً ثم تصاعد",
          },
          {
            label: "Google Keyword Planner — تحذير رسمي موثّق",
            do: "استخدم Keyword Planner لمعرفة حجم البحث الشهري فقط — هذا ما هو مفيد منه للـ SEO",
            dont: "عمود Competition في Keyword Planner يقيس عدد المعلنين المتنافسين على الإعلان (Google Ads) وليس صعوبة الترتيب العضوي — مؤكد رسمياً من جوجل. لا تعتمد عليه لتقييم صعوبة الـ SEO. هذا خطأ شائع يضيّع شهوراً",
          },
          {
            label: "أدوات KD الحقيقية للـ SEO",
            do: "Semrush (KD%) · Ahrefs (KD) · Mangools / KWFinder · Rank Tracker — هذه تحسب صعوبة الترتيب العضوي بناءً على backlinks الصفحات المتصدرة",
            dont: "لا تبدأ حملة محتوى طويلة بدون فحص KD أولاً — الكلمة الجذابة بحجم بحث عالٍ قد تكون مستحيلة لموقعك في مرحلته الحالية",
          },
        ],
      },
      {
        icon: Hash,
        title: "حقول SEO الأساسية",
        rules: [
          {
            label: "SEO Title — صيغة العنوان",
            do: "الصيغة: [الكلمة المفتاحية الرئيسية] | مدونتي — وصفي ومختصر (50-60 حرف benchmark عملي، جوجل يقطع الأطول). الكلمة المفتاحية في البداية",
            dont: "لا تنسخ عنوان المقال — SEO Title لجوجل، Article Title للقارئ. الاثنان يختلفان في الهدف",
          },
          {
            label: "SEO Description — نية البحث",
            do: "اكتب بحسب نية البحث: معلوماتي / تجاري / نقل. أنهِ بـ CTA واضح. 140-160 حرف benchmark عملي — جوجل لا يحدد حداً رسمياً لكنه يقطع الأطول",
            dont: "لا تنسخ الـ Excerpt — وصف جوجل يختلف عن ملخص البطاقة. ولا تحشو كلمات مفتاحية — جوجل يتجاهل الوصف المصطنع",
          },
          {
            label: "Keywords — الهيكل الصحيح",
            do: "كلمة رئيسية واحدة أولاً، ثم 2-4 كلمات LSI ثانوية. مثال: «تسويق المحتوى», «استراتيجية المحتوى», «كتابة SEO»",
            dont: "لا تضع أكثر من 7 كلمات — الكثرة لا تفيد. الكلمات العامة جداً تنافسها عالٍ وضررها أكبر من نفعها",
          },
        ],
      },
      {
        icon: AlignLeft,
        title: "المحتوى والروابط الداخلية",
        rules: [
          {
            label: "هيكل المحتوى — H2 و H3",
            do: "عناوين فرعية واضحة بكلمات مفتاحية. الكلمة المفتاحية الرئيسية في أول 100 كلمة. 800 كلمة حد أدنى",
            dont: "لا تكتب المقال كتلة نص واحدة — يضر القراءة وجوجل لا يفهم بنية المحتوى",
          },
          {
            label: "الروابط الداخلية — Internal Links",
            do: "2-4 روابط داخلية لكل مقال. Anchor Text وصفي يحتوي الكلمة المفتاحية للصفحة المرتبط بها",
            dont: "لا تستخدم «اضغط هنا» كـ Anchor Text، ولا تنشر مقالاً بدون أي رابط داخلي",
          },
          {
            label: "درجة SEO — بوابة النشر",
            do: "الـ SEO HEALTH يفحص: Title + Description + Keywords + Alt Text + Internal Links + Length. لازم 60%+",
            dont: "لا تنشر بنقطة أقل من 60% — النظام يمنع النشر. راجع الـ SEO Overview لتدقيق المقالات الضعيفة",
          },
        ],
      },
    ],
  },
  {
    id: "offpage",
    pillar: "Off-Page SEO",
    pillarAr: "السلطة الخارجية",
    responsibility: "خارج الأدمن — استراتيجية خارجية",
    responsibilityIcon: ExternalLink,
    headerColor: "border-emerald-500/20 bg-emerald-500/[0.05]",
    badgeColor: "border-emerald-500/30 text-emerald-400",
    titleColor: "text-emerald-400",
    dividerColor: "divide-emerald-500/10",
    note: "هذا القسم خارج الأدمن بالكامل — مسؤوليتك تبني الاستراتيجية وتتابع النتائج عبر GSC.",
    noteColor: "bg-emerald-500/[0.05] border-emerald-500/20 text-emerald-300",
    sections: [
      {
        icon: Link2,
        title: "Backlinks — بناء الروابط الخارجية",
        rules: [
          {
            label: "الجودة قبل الكمية",
            do: "رابط واحد من موقع ذو صلة بالقطاع وسلطة عالية يساوي مئة رابط من مواقع ضعيفة. استهدف المواقع الموثوقة في نفس المجال",
            dont: "لا تشتري روابط ولا تتبادلها بشكل مصطنع — جوجل يعاقب على هذا بخفض الترتيب أو الحذف من الفهرس",
          },
          {
            label: "Guest Posting & Mentions",
            do: "اكتب مقالات ضيف في مواقع القطاع — الروابط في مقالات الضيف لازم تحتوي rel=\"nofollow\" أو rel=\"sponsored\" وإلا تعدّها جوجل spam. تتبّع Brand Mentions بـ Google Alerts",
            dont: "لا تنشر في مواقع Spam أو PBN — الرابط السيئ يضر أكثر من عدم وجوده",
          },
          {
            label: "Disavow — نبذ الروابط السيئة",
            do: "استخدم Disavow Tool فقط إذا وصلك تحذير Manual Penalty رسمي من جوجل (GSC > Security & Manual Actions). النظام الآلي لجوجل يتجاهل معظم الروابط السيئة تلقائياً",
            dont: "لا تستخدم Disavow Tool بشكل اعتيادي أو أسبوعياً — جوجل نفسه يقول: «معظم المواقع لا تحتاجه أبداً». الاستخدام الخاطئ يضر موقعك",
          },
        ],
      },
      {
        icon: Activity,
        title: "المراقبة والقياس",
        rules: [
          {
            label: "Google Search Console — أسبوعياً",
            do: "راجع: الكلمات المفتاحية الجديدة، CTR، متوسط الترتيب، صفحات Core Web Vitals. قارن بالأسبوع السابق",
            dont: "لا تعتمد فقط على نقاط الأدمن — النقطة الداخلية تقيس الإدخال، GSC تقيس النتيجة الفعلية في جوجل",
          },
          {
            label: "Quick Wins — الفرص السريعة",
            do: "ابحث عن كلمات في الترتيب 4-15 (Position Report في GSC) — تحسين On-Page لهذه المقالات يرفعها سريعاً",
            dont: "لا تبدأ بالكلمات في الصفحة الخامسة — الكلمات في الترتيب 11-20 أسرع في الارتفاع وعائدها أعلى",
          },
          {
            label: "تقرير الأداء الشهري",
            do: "اربط GSC + Analytics وقارن: Organic Traffic + Avg. Position + CTR + Bounce Rate. شارك التقرير مع الفريق",
            dont: "لا تُقيّم النجاح فقط بعدد الزيارات — قارن الـ CTR بأداء نفس المقال في الشهر السابق، وليس برقم ثابت عام",
          },
        ],
      },
    ],
  },
];

// ─── SEO Tools ───────────────────────────────────────────────────────────────
const seoTools = [
  {
    group: "مجانية — أساسية لا غنى عنها",
    groupIcon: Star,
    groupColor: "text-emerald-400",
    groupBadge: "border-emerald-500/30 text-emerald-400 bg-emerald-500/[0.05]",
    tools: [
      {
        name: "Google Search Console",
        role: "مراقبة ترتيب موقعك في جوجل، CTR، أخطاء الفهرسة، حالة الـ Sitemap، تحذيرات Manual Penalty، وتقرير Core Web Vitals",
        url: "https://search.google.com/search-console",
        tag: "مجاني — الأهم على الإطلاق",
      },
      {
        name: "Google Analytics 4",
        role: "تحليل سلوك الزوار، مصادر الترافيك، الصفحات الأكثر زيارة، معدل الارتداد، والتحويلات — يكمل GSC",
        url: "https://analytics.google.com",
        tag: "مجاني",
      },
      {
        name: "Google Trends",
        role: "اتجاهات البحث الموسمية — تعرف متى يبحث الناس عن موضوعك وأي المناطق أكثر اهتماماً. أساسي لتخطيط المحتوى",
        url: "https://trends.google.com",
        tag: "مجاني",
      },
      {
        name: "Google Alerts",
        role: "تتبّع Brand Mentions — يُرسل لك إشعار فور ذِكر اسم موقعك أو عميلك في أي موقع على الإنترنت",
        url: "https://www.google.com/alerts",
        tag: "مجاني",
      },
      {
        name: "Google PageSpeed Insights",
        role: "قياس سرعة تحميل الموقع وتقرير Core Web Vitals — يؤثر مباشرة على الترتيب في جوجل",
        url: "https://pagespeed.web.dev",
        tag: "مجاني",
      },
      {
        name: "Google Rich Results Test",
        role: "التحقق من صحة JSON-LD وStructured Data — تأكد أن Schema المقال والكاتب والعميل مقروءة بشكل صحيح من جوجل",
        url: "https://search.google.com/test/rich-results",
        tag: "مجاني",
      },
      {
        name: "Google Keyword Planner",
        role: "حجم البحث الشهري للكلمات المفتاحية — ⚠️ عمود Competition فيه للإعلانات فقط وليس صعوبة الترتيب العضوي",
        url: "https://ads.google.com/home/tools/keyword-planner/",
        tag: "مجاني · يحتاج حساب Ads",
      },
    ],
  },
  {
    group: "مدفوعة — منصات شاملة All-in-One",
    groupIcon: DollarSign,
    groupColor: "text-amber-400",
    groupBadge: "border-amber-500/30 text-amber-400 bg-amber-500/[0.05]",
    tools: [
      {
        name: "Semrush",
        role: "الأشمل: KD%، بحث كلمات مفتاحية، تحليل المنافسين، Backlinks، Site Audit، Rank Tracking، وتقارير شاملة. الأكثر استخداماً عند الوكالات",
        url: "https://www.semrush.com",
        tag: "مدفوع · الأكثر استخداماً",
      },
      {
        name: "Ahrefs",
        role: "أقوى أداة لتحليل الـ Backlinks وKD — تُعطيك Content Gap Analysis لمعرفة ما يرتب به المنافس ولا تغطيه",
        url: "https://ahrefs.com",
        tag: "مدفوع",
      },
      {
        name: "SE Ranking",
        role: "بديل Semrush بسعر أقل بكثير — يشمل Rank Tracking، Site Audit، Keyword Research، وBacklinks. مناسب للمشاريع المتوسطة",
        url: "https://seranking.com",
        tag: "مدفوع · أقل سعراً",
      },
    ],
  },
  {
    group: "تحسين المحتوى — Content Optimization",
    groupIcon: PenLine,
    groupColor: "text-violet-400",
    groupBadge: "border-violet-500/30 text-violet-400 bg-violet-500/[0.05]",
    tools: [
      {
        name: "Surfer SEO",
        role: "يحلل الصفحات المتصدرة في جوجل لكلمتك المفتاحية ويعطيك تقرير دقيق: كم كلمة، أي عناوين H2/H3، كم رابط داخلي تحتاج — الأشهر في تحسين المحتوى",
        url: "https://surferseo.com",
        tag: "مدفوع · الأشهر للمحتوى",
      },
      {
        name: "Clearscope",
        role: "مثل Surfer لكن للفرق الكبيرة — يُبسّط تحسين المحتوى للكتّاب غير المتخصصين في SEO. تستخدمه شركات مثل Adobe وIBM",
        url: "https://www.clearscope.io",
        tag: "مدفوع · Enterprise",
      },
      {
        name: "Frase",
        role: "يولّد Content Briefs تلقائياً ويساعد في كتابة المحتوى المحسّن للـ SEO — يدعم GEO (الظهور في إجابات الـ AI)",
        url: "https://www.frase.io",
        tag: "مدفوع · يدعم GEO",
      },
    ],
  },
  {
    group: "بحث الكلمات المفتاحية — Keyword Research",
    groupIcon: Search,
    groupColor: "text-blue-400",
    groupBadge: "border-blue-500/30 text-blue-400 bg-blue-500/[0.05]",
    tools: [
      {
        name: "Mangools / KWFinder",
        role: "بديل أرخص لـ Semrush متخصص في KD وبحث كلمات مفتاحية — واجهة بسيطة ومناسبة للمبتدئين",
        url: "https://mangools.com",
        tag: "مدفوع · سعر منخفض",
      },
      {
        name: "Ubersuggest",
        role: "بديل مجاني/رخيص لمعرفة KD وحجم البحث — مناسب كنقطة بداية قبل الاستثمار في أداة متكاملة",
        url: "https://neilpatel.com/ubersuggest/",
        tag: "مجاني جزئياً",
      },
      {
        name: "Answer The Public",
        role: "يعرض الأسئلة التي يبحث عنها الناس حول موضوعك — مصدر لا ينضب لأفكار المحتوى والـ Long-tail keywords",
        url: "https://answerthepublic.com",
        tag: "مجاني جزئياً",
      },
    ],
  },
  {
    group: "التقني — Technical SEO",
    groupIcon: Cpu,
    groupColor: "text-rose-400",
    groupBadge: "border-rose-500/30 text-rose-400 bg-rose-500/[0.05]",
    tools: [
      {
        name: "Screaming Frog SEO Spider",
        role: "زحف تقني كامل للموقع — يكتشف روابط مكسورة، صفحات بدون meta، مشاكل canonical، redirect chains، وصفحات بطيئة",
        url: "https://www.screamingfrog.co.uk/seo-spider/",
        tag: "مجاني لـ 500 URL",
      },
      {
        name: "Sitebulb",
        role: "مثل Screaming Frog لكن بتصورات بصرية أوضح وأولويات مرتبة — يوفر وقتاً في تحليل المشاكل التقنية الكبيرة",
        url: "https://sitebulb.com",
        tag: "مدفوع · أفضل تصوراً",
      },
    ],
  },
  {
    group: "تتبع الترتيب — Rank Tracking",
    groupIcon: TrendingUp,
    groupColor: "text-cyan-400",
    groupBadge: "border-cyan-500/30 text-cyan-400 bg-cyan-500/[0.05]",
    tools: [
      {
        name: "AccuRanker",
        role: "الأسرع في تتبع الترتيب على مستوى Enterprise — تستخدمه شركات مثل IKEA وGarmin. مناسب لمواقع بآلاف الكلمات",
        url: "https://www.accuranker.com",
        tag: "مدفوع · Enterprise",
      },
      {
        name: "Nightwatch",
        role: "تتبع الترتيب المحلي والـ SaaS — يدعم تتبع غير محدود للمواقع في الخطط المتقدمة. جيد للوكالات",
        url: "https://nightwatch.io",
        tag: "مدفوع · سعر معقول",
      },
      {
        name: "SERPWatcher by Mangools",
        role: "تتبع ترتيب يومي بسيط وسريع — جزء من منظومة Mangools. مناسب إذا تستخدم KWFinder مسبقاً",
        url: "https://mangools.com/serpwatcher",
        tag: "مدفوع · ضمن Mangools",
      },
    ],
  },
  {
    group: "تحليل الـ Backlinks",
    groupIcon: Link2,
    groupColor: "text-indigo-400",
    groupBadge: "border-indigo-500/30 text-indigo-400 bg-indigo-500/[0.05]",
    tools: [
      {
        name: "Majestic",
        role: "متخصص حصراً في تحليل جودة الـ Backlinks بمقياسَين حصريَّين: Trust Flow (جودة الرابط) و Citation Flow (كمية الروابط)",
        url: "https://majestic.com",
        tag: "مدفوع · متخصص Backlinks",
      },
    ],
  },
  {
    group: "بناء الروابط والتواصل — Link Building",
    groupIcon: Users,
    groupColor: "text-orange-400",
    groupBadge: "border-orange-500/30 text-orange-400 bg-orange-500/[0.05]",
    tools: [
      {
        name: "Hunter.io",
        role: "يجد ويتحقق من عناوين البريد الإلكتروني لأصحاب المواقع — الخطوة الأولى قبل أي حملة تواصل لبناء الروابط",
        url: "https://hunter.io",
        tag: "مجاني جزئياً",
      },
      {
        name: "BuzzStream",
        role: "CRM متخصص لبناء الروابط — يتتبع المحادثات مع المواقع، يرسل متابعات تلقائية، ويمنع تكرار التواصل مع نفس الموقع",
        url: "https://www.buzzstream.com",
        tag: "مدفوع · من $24/شهر",
      },
      {
        name: "Pitchbox",
        role: "يجمع كل شيء: البحث عن المواقع المستهدفة، إيجاد الإيميلات، إرسال الرسائل، متابعة الردود، وقياس الروابط المكتسبة",
        url: "https://pitchbox.com",
        tag: "مدفوع · من $195/شهر",
      },
    ],
  },
  {
    group: "AI & GEO — مستقبل الـ SEO 2025/2026",
    groupIcon: Bot,
    groupColor: "text-pink-400",
    groupBadge: "border-pink-500/30 text-pink-400 bg-pink-500/[0.05]",
    tools: [
      {
        name: "Frase — GEO Mode",
        role: "GEO = Generative Engine Optimization — تحسين المحتوى ليُذكر في إجابات ChatGPT وPerplexity وGoogle AI Overviews، وليس فقط نتائج جوجل التقليدية",
        url: "https://www.frase.io",
        tag: "ترند 2025/2026",
      },
      {
        name: "SE Ranking — AI Visibility",
        role: "يتتبع ظهور موقعك في Google AI Overviews بجانب الترتيب التقليدي — AI Overviews تظهر الآن في 16%+ من كل عمليات البحث",
        url: "https://seranking.com",
        tag: "ميزة جديدة 2025",
      },
      {
        name: "Profound",
        role: "أداة متخصصة في قياس ظهور علامتك التجارية داخل إجابات الـ AI: ChatGPT، Claude، Perplexity، Gemini، Copilot، وDeepSeek",
        url: "https://www.tryprofound.com",
        tag: "AI Visibility · جديد",
      },
    ],
  },
];

// ─── SEO Prohibitions ─────────────────────────────────────────────────────────
type Severity = "critical" | "high" | "medium";

interface Prohibition {
  name: string;
  consequence: string;
  severity: Severity;
}

interface ProhibitionCategory {
  category: string;
  icon: React.ElementType;
  items: Prohibition[];
}

const severityConfig: Record<Severity, { label: string; badge: string; dot: string }> = {
  critical: { label: "خطر فوري", badge: "border-red-500/40 text-red-400 bg-red-500/[0.08]", dot: "bg-red-500" },
  high: { label: "يخفض الترتيب", badge: "border-orange-500/40 text-orange-400 bg-orange-500/[0.08]", dot: "bg-orange-500" },
  medium: { label: "يضعف الموقع", badge: "border-yellow-500/40 text-yellow-400 bg-yellow-500/[0.08]", dot: "bg-yellow-500" },
};

const seoProhibitions: ProhibitionCategory[] = [
  {
    category: "التقني — يُعطّل الفهرسة",
    icon: Cpu,
    items: [
      { name: "Canonical + noindex على نفس الصفحة", consequence: "تعارض مباشر — جوجل يتجاهل الصفحة كلياً وتختفي من نتائج البحث", severity: "critical" },
      { name: "Canonical يشير لصفحة redirect أو محذوفة", consequence: "الصفحة تفقد كل سلطتها المكتسبة — الـ canonical لازم يشير لصفحة تُعيد 200", severity: "high" },
      { name: "Noindex في الـ Sitemap", consequence: "تعارض صريح يهدر الـ Crawl Budget ويُشوّش Googlebot — GSC ينبّه عليه في Coverage", severity: "high" },
      { name: "Robots.txt يحجب صفحات مهمة", consequence: "Googlebot لا يزحف ولا يُفهرس — الصفحة تختفي من جوجل تماماً حتى لو في الـ Sitemap", severity: "critical" },
      { name: "Orphan Pages — صفحات بلا روابط داخلية", consequence: "Googlebot يزحف عبر الروابط — صفحة بلا روابط = مخفية فعلياً حتى لو محتواها ممتاز", severity: "high" },
      { name: "LCP أبطأ من 2.5 ثانية", consequence: "Core Web Vitals تفشل — جوجل يُخفض الترتيب مقارنة بمنافسين أسرع في نفس الكلمة المفتاحية", severity: "high" },
      { name: "CLS أكثر من 0.1 (الصفحة تتحرك أثناء التحميل)", consequence: "Core Web Vitals تفشل — تجربة مستخدم سيئة ترفع معدل الارتداد وتُضعف الترتيب", severity: "high" },
      { name: "www vs non-www بدون توحيد + canonical موحّد", consequence: "جوجل يعتبرهما موقعَين مختلفَين — المحتوى يتنافس مع نفسه على نفس الكلمة المفتاحية", severity: "high" },
      { name: "URL Parameter Explosion — مسارات زحف لا نهائية", consequence: "فلاتر البحث أو Session IDs أو التقويمات تُولّد آلاف URLs مكررة — يهدر الـ Crawl Budget كله على صفحات بلا قيمة ويُبطّئ الفهرسة الحقيقية", severity: "high" },
      { name: "حجب CSS أو JavaScript عن Googlebot في Robots.txt", consequence: "جوجل لا يستطيع رسم الصفحة (render) بدون CSS/JS — يتعامل معها كمحتوى ناقص ويُخفض تقييمها رغم أن المحتوى موجود فعلاً", severity: "high" },
    ],
  },
  {
    category: "المحتوى — يُضعف الجودة ويُعاقَب عليه",
    icon: FileText,
    items: [
      { name: "Keyword Stuffing — حشو الكلمات المفتاحية", consequence: "عقوبة Spam مباشرة من جوجل — تكرار مصطنع في العنوان أو المحتوى أو الـ alt text يُدمّر الترتيب", severity: "critical" },
      { name: "Thin Content — محتوى فقير بلا قيمة", consequence: "خوارزمية Panda تعاقب عليه — صفحات أقل من 300 كلمة بلا عمق أو قيمة حقيقية تُخفض الموقع كله", severity: "high" },
      { name: "Duplicate Content بلا canonical", consequence: "صفحتان تتنافسان — جوجل يُضعف الاثنتين ويختار هو أيهما يعرض بدلاً منك", severity: "high" },
      { name: "AI Content بدون مراجعة بشرية", consequence: "منذ 2024 جوجل يعاقب على المحتوى الآلي غير المحرَّر — scaled content abuse يؤدي لحذف جماعي للصفحات", severity: "high" },
      { name: "Scaled Content Abuse — إنتاج جماعي للمقالات بلا قيمة", consequence: "سياسة جوجل 2024/2025 تُسقط آلاف الصفحات دفعة واحدة — لا نجاة منها إلا بالمحتوى الحقيقي", severity: "critical" },
      { name: "محتوى لا يطابق نية البحث (Search Intent)", consequence: "Bounce Rate يرتفع وجلسة القراءة تنخفض — جوجل يستنتج أن الصفحة لا تجيب على السؤال ويُخفضها", severity: "high" },
      { name: "Scraping — نسخ محتوى المواقع الأخرى", consequence: "عقوبة Spam مباشرة — حتى مع إضافة تعديلات طفيفة، جوجل يكتشفه ويُزيل الصفحة من الفهرس", severity: "critical" },
      { name: "Thin Affiliation — محتوى التابع بلا قيمة مضافة", consequence: "سياسة Spam رسمية من جوجل — نسخ وصف المنتجات من المصنّع مباشرة دون تقييم حقيقي أو محتوى أصلي يُعرّض الموقع للحذف", severity: "high" },
      { name: "User-Generated Spam — محتوى مُحقن في التعليقات أو المنتديات", consequence: "جوجل يُعاقب الموقع المضيف وليس فقط المحتوى — تعليقات Spam أو منشورات مزيفة في قسم المجتمع تنقل العقوبة للموقع كله", severity: "high" },
    ],
  },
  {
    category: "On-Page — أخطاء تُضعف كل صفحة",
    icon: Hash,
    items: [
      { name: "نفس الـ Meta Description في كل الصفحات", consequence: "جوجل يتجاهل الأوصاف المكررة ويكتب وصفه الخاص — فرصة ضائعة في كل رابط يظهر في نتائج البحث", severity: "medium" },
      { name: "صفحتان بنفس الـ SEO Title تستهدفان نفس الكلمة", consequence: "الصفحتان تتنافسان مع بعضهما (Keyword Cannibalization) — جوجل يُضعف الاثنتين بدلاً من تقوية الأقوى", severity: "high" },
      { name: "صفحة بلا عنوان H1 واضح", consequence: "جوجل لا يفهم موضوع الصفحة الرئيسي — يضر بنية المحتوى ويُقلل فرص الظهور في الكلمات المستهدفة", severity: "high" },
      { name: "Alt Text فارغ على الصور", consequence: "جوجل لا يقرأ الصور بدون alt — تضيع فرصة الظهور في Google Images وتضعف فهم المحتوى. 55% من المواقع تقع في هذا الخطأ", severity: "medium" },
      { name: "روابط داخلية مكسورة (404)", consequence: "يضر الـ Crawl Budget، يُشوّش بنية الموقع، ويُعطي تجربة مستخدم سيئة — كل ذلك إشارات سلبية لجوجل", severity: "medium" },
      { name: "Slug يتغير على مقال منشور بدون redirect", consequence: "URL الأصلي يُصبح 404 — تضيع كل الروابط الخارجية وسلطة الصفحة المكتسبة دفعة واحدة", severity: "critical" },
    ],
  },
  {
    category: "الروابط الخارجية — عقوبات Penguin",
    icon: Link2,
    items: [
      { name: "شراء الروابط أو بيعها لنقل الـ Authority", consequence: "Google Penguin — عقوبة فورية. جوجل يُفهرس الأنماط وليس فقط الروابط الفردية. الأثر قد يُدمّر الموقع كله", severity: "critical" },
      { name: "تبادل الروابط بشكل مصطنع (A → B → A)", consequence: "Link spam violation — تبادل الروابط الدائرية المكشوف تعاقب عليه خوارزميات 2024/2025", severity: "critical" },
      { name: "Guest Post links بدون rel=nofollow أو rel=sponsored", consequence: "جوجل يعتبرها link spam — مؤكد رسمياً. الرابط في مقال ضيف بدون nofollow = مخالفة صريحة", severity: "critical" },
      { name: "PBN — شبكات المواقع الخاصة لبناء الروابط", consequence: "حذف من الفهرس — جوجل متخصص في اكتشاف PBN من أنماط الربط والمحتوى المتشابه", severity: "critical" },
      { name: "Parasite SEO — نشر محتوى على مواقع قوية لاستغلال سلطتها", consequence: "سياسة Site Reputation Abuse المُفعَّلة 2024 — المواقع المُستغَلة تُعاقَب وليس فقط المحتوى المنشور", severity: "critical" },
      { name: "Expired Domain Abuse — شراء دومينات منتهية الصلاحية لحشو محتوى رخيص", consequence: "سياسة Spam رسمية 2024 — إعادة استخدام دومينات قديمة ذات سلطة لنشر محتوى ضعيف لا صلة له بالتاريخ السابق للدومين عقوبتها حذف فوري", severity: "critical" },
    ],
  },
  {
    category: "Manual Penalty — عقوبات جوجل المباشرة",
    icon: AlertCircle,
    items: [
      { name: "Cloaking — عرض محتوى مختلف لجوجل وللمستخدم", consequence: "حذف فوري من الفهرس — من أشد المخالفات خطورة. جوجل يُرسل human reviewer ويزيل الموقع", severity: "critical" },
      { name: "Hidden Text or Links — نص أو روابط مخفية", consequence: "Manual penalty فوري — نص بنفس لون الخلفية، حجم صفر، أو خلف صورة كلها مخالفات صريحة", severity: "critical" },
      { name: "Doorway Pages — صفحات لا قيمة لها سوى الـ SEO", consequence: "عقوبة مباشرة — صفحات تستهدف كلمات مفتاحية كثيرة بمحتوى فارغ ثم تُعيد التوجيه لصفحة رئيسية", severity: "critical" },
      { name: "Sneaky Redirects — مستخدمون يصلون لمحتوى غير ما وعدت به جوجل", consequence: "حذف من الفهرس — Redirect يُظهر لجوجل صفحة مختلفة عن التي يرى المستخدم", severity: "critical" },
      { name: "Hacked Content — محتوى مُحقن من هاكرز", consequence: "إزالة فورية وتحذير في GSC — جوجل يُعلّم الموقع كـ \"Dangerous\" ويُحذّر الزوار", severity: "critical" },
      { name: "Scam and Fraud — انتحال هوية أو معلومات تجارية كاذبة", consequence: "Manual action فوري وحذف من الفهرس — ادّعاء التواجد في مدينة معينة بدون وجود فعلي، أو انتحال اسم علامة تجارية أخرى", severity: "critical" },
      { name: "Policy Circumvention — إنشاء دومينات أو Subdomains للتهرب من العقوبة", consequence: "سياسة Spam رسمية — فتح موقع جديد أو subdomain بعد عقوبة على الأصلي للمتابعة بنفس المحتوى. جوجل يربط الأنماط ويُطبّق العقوبة على الجديد أيضاً", severity: "critical" },
      { name: "Machine-Generated Traffic — إرسال استفسارات آلية لجوجل", consequence: "انتهاك صريح لشروط الخدمة — استخدام أدوات لمحاكاة عمليات بحث مصطنعة يُسبّب حظر الـ IP وإشارات سلبية للموقع", severity: "critical" },
    ],
  },
  {
    category: "تجربة المستخدم — إشارات سلبية لجوجل",
    icon: Activity,
    items: [
      { name: "Intrusive Interstitials — Pop-ups تغطي المحتوى على الموبايل", consequence: "Google demotion مباشر — جوجل يُخفض المواقع التي تُعيق المستخدم بالإعلانات والـ pop-ups الإجبارية", severity: "high" },
      { name: "Non-Mobile-Friendly Design", consequence: "Mobile-first Indexing — جوجل يفهرس الموقع من نسخة الموبايل. موقع غير متجاوب = ترتيب أدنى في كل الأجهزة", severity: "critical" },
      { name: "INP أبطأ من 200ms (استجابة بطيئة للتفاعل)", consequence: "Core Web Vitals تفشل (حلّ محل FID رسمياً 2024) — تجربة مستخدم سيئة تُضعف الترتيب في نتائج البحث", severity: "high" },
      { name: "Bounce Rate عالٍ + وقت جلسة قصير جداً", consequence: "إشارة سلبية — المستخدم دخل وخرج فوراً يقول لجوجل أن الصفحة لم تُجب على استفساره. يُخفض الترتيب تدريجياً", severity: "medium" },
    ],
  },
];

// ─── All sections grid ────────────────────────────────────────────────────────
const guidelineSections = [
  {
    id: "media",
    title: "Media & Image Standards",
    description: "مقاسات الصور المعتمدة، الصيغ المطلوبة، وأفضل الممارسات للتصميم والمحتوى المرئي",
    icon: ImageIcon,
    href: "/guidelines/media",
    color: "text-blue-500",
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/[0.03]",
  },
  {
    id: "articles",
    title: "Articles",
    description: "دليل إنشاء المقالات — الخطوات، حقول المحتوى، SEO، والنشر",
    icon: FileText,
    href: "/guidelines/articles",
    color: "text-emerald-500",
    borderColor: "border-emerald-500/20",
    bgColor: "bg-emerald-500/[0.03]",
  },
  {
    id: "authors",
    title: "Authors",
    description: "إعداد ملف الكاتب، المصداقية، والربط مع المقالات",
    icon: Pen,
    href: "/guidelines/authors",
    color: "text-violet-500",
    borderColor: "border-violet-500/20",
    bgColor: "bg-violet-500/[0.03]",
  },
  {
    id: "clients",
    title: "Clients",
    description: "إعداد بيانات العملاء، الشعار، المعلومات التجارية، والربط مع المقالات",
    icon: Building2,
    href: "/guidelines/clients",
    color: "text-orange-500",
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/[0.03]",
  },
  {
    id: "organization",
    title: "Content Organization",
    description: "الفئات والوسوم والقطاعات — كيف ينظّم النظام المحتوى والعملاء",
    icon: Folder,
    href: "/guidelines/organization",
    color: "text-indigo-500",
    borderColor: "border-indigo-500/20",
    bgColor: "bg-indigo-500/[0.03]",
  },
  {
    id: "subscribers",
    title: "Subscribers",
    description: "إدارة المشتركين، قوائم البريد، وسياسة الخصوصية",
    icon: Mail,
    href: "/guidelines/subscribers",
    color: "text-teal-500",
    borderColor: "border-teal-500/20",
    bgColor: "bg-teal-500/[0.03]",
  },
  {
    id: "tracking",
    title: "Tracking & Performance",
    description: "GTM وAnalytics — إعداد التتبع وقراءة البيانات لتحسين المحتوى",
    icon: BarChart3,
    href: "/guidelines/tracking",
    color: "text-amber-500",
    borderColor: "border-amber-500/20",
    bgColor: "bg-amber-500/[0.03]",
  },
  {
    id: "seo-visual",
    title: "Visual SEO Course",
    description: "دليل بصري شامل — SERP · Rich Result · OG Image · Social Share لكل منصة",
    icon: Search,
    href: "/guidelines/seo-visual",
    color: "text-sky-500",
    borderColor: "border-sky-500/20",
    bgColor: "bg-sky-500/[0.03]",
  },
];

export default function GuidelinesPage() {
  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto space-y-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">Guidelines</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          دليل شامل لفريق العمل — المقاسات المعتمدة، طريقة الاستخدام، وأفضل الممارسات لكل قسم
        </p>
      </div>

      {/* ── Row 1: Designer (compact, left) ─────────────────────────────────── */}
      <Card className="border-blue-500/30 bg-blue-500/[0.03] overflow-hidden">
        <CardContent className="p-0">
          <div className="p-5 border-b border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Palette className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <span className="font-bold text-base">للمصمم</span>
                <p className="text-xs text-muted-foreground">الأساسيات اللي لازم تعرفها قبل ما ترفع أي صورة أو تسلّم أي تصميم</p>
              </div>
            </div>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px] shrink-0">Designer</Badge>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {designerRules.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium leading-snug">{item.rule}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.spec}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 pb-4">
            <Link href="/guidelines/media" className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium w-fit">
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              دليل الصور الكامل مع كل المقاسات
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ── Row 2: Content Writer — full SEO guide ──────────────────────────── */}
      <Card className="border-emerald-500/30 bg-emerald-500/[0.03] overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-5 border-b border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <PenLine className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <span className="font-bold text-base">لكاتب المحتوى — دليل SEO الكامل</span>
                <p className="text-xs text-muted-foreground">كل مقال تكتبه يحتاج هذه النقاط — اتبعها وارتفع في نتائج البحث</p>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] shrink-0">Content Writer</Badge>
          </div>

          {/* SEO Sections — collapsible */}
          <Accordion type="multiple" className="divide-y divide-border/40">
            {seoSections.map((section) => {
              const SectionIcon = section.icon;
              return (
                <AccordionItem key={section.title} value={section.title} className="border-0 px-5">
                  <AccordionTrigger className="py-4 hover:no-underline gap-2 [&>svg]:text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <SectionIcon className={`h-4 w-4 ${section.color} shrink-0`} />
                      <span className={`text-sm font-semibold ${section.color}`}>{section.title}</span>
                      <span className="text-[10px] text-muted-foreground font-normal hidden sm:block">
                        — {section.rules.length} نقطة
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {section.rules.map((rule, i) => (
                        <div key={i} className="rounded-lg border border-border/50 bg-background/40 p-3 space-y-2">
                          <p className="text-xs font-bold">{rule.label}</p>
                          <div className="flex items-start gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">{rule.do}</p>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">{rule.dont}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Footer note + link */}
          <div className="px-5 py-4 border-t border-emerald-500/20 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-muted-foreground">
              ⚠️ كل ما ذُكر أعلاه موجود في الأدمن فعلاً — <strong className="text-foreground">Basic (Step 1)</strong> للعنوان والملخص والرابط · <strong className="text-foreground">Content (Step 2)</strong> للمحرر · <strong className="text-foreground">SEO (Step 3)</strong> لحقول جوجل
            </p>
            <Link href="/guidelines/articles" className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              دليل إنشاء المقالات الكامل
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ── Row 3: SEO Specialist ────────────────────────────────────────────── */}
      <Card className="border-amber-500/30 bg-amber-500/[0.03] overflow-hidden">
        <CardContent className="p-0">
          {/* Card Header */}
          <div className="p-5 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <TrendingUp className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <span className="font-bold text-base">لمتخصص SEO — الدليل الشامل</span>
                <p className="text-xs text-muted-foreground">Technical · On-Page · Off-Page — المنهجية الكاملة</p>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px] shrink-0">SEO Specialist</Badge>
          </div>

          {/* 3 Pillars summary bar */}
          <div className="grid grid-cols-3 divide-x divide-x-reverse divide-border/50 border-b border-border/40">
            {seoPillars.map((p) => {
              const RIcon = p.responsibilityIcon;
              return (
                <div key={p.id} className="p-3 flex flex-col items-center gap-1 text-center">
                  <span className="text-xs font-bold">{p.pillar}</span>
                  <span className="text-[10px] text-muted-foreground hidden sm:block">{p.pillarAr}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <RIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{p.responsibility}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pillars content + Tools — collapsible */}
          <Accordion type="multiple" className="divide-y divide-border/40">
            {seoPillars.map((pillar) => (
              <AccordionItem key={pillar.id} value={pillar.id} className="border-0 px-5">
                <AccordionTrigger className="py-4 hover:no-underline gap-2 [&>svg]:text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${pillar.titleColor}`}>{pillar.pillar}</span>
                    <span className="text-xs text-muted-foreground hidden sm:block">— {pillar.pillarAr}</span>
                    <Badge variant="outline" className={`text-[10px] ${pillar.badgeColor} hidden sm:inline-flex`}>
                      {pillar.responsibility}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                  <div className={`mb-3 px-3 py-2 rounded-lg border text-xs ${pillar.noteColor}`}>
                    {pillar.note}
                  </div>
                  <div className={`divide-y ${pillar.dividerColor}`}>
                    {pillar.sections.map((section) => {
                      const SIcon = section.icon;
                      return (
                        <div key={section.title} className="py-4 first:pt-0">
                          <div className="flex items-center gap-2 mb-3">
                            <SIcon className={`h-3.5 w-3.5 ${pillar.titleColor}`} />
                            <span className={`text-xs font-semibold ${pillar.titleColor}`}>{section.title}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {section.rules.map((rule, i) => (
                              <div key={i} className="rounded-lg border border-border/50 bg-background/40 p-3 space-y-2">
                                <p className="text-xs font-bold">{rule.label}</p>
                                <div className="flex items-start gap-1.5">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                  <p className="text-xs text-muted-foreground leading-relaxed">{rule.do}</p>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                                  <p className="text-xs text-muted-foreground leading-relaxed">{rule.dont}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}

            {/* Tools as accordion item */}
            <AccordionItem value="tools" className="border-0 px-5">
              <AccordionTrigger className="py-4 hover:no-underline gap-2 [&>svg]:text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="text-sm font-bold">صندوق الأدوات — ما تحتاجه للعمل</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5 space-y-5">
                {seoTools.map((group) => {
                  const GIcon = group.groupIcon;
                  return (
                    <div key={group.group}>
                      <div className="flex items-center gap-2 mb-3">
                        <GIcon className={`h-3.5 w-3.5 ${group.groupColor}`} />
                        <span className={`text-xs font-semibold ${group.groupColor}`}>{group.group}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {group.tools.map((tool) => (
                          <a
                            key={tool.name}
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-border/50 bg-background/40 p-3 hover:border-amber-500/30 hover:bg-amber-500/[0.03] transition-all group"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span className="text-xs font-bold group-hover:text-amber-400 transition-colors leading-tight">{tool.name}</span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-amber-400 shrink-0 mt-0.5 transition-colors" />
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">{tool.role}</p>
                            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${group.groupBadge}`}>
                              {tool.tag}
                            </Badge>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Footer — SEO Specialist quick links */}
          <div className="px-5 py-5 border-t border-amber-500/20 space-y-3">
            <p className="text-xs text-muted-foreground font-medium">الأقسام المرتبطة بعملك مباشرة</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { href: "/guidelines/articles", icon: FileText, label: "Articles", sub: "On-Page SEO — شغلك الأساسي", color: "text-emerald-400", border: "border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/[0.05]" },
                { href: "/guidelines/tracking", icon: BarChart3, label: "Tracking & Performance", sub: "GTM + Analytics — التتبع والأداء", color: "text-amber-400", border: "border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/[0.05]" },
                { href: "/guidelines/organization", icon: Folder, label: "Content Organization", sub: "الفئات والوسوم والقطاعات", color: "text-indigo-400", border: "border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-500/[0.05]" },
                { href: "/guidelines/seo-visual", icon: Search, label: "Visual SEO Course", sub: "SERP · Rich Result · OG Image", color: "text-sky-400", border: "border-sky-500/20 hover:border-sky-500/40 hover:bg-sky-500/[0.05]" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={`rounded-lg border bg-background/40 p-3 transition-all cursor-pointer ${item.border}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                        <span className={`text-xs font-semibold ${item.color}`}>{item.label}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{item.sub}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── محظورات SEO ──────────────────────────────────────────────────────── */}
      <Card className="border-red-500/40 bg-red-500/[0.02] overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-5 border-b border-red-500/30 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 shrink-0 mt-0.5">
                <XCircle className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <span className="font-bold text-base text-red-400">محظورات SEO — ما يُضعف موقعك أو يحذفه من جوجل</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  كل ما يلي موثّق من سياسات جوجل الرسمية. أي مخالفة = خسارة ترتيب أو حذف من الفهرس.
                  لا استثناء ولا حجة.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              {(["critical", "high", "medium"] as Severity[]).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${severityConfig[s].dot}`} />
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap">{severityConfig[s].label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Categories — collapsible */}
          <Accordion type="multiple" className="divide-y divide-red-500/10">
            {seoProhibitions.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <AccordionItem key={cat.category} value={cat.category} className="border-0 px-5">
                  <AccordionTrigger className="py-4 hover:no-underline gap-2 [&>svg]:text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CatIcon className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      <span className="text-xs font-bold text-red-400">{cat.category}</span>
                      <span className="text-[10px] text-muted-foreground font-normal hidden sm:block">
                        — {cat.items.length} بند
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                      {cat.items.map((item, i) => {
                        const sc = severityConfig[item.severity];
                        return (
                          <div key={i} className="rounded-lg border border-border/40 bg-background/50 p-3 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${sc.dot}`} />
                                <p className="text-xs font-semibold leading-snug">{item.name}</p>
                              </div>
                              <Badge variant="outline" className={`text-[8px] px-1.5 py-0 shrink-0 whitespace-nowrap ${sc.badge}`}>
                                {sc.label}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed ps-3">{item.consequence}</p>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-red-500/20 bg-red-500/[0.03]">
            <p className="text-xs text-muted-foreground">
              🔴 <strong className="text-red-400">خطر فوري</strong> — حذف من الفهرس أو manual penalty ·
              🟠 <strong className="text-orange-400">يخفض الترتيب</strong> — خسارة مباشرة في نتائج البحث ·
              🟡 <strong className="text-yellow-400">يضعف الموقع</strong> — تراجع تدريجي في الأداء
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Visual SEO Course — teaser card ─────────────────────────────────── */}
      <Link href="/guidelines/seo-visual">
        <Card className="border-sky-500/30 bg-sky-500/[0.02] hover:shadow-md transition-all cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 shrink-0">
                  <Search className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">كيف يظهر موقعك في جوجل والمنصات؟ — الدليل البصري</span>
                    <Badge variant="outline" className="border-sky-500/30 text-sky-400 text-[10px]">للجميع</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    تصور بصري كامل: نتيجة جوجل · البطاقة المُحسَّنة · قبل وبعد · معاينة WhatsApp / LinkedIn / X — كل عنصر ومصدره في الأدمن
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    {["SERP", "Rich Result", "OG Image", "Social Share"].map((tag) => (
                      <span key={tag} className="text-[10px] border border-sky-500/25 text-sky-400 rounded px-2 py-0.5">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            </div>
          </CardContent>
        </Card>
      </Link>


      {/* ── Divider ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">جميع الأقسام</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* ── All Sections Grid ─────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {guidelineSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.id} href={section.href}>
              <Card className={`h-full transition-all hover:shadow-md cursor-pointer ${section.borderColor} ${section.bgColor}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${section.bgColor} border ${section.borderColor}`}>
                      <Icon className={`h-5 w-5 ${section.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1">{section.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{section.description}</p>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0 mt-1 rtl:rotate-0 ltr:rotate-180" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
