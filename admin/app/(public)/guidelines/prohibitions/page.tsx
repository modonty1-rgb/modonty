"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GuidelineLayout } from "../components/guideline-layout";
import {
  XCircle,
  Cpu,
  FileText,
  Hash,
  Link2,
  AlertCircle,
  Activity,
  Shield,
  Film,
  Palette,
  Wrench,
  Share2,
} from "lucide-react";

// ─── Types + Severity ──────────────────────────────────────────────────────
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

// ─── Categories (cross-discipline: SEO + Brand + Video) ────────────────────
const seoProhibitions: ProhibitionCategory[] = [
  {
    category: "العلامة التجارية واللوقو — يكسر الهوية البصرية",
    icon: Shield,
    items: [
      { name: "تمدد اللوقو أفقياً أو رأسياً", consequence: "اللوقو محسوب بنسب ثابتة. أي تمدد يشوّهه ويخلّيه يبان غير احترافي — القارئ يحس فوراً إن في حاجة غلط", severity: "high" },
      { name: "تدوير اللوقو بأي زاوية", consequence: "اللوقو دايماً مستقيم. التدوير يخلّي القارئ يقعد ثواني عشان يقرأه، والذهن يربطه بـ \"غير محترف\"", severity: "high" },
      { name: "وضع اللوقو داخل إطار أو خانة", consequence: "اللوقو محتاج مساحة فاضية حواليه عشان يتنفّس بصرياً. الإطارات والخانات تخنقه وتفقده قوته", severity: "high" },
      { name: "عكس اللوقو (mirror / flip)", consequence: "النص بينعكس ويصير غير مقروء — كسر صريح لهوية مودونتي", severity: "critical" },
      { name: "إعادة تلوين اللوقو بألوان غير معتمدة", consequence: "ألوان البراند ثابتة في الـ brand book. أي تغيير لون يخلّي العين تحتاج وقت تعرف إن ده فعلاً لوقو مودونتي", severity: "high" },
      { name: "إضافة ظلال أو تأثيرات على اللوقو", consequence: "اللوقو نظيف بدون تأثيرات. الظلال (shadow) أو التوهج (glow) أو التدرّج (gradient) تغيّر شكله عن النسخة المعتمدة", severity: "high" },
    ],
  },
  {
    category: "الفيديو — يكسر تجربة المشاهد",
    icon: Film,
    items: [
      { name: "استخدام موسيقى بدون ترخيص (license)", consequence: "الموسيقى محمية بحقوق نشر. لو استخدمت موسيقى بدون شراء ترخيص، Meta وYouTube ممكن يحذفوا الفيديو ويعطّلوا الحساب — مخاطرة قانونية حقيقية", severity: "critical" },
      { name: "مقدمة فيديو طويلة (أكتر من 3 ثواني)", consequence: "أول 3 ثواني تحدد إذا المشاهد بيكمل أو لا. مقدمة طويلة (logo reveal، fade-in) = خسارة نص المشاهدين قبل ما يوصلوا للمحتوى الفعلي", severity: "high" },
      { name: "نصوص صغيرة ما تُقرأ على الموبايل", consequence: "60% من المشاهدين على الموبايل بشاشة 6 إنش. نص صغير ما يبان = الرسالة كلها ضايعة", severity: "high" },
      { name: "تشغيل تلقائي بصوت (Auto-play with sound)", consequence: "الصوت المفاجئ يزعج المستخدم. كل المتصفحات الحديثة تكتمه تلقائياً، والمستخدم يقفل الصفحة من العصبية", severity: "high" },
      { name: "ادعاءات أو إحصائيات بدون مصدر موثَّق", consequence: "ذكر رقم بدون مصدر = خطر قانوني + كسر للثقة. لو الرقم طلع غلط، الفيديو والعلامة كلها تتأثر", severity: "high" },
      { name: "علامات مائية من منصات تانية (TikTok / CapCut watermark)", consequence: "العلامة المائية تخلّي الفيديو يبان كأنه محتوى مُعاد تدويره. Reels وYouTube Shorts يخفّضوا توزيع الفيديوهات اللي عليها watermarks من منصات تانية", severity: "medium" },
    ],
  },
  {
    category: "منصات النشر — TikTok · Meta · Snap · Instagram",
    icon: Share2,
    items: [
      { name: "محتوى ذكاء صناعي بدون تصنيف (AI Label)", consequence: "TikTok ومنصات Meta (Facebook + Instagram) يلزمونك تضع تصنيف \"AI-generated\" على أي صورة أو فيديو منتج بـ AI. بدون التصنيف = حذف الفيديو + خفض الحساب. TikTok حذف 51 ألف فيديو AI بدون label في النصف الثاني من 2025 لوحده", severity: "critical" },
      { name: "محتوى للعميل بدون \"Paid Partnership\" tag", consequence: "أي محتوى تنشره مودونتي لعميل (مدفوع، مجاني، أو حتى عينة منتج) لازم يكون عليه tag \"Paid Partnership with [Brand]\". في 2026 Meta صنّف الـ UGC-style ads بدون التصنيف هذا كـ \"Deceptive Practice\" — عقوبة فورية", severity: "critical" },
      { name: "موسيقى أو فيديو أو صور محمية بحقوق نشر", consequence: "استخدام أغنية بدون license، أو clip من فيلم/مسلسل، أو صورة من Getty Images = Copyright Strike فوري. 3 strikes = إغلاق الحساب نهائياً على YouTube و Meta. استخدم بس الموسيقى من المكتبة الرسمية للمنصة", severity: "critical" },
      { name: "Deepfake أو فيديو متلاعب فيه (Manipulated Media)", consequence: "كل المنصات تحذف Deepfakes للأشخاص الحقيقيين بدون موافقتهم. حتى لو وضعت تصنيف، Deepfakes لشخصيات عامة في سياق إجرامي أو مهين = حذف فوري + ممكن إجراء قانوني", severity: "critical" },
      { name: "انتحال هوية علامة تجارية أو شخص", consequence: "حساب يدّعي إنه عميل مودونتي أو يستخدم لوقو علامة تجارية بدون إذن = حذف فوري للحساب. Meta و TikTok عندهم نظام تبليغ سريع للعلامات التجارية، والإجراء أحياناً خلال ساعات", severity: "critical" },
      { name: "ادعاءات صحية أو طبية بدون مصدر رسمي", consequence: "كل المنصات تخفّض المحتوى اللي يدّعي علاجات أو نتائج طبية بدون مصدر طبي معتمد. خصوصاً في السعودية ومصر، الإعلانات الصحية تتطلب موافقة هيئة الغذاء والدواء (SFDA / EDA)", severity: "high" },
      { name: "شراء followers / likes / مشاهدات", consequence: "تفاعل مزيف = إغلاق الحساب نهائياً. كل المنصات (Meta, TikTok, Snap) عندها أنظمة كشف للأنشطة الآلية، والأثر يصل لكل حسابات مودونتي المرتبطة بنفس الـ IP أو طريقة الدفع", severity: "critical" },
      { name: "Engagement Bait — التحريض على التفاعل", consequence: "عبارات مثل \"اعمل لايك لو وافقتني\"، \"شير مع أصحابك\"، \"Tag صديق\"، \"علّق بـ 'نعم'\" = Meta يخفّض الـ reach تلقائياً (موثَّق رسمياً في Meta Transparency Center). الصفحة اللي تكرر هذي العبارات يخفّض reach كل منشوراتها مش بس المنشور الواحد", severity: "high" },
      { name: "Clickbait — عنوان أو thumbnail يخدع القارئ", consequence: "العنوان أو الصورة يعدا بشيء مثير، لكن المحتوى يقدّم شيء تاني = القراء يخرجون بسرعة (early drop-off)، وخوارزمية Meta 2026 تقرأ هذي الإشارة وتخفّض توزيع المحتوى. وعد + تنفيذ متطابقَين = الحل", severity: "high" },
      { name: "صور بدقة منخفضة (أقل من 1080px على الجانب الأقصر)", consequence: "Meta Ad Specs 2026 تتطلب 1080px على الأقل. أصغر = الصورة تطلع مكسّرة (pixelated) في الـ feed، Meta يخفّض ترتيب الإعلان في الـ auction، CPM يرتفع، وperformance ينزل", severity: "medium" },
      { name: "تمدد صورة صغيرة لتعبئة مساحة إعلان أكبر", consequence: "بدل تمدد صورة 600px لتعبئة 1200px، استخدم صورة بالحجم الأصلي. التمدد = pixelation = إشارة جودة سلبية لـ Meta = خفض في الـ delivery. صورة بسيطة عالية الجودة أحسن من معقدة مكسّرة", severity: "medium" },
      { name: "إعادة نشر نفس المحتوى بشكل متكرر بدون تعديل", consequence: "Meta Original Content Rules 2026 تخفّض المحتوى المُكرَّر — نفس الفيديو في 5 منشورات، أو نفس الصورة بعنوان مختلف. كل منشور لازم يقدّم قيمة جديدة أو تجربة مختلفة، وإلا تنخفض الـ reach تدريجياً", severity: "medium" },
    ],
  },
  {
    category: "التقني — يُعطّل الفهرسة",
    icon: Cpu,
    items: [
      { name: "Canonical + noindex على نفس الصفحة (تعارض)", consequence: "الـ Canonical يقول لجوجل \"هذي الصفحة الأصلية، اعرضها\". والـ noindex يقول \"لا تعرضها\". الاثنين معاً يربكوا جوجل، فيتجاهل الصفحة كلياً وتختفي من البحث", severity: "critical" },
      { name: "Canonical يشير لصفحة محذوفة أو محوّلة (redirect)", consequence: "الـ Canonical (الرابط الأصلي) لازم يشير لصفحة شغّالة. لو غيّرت رابط مقال منشور وما أعدت توجيه القديم، الـ Canonical يصير يشير لصفحة مفقودة، والمقال يفقد ترتيبه", severity: "high" },
      { name: "صفحة عليها noindex وموجودة في Sitemap", consequence: "الـ Sitemap (خريطة الموقع) يقول لجوجل \"افهرس هذي الصفحات\". والـ noindex يقول العكس. لما تحط صفحة في الاثنين، جوجل يضيّع وقته على صفحات لن تظهر", severity: "high" },
      { name: "Robots.txt يحجب صفحات مهمة", consequence: "ملف Robots.txt هو زي حارس البوابة لجوجل. لو حجبت صفحة مهمة فيه، جوجل ما يقدر يقرأها أبداً، وتختفي من نتائج البحث", severity: "critical" },
      { name: "صفحات بدون أي روابط داخلية (Orphan Pages)", consequence: "جوجل يكتشف الصفحات بالروابط بين بعضها. صفحة ما يربط لها أي مقال أو قسم تاني = مخفية عن جوجل، حتى لو محتواها ممتاز", severity: "high" },
      { name: "بطء تحميل المحتوى الرئيسي (LCP أبطأ من 2.5 ثانية)", consequence: "LCP = الوقت اللي تاخذه أكبر صورة أو عنوان عشان يظهر في الصفحة. جوجل قال رسمياً: لازم 2.5 ثانية أو أقل. أبطأ من كده = ترتيب أدنى من المنافسين الأسرع", severity: "high" },
      { name: "اهتزاز الصفحة وقت التحميل (CLS أكتر من 0.1)", consequence: "CLS = ثبات الصفحة وقت التحميل. لو الأزرار والصور تتحرك أثناء التحميل، المستخدم يضغط على شيء غير مقصود ويتضايق. جوجل قال رسمياً: لازم CLS تحت 0.1", severity: "high" },
      { name: "الموقع شغّال على www و non-www مع بعض", consequence: "modonty.com و www.modonty.com لازم يكونوا نسخة واحدة بس. لو الاثنين شغّالين بدون توحيد، جوجل يعتبرهم موقعين مختلفين، والمحتوى يتنافس مع نفسه", severity: "high" },
      { name: "روابط لانهائية بسبب فلاتر أو parameters", consequence: "URL Parameters = اللي يظهر بعد علامة ? في الرابط (فلاتر، تواريخ، sessions). لو الموقع يولّد آلاف الروابط بمحتوى متشابه، جوجل يضيّع وقته فيها بدل ما يفهرس الصفحات المهمة", severity: "high" },
      { name: "حجب ملفات CSS أو JavaScript عن جوجل", consequence: "جوجل يحتاج CSS وJavaScript عشان \"يشوف\" الصفحة كأنها تظهر للمستخدم. لو حجبتهم في Robots.txt، جوجل يشوف صفحة مكسورة ويخفّض تقييمها رغم إن المحتوى موجود فعلاً", severity: "high" },
      { name: "صفحة Soft 404 — تعطي 200 لكن محتواها فارغ أو \"غير موجود\"", consequence: "Soft 404 = الصفحة تظهر للزائر كصفحة \"غير موجود\" لكن السيرفر يرد بـ HTTP 200 (موجودة). جوجل يكتشفه ويحسبه خطأ. مثال: مقال محذوف يعرض \"الصفحة غير متوفرة\" بدل ما يعطي 404 أو 410. الحل لمودونتي: المقالات المحذوفة لازم تعطي 410 Gone، والـ slugs المتغيّرة 301 redirect", severity: "medium" },
      { name: "أخطاء Hreflang في المحتوى متعدد اللغات", consequence: "Hreflang = الكود اللي يقول لجوجل \"هذي النسخة العربية، وهذي الإنجليزية\". مودونتي عربي + إنجليزي + يستهدف السعودية ومصر = أخطاء Hreflang تعني visibility ضائعة في الأسواق المستهدفة. الأخطاء الشائعة: missing return links (الصفحة A تشير لـ B، لكن B ما تشير لـ A) · wrong language codes · تعارض مع canonical. ليس عقوبة، لكنه يعطّل تخصيص اللغة بالكامل", severity: "medium" },
    ],
  },
  {
    category: "المحتوى — يُضعف الجودة ويُعاقَب عليه",
    icon: FileText,
    items: [
      { name: "حشو الكلمات المفتاحية (Keyword Stuffing)", consequence: "تكرار الكلمة المفتاحية بشكل مصطنع في العنوان والمحتوى = جوجل يكتشفه ويعطي عقوبة مباشرة تدمّر الترتيب. الكتابة الطبيعية أهم من نسبة التكرار", severity: "critical" },
      { name: "محتوى ضحل بدون قيمة (Thin Content)", consequence: "Google ما يلزم بعدد كلمات محدد (نفى رسمياً وجود حد أدنى)، لكن المحتوى السطحي اللي يلخّص أفكار الآخرين بدون قيمة مضافة أو خبرة حقيقية = نظام Helpful Content (مدمج في الـ core منذ مارس 2024) يخفّض الموقع كله. تحديث مارس 2026 ضرب بشدة المواقع اللي تنشر محتوى سطحي بكثرة", severity: "high" },
      { name: "نشر نفس المحتوى في عدة صفحات (Duplicate Content)", consequence: "صفحتان بنفس المحتوى يتنافسان على نفس الكلمة المفتاحية. جوجل يضعف الاثنتين ويختار هو أيهما يعرض بدلاً منك", severity: "high" },
      { name: "محتوى AI منشور كما هو بدون قيمة مضافة", consequence: "Google قال رسمياً (John Mueller، نوفمبر 2025): \"أنظمتنا لا تهتم إذا كان المحتوى من AI أو من بشر — المهم هل هو مفيد للقارئ\". المشكلة مش في AI نفسه، المشكلة في النشر بدون مراجعة بشرية، خبرة حقيقية، ومصادر موثَّقة. الذكر الواضح إن المحتوى استخدم AI = شفافية مطلوبة", severity: "high" },
      { name: "إنتاج جماعي لمقالات بدون قيمة (Scaled Content)", consequence: "نشر آلاف المقالات بسرعة عشان تستهدف كلمات مفتاحية كثيرة (سواء بـ AI أو فرق كتاب) = سياسة جوجل 2024/2025 تسقط آلاف الصفحات دفعة واحدة", severity: "critical" },
      { name: "محتوى لا يطابق ما يبحث عنه القارئ", consequence: "لو عنوان المقال \"كيف تشتري كاميرا\" لكن المحتوى عن تاريخ التصوير = القراء يرجعون لجوجل بسرعة، وجوجل يفهم إن الصفحة مش مفيدة فيخفّضها", severity: "high" },
      { name: "نسخ محتوى من مواقع أخرى (Scraping)", consequence: "نسخ محتوى موقع تاني حتى مع تعديلات بسيطة = عقوبة Spam مباشرة. جوجل يكتشفه ويزيل الصفحة من الفهرس", severity: "critical" },
      { name: "نسخ وصف منتجات من الشركة المصنّعة", consequence: "موقع مراجعات ينسخ وصف المنتج من الشركة الأصلية بدون رأي حقيقي ولا قيمة مضافة = سياسة Thin Affiliation، الموقع كله ممكن يُحذف من الفهرس", severity: "high" },
      { name: "تعليقات spam في المقالات بدون مراجعة", consequence: "تعليقات بروابط مشبوهة أو إعلانات في قسم التعليقات لو ما تتحذف = جوجل يعاقب مودونتي كله، مش بس المقال. الإدارة لازم تراجع وتحذف بانتظام", severity: "high" },
      { name: "استخدام صور أو نصوص بدون إذن (Copyright / DMCA)", consequence: "صور بدون ترخيص، اقتباسات طويلة بدون إذن، أو إعادة نشر محتوى محمي = طلبات قانونية متراكمة + جوجل يخفّض الموقع. كل صورة في مودونتي لازم تكون من Cloudinary المعتمد أو مصدر مرخّص", severity: "high" },
      { name: "نشر معلومات شخصية بدون موافقة", consequence: "ذكر أسماء أشخاص حقيقيين مع تفاصيل خاصة، صورهم بدون إذن، أو أرقام تواصلهم = طلبات إزالة + خفض الموقع. في المقالات اذكر فقط المعلومات العامة الموثقة من مصدر رسمي", severity: "high" },
    ],
  },
  {
    category: "On-Page — أخطاء تُضعف كل صفحة",
    icon: Hash,
    items: [
      { name: "نفس وصف SEO (Meta Description) على كل المقالات", consequence: "Google ما يعتبره عقوبة مباشرة، لكن لو الوصف مكرر عدّ المقالات، Google يتجاهله ويكتب وصف من عنده (مأخوذ من المحتوى) — يفقد المقال فرصة الـ snippet المخصَّص اللي يقنع القارئ بالضغط من نتائج البحث", severity: "medium" },
      { name: "مقالان بنفس عنوان SEO يستهدفان نفس الكلمة", consequence: "Keyword Cannibalization — مش عقوبة رسمية من Google لكنها مشكلة جودة حقيقية: صفحتان من موقعك تتنافسان على نفس الكلمة المفتاحية، فيضعف ترتيب الاثنتين بدل ما تقوي الأقوى. الحل: دمجهما أو تمييز الكلمات المستهدفة", severity: "high" },
      { name: "مقال بدون عنوان رئيسي واضح (H1)", consequence: "Google قال رسمياً إن H1 ليس مطلوباً ولا يُلزم بوجوده. لكنه يساعد Google والقارئ على فهم موضوع المقال بسرعة، خصوصاً في صفحات النتائج لما Google يختار title link من H1 إذا كان أوضح من tag الـ title", severity: "medium" },
      { name: "صور بدون وصف (Alt Text فارغ)", consequence: "Alt Text أساسي لإمكانية الوصول (accessibility) — قارئ ضعيف البصر يعتمد على screen reader اللي يقرأ alt. كمان فرصة لظهور الصورة في Google Images. الإهمال = حرمان شريحة من القراء + فرصة ضائعة، مش عقوبة مباشرة لكنه إشارة جودة سلبية", severity: "medium" },
      { name: "روابط داخلية مكسورة (تعطي 404)", consequence: "رابط داخلي يقود لصفحة محذوفة = تجربة سيئة + إشارة إهمال. القارئ يحبط، وجوجل يستنتج إن الموقع غير محدّث", severity: "medium" },
      { name: "تغيير رابط (Slug) مقال منشور بدون توجيه (redirect)", consequence: "Slug = الجزء الأخير من الرابط (modonty.com/articles/THIS). لو غيّرته على مقال منشور بدون redirect للقديم، الرابط الأصلي يصير 404 وكل الترتيب اللي بناه المقال يضيع دفعة واحدة", severity: "critical" },
    ],
  },
  {
    category: "الروابط الخارجية — عقوبات Penguin",
    icon: Link2,
    items: [
      { name: "شراء الروابط أو بيعها", consequence: "دفع فلوس عشان موقع تاني يضع رابط لموقعك = خوارزمية Penguin من جوجل تكتشف الأنماط وتعطي عقوبة فورية. الأثر ممكن يدمّر الموقع كله", severity: "critical" },
      { name: "تبادل الروابط بشكل مصطنع (أنا أربط لك وأنت تربط لي)", consequence: "تبادل روابط واضح بين موقعين أو ثلاثة (A→B→A) = نمط مكشوف لجوجل. خوارزميات 2024/2025 تعاقب عليه مباشرة", severity: "critical" },
      { name: "روابط في مقال ضيف بدون rel=\"nofollow\"", consequence: "لما تكتب مقال ضيف على موقع تاني وتحط رابط لمودونتي، الرابط لازم يكون فيه rel=\"nofollow\" أو rel=\"sponsored\". بدونها، جوجل يعتبره link spam — مؤكد رسمياً", severity: "critical" },
      { name: "شبكة مواقع خاصة لبناء الروابط (PBN)", consequence: "PBN = شبكة مواقع مملوكة لشخص واحد، كلها تشير لموقع رئيسي عشان ترفعه. جوجل متخصص في اكتشاف الأنماط (نفس IP، نفس style) ويحذف الكل من الفهرس", severity: "critical" },
      { name: "استغلال سلطة الموقع المضيف (Site Reputation Abuse)", consequence: "🎯 سياسة تخصّ مودونتي مباشرة: نموذج عملنا = نشر محتوى لعملاء على دومين مودونتي. الحماية واجبة على كل مقال: (1) مراجعة من فريقنا قبل النشر (2) ذكر اسم العميل والكاتب بوضوح (3) قيمة حقيقية للقارئ، مش مجرد رابط للعميل. الإخلال بأي شرط = عقوبة على مودونتي كله", severity: "critical" },
      { name: "شراء دومين منتهي الصلاحية لاستغلال سلطته القديمة", consequence: "تشتري دومين قديم كان عليه موقع موثوق، وتنشر فيه محتوى ضعيف غير ذي صلة بالموقع الأصلي عشان تستفيد من سلطته = سياسة Spam رسمية 2024، حذف فوري من الفهرس", severity: "critical" },
      { name: "روابط من أدلة منخفضة الجودة أو bookmarks عامة", consequence: "حين فريق SEO يبني روابط لمودونتي، تجنّب الأدلة اللي تقبل أي إضافة بدون مراجعة، ومواقع bookmark العامة. الرابط منها ما ينفع وممكن يضر — جوجل يحسبها ضمن أنماط link spam", severity: "medium" },
    ],
  },
  {
    category: "Manual Penalty — عقوبات جوجل المباشرة",
    icon: AlertCircle,
    items: [
      { name: "عرض محتوى مختلف لجوجل وللمستخدم (Cloaking)", consequence: "تخدع جوجل بصفحة محتواها مختلف عن اللي يشوفه المستخدم (مثلاً: لجوجل صفحة عن وصفات، للمستخدم صفحة كازينو) = من أشد المخالفات خطورة. جوجل يحذف الموقع كاملاً من الفهرس", severity: "critical" },
      { name: "نص أو روابط مخفية (Hidden Text/Links)", consequence: "نص بنفس لون الخلفية، أو حجم خط صفر، أو نص خلف صورة، أو موضع خارج الشاشة = حشو كلمات مخفي عن المستخدم لكن مرئي لجوجل. عقوبة فورية", severity: "critical" },
      { name: "صفحات وهمية لاستهداف كلمات بحث (Doorway Pages)", consequence: "صفحات مصممة فقط للظهور في كلمات مفتاحية كثيرة، ومحتواها فارغ، وتحوّل المستخدم لصفحة تانية = عقوبة مباشرة من جوجل", severity: "critical" },
      { name: "تحويلات خادعة (Sneaky Redirects)", consequence: "صفحة تظهر لجوجل عادية، لكن لما المستخدم يدخلها تحوّله لصفحة مختلفة (إعلانات، مالوير، محتوى مختلف) = حذف من الفهرس", severity: "critical" },
      { name: "محتوى مُحقن من هاكرز", consequence: "هاكرز يخترقون الموقع ويحقنون محتوى أو روابط بدون علمك = جوجل يعلّم الموقع كـ \"Dangerous\" ويحذّر الزوار. لازم تنظيف فوري وإبلاغ جوجل في GSC", severity: "critical" },
      { name: "انتحال هوية أو معلومات كاذبة (Scam & Fraud)", consequence: "ادّعاء وجود الشركة في مدينة بدون مكتب فعلي، أو انتحال اسم علامة تجارية تانية، أو معلومات تجارية كاذبة = Manual action فوري وحذف من الفهرس", severity: "critical" },
      { name: "فتح موقع جديد بعد عقوبة للهروب منها", consequence: "موقعك تعرض لعقوبة، فتفتح موقع جديد أو subdomain لتكمل بنفس المحتوى = جوجل يربط الأنماط ويطبّق العقوبة على الجديد كمان", severity: "critical" },
      { name: "محاكاة عمليات بحث آلية (Machine-Generated Traffic)", consequence: "استخدام أدوات تحاكي عمليات بحث على جوجل كأنها من مستخدمين حقيقيين عشان ترفع الترتيب = حظر الـ IP وإشارات سلبية للموقع. مخالفة لشروط خدمة جوجل", severity: "critical" },
      { name: "Structured Data خادع أو مضلِّل (Spammy Schema)", consequence: "🎯 يخصّ مودونتي مباشرة: مودونتي تولّد JSON-LD تلقائياً لكل مقال (Article + Person + Organization). أي مخالفة في الـ schema = manual action تُعطّل ظهور Rich Results في نتائج البحث. الممنوعات: (1) Schema لمحتوى غير ظاهر للقارئ (2) Fake Reviews أو ratings غير حقيقية (3) markup لـ content مختلف عن موضوع الصفحة (مثلاً موقع نجارة يعمل markup وصفات طبخ). أي خلل = خطأ في الـ code، مش في إدخال الأدمن", severity: "high" },
    ],
  },
  {
    category: "تجربة المستخدم — إشارات سلبية لجوجل",
    icon: Activity,
    items: [
      { name: "Pop-ups تغطي المحتوى على الموبايل", consequence: "إعلانات منبثقة (pop-ups) تغطي المقال على شاشة الموبايل وتجبر المستخدم يضغط X = جوجل يخفّض الموقع لأنها تجربة سيئة", severity: "high" },
      { name: "تصميم غير متجاوب على الموبايل", consequence: "Mobile-first Indexing = جوجل يفهرس النسخة الموبايل من الموقع، مش الديسكتوب. لو الموقع غير متجاوب على الموبايل، الترتيب يصير أدنى في كل الأجهزة (حتى Desktop)", severity: "critical" },
      { name: "بطء استجابة الصفحة للتفاعل (INP أبطأ من 200ms)", consequence: "INP = الوقت اللي تاخذه الصفحة للاستجابة لما تضغط زرار أو رابط. جوجل قال رسمياً (مارس 2024): لازم تحت 200ms. أبطأ من كده = الصفحة تحس مكسورة، والترتيب يتأثر", severity: "high" },
      { name: "غياب HTTPS — أو صفحة فيها mixed content", consequence: "HTTPS = القفل الأخضر في المتصفح. جوجل يعتبره من إشارات الترتيب الرسمية. مودونتي على HTTPS حالياً، لكن أي صفحة تحمّل صور أو scripts من رابط HTTP (mixed content) تفقد القفل الأخضر وتنزل من إشارة Page Experience", severity: "high" },
    ],
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────
export default function ProhibitionsGuidelinePage() {
  return (
    <GuidelineLayout
      title="الممنوعات — Modonty Prohibitions"
      description="المرجع الموحّد لكل ما هو ممنوع عبر الفريق — SEO · Brand · Video — في صفحة واحدة"
    >

      {(() => {
        // Group categories into 3 disciplines (by category name keywords)
        const disciplines = [
          {
            value: "brand",
            label: "الهوية البصرية",
            sublabel: "Brand · Video · Platforms",
            icon: Palette,
            color: "data-[state=active]:text-violet-400 data-[state=active]:border-violet-500/40 data-[state=active]:bg-violet-500/[0.08]",
            categories: seoProhibitions.filter((c) =>
              c.category.includes("العلامة التجارية") || c.category.includes("الفيديو") || c.category.includes("منصات النشر")
            ),
          },
          {
            value: "content",
            label: "المحتوى والمقالات",
            sublabel: "Articles & On-Page",
            icon: FileText,
            color: "data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/40 data-[state=active]:bg-emerald-500/[0.08]",
            categories: seoProhibitions.filter((c) =>
              c.category.includes("المحتوى") || c.category.includes("On-Page")
            ),
          },
          {
            value: "technical",
            label: "SEO التقني",
            sublabel: "Technical · Links · Penalty · UX",
            icon: Wrench,
            color: "data-[state=active]:text-amber-400 data-[state=active]:border-amber-500/40 data-[state=active]:bg-amber-500/[0.08]",
            categories: seoProhibitions.filter((c) =>
              c.category.includes("التقني") || c.category.includes("الروابط الخارجية") || c.category.includes("Manual Penalty") || c.category.includes("تجربة المستخدم")
            ),
          },
        ];

        return (
          <Card className="border-red-500/40 bg-red-500/[0.02] overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="p-5 border-b border-red-500/30 flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 shrink-0 mt-0.5">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h2 dir="rtl" className="font-bold text-lg text-red-400 leading-tight">
                      محظورات <span dir="ltr" className="inline-block">Modonty</span> — كل ما هو ممنوع عبر الفريق
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      مرجع موحّد للفريق كله، مقسّم حسب التخصص. اختر التبويب الذي يخصك.
                    </p>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col flex-wrap gap-x-3 gap-y-1.5 shrink-0 ps-2 sm:ps-0 sm:border-s sm:border-red-500/20">
                  {(["critical", "high", "medium"] as Severity[]).map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${severityConfig[s].dot}`} />
                      <span className="text-xs font-medium text-foreground whitespace-nowrap">{severityConfig[s].label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 discipline tabs */}
              <Tabs defaultValue="brand" className="w-full">
                <TabsList className="w-full h-auto p-0 bg-transparent border-b border-red-500/20 rounded-none grid grid-cols-3 divide-x divide-x-reverse divide-red-500/10">
                  {disciplines.map((d) => {
                    const DIcon = d.icon;
                    const itemCount = d.categories.reduce((acc, c) => acc + c.items.length, 0);
                    return (
                      <TabsTrigger
                        key={d.value}
                        value={d.value}
                        className={`flex flex-col items-center gap-1.5 py-5 px-3 rounded-none border-b-2 border-transparent text-muted-foreground transition-colors ${d.color}`}
                      >
                        <div className="flex items-center gap-2">
                          <DIcon className="h-5 w-5" />
                          <span className="text-base font-bold">{d.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs opacity-70 hidden sm:inline">{d.sublabel}</span>
                          <span className="text-xs opacity-60 hidden sm:inline">·</span>
                          <span className="text-xs font-mono opacity-80">{itemCount} بند</span>
                        </div>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {disciplines.map((d) => (
                  <TabsContent key={d.value} value={d.value} className="m-0">
                    <Accordion type="multiple" defaultValue={d.categories[0] ? [d.categories[0].category] : []} className="divide-y divide-red-500/10">
                      {d.categories.map((cat) => {
                        const CatIcon = cat.icon;
                        return (
                          <AccordionItem key={cat.category} value={cat.category} className="border-0 px-5">
                            <AccordionTrigger className="py-5 hover:no-underline gap-2 [&>svg]:text-muted-foreground">
                              <div className="flex items-center gap-2.5">
                                <CatIcon className="h-4 w-4 text-red-400 shrink-0" />
                                <span className="text-base font-bold text-red-400">{cat.category}</span>
                                <span className="text-sm text-muted-foreground font-normal hidden sm:block">
                                  — {cat.items.length} بند
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {cat.items.map((item, i) => {
                                  const sc = severityConfig[item.severity];
                                  return (
                                    <div key={i} className="rounded-lg border border-border/50 bg-background/60 p-4 space-y-3">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-2 flex-1 min-w-0">
                                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${sc.dot}`} />
                                          <p className="text-base font-bold leading-snug text-foreground">{item.name}</p>
                                        </div>
                                        <Badge variant="outline" className={`text-[11px] px-2 py-0.5 shrink-0 whitespace-nowrap font-semibold ${sc.badge}`}>
                                          {sc.label}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground leading-relaxed ps-4">{item.consequence}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-red-500/20 bg-red-500/[0.03]">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  🔴 <strong className="text-red-400">خطر فوري</strong> — حذف من الفهرس أو manual penalty ·
                  🟠 <strong className="text-orange-400">يخفض الترتيب</strong> — خسارة مباشرة في نتائج البحث ·
                  🟡 <strong className="text-yellow-400">يضعف الموقع</strong> — تراجع تدريجي في الأداء
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })()}

    </GuidelineLayout>
  );
}
