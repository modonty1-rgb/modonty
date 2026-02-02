import { db } from "@/lib/db";
import {
  ArticleStatus,
  TrafficSource,
  SubscriptionTier,
  SubscriptionStatus,
  PaymentStatus,
  CommentStatus,
  SharePlatform,
  ConversionType,
  CTAType,
  CampaignType,
  LinkType,
} from "@prisma/client";
import {
  generateArticleWithOpenAI,
  type OpenAIArticleData,
  generateCategoriesWithOpenAI,
  type OpenAICategoriesData,
  generateTagsWithOpenAI,
  type OpenAITagsData,
  generateIndustriesWithOpenAI,
  type OpenAIIndustriesData,
  generateArticleTitlesWithOpenAI,
  type OpenAIArticleTitlesData,
  generateFAQTemplatesWithOpenAI,
  type OpenAIFAQTemplateData,
} from "@/lib/openai-seed";
import {
  fetchArticleTitlesFromNewsAPI,
  extractTagsFromNewsAPI,
  type NewsArticle,
} from "@/lib/news-api-seed";
import {
  validateImageUrl,
  downloadImageFromUrl,
  uploadImageBufferToCloudinary,
  searchUnsplashAlternative,
} from "@/lib/utils/image-validation";
import { v2 as cloudinary } from "cloudinary";
import {
  generateSEOFileName,
  generateCloudinaryPublicId,
  isValidCloudinaryPublicId,
  optimizeCloudinaryUrl,
} from "@/lib/utils/image-seo";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function generateRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Calculate proportional count based on article count
 * For small article counts (1-5): reduce per-article counts
 * For medium counts (6-20): moderate counts
 * For large counts (21+): full counts
 */
function getProportionalCount(
  articleCount: number,
  minPerArticle: number,
  maxPerArticle: number,
  scaleFactor: number = 1
): { min: number; max: number } {
  // Scale down for small article counts
  if (articleCount <= 5) {
    // For 1-5 articles: reduce to 30-50% of normal
    const scale = 0.3 + (articleCount / 5) * 0.2; // 0.3 to 0.5
    return {
      min: Math.max(1, Math.floor(minPerArticle * scale * scaleFactor)),
      max: Math.max(1, Math.floor(maxPerArticle * scale * scaleFactor)),
    };
  } else if (articleCount <= 20) {
    // For 6-20 articles: scale 50-80% of normal
    const scale = 0.5 + ((articleCount - 5) / 15) * 0.3; // 0.5 to 0.8
    return {
      min: Math.max(1, Math.floor(minPerArticle * scale * scaleFactor)),
      max: Math.max(1, Math.floor(maxPerArticle * scale * scaleFactor)),
    };
  } else {
    // For 21+ articles: full counts
    return {
      min: Math.max(1, Math.floor(minPerArticle * scaleFactor)),
      max: Math.max(1, Math.floor(maxPerArticle * scaleFactor)),
    };
  }
}

function generateSEOArticleContent(
  title: string,
  category: string,
  length: "short" | "medium" | "long"
): { content: string; excerpt: string; wordCount: number } {
  const seoContentTemplates: Record<string, Record<string, string[]>> = {
    "technical-seo": {
      short: [
        "Core Web Vitals هي مجموعة من المؤشرات التي يقيسها Google لتقييم تجربة المستخدم على موقعك. LCP (Largest Contentful Paint) يقيس سرعة تحميل المحتوى الرئيسي، بينما FID (First Input Delay) يقيس سرعة الاستجابة للتفاعلات.",
        "لتحسين Core Web Vitals، يجب تحسين سرعة تحميل الصور، تقليل JavaScript غير الضروري، واستخدام CDN لتسريع التحميل.",
      ],
      medium: [
        "Core Web Vitals هي مجموعة من المؤشرات الأساسية التي يستخدمها Google لتقييم جودة تجربة المستخدم على موقعك. هذه المؤشرات الثلاثة - LCP (Largest Contentful Paint)، FID (First Input Delay)، و CLS (Cumulative Layout Shift) - أصبحت جزءاً أساسياً من خوارزمية Google منذ عام 2021.",
        "LCP يقيس الوقت الذي يستغرقه أكبر عنصر محتوى في الصفحة للظهور. الهدف هو أن يكون أقل من 2.5 ثانية. يمكن تحسين LCP من خلال تحسين سرعة الخادم، استخدام CDN، تحسين الصور، وإزالة JavaScript الذي يعيق التحميل.",
        "FID يقيس الوقت بين تفاعل المستخدم الأول مع الصفحة (مثل النقر على رابط) ووقت استجابة المتصفح. الهدف هو أقل من 100 مللي ثانية. يمكن تحسين FID من خلال تقليل JavaScript، استخدام code splitting، وتأجيل تحميل المكونات غير الضرورية.",
        "CLS يقيس استقرار المحتوى المرئي. الهدف هو أقل من 0.1. يمكن تحسين CLS من خلال تحديد أبعاد الصور والفيديو مسبقاً، تجنب إدراج المحتوى فوق المحتوى الموجود، واستخدام خطوط web fonts بشكل صحيح.",
      ],
      long: [
        "Core Web Vitals هي مجموعة من المؤشرات الأساسية التي يستخدمها Google لتقييم جودة تجربة المستخدم على موقعك. هذه المؤشرات الثلاثة - LCP (Largest Contentful Paint)، FID (First Input Delay)، و CLS (Cumulative Layout Shift) - أصبحت جزءاً أساسياً من خوارزمية Google منذ عام 2021، وتؤثر بشكل مباشر على ترتيب موقعك في نتائج البحث.",
        "LCP (Largest Contentful Paint) يقيس الوقت الذي يستغرقه أكبر عنصر محتوى في الصفحة للظهور. الهدف هو أن يكون أقل من 2.5 ثانية. يمكن تحسين LCP من خلال عدة استراتيجيات:",
        "1. تحسين سرعة الخادم: استخدم خوادم سريعة وموزعة جغرافياً، واستخدم CDN لتوزيع المحتوى.",
        "2. تحسين الصور: استخدم تنسيقات الصور الحديثة مثل WebP أو AVIF، وضغط الصور بشكل صحيح.",
        "3. إزالة JavaScript المعيق: حدد JavaScript غير الضروري وأجله للتحميل بعد تحميل المحتوى الأساسي.",
        "4. تحسين CSS: استخدم critical CSS، وأزل CSS غير المستخدم.",
        "FID (First Input Delay) يقيس الوقت بين تفاعل المستخدم الأول مع الصفحة (مثل النقر على رابط) ووقت استجابة المتصفح. الهدف هو أقل من 100 مللي ثانية. يمكن تحسين FID من خلال:",
        "1. تقليل JavaScript: قلل من كمية JavaScript المستخدمة، واستخدم code splitting.",
        "2. تأجيل تحميل المكونات: أزل المكونات غير الضرورية من التحميل الأولي.",
        "3. استخدام Web Workers: استخدم Web Workers للمهام الثقيلة.",
        "CLS (Cumulative Layout Shift) يقيس استقرار المحتوى المرئي. الهدف هو أقل من 0.1. يمكن تحسين CLS من خلال:",
        "1. تحديد أبعاد الصور والفيديو: حدد width و height للصور والفيديو مسبقاً.",
        "2. تجنب إدراج المحتوى فوق المحتوى الموجود: لا تضيف إعلانات أو محتوى ديناميكي فوق المحتوى الموجود.",
        "3. استخدام خطوط web fonts بشكل صحيح: استخدم font-display: swap، وحدد fallback fonts.",
        "بتحسين Core Web Vitals، يمكنك تحسين تجربة المستخدم وترتيب موقعك في نتائج البحث بشكل كبير.",
      ],
    },
    "on-page-seo": {
      short: [
        "On-Page SEO يشمل جميع التحسينات التي يمكنك إجراؤها على صفحات موقعك لتحسين ترتيبها في محركات البحث. يتضمن ذلك تحسين Title Tags، Meta Descriptions، والعناوين.",
        "الكلمات المفتاحية مهمة جداً في On-Page SEO. يجب استخدام الكلمات المفتاحية بشكل طبيعي في العنوان، المحتوى، والعناوين الفرعية.",
      ],
      medium: [
        "On-Page SEO يشمل جميع التحسينات التي يمكنك إجراؤها مباشرة على صفحات موقعك لتحسين ترتيبها في محركات البحث. هذه التحسينات تتضمن تحسين Title Tags، Meta Descriptions، العناوين، المحتوى، والروابط الداخلية.",
        "Title Tags هي أحد أهم عناصر On-Page SEO. يجب أن يكون Title Tag فريداً لكل صفحة، ويحتوي على الكلمة المفتاحية الرئيسية، ويجب أن يكون طوله بين 50-60 حرفاً. يجب وضع الكلمة المفتاحية في بداية Title Tag كلما أمكن.",
        "Meta Descriptions مهمة أيضاً لـ SEO، رغم أنها لا تؤثر مباشرة على الترتيب. لكنها تؤثر على معدل النقر (CTR) من نتائج البحث. يجب أن تكون Meta Description جذابة، وتحتوي على الكلمة المفتاحية، ويجب أن يكون طولها بين 150-160 حرفاً.",
        "العناوين (H1, H2, H3) مهمة جداً لتنظيم المحتوى وإخبار محركات البحث عن هيكل الصفحة. يجب استخدام H1 مرة واحدة فقط في كل صفحة، ويجب أن يحتوي على الكلمة المفتاحية الرئيسية. العناوين الفرعية (H2, H3) تساعد في تنظيم المحتوى وجعل القراءة أسهل.",
      ],
      long: [
        "On-Page SEO يشمل جميع التحسينات التي يمكنك إجراؤها مباشرة على صفحات موقعك لتحسين ترتيبها في محركات البحث. هذه التحسينات تتضمن تحسين Title Tags، Meta Descriptions، العناوين، المحتوى، والروابط الداخلية.",
        "Title Tags هي أحد أهم عناصر On-Page SEO. يجب أن يكون Title Tag فريداً لكل صفحة، ويحتوي على الكلمة المفتاحية الرئيسية، ويجب أن يكون طوله بين 50-60 حرفاً. يجب وضع الكلمة المفتاحية في بداية Title Tag كلما أمكن. Title Tag يظهر في نتائج البحث وهو أول ما يراه المستخدم، لذلك يجب أن يكون جذاباً ومقنعاً.",
        "Meta Descriptions مهمة أيضاً لـ SEO، رغم أنها لا تؤثر مباشرة على الترتيب. لكنها تؤثر على معدل النقر (CTR) من نتائج البحث. يجب أن تكون Meta Description جذابة، وتحتوي على الكلمة المفتاحية، ويجب أن يكون طولها بين 150-160 حرفاً. يمكنك استخدام call-to-action في Meta Description لزيادة معدل النقر.",
        "العناوين (H1, H2, H3) مهمة جداً لتنظيم المحتوى وإخبار محركات البحث عن هيكل الصفحة. يجب استخدام H1 مرة واحدة فقط في كل صفحة، ويجب أن يحتوي على الكلمة المفتاحية الرئيسية. العناوين الفرعية (H2, H3) تساعد في تنظيم المحتوى وجعل القراءة أسهل. يجب استخدام العناوين بشكل هرمي ومنطقي.",
        "المحتوى هو الملك في On-Page SEO. يجب أن يكون المحتوى عالي الجودة، مفيداً للقارئ، ويجب أن يحتوي على الكلمات المفتاحية بشكل طبيعي. يجب تجنب keyword stuffing (حشو الكلمات المفتاحية). يجب أن يكون المحتوى طويلاً بما يكفي لتغطية الموضوع بشكل شامل (عادة 1000+ كلمة للمواضيع المهمة).",
        "الروابط الداخلية مهمة جداً لـ On-Page SEO. تساعد الروابط الداخلية في توزيع PageRank على صفحات الموقع، وتسهل على محركات البحث اكتشاف وفهم هيكل الموقع. يجب ربط الصفحات ذات الصلة ببعضها البعض باستخدام anchor text وصفية.",
        "تحسين الصور مهم أيضاً. يجب استخدام alt text وصفية للصور، وضغط الصور لتقليل حجمها، واستخدام تنسيقات الصور الحديثة. يجب أيضاً استخدام أسماء ملفات وصفية للصور.",
      ],
    },
    "off-page-seo": {
      short: [
        "Off-Page SEO يشمل جميع الأنشطة التي تقوم بها خارج موقعك لتحسين ترتيبه في محركات البحث. أهم عنصر في Off-Page SEO هو بناء الروابط الخلفية (Backlinks).",
        "الروابط الخلفية عالية الجودة من مواقع موثوقة تساعد في تحسين Domain Authority وترتيب موقعك في نتائج البحث.",
      ],
      medium: [
        "Off-Page SEO يشمل جميع الأنشطة التي تقوم بها خارج موقعك لتحسين ترتيبه في محركات البحث. أهم عنصر في Off-Page SEO هو بناء الروابط الخلفية (Backlinks) من مواقع أخرى.",
        "الروابط الخلفية عالية الجودة من مواقع موثوقة تساعد في تحسين Domain Authority وترتيب موقعك في نتائج البحث. Google يعتبر الروابط الخلفية كتصويتات ثقة من مواقع أخرى. كلما زادت جودة وعدد الروابط الخلفية، كلما تحسن ترتيب موقعك.",
        "هناك عدة طرق لبناء الروابط الخلفية:",
        "1. إنشاء محتوى عالي الجودة يجذب الروابط الطبيعية.",
        "2. Guest Posting على مواقع أخرى في نفس المجال.",
        "3. المشاركة في المنتديات والمجتمعات المتخصصة.",
        "4. استخدام Broken Link Building (العثور على روابط معطلة في مواقع أخرى واقتراح محتوى بديل).",
        "يجب تجنب شراء الروابط أو استخدام روابط غير طبيعية، لأن ذلك قد يؤدي إلى عقوبات من Google.",
      ],
      long: [
        "Off-Page SEO يشمل جميع الأنشطة التي تقوم بها خارج موقعك لتحسين ترتيبه في محركات البحث. أهم عنصر في Off-Page SEO هو بناء الروابط الخلفية (Backlinks) من مواقع أخرى.",
        "الروابط الخلفية عالية الجودة من مواقع موثوقة تساعد في تحسين Domain Authority وترتيب موقعك في نتائج البحث. Google يعتبر الروابط الخلفية كتصويتات ثقة من مواقع أخرى. كلما زادت جودة وعدد الروابط الخلفية، كلما تحسن ترتيب موقعك.",
        "هناك عدة طرق لبناء الروابط الخلفية:",
        "1. إنشاء محتوى عالي الجودة يجذب الروابط الطبيعية: المحتوى القيم والجذاب يجذب الروابط تلقائياً من مواقع أخرى. ركز على إنشاء محتوى فريد ومفيد يجيب على أسئلة المستخدمين.",
        "2. Guest Posting على مواقع أخرى في نفس المجال: الكتابة كضيف على مواقع أخرى في نفس المجال يمكن أن تساعدك في الحصول على روابط خلفية عالية الجودة. اختر المواقع التي لها Domain Authority عالي وحركة مرور جيدة.",
        "3. المشاركة في المنتديات والمجتمعات المتخصصة: المشاركة في المنتديات والمجتمعات المتخصصة (مثل Reddit، Quora) يمكن أن تساعدك في بناء سمعة وروابط خلفية. لكن يجب أن تكون مساهماً حقيقياً وليس فقط للترويج.",
        "4. استخدام Broken Link Building: هذه الاستراتيجية تتضمن العثور على روابط معطلة في مواقع أخرى واقتراح محتوى بديل من موقعك. هذه طريقة فعالة للحصول على روابط خلفية.",
        "5. إنشاء موارد قابلة للمشاركة: إنشاء أدوات، حاسبات، أو موارد أخرى قابلة للمشاركة يمكن أن يجذب روابط خلفية طبيعية.",
        "يجب تجنب شراء الروابط أو استخدام روابط غير طبيعية، لأن ذلك قد يؤدي إلى عقوبات من Google. ركز على بناء روابط طبيعية وعالية الجودة بدلاً من الكمية.",
      ],
    },
  };

  const defaultContent = {
    short: [
      `${title} هو موضوع مهم في تحسين محركات البحث. في هذا المقال، سنستكشف الجوانب الأساسية لهذا الموضوع.`,
      `من خلال فهم المبادئ الأساسية وتطبيقها بشكل صحيح، يمكنك تحسين ترتيب موقعك في نتائج البحث.`,
    ],
    medium: [
      `${title} هو موضوع مهم في تحسين محركات البحث. في هذا المقال، سنستكشف الجوانب الأساسية لهذا الموضوع بالتفصيل.`,
      `سنتناول في هذا الدليل الشامل كل ما تحتاج معرفته عن ${title}. من الأساسيات إلى المستوى المتقدم.`,
      `من خلال فهم المبادئ الأساسية وتطبيقها بشكل صحيح، يمكنك تحسين ترتيب موقعك في نتائج البحث بشكل كبير.`,
      `في الختام، ${title} يمثل فرصة كبيرة لتحسين ظهور موقعك في محركات البحث.`,
    ],
    long: [
      `${title} هو موضوع مهم في تحسين محركات البحث. في هذا المقال، سنستكشف الجوانب الأساسية لهذا الموضوع بالتفصيل.`,
      `سنتناول في هذا الدليل الشامل كل ما تحتاج معرفته عن ${title}. من الأساسيات إلى المستوى المتقدم.`,
      `في القسم الأول، سنغطي المبادئ الأساسية لـ ${title}. هذه المبادئ مهمة لفهم الموضوع بشكل كامل.`,
      `في القسم الثاني، سنستكشف الاستراتيجيات المتقدمة لـ ${title}. هذه الاستراتيجيات يمكن أن تساعدك في تحقيق نتائج أفضل.`,
      `في القسم الثالث، سنناقش أفضل الممارسات في ${title}. هذه الممارسات مستندة إلى سنوات من الخبرة والبحث.`,
      `من خلال فهم المبادئ الأساسية وتطبيقها بشكل صحيح، يمكنك تحسين ترتيب موقعك في نتائج البحث بشكل كبير.`,
      `في الختام، ${title} يمثل فرصة كبيرة لتحسين ظهور موقعك في محركات البحث. من خلال تطبيق ما تعلمناه في هذا المقال، يمكنك تحقيق نتائج متميزة.`,
    ],
  };

  const templates = seoContentTemplates[category] || defaultContent;
  const paragraphs = templates[length] || defaultContent[length];

  const content = paragraphs.join("\n\n");
  const words = content.split(/\s+/);
  const wordCount = words.length;
  const excerpt = paragraphs[0].substring(0, 150) + "...";

  return { content, excerpt, wordCount };
}

function generateSEOFields(title: string, excerpt: string, category: string) {
  const seoTitle = `${title} | ${category}`;
  const seoDescription = excerpt.length > 155 ? excerpt.substring(0, 152) + "..." : excerpt;

  return {
    seoTitle,
    seoDescription,
    metaRobots: "index, follow",
    canonicalUrl: `https://modonty.com/articles/${slugify(title)}`,
    sitemapPriority: 0.7,
    sitemapChangeFreq: "weekly" as const,
    ogType: "article" as const,
    ogArticleAuthor: "Modonty",
    twitterCard: "summary_large_image" as const,
    twitterSite: "@modonty",
    twitterCreator: "@modonty",
  };
}

async function clearDatabase(logCallback?: (message: string, level?: "info" | "success" | "error") => void) {
  const log = logCallback || console.log;
  const logError = logCallback || console.error;

  log("Clearing existing data...", "info");

  try {
    log("  [1/6] Deleting related articles...", "info");
    const relatedCount = await db.relatedArticle.count();
    if (relatedCount > 0) {
      await db.relatedArticle.deleteMany({});
      log(`    Deleted ${relatedCount} related articles`, "success");
    }

    log("  [2/6] Deleting FAQs...", "info");
    const faqCount = await db.articleFAQ.count();
    if (faqCount > 0) {
      await db.articleFAQ.deleteMany({});
      log(`    Deleted ${faqCount} FAQs`, "success");
    }

    log("  [3/6] Deleting analytics...", "info");
    const analyticsCount = await db.analytics.count();
    if (analyticsCount > 0) {
      await db.analytics.deleteMany({});
      log(`    Deleted ${analyticsCount} analytics records`, "success");
    }

    log("  [4/6] Deleting article media gallery...", "info");
    const mediaCount = await db.articleMedia.count();
    if (mediaCount > 0) {
      await db.articleMedia.deleteMany({});
      log(`    Deleted ${mediaCount} article media records`, "success");
    }

    log("  [5/6] Deleting article tags...", "info");
    const tagCount = await db.articleTag.count();
    if (tagCount > 0) {
      await db.articleTag.deleteMany({});
      log(`    Deleted ${tagCount} article tags`, "success");
    }

    log("  [6/6] Deleting article versions...", "info");
    const versionCount = await db.articleVersion.count();
    if (versionCount > 0) {
      await db.articleVersion.deleteMany({});
      log(`    Deleted ${versionCount} article versions`, "success");
    }

    log("  [7/7] Deleting article link clicks...", "info");
    const linkClickCount = await db.articleLinkClick.count();
    if (linkClickCount > 0) {
      await db.articleLinkClick.deleteMany({});
      log(`    Deleted ${linkClickCount} article link clicks`, "success");
    }

    log("  Deleting engagement duration...", "info");
    const engagementCount = await db.engagementDuration.count();
    if (engagementCount > 0) {
      await db.engagementDuration.deleteMany({});
      log(`    Deleted ${engagementCount} engagement duration records`, "success");
    }

    log("  Deleting lead scoring...", "info");
    const leadScoringCount = await db.leadScoring.count();
    if (leadScoringCount > 0) {
      await db.leadScoring.deleteMany({});
      log(`    Deleted ${leadScoringCount} lead scoring records`, "success");
    }

    log("  Deleting campaign tracking...", "info");
    const campaignCount = await db.campaignTracking.count();
    if (campaignCount > 0) {
      await db.campaignTracking.deleteMany({});
      log(`    Deleted ${campaignCount} campaign tracking records`, "success");
    }

    log("  Deleting CTA clicks...", "info");
    const ctaClickCount = await db.cTAClick.count();
    if (ctaClickCount > 0) {
      await db.cTAClick.deleteMany({});
      log(`    Deleted ${ctaClickCount} CTA clicks`, "success");
    }

    log("  Deleting conversions...", "info");
    const conversionCount = await db.conversion.count();
    if (conversionCount > 0) {
      await db.conversion.deleteMany({});
      log(`    Deleted ${conversionCount} conversions`, "success");
    }

    log("  Deleting shares...", "info");
    const shareCount = await db.share.count();
    if (shareCount > 0) {
      await db.share.deleteMany({});
      log(`    Deleted ${shareCount} shares`, "success");
    }

    log("  Deleting client views...", "info");
    const clientViewCount = await db.clientView.count();
    if (clientViewCount > 0) {
      await db.clientView.deleteMany({});
      log(`    Deleted ${clientViewCount} client views`, "success");
    }

    log("  Deleting article views...", "info");
    const articleViewCount = await db.articleView.count();
    if (articleViewCount > 0) {
      await db.articleView.deleteMany({});
      log(`    Deleted ${articleViewCount} article views`, "success");
    }

    log("  Deleting client comment dislikes...", "info");
    const clientCommentDislikeCount = await db.clientCommentDislike.count();
    if (clientCommentDislikeCount > 0) {
      await db.clientCommentDislike.deleteMany({});
      log(`    Deleted ${clientCommentDislikeCount} client comment dislikes`, "success");
    }

    log("  Deleting client comment likes...", "info");
    const clientCommentLikeCount = await db.clientCommentLike.count();
    if (clientCommentLikeCount > 0) {
      await db.clientCommentLike.deleteMany({});
      log(`    Deleted ${clientCommentLikeCount} client comment likes`, "success");
    }

    log("  Deleting client favorites...", "info");
    const clientFavoriteCount = await db.clientFavorite.count();
    if (clientFavoriteCount > 0) {
      await db.clientFavorite.deleteMany({});
      log(`    Deleted ${clientFavoriteCount} client favorites`, "success");
    }

    log("  Deleting client dislikes...", "info");
    const clientDislikeCount = await db.clientDislike.count();
    if (clientDislikeCount > 0) {
      await db.clientDislike.deleteMany({});
      log(`    Deleted ${clientDislikeCount} client dislikes`, "success");
    }

    log("  Deleting client likes...", "info");
    const clientLikeCount = await db.clientLike.count();
    if (clientLikeCount > 0) {
      await db.clientLike.deleteMany({});
      log(`    Deleted ${clientLikeCount} client likes`, "success");
    }

    log("  Clearing parent references from client comments...", "info");
    await db.clientComment.updateMany({
      data: { parentId: null },
    });

    log("  Deleting client comments...", "info");
    const clientCommentCount = await db.clientComment.count();
    if (clientCommentCount > 0) {
      await db.clientComment.deleteMany({});
      log(`    Deleted ${clientCommentCount} client comments`, "success");
    }

    log("  Deleting comment dislikes...", "info");
    const commentDislikeCount = await db.commentDislike.count();
    if (commentDislikeCount > 0) {
      await db.commentDislike.deleteMany({});
      log(`    Deleted ${commentDislikeCount} comment dislikes`, "success");
    }

    log("  Deleting comment likes...", "info");
    const commentLikeCount = await db.commentLike.count();
    if (commentLikeCount > 0) {
      await db.commentLike.deleteMany({});
      log(`    Deleted ${commentLikeCount} comment likes`, "success");
    }

    log("  Deleting article favorites...", "info");
    const articleFavoriteCount = await db.articleFavorite.count();
    if (articleFavoriteCount > 0) {
      await db.articleFavorite.deleteMany({});
      log(`    Deleted ${articleFavoriteCount} article favorites`, "success");
    }

    log("  Deleting article dislikes...", "info");
    const articleDislikeCount = await db.articleDislike.count();
    if (articleDislikeCount > 0) {
      await db.articleDislike.deleteMany({});
      log(`    Deleted ${articleDislikeCount} article dislikes`, "success");
    }

    log("  Deleting article likes...", "info");
    const articleLikeCount = await db.articleLike.count();
    if (articleLikeCount > 0) {
      await db.articleLike.deleteMany({});
      log(`    Deleted ${articleLikeCount} article likes`, "success");
    }

    log("  Clearing parent references from comments...", "info");
    await db.comment.updateMany({
      data: { parentId: null },
    });

    log("  Deleting comments...", "info");
    const commentCount = await db.comment.count();
    if (commentCount > 0) {
      await db.comment.deleteMany({});
      log(`    Deleted ${commentCount} comments`, "success");
    }

    log("  Deleting articles...", "info");
    const articleCount = await db.article.count();
    if (articleCount > 0) {
      await db.article.deleteMany({});
      log(`    Deleted ${articleCount} articles`, "success");
    }

    log("  Deleting article tags (before deleting tags - children first)...", "info");
    await db.articleTag.deleteMany({});
    await new Promise((resolve) => setTimeout(resolve, 200));

    log("  Deleting tags (parent)...", "info");
    await db.tag.deleteMany({});

    log("  Deleting subscribers (depend on clients - children)...", "info");
    await db.subscriber.deleteMany({});

    log("  Clearing media references from clients...", "info");
    await db.client.updateMany({
      data: {
        logoMediaId: null,
        ogImageMediaId: null,
        twitterImageMediaId: null,
      },
    });

    log("  Clearing parent organization references from clients...", "info");
    await db.client.updateMany({
      data: { parentOrganizationId: null },
    });

    log("  Deleting clients (parent)...", "info");
    await db.client.deleteMany({});

    log("  Deleting media (parent)...", "info");
    await db.media.deleteMany({});

    log("  Clearing parent references from categories...", "info");
    await db.category.updateMany({
      data: { parentId: null },
    });

    log("  Deleting categories...", "info");
    await db.category.deleteMany({});

    log("  Deleting authors...", "info");
    await db.author.deleteMany({});

    log("  Deleting industries...", "info");
    await db.industry.deleteMany({});

    log("  Deleting settings...", "info");
    await db.settings.deleteMany({});

    log("  Deleting subscription tier configs...", "info");
    await db.subscriptionTierConfig.deleteMany({});

    log("✅ Database cleared successfully.", "success");
  } catch (error) {
    logError("❌ Error during database clearing:", "error");
    if (error instanceof Error) {
      logError(`   ${error.message}`, "error");
    }
    throw error;
  }
}

async function seedSubscriptionTierConfigs(logCallback?: (message: string, level?: "info" | "success" | "error") => void) {
  const log = logCallback || console.log;
  log("Seeding subscription tier configs...", "info");

  const tierConfigs = [
    {
      tier: SubscriptionTier.BASIC,
      name: "Basic",
      articlesPerMonth: 2,
      price: 2499,
      isActive: true,
      isPopular: false,
      description: "Perfect for small businesses getting started with content marketing",
    },
    {
      tier: SubscriptionTier.STANDARD,
      name: "Standard",
      articlesPerMonth: 4,
      price: 3999,
      isActive: true,
      isPopular: true,
      description: "Most popular choice for growing businesses (Most Popular)",
    },
    {
      tier: SubscriptionTier.PRO,
      name: "Pro",
      articlesPerMonth: 8,
      price: 6999,
      isActive: true,
      isPopular: false,
      description: "Ideal for established businesses with consistent content needs",
    },
    {
      tier: SubscriptionTier.PREMIUM,
      name: "Premium",
      articlesPerMonth: 12,
      price: 9999,
      isActive: true,
      isPopular: false,
      description: "Best for large enterprises and agencies requiring high-volume content",
    },
  ];

  const createdConfigs = [];
  for (const configData of tierConfigs) {
    const config = await db.subscriptionTierConfig.upsert({
      where: { tier: configData.tier },
      update: {
        name: configData.name,
        articlesPerMonth: configData.articlesPerMonth,
        price: configData.price,
        isActive: configData.isActive,
        isPopular: configData.isPopular,
        description: configData.description,
      },
      create: configData,
    });
    createdConfigs.push(config);
  }

  log(`Seeded ${createdConfigs.length} subscription tier configs.`, "success");
  return createdConfigs;
}

async function seedIndustries(
  useOpenAI: boolean,
  industryBrief?: string,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding industries...", "info");

  let industriesData: Array<{
    name: string;
    slug: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
  }> = [];

  if (useOpenAI) {
    try {
      log("Generating industries with OpenAI...", "info");
      const aiIndustries = await generateIndustriesWithOpenAI({
        language: "ar",
        industryBrief,
      });
      industriesData = aiIndustries.industries;
      log(`Generated ${industriesData.length} industries with AI.`, "success");
    } catch (error) {
      const logError = logCallback || console.error;
      logError(
        "OpenAI industry generation failed, falling back to templates:",
        "error"
      );
      logError(error instanceof Error ? error.message : String(error), "error");
      // Fall through to hardcoded templates
      useOpenAI = false;
    }
  }

  if (!useOpenAI) {
    // Hardcoded fallback templates
    industriesData = [
      {
        name: "التقنية والبرمجيات",
        slug: "technology-software",
        description: "صناعة التقنية والبرمجيات وتطوير التطبيقات",
        seoTitle: "التقنية والبرمجيات - صناعة التكنولوجيا",
        seoDescription: "اكتشف أحدث التطورات في صناعة التقنية والبرمجيات وتطوير التطبيقات.",
      },
      {
        name: "التسويق الرقمي",
        slug: "digital-marketing",
        description: "صناعة التسويق الرقمي وتحسين محركات البحث",
        seoTitle: "التسويق الرقمي - استراتيجيات التسويق عبر الإنترنت",
        seoDescription: "تعلم أحدث استراتيجيات التسويق الرقمي وتحسين محركات البحث لزيادة المبيعات.",
      },
      {
        name: "التصميم والإبداع",
        slug: "design-creativity",
        description: "صناعة التصميم الجرافيكي وواجهات المستخدم",
        seoTitle: "التصميم والإبداع - تصميم واجهات المستخدم",
        seoDescription: "اكتشف أحدث اتجاهات التصميم وواجهات المستخدم وتجربة المستخدم.",
      },
      {
        name: "التجارة الإلكترونية",
        slug: "ecommerce",
        description: "صناعة التجارة الإلكترونية والمتاجر الإلكترونية",
        seoTitle: "التجارة الإلكترونية - بناء متاجر إلكترونية ناجحة",
        seoDescription: "تعلم كيفية بناء وإدارة متاجر إلكترونية ناجحة وتحسين المبيعات.",
      },
      {
        name: "الخدمات المالية",
        slug: "financial-services",
        description: "صناعة الخدمات المالية والتكنولوجيا المالية",
        seoTitle: "الخدمات المالية - التكنولوجيا المالية",
        seoDescription: "اكتشف أحدث التطورات في التكنولوجيا المالية والخدمات المالية.",
      },
      {
        name: "الرعاية الصحية",
        slug: "healthcare",
        description: "صناعة الرعاية الصحية والتكنولوجيا الطبية",
        seoTitle: "الرعاية الصحية - التكنولوجيا الطبية",
        seoDescription: "تعلم عن أحدث التطورات في التكنولوجيا الطبية والرعاية الصحية.",
      },
      {
        name: "التعليم",
        slug: "education",
        description: "صناعة التعليم والتكنولوجيا التعليمية",
        seoTitle: "التعليم - التكنولوجيا التعليمية",
        seoDescription: "اكتشف كيف يمكن للتكنولوجيا تحسين التعليم والتعلم.",
      },
      {
        name: "الطاقة والاستدامة",
        slug: "energy-sustainability",
        description: "صناعة الطاقة المتجددة والاستدامة",
        seoTitle: "الطاقة والاستدامة - الطاقة المتجددة",
        seoDescription: "تعلم عن الطاقة المتجددة والاستدامة والتقنيات الخضراء.",
      },
    ];
  }

  const createdIndustries = [];
  for (const industryData of industriesData) {
    const industry = await db.industry.upsert({
      where: { slug: industryData.slug },
      update: industryData,
      create: industryData,
    });
    createdIndustries.push(industry);
  }

  log(`Seeded ${createdIndustries.length} industries.`, "success");
  return createdIndustries;
}

async function seedClients(
  industries: Awaited<ReturnType<typeof seedIndustries>>,
  tierConfigs: Awaited<ReturnType<typeof seedSubscriptionTierConfigs>>,
  articleCount: number,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void,
  targetClientCount?: number
) {
  const log = logCallback || console.log;
  log("Seeding clients...", "info");

  // If targetClientCount is provided (Phase 1), use it directly
  // Otherwise, calculate client count based on article count (Phase 2)
  // Estimate: 1 client per 10-15 articles, minimum 3, maximum 20
  const estimatedClientCount = targetClientCount
    ? targetClientCount
    : Math.max(3, Math.min(20, Math.ceil(articleCount / 12)));

  if (targetClientCount) {
    log(`  Generating ${estimatedClientCount} clients (Phase 1)...`, "info");
  } else {
    log(`  Generating ${estimatedClientCount} clients based on ${articleCount} articles...`, "info");
  }

  // Client name templates
  const clientNamePrefixes = [
    "حلول", "مركز", "استوديو", "مختبرات", "شركة", "مجموعة", "مؤسسة", "وكالة",
    "منصة", "خدمات", "تقنيات", "ابتكارات", "تطويرات", "حلول تقنية", "حلول رقمية"
  ];

  const clientNameSuffixes = [
    "المتقدمة", "المحترفة", "الرقمية", "التقنية", "الإبداعية", "الذكية", "الحديثة",
    "المبتكرة", "المتخصصة", "الاحترافية", "العالمية", "المحلية", "المستدامة"
  ];

  const businessTypes = [
    "تقنية", "برمجية", "تسويقية", "تصميم", "تجارة إلكترونية", "استشارات",
    "خدمات رقمية", "حلول ذكية", "تطوير", "ابتكار", "تسويق رقمي", "تصميم جرافيكي"
  ];

  const cityNames = [
    "الرياض", "جدة", "الدمام", "المدينة", "الطائف", "الخبر", "بريدة", "تبوك"
  ];

  const tierDistribution = [
    SubscriptionTier.BASIC,
    SubscriptionTier.STANDARD,
    SubscriptionTier.STANDARD,
    SubscriptionTier.PRO,
    SubscriptionTier.PREMIUM,
  ];

  const clientsData = [];

  for (let i = 0; i < estimatedClientCount; i++) {
    const prefix = getRandomElement(clientNamePrefixes);
    const suffix = getRandomElement(clientNameSuffixes);
    const businessType = getRandomElement(businessTypes);
    const city = getRandomElement(cityNames);

    // Generate client name
    const name = `${prefix} ${businessType} ${suffix}`;
    const slug = `client-${i + 1}-${slugify(businessType)}-${slugify(city)}-${Date.now()}-${i}`;
    const legalName = `${name} ش.م.م`;

    // Generate email
    const emailSlug = slugify(`${businessType}-${city}-${i + 1}`);
    const email = `info@${emailSlug}.example.com`;

    // Generate phone
    const phoneSuffix = Math.floor(Math.random() * 9000000) + 1000000;
    const phone = `+96650${phoneSuffix}`;

    // Select industry (distribute evenly)
    const industry = industries[i % industries.length];

    // Select subscription tier (weighted distribution)
    const tier = tierDistribution[Math.floor(Math.random() * tierDistribution.length)];

    // Generate founding date (within last 10 years)
    const yearsAgo = Math.random() * 10;
    const foundingDate = new Date(Date.now() - yearsAgo * 365 * 24 * 60 * 60 * 1000);

    // Generate URLs
    const url = `https://${emailSlug}.example.com`;
    const linkedInUrl = `https://linkedin.com/company/${emailSlug}`;
    const twitterHandle = `${emailSlug.replace(/-/g, '')}`.substring(0, 15);

    // Generate SEO fields
    const seoTitle = `${name} - ${businessType} في ${city}`;
    const seoDescription = `${name} هي ${businessType} متخصصة في ${city}. نقدم حلول احترافية وعالية الجودة لعملائنا في المنطقة.`;

    clientsData.push({
      name,
      slug,
      legalName,
      url,
      sameAs: [linkedInUrl, `https://twitter.com/${twitterHandle}`],
      email,
      phone,
      seoTitle,
      seoDescription,
      foundingDate,
      industrySlug: industry.slug,
      subscriptionTier: tier,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      paymentStatus: PaymentStatus.PAID,
    });
  }

  // All clients are now dynamically generated based on article count

  const createdClients = [];
  const now = new Date();
  // Set subscription start to 12 months ago to align with article publication dates
  const subscriptionStartDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  // Set subscription end to 1 year from start (18 months total: 12 months paid = 18 months content)
  const subscriptionEndDate = new Date(subscriptionStartDate.getTime() + 365 * 24 * 60 * 60 * 1000);

  for (const clientData of clientsData) {
    const industry = industries.find((i) => i.slug === clientData.industrySlug);
    const tierConfig = tierConfigs.find((t) => t.tier === clientData.subscriptionTier);
    const { industrySlug, ...clientFields } = clientData;

    // Get articlesPerMonth and subscriptionTierConfigId from tier config
    const articlesPerMonth = tierConfig?.articlesPerMonth || 0;
    const subscriptionTierConfigId = tierConfig?.id || null;

    const client = await db.client.upsert({
      where: { slug: clientFields.slug },
      update: {
        ...clientFields,
        industryId: industry?.id,
        subscriptionStartDate,
        subscriptionEndDate,
        articlesPerMonth,
        subscriptionTierConfigId,
      },
      create: {
        ...clientFields,
        industryId: industry?.id,
        subscriptionStartDate,
        subscriptionEndDate,
        articlesPerMonth,
        subscriptionTierConfigId,
      },
    });
    createdClients.push(client);
  }

  log(`Seeded ${createdClients.length} clients.`, "success");
  return createdClients;
}

async function seedAuthors(logCallback?: (message: string, level?: "info" | "success" | "error") => void) {
  const log = logCallback || console.log;
  log("Seeding author (singleton: modonty)...", "info");

  const author = await db.author.upsert({
    where: { slug: "modonty" },
    update: {
      name: "Modonty",
      firstName: "Modonty",
      lastName: "Team",
      bio: "فريق Modonty المتخصص في تحسين محركات البحث والتسويق الرقمي. نقدم محتوى عالي الجودة عن SEO وأفضل الممارسات.",
      jobTitle: "خبير SEO ومتخصص في التسويق الرقمي",
      expertiseAreas: [
        "Technical SEO",
        "On-Page SEO",
        "Off-Page SEO",
        "Local SEO",
        "Content SEO",
        "E-E-A-T",
        "Core Web Vitals",
        "Schema Markup",
      ],
      credentials: [
        "Google Analytics Certified",
        "Google Search Console Expert",
        "SEO Specialist Certification",
      ],
      qualifications: [
        "خبرة 10+ سنوات في SEO",
        "خبير في تحليل البيانات",
        "متخصص في تحسين الأداء",
      ],
      experienceYears: 10,
      verificationStatus: true,
      memberOf: ["Google Partners", "SEO Professionals Association"],
      seoTitle: "Modonty - خبير SEO ومتخصص في التسويق الرقمي",
      seoDescription:
        "فريق Modonty المتخصص في تحسين محركات البحث. اكتشف أحدث استراتيجيات SEO وأفضل الممارسات.",
      linkedIn: "https://linkedin.com/company/modonty",
      twitter: "https://twitter.com/modonty",
      sameAs: [
        "https://linkedin.com/company/modonty",
        "https://twitter.com/modonty",
        "https://facebook.com/modonty",
      ],
    },
    create: {
      name: "Modonty",
      slug: "modonty",
      firstName: "Modonty",
      lastName: "Team",
      bio: "فريق Modonty المتخصص في تحسين محركات البحث والتسويق الرقمي. نقدم محتوى عالي الجودة عن SEO وأفضل الممارسات.",
      jobTitle: "خبير SEO ومتخصص في التسويق الرقمي",
      expertiseAreas: [
        "Technical SEO",
        "On-Page SEO",
        "Off-Page SEO",
        "Local SEO",
        "Content SEO",
        "E-E-A-T",
        "Core Web Vitals",
        "Schema Markup",
      ],
      credentials: [
        "Google Analytics Certified",
        "Google Search Console Expert",
        "SEO Specialist Certification",
      ],
      qualifications: [
        "خبرة 10+ سنوات في SEO",
        "خبير في تحليل البيانات",
        "متخصص في تحسين الأداء",
      ],
      experienceYears: 10,
      verificationStatus: true,
      memberOf: ["Google Partners", "SEO Professionals Association"],
      seoTitle: "Modonty - خبير SEO ومتخصص في التسويق الرقمي",
      seoDescription:
        "فريق Modonty المتخصص في تحسين محركات البحث. اكتشف أحدث استراتيجيات SEO وأفضل الممارسات.",
      linkedIn: "https://linkedin.com/company/modonty",
      twitter: "https://twitter.com/modonty",
      sameAs: [
        "https://linkedin.com/company/modonty",
        "https://twitter.com/modonty",
        "https://facebook.com/modonty",
      ],
    },
  });

  log(`Seeded author: ${author.name}`, "success");
  return author;
}

async function seedCategories(
  useOpenAI: boolean,
  industryBrief: string | undefined,
  articleCount: number,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding categories...", "info");

  let categoriesData: Array<{
    name: string;
    slug: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
  }> = [];
  let childCategories: Array<{
    name: string;
    slug: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    parentSlug: string;
  }> = [];
  let parentSlugs: string[] = [];

  if (useOpenAI) {
    try {
      log("Generating categories with OpenAI...", "info");
      const aiCategories = await generateCategoriesWithOpenAI({
        language: "ar",
        industryBrief,
        articleCount,
      });
      categoriesData = aiCategories.parentCategories;
      childCategories = aiCategories.childCategories;
      parentSlugs = childCategories
        .map((c) => c.parentSlug)
        .filter((slug, index, arr) => arr.indexOf(slug) === index);
      log(`Generated ${categoriesData.length} parent categories and ${childCategories.length} child categories with AI.`, "success");
    } catch (error) {
      const logError = logCallback || console.error;
      logError(
        "OpenAI category generation failed, falling back to templates:",
        "error"
      );
      logError(error instanceof Error ? error.message : String(error), "error");
      // Fall through to hardcoded templates
      useOpenAI = false;
    }
  }

  if (!useOpenAI) {
    // Hardcoded fallback templates
    categoriesData = [
      {
        name: "Technical SEO",
        slug: "technical-seo",
        description: "مقالات عن Technical SEO وCore Web Vitals وSchema Markup",
        seoTitle: "Technical SEO - تحسين محركات البحث التقني",
        seoDescription:
          "اكتشف أحدث استراتيجيات Technical SEO وCore Web Vitals وSchema Markup لتحسين ظهور موقعك في نتائج البحث.",
      },
      {
        name: "On-Page SEO",
        slug: "on-page-seo",
        description: "مقالات عن On-Page SEO وتحسين المحتوى",
        seoTitle: "On-Page SEO - تحسين محركات البحث على الصفحة",
        seoDescription:
          "تعلم كيفية تحسين On-Page SEO من خلال تحسين المحتوى والكلمات المفتاحية والعناصر الداخلية.",
      },
      {
        name: "Off-Page SEO",
        slug: "off-page-seo",
        description: "مقالات عن Off-Page SEO وبناء الروابط",
        seoTitle: "Off-Page SEO - تحسين محركات البحث خارج الصفحة",
        seoDescription:
          "اكتشف استراتيجيات Off-Page SEO وبناء الروابط الخلفية لتحسين ترتيب موقعك في محركات البحث.",
      },
      {
        name: "Local SEO",
        slug: "local-seo",
        description: "مقالات عن Local SEO وGoogle My Business",
        seoTitle: "Local SEO - تحسين محركات البحث المحلي",
        seoDescription:
          "تعلم كيفية تحسين Local SEO وGoogle My Business لزيادة ظهورك في البحث المحلي.",
      },
      {
        name: "Content SEO",
        slug: "content-seo",
        description: "مقالات عن Content SEO واستراتيجيات المحتوى",
        seoTitle: "Content SEO - تحسين محركات البحث للمحتوى",
        seoDescription:
          "اكتشف كيفية إنشاء محتوى محسّن لـ SEO يجذب الزوار ويحسن ترتيبك في محركات البحث.",
      },
      {
        name: "E-E-A-T",
        slug: "e-e-a-t",
        description: "مقالات عن E-E-A-T (Expertise, Authoritativeness, Trustworthiness)",
        seoTitle: "E-E-A-T - الخبرة والسلطة والموثوقية في SEO",
        seoDescription:
          "تعلم كيفية تحسين E-E-A-T (Expertise, Authoritativeness, Trustworthiness) لموقعك ومحتواك.",
      },
      {
        name: "Mobile SEO",
        slug: "mobile-seo",
        description: "مقالات عن Mobile SEO وMobile-First Indexing",
        seoTitle: "Mobile SEO - تحسين محركات البحث للموبايل",
        seoDescription:
          "اكتشف كيفية تحسين Mobile SEO وMobile-First Indexing لتحسين تجربة المستخدم على الأجهزة المحمولة.",
      },
      {
        name: "International SEO",
        slug: "international-seo",
        description: "مقالات عن International SEO وhreflang",
        seoTitle: "International SEO - تحسين محركات البحث الدولي",
        seoDescription:
          "تعلم كيفية تحسين International SEO وhreflang لاستهداف الأسواق الدولية.",
      },
    ];

    parentSlugs = ["technical-seo", "on-page-seo", "off-page-seo", "local-seo"];
    childCategories = [
      {
        name: "Core Web Vitals",
        slug: "core-web-vitals",
        description: "مقالات عن Core Web Vitals وقياس الأداء",
        seoTitle: "Core Web Vitals - مؤشرات الأداء الأساسية",
        seoDescription: "تعلم كيفية تحسين Core Web Vitals (LCP, FID, CLS) لتحسين تجربة المستخدم.",
        parentSlug: "technical-seo",
      },
      {
        name: "Schema Markup",
        slug: "schema-markup",
        description: "مقالات عن Schema Markup والبيانات المنظمة",
        seoTitle: "Schema Markup - البيانات المنظمة",
        seoDescription: "اكتشف كيفية استخدام Schema Markup لتحسين ظهورك في نتائج البحث.",
        parentSlug: "technical-seo",
      },
      {
        name: "Keyword Research",
        slug: "keyword-research",
        description: "مقالات عن Keyword Research واستراتيجيات الكلمات المفتاحية",
        seoTitle: "Keyword Research - البحث عن الكلمات المفتاحية",
        seoDescription: "تعلم كيفية إجراء Keyword Research واختيار الكلمات المفتاحية المناسبة.",
        parentSlug: "on-page-seo",
      },
      {
        name: "Link Building",
        slug: "link-building",
        description: "مقالات عن Link Building وبناء الروابط الخلفية",
        seoTitle: "Link Building - بناء الروابط الخلفية",
        seoDescription: "اكتشف استراتيجيات Link Building الفعالة لتحسين Domain Authority.",
        parentSlug: "off-page-seo",
      },
    ];
  }

  const createdCategories = [];
  for (const categoryData of categoriesData) {
    const category = await db.category.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: categoryData,
    });
    createdCategories.push(category);
  }

  // Get parent categories for child category mapping
  const parents = await db.category.findMany({
    where: { slug: { in: parentSlugs.length > 0 ? parentSlugs : categoriesData.map((c) => c.slug) } },
    select: { id: true, slug: true },
  });
  const parentMap = new Map(parents.map((p) => [p.slug, p.id]));

  for (const child of childCategories) {
    const parentId = parentMap.get(child.parentSlug);
    if (!parentId) continue;

    const { parentSlug, ...categoryData } = child;
    const category = await db.category.upsert({
      where: { slug: categoryData.slug },
      update: { ...categoryData, parentId },
      create: { ...categoryData, parentId },
    });
    createdCategories.push(category);
  }

  log(`Seeded ${createdCategories.length} categories (including hierarchy).`, "success");
  return createdCategories;
}

async function seedTags(
  useOpenAI: boolean,
  industryBrief: string | undefined,
  articleCount: number,
  useNewsAPI?: boolean,
  newsAPIArticles?: NewsArticle[],
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding tags...", "info");

  // Extract tags from NewsAPI articles (hybrid approach)
  let newsAPITags: string[] = [];
  if (useNewsAPI && newsAPIArticles && newsAPIArticles.length > 0) {
    try {
      log("Extracting tags from NewsAPI articles...", "info");
      const extracted = extractTagsFromNewsAPI({ articles: newsAPIArticles });
      newsAPITags = extracted.tags;
      log(`Extracted ${newsAPITags.length} tags from NewsAPI articles.`, "success");
    } catch (error) {
      const logError = logCallback || console.error;
      logError("Failed to extract tags from NewsAPI articles", "error");
      logError(error instanceof Error ? error.message : String(error), "error");
    }
  }

  let tagsData: string[] = [];

  if (useOpenAI) {
    try {
      log("Generating tags with OpenAI...", "info");
      const aiTags = await generateTagsWithOpenAI({
        language: "ar",
        industryBrief,
        articleCount,
      });
      tagsData = aiTags.tags;
      log(`Generated ${tagsData.length} tags with AI.`, "success");
    } catch (error) {
      const logError = logCallback || console.error;
      logError(
        "OpenAI tag generation failed, falling back to templates:",
        "error"
      );
      logError(error instanceof Error ? error.message : String(error), "error");
      // Fall through to hardcoded templates
      useOpenAI = false;
    }
  }

  if (!useOpenAI) {
    // Hardcoded fallback templates
    tagsData = [
      "SEO",
      "Technical SEO",
      "On-Page SEO",
      "Off-Page SEO",
      "Local SEO",
      "Content SEO",
      "E-E-A-T",
      "Core Web Vitals",
      "LCP",
      "FID",
      "CLS",
      "INP",
      "Schema Markup",
      "Structured Data",
      "JSON-LD",
      "Backlinks",
      "Link Building",
      "Domain Authority",
      "Page Speed",
      "Mobile SEO",
      "Mobile-First Indexing",
      "Keyword Research",
      "Long-Tail Keywords",
      "Meta Tags",
      "Title Tags",
      "Meta Descriptions",
      "Canonical URLs",
      "Robots.txt",
      "Sitemap",
      "Google Search Console",
      "Google Analytics",
      "Search Engine Optimization",
      "Organic Traffic",
      "Search Rankings",
      "Algorithm Updates",
      "Google Updates",
      "Content Marketing",
      "Blogging",
      "Content Strategy",
      "User Experience",
      "Conversion Rate Optimization",
      "A/B Testing",
      "Landing Pages",
      "Internal Linking",
      "External Linking",
      "Anchor Text",
      "Image SEO",
      "Alt Text",
      "Video SEO",
      "Voice Search",
      "Featured Snippets",
      "Rich Snippets",
      "Knowledge Graph",
      "Semantic SEO",
      "Topic Clusters",
      "Pillar Pages",
      "Content Clusters",
    ];
  }

  // Merge NewsAPI tags with OpenAI/template tags
  const allTags = [...newsAPITags, ...tagsData];
  
  // Dedupe and normalize tags (case-insensitive)
  const uniqueTagsMap = new Map<string, string>();
  for (const tag of allTags) {
    const normalized = tag.trim().toLowerCase();
    if (!uniqueTagsMap.has(normalized) && tag.trim().length > 0) {
      // Preserve original case from first occurrence
      uniqueTagsMap.set(normalized, tag.trim());
    }
  }
  
  tagsData = Array.from(uniqueTagsMap.values());
  
  if (newsAPITags.length > 0) {
    log(`Merged ${newsAPITags.length} NewsAPI tags with ${tagsData.length - newsAPITags.length} existing tags.`, "info");
  }

  const createdTags = [];
  log(`  Creating ${tagsData.length} tags...`, "info");
  for (let idx = 0; idx < tagsData.length; idx++) {
    const tagName = tagsData[idx];
    const tag = await db.tag.upsert({
      where: { slug: slugify(tagName) },
      update: { name: tagName },
      create: { name: tagName, slug: slugify(tagName) },
    });
    createdTags.push(tag);

    if ((idx + 1) % 10 === 0) {
      log(`    ✓ Created ${idx + 1}/${tagsData.length} tags...`, "info");
    }
  }

  log(`✅ Seeded ${createdTags.length} tags.`, "success");
  return createdTags;
}

async function seedArticles(
  clients: Awaited<ReturnType<typeof seedClients>>,
  author: Awaited<ReturnType<typeof seedAuthors>>,
  categories: Awaited<ReturnType<typeof seedCategories>>,
  articleCount: number,
  useOpenAI: boolean,
  industryBrief?: string,
  useNewsAPI?: boolean,
  newsAPIArticles?: NewsArticle[],
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log(`Seeding ${articleCount} SEO articles...`, "info");
  const startTime = Date.now();

  let seoArticleTitles: string[] = [];

  // Priority 1: NewsAPI (if enabled)
  if (useNewsAPI) {
    // If articles already fetched, use them
    if (newsAPIArticles && newsAPIArticles.length > 0) {
      try {
        log("Using article titles from NewsAPI...", "info");
        seoArticleTitles = newsAPIArticles
          .map((article) => article.title)
          .filter((title) => title && title.trim().length > 0);
        log(`Using ${seoArticleTitles.length} article titles from NewsAPI.`, "success");
      } catch (error) {
        const logError = logCallback || console.error;
        logError(
          "Failed to extract titles from NewsAPI articles, falling back to OpenAI/templates:",
          "error"
        );
        logError(error instanceof Error ? error.message : String(error), "error");
      }
    } else {
      // Fetch articles if not provided
      try {
        log("Fetching article titles from NewsAPI...", "info");
        const newsData = await fetchArticleTitlesFromNewsAPI({
          language: "ar",
          pageSize: articleCount,
          query: industryBrief || "SEO technology",
          industryBrief,
        });
        seoArticleTitles = newsData.titles;
        log(`Fetched ${seoArticleTitles.length} article titles from NewsAPI.`, "success");
      } catch (error) {
        const logError = logCallback || console.error;
        logError(
          "NewsAPI title fetch failed, falling back to OpenAI/templates:",
          "error"
        );
        logError(error instanceof Error ? error.message : String(error), "error");
        // Fall through to OpenAI/templates
      }
    }
  }

  // Priority 2: OpenAI (if enabled and NewsAPI didn't provide titles)
  if (seoArticleTitles.length === 0 && useOpenAI) {
    try {
      log("Generating article titles with OpenAI...", "info");
      const aiTitles = await generateArticleTitlesWithOpenAI({
        language: "ar",
        industryBrief,
        count: articleCount, // Generate exactly the number of articles needed
      });
      seoArticleTitles = aiTitles.titles;
      log(`Generated ${seoArticleTitles.length} article titles with AI.`, "success");
    } catch (error) {
      const logError = logCallback || console.error;
      logError(
        "OpenAI article title generation failed, falling back to templates:",
        "error"
      );
      logError(error instanceof Error ? error.message : String(error), "error");
      // Fall through to hardcoded templates
    }
  }

  if (seoArticleTitles.length === 0) {
    // Hardcoded fallback templates
    seoArticleTitles = [
      "دليل شامل لتحسين Core Web Vitals في 2025",
      "كيفية استخدام Schema Markup لتحسين ظهورك في البحث",
      "تحسين سرعة الصفحة: أدوات وأفضل الممارسات",
      "Mobile-First Indexing: كل ما تحتاج معرفته",
      "كيفية تحسين LCP (Largest Contentful Paint)",
      "تحسين FID و INP: تقليل وقت الاستجابة",
      "تقليل CLS: تحسين استقرار التخطيط",
      "استخدام JSON-LD للبيانات المنظمة",
      "تحسين Structured Data لنتائج البحث الغنية",
      "Technical SEO Checklist: قائمة التحقق الكاملة",
      "استراتيجيات البحث عن الكلمات المفتاحية",
      "كيفية كتابة Title Tags محسّنة لـ SEO",
      "أفضل الممارسات في Meta Descriptions",
      "تحسين العناوين (H1, H2, H3) لـ SEO",
      "Keyword Research: دليل شامل للمبتدئين",
      "Long-Tail Keywords: استراتيجيات فعالة",
      "تحسين المحتوى للكلمات المفتاحية",
      "Internal Linking: استراتيجيات الربط الداخلي",
      "تحسين الصور لـ SEO: Alt Text وأفضل الممارسات",
      "On-Page SEO Checklist: قائمة التحقق الكاملة",
      "استراتيجيات بناء الروابط الخلفية (Backlinks) الفعالة",
      "Link Building: دليل شامل للمبتدئين",
      "كيفية تحسين Domain Authority",
      "Guest Posting: كيفية الكتابة كضيف",
      "Broken Link Building: استراتيجية فعالة",
      "تحليل الروابط الخلفية للمنافسين",
      "تجنب عقوبات Google: أفضل الممارسات",
      "Off-Page SEO Checklist: قائمة التحقق الكاملة",
      "تحسين محركات البحث المحلي: دليل Google My Business",
      "Local SEO: استراتيجيات للشركات المحلية",
      "كيفية تحسين NAP (Name, Address, Phone)",
      "Local Citations: بناء Citations محلية",
      "Google Maps Optimization: تحسين الخرائط",
      "Local SEO Checklist: قائمة التحقق الكاملة",
      "استراتيجيات Content Marketing لـ SEO",
      "كيفية إنشاء محتوى محسّن لـ SEO",
      "Topic Clusters: استراتيجية المحتوى المتقدم",
      "Pillar Pages: بناء صفحات الركيزة",
      "Content Clusters: تنظيم المحتوى",
      "كيفية كتابة محتوى طويل وعالي الجودة",
      "Content SEO Checklist: قائمة التحقق الكاملة",
      "أهمية E-E-A-T في تحسين محركات البحث",
      "كيفية تحسين Expertise في المحتوى",
      "بناء Authoritativeness لموقعك",
      "تحسين Trustworthiness للموقع",
      "E-E-A-T Checklist: قائمة التحقق الكاملة",
      "Mobile SEO: دليل شامل",
      "تحسين Mobile User Experience",
      "AMP (Accelerated Mobile Pages): دليل شامل",
      "Mobile SEO Checklist: قائمة التحقق الكاملة",
      "International SEO: استهداف الأسواق الدولية",
      "hreflang Tags: دليل شامل",
      "Multilingual SEO: تحسين المواقع متعددة اللغات",
      "International SEO Checklist: قائمة التحقق الكاملة",
      "Google Search Console: دليل الاستخدام الكامل",
      "Google Analytics 4: تحليل البيانات",
      "أفضل أدوات SEO التي يجب أن تعرفها",
      "كيفية تحليل بيانات SEO",
      "SEO Tools Checklist: قائمة الأدوات",
      "Semantic SEO: تحسين البحث الدلالي",
      "Voice Search Optimization: تحسين البحث الصوتي",
      "Featured Snippets: كيفية الظهور في المقتطفات",
      "Rich Snippets: تحسين النتائج الغنية",
      "Knowledge Graph: فهم الرسم البياني المعرفي",
      "تحسين Robots.txt لـ SEO",
      "XML Sitemap: دليل شامل",
      "Canonical URLs: كيفية استخدامها",
      "تحسين 404 Errors",
      "Redirects: 301 vs 302",
      "HTTPS و SEO: أهمية SSL",
      "تحسين URL Structure",
      "Image SEO: دليل شامل",
      "Video SEO: تحسين الفيديو",
      "Podcast SEO: تحسين البودكاست",
      "E-commerce SEO: تحسين المتاجر الإلكترونية",
      "Blog SEO: تحسين المدونات",
      "News SEO: تحسين الأخبار",
      "YouTube SEO: تحسين اليوتيوب",
      "Social Media SEO: تحسين وسائل التواصل",
      "Email Marketing و SEO",
      "PPC و SEO: التكامل بينهما",
      "Competitor Analysis: تحليل المنافسين",
      "SEO Audit: كيفية إجراء تدقيق شامل",
      "Technical SEO Audit: تدقيق تقني",
      "Content Audit: تدقيق المحتوى",
      "Link Audit: تدقيق الروابط",
      "SEO Reporting: كيفية إنشاء تقارير",
      "KPIs لـ SEO: مؤشرات الأداء",
      "ROI في SEO: قياس العائد",
      "SEO Budget: كيفية تخصيص الميزانية",
      "In-House vs Agency: أيهما أفضل",
      "SEO Trends 2025: الاتجاهات الجديدة",
      "Google Algorithm Updates: التحديثات الأخيرة",
      "Future of SEO: مستقبل SEO",
    ];
  }

  const extendedTitles = seoArticleTitles;

  const articles: Awaited<ReturnType<typeof db.article.create>>[] = [];
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const statusDistribution: ArticleStatus[] = [];
  const publishedTarget = Math.round(articleCount * 0.6);
  const draftTarget = articleCount - publishedTarget;
  for (let i = 0; i < publishedTarget; i++) statusDistribution.push(ArticleStatus.PUBLISHED);
  for (let i = 0; i < draftTarget; i++) statusDistribution.push(ArticleStatus.DRAFT);

  const lengthDistribution: ("short" | "medium" | "long")[] = [];
  const shortTarget = Math.round(articleCount * 0.3);
  const mediumTarget = Math.round(articleCount * 0.4);
  const longTarget = articleCount - (shortTarget + mediumTarget);
  for (let i = 0; i < shortTarget; i++) lengthDistribution.push("short");
  for (let i = 0; i < mediumTarget; i++) lengthDistribution.push("medium");
  for (let i = 0; i < longTarget; i++) lengthDistribution.push("long");

  const shuffledStatus = statusDistribution.sort(() => Math.random() - 0.5);
  const shuffledLength = lengthDistribution.sort(() => Math.random() - 0.5);

  for (let i = 0; i < articleCount; i++) {
    const client = clients[i % clients.length];
    const category = categories[i % categories.length];
    const title = extendedTitles[i % extendedTitles.length];
    const slug = `${slugify(title)}-${i + 1}`;
    const status = shuffledStatus[i];
    const length = shuffledLength[i];
    const categorySlug = category.slug;

    let content: string;
    let excerpt: string;
    let wordCount: number;
    let aiData: OpenAIArticleData | null = null;

    if (useOpenAI) {
      try {
        aiData = await generateArticleWithOpenAI({
          title,
          category: categorySlug,
          length,
          language: "ar",
          industryBrief,
        });
        content = aiData.content;
        excerpt = aiData.excerpt;
        wordCount = aiData.wordCount;
      } catch (error) {
        const logError = logCallback || console.error;
        logError(
          "OpenAI article generation failed, falling back to templates:",
          "error"
        );
        if (error instanceof Error) {
          logError(`   ${error.message}`, "error");
        }
        const fallback = generateSEOArticleContent(title, categorySlug, length);
        content = fallback.content;
        excerpt = fallback.excerpt;
        wordCount = fallback.wordCount;
        aiData = null;
      }
    } else {
      const fallback = generateSEOArticleContent(title, categorySlug, length);
      content = fallback.content;
      excerpt = fallback.excerpt;
      wordCount = fallback.wordCount;
    }

    const readingTime = Math.ceil(wordCount / 200);
    const contentDepth = length;

    const datePublished =
      status === ArticleStatus.PUBLISHED ? generateRandomDate(twelveMonthsAgo, now) : null;

    // Extract Twitter handles from client and author
    const clientTwitterHandle = client.sameAs?.find((url) => url.includes("twitter.com"))?.split("/").pop()?.replace("@", "") || undefined;
    const authorTwitterHandle = author.twitter?.replace("@", "") || undefined;
    const twitterSite = clientTwitterHandle ? `@${clientTwitterHandle}` : "@modonty";
    const twitterCreator = authorTwitterHandle ? `@${authorTwitterHandle}` : "@modonty";

    // Canonical URL: always siteUrl/articles/slug (never /clients/.../articles/)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
    const canonicalUrl = `${siteUrl}/articles/${slug}`;

    // Set metaRobots based on status
    const metaRobots = status === ArticleStatus.PUBLISHED ? "index, follow" : "noindex, nofollow";

    // Generate breadcrumb path
    const breadcrumbPath = [
      { name: "Home", url: client.url || "https://modonty.com" },
      { name: category.name, url: `${client.url || "https://modonty.com"}/categories/${category.slug}` },
      { name: title, url: canonicalUrl },
    ];

    // Set lastReviewed to datePublished for published articles, or null for drafts
    const lastReviewed = datePublished ? new Date(datePublished.getTime() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000) : null;

    // Set mainEntityOfPage (canonical URL)
    const mainEntityOfPage = canonicalUrl;

    // Set license (default to CC-BY for articles)
    const license = "https://creativecommons.org/licenses/by/4.0/";

    // Set alternate languages (for multilingual support - currently Arabic only)
    const alternateLanguages = [
      { hreflang: "ar", url: canonicalUrl },
    ];

    // Extract plain text from markdown content for articleBodyText
    const articleBodyText = content
      .replace(/```[\s\S]*?```/g, "") // Remove code blocks
      .replace(/`[^`]+`/g, "") // Remove inline code
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Convert links to text
      .replace(/[#*_~`]/g, "") // Remove markdown formatting
      .replace(/\n{3,}/g, "\n\n") // Normalize line breaks
      .trim();

    // Generate semantic keywords from title, category, and tags (will be populated later)
    const semanticKeywords = [
      { name: title, url: canonicalUrl },
      { name: category.name, url: `${client.url || "https://modonty.com"}/categories/${category.slug}` },
    ];

    // Generate citations (external authoritative sources) - can be enhanced with AI
    const citations = [
      "https://developers.google.com/search/docs",
      "https://schema.org/Article",
    ];

    let seoFields = generateSEOFields(title, excerpt, category.name);
    if (aiData) {
      if (aiData.seoTitle) {
        seoFields = { ...seoFields, seoTitle: aiData.seoTitle };
      }
      if (aiData.seoDescription) {
        seoFields = { ...seoFields, seoDescription: aiData.seoDescription };
      }
    }

    const article = await db.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        clientId: client.id,
        categoryId: category.id,
        authorId: author.id,
        status,
        datePublished,
        featured: i % 20 === 0,
        wordCount,
        readingTimeMinutes: readingTime,
        contentDepth,
        ...seoFields,
        canonicalUrl,
        mainEntityOfPage,
        lastReviewed,
        breadcrumbPath: breadcrumbPath as any,
        articleBodyText,
        semanticKeywords: semanticKeywords as any,
        citations,
        ogArticlePublishedTime: datePublished || undefined,
        ogArticleModifiedTime: datePublished || undefined,
      },
    });

    articles.push(article);

    if ((i + 1) % 10 === 0 || i === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      log(
        `    ✓ Created ${i + 1}/${articleCount} articles (${status}, ${length}, ${wordCount} words) - ${elapsed}s`,
        "info"
      );
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${articles.length} articles in ${totalTime} seconds.`, "success");
  return articles;
}

async function seedArticleTags(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  tags: Awaited<ReturnType<typeof seedTags>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding article tags...", "info");
  const startTime = Date.now();
  let count = 0;
  const total = articles.length;

  for (let idx = 0; idx < articles.length; idx++) {
    const article = articles[idx];
    const tagCount = Math.floor(Math.random() * 4) + 2;
    const selectedTags = getRandomElements(tags, tagCount);

    for (const tag of selectedTags) {
      await db.articleTag.upsert({
        where: {
          articleId_tagId: {
            articleId: article.id,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          articleId: article.id,
          tagId: tag.id,
        },
      });
      count++;
    }

    if ((idx + 1) % 10 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      log(
        `    ✓ Processed ${idx + 1}/${total} articles (${count} tag relations) - ${elapsed}s`,
        "info"
      );
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} article-tag relationships in ${totalTime} seconds.`, "success");
}

/**
 * Upload image to Cloudinary using SDK (seed-only function)
 * Uses Cloudinary SDK for reliable server-side uploads from URLs
 */
async function uploadImageToCloudinarySDK(params: {
  sourceUrl?: string;
  buffer?: Buffer;
  publicId: string;
  altText: string;
  folder?: string;
  mimeType: string;
}): Promise<{ success: boolean; url?: string; cloudinaryPublicId?: string; cloudinaryVersion?: string; error?: string }> {
  const { buffer, sourceUrl, publicId, altText, folder, mimeType } = params;

  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return {
        success: false,
        error: "Cloudinary configuration missing. Please check your environment variables (CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).",
      };
    }

    // Configure Cloudinary SDK
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    // Generate SEO-friendly public_id
    const seoFileName = generateSEOFileName(altText, "", "", undefined, true);
    const cloudinaryPublicId = folder
      ? generateCloudinaryPublicId(seoFileName, folder)
      : seoFileName;

    if (!isValidCloudinaryPublicId(cloudinaryPublicId)) {
      return {
        success: false,
        error: "Generated public_id is invalid.",
      };
    }

    // Upload options
    const uploadOptions: any = {
      public_id: cloudinaryPublicId,
      resource_type: "image" as const,
    };

    if (folder) {
      uploadOptions.asset_folder = folder;
    }

    let uploadResult;

    // Method 1: Direct URL upload (SDK handles this perfectly)
    if (sourceUrl) {
      uploadResult = await cloudinary.uploader.upload(sourceUrl, uploadOptions);
    }
    // Method 2: Buffer upload (fallback)
    else if (buffer) {
      const base64Data = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      uploadResult = await cloudinary.uploader.upload(dataUrl, uploadOptions);
    } else {
      return {
        success: false,
        error: "Either sourceUrl or buffer must be provided.",
      };
    }

    // Extract results from SDK response
    const cloudinaryUrl = uploadResult.secure_url || uploadResult.url;
    const optimizedUrl = optimizeCloudinaryUrl(
      cloudinaryUrl,
      uploadResult.public_id,
      uploadResult.format || "jpg",
      "image"
    );

    return {
      success: true,
      url: optimizedUrl,
      cloudinaryPublicId: uploadResult.public_id, // SDK returns actual public_id
      cloudinaryVersion: uploadResult.version?.toString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function processImageUrl(
  originalUrl: string,
  searchTerm: string,
  altText: string,
  folder: string,
  defaultMimeType: string,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
): Promise<{
  url: string;
  cloudinaryPublicId?: string;
  cloudinaryVersion?: string;
  mimeType: string;
  fileSize?: number;
}> {
  const log = logCallback || console.log;

  // 1. Validate original URL
  const validation = await validateImageUrl(originalUrl);

  if (validation.valid) {
    log(`    ✓ Valid image URL: ${originalUrl}`, "info");

    // 2. Upload directly from URL to Cloudinary using SDK (recommended method)
    const upload = await uploadImageToCloudinarySDK({
      sourceUrl: originalUrl,
      publicId: altText,
      altText,
      folder,
      mimeType: defaultMimeType,
    });

    if (upload.success && upload.url) {
      log(`    ✓ Uploaded to Cloudinary: ${upload.url}`, "info");
      return {
        url: upload.url,
        cloudinaryPublicId: upload.cloudinaryPublicId,
        cloudinaryVersion: upload.cloudinaryVersion,
        mimeType: defaultMimeType,
        fileSize: undefined, // Cloudinary will handle file size
      };
    } else {
      log(`    ⚠ Cloudinary upload failed: ${upload.error || "Unknown error"}, trying buffer upload...`, "error");

      // Fallback: Download and upload as buffer
      const download = await downloadImageFromUrl(originalUrl);
      if (download.success && download.buffer) {
        const bufferUpload = await uploadImageToCloudinarySDK({
          buffer: download.buffer,
          publicId: altText,
          altText,
          folder,
          mimeType: download.mimeType || defaultMimeType,
        });

        if (bufferUpload.success && bufferUpload.url) {
          log(`    ✓ Uploaded to Cloudinary via buffer: ${bufferUpload.url}`, "info");
          return {
            url: bufferUpload.url,
            cloudinaryPublicId: bufferUpload.cloudinaryPublicId,
            cloudinaryVersion: bufferUpload.cloudinaryVersion,
            mimeType: download.mimeType || defaultMimeType,
            fileSize: download.buffer.length,
          };
        } else {
          log(`    ⚠ Buffer upload also failed: ${bufferUpload.error || "Unknown error"}`, "error");
        }
      } else {
        log(`    ⚠ Image download failed: ${download.error || "Unknown error"}, searching alternative...`, "error");
      }
    }
  } else {
    log(`    ✗ Invalid image URL (${validation.statusCode || validation.error}): ${originalUrl}, searching alternative...`, "error");
  }

  // 4. Search Unsplash alternative
  const unsplash = await searchUnsplashAlternative(searchTerm);
  if (unsplash.success && unsplash.url) {
    log(`    ✓ Found alternative from Unsplash: ${unsplash.url}`, "info");

    // 5. Upload alternative directly from Unsplash URL using SDK
    const upload = await uploadImageToCloudinarySDK({
      sourceUrl: unsplash.url,
      publicId: altText,
      altText,
      folder,
      mimeType: defaultMimeType,
    });

    if (upload.success && upload.url) {
      log(`    ✓ Uploaded alternative to Cloudinary: ${upload.url}`, "info");
      return {
        url: upload.url,
        cloudinaryPublicId: upload.cloudinaryPublicId,
        cloudinaryVersion: upload.cloudinaryVersion,
        mimeType: defaultMimeType,
        fileSize: undefined,
      };
    } else {
      log(`    ⚠ Direct URL upload failed: ${upload.error || "Unknown error"}, trying buffer upload...`, "error");

      // Fallback: Download and upload as buffer
      const download = await downloadImageFromUrl(unsplash.url);
      if (download.success && download.buffer) {
        const bufferUpload = await uploadImageToCloudinarySDK({
          buffer: download.buffer,
          publicId: altText,
          altText,
          folder,
          mimeType: download.mimeType || defaultMimeType,
        });

        if (bufferUpload.success && bufferUpload.url) {
          log(`    ✓ Uploaded alternative to Cloudinary via buffer: ${bufferUpload.url}`, "info");
          return {
            url: bufferUpload.url,
            cloudinaryPublicId: bufferUpload.cloudinaryPublicId,
            cloudinaryVersion: bufferUpload.cloudinaryVersion,
            mimeType: download.mimeType || defaultMimeType,
            fileSize: download.buffer.length,
          };
        }
      }
    }
  } else {
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      log(`    ⚠ UNSPLASH_ACCESS_KEY not configured, skipping Unsplash search`, "info");
    } else {
      log(`    ✗ Unsplash search failed: ${unsplash.error || "Unknown error"}, using original URL`, "error");
    }
  }

  // 6. Fallback: return original URL with warning
  log(`    ⚠ Failed to validate or find alternative for: ${originalUrl} - using original URL`, "error");
  return {
    url: originalUrl,
    mimeType: defaultMimeType,
  };
}

/**
 * Fetches image URL from Unsplash API with fallback to Lorem Picsum
 * Matches the pattern from testCreateClientWithMedia (source of truth)
 */
async function fetchUnsplashImageUrl(
  query: string,
  orientation: "squarish" | "landscape",
  fallbackUrl: string
): Promise<string> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
  
  if (!accessKey) {
    return fallbackUrl;
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=${orientation}`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.urls?.regular || fallbackUrl;
    } else {
      return fallbackUrl;
    }
  } catch {
    return fallbackUrl;
  }
}

/**
 * Builds Cloudinary URL from publicId and version with optimizations (matches uploadImageToCloudinarySDK output)
 * Uses optimizeCloudinaryUrl to add performance transformations (f_auto,q_auto,dpr_auto,c_limit)
 */
function buildCloudinaryUrlFromPublicId(
  cloudinaryPublicId: string | null | undefined,
  cloudinaryVersion: string | null | undefined,
  mimeType: string,
  filename: string
): string | null {
  if (!cloudinaryPublicId) {
    return null;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dfegnpgwx";
  const resourceType = mimeType.startsWith("image/") ? "image" : "video";

  // Extract format from filename or mimeType
  let format = filename.split(".").pop() || "";
  if (!format) {
    format = mimeType.split("/")[1] || "png";
  }

  // Remove extension from cloudinaryPublicId if it exists (Cloudinary stores public_id without extension)
  let publicId = cloudinaryPublicId;
  const lastDot = publicId.lastIndexOf(".");
  if (lastDot > 0) {
    // Check if the part after the dot looks like a file extension
    const possibleExt = publicId.substring(lastDot + 1).toLowerCase();
    const validExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "mp4", "mov", "avi"];
    if (validExtensions.includes(possibleExt)) {
      publicId = publicId.substring(0, lastDot);
    }
  }

  // Construct base Cloudinary URL: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
  let baseUrl: string;
  if (cloudinaryVersion) {
    baseUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/v${cloudinaryVersion}/${publicId}.${format}`;
  } else {
    baseUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${publicId}.${format}`;
  }

  return optimizeCloudinaryUrl(baseUrl, publicId, format, resourceType);
}

async function seedMedia(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  clients: Awaited<ReturnType<typeof seedClients>>,
  author: Awaited<ReturnType<typeof seedAuthors>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding media...", "info");
  const startTime = Date.now();
  const createdMedia = [];

  let validCount = 0;
  let cloudinaryCount = 0;
  let totalCount = 0;

  // Only create article media if articles exist
  if (articles.length > 0) {
    log("  Creating featured images for articles...", "info");
    
    // Configure Cloudinary (matches SOT pattern)
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }

    for (let idx = 0; idx < articles.length; idx++) {
      const article = articles[idx];
      totalCount++;

      // Use SOT pattern: fetchUnsplashImageUrl + cloudinary.uploader.upload + optimizeCloudinaryUrl
      const featuredImageUrl = await fetchUnsplashImageUrl(
        "article",
        "landscape",
        `https://picsum.photos/1200/630?random=${Date.now() + idx}`
      );

      const featuredAltText = article.title;
      const featuredSeoFileName = generateSEOFileName(featuredAltText, "", "", undefined, true);
      const featuredPublicId = generateCloudinaryPublicId(featuredSeoFileName, "seed/article-featured");

      const featuredUploadResult = await cloudinary.uploader.upload(featuredImageUrl, {
        public_id: featuredPublicId,
        resource_type: "image" as const,
        asset_folder: "seed/article-featured",
      });

      const featuredCloudinaryUrl = featuredUploadResult.secure_url || featuredUploadResult.url;
      const featuredOptimizedUrl = optimizeCloudinaryUrl(
        featuredCloudinaryUrl,
        featuredUploadResult.public_id,
        featuredUploadResult.format || "jpg",
        "image"
      );

      if (featuredUploadResult.public_id) {
        cloudinaryCount++;
      }

      const media = await db.media.create({
        data: {
          filename: `article-${article.slug}.jpg`,
          url: featuredOptimizedUrl, // Use optimized URL (matches SOT pattern)
          mimeType: "image/jpeg",
          fileSize: featuredUploadResult.bytes || Math.floor(Math.random() * 500000) + 100000,
          width: 1200,
          height: 630,
          encodingFormat: "image/jpeg",
          altText: featuredAltText,
          caption: article.excerpt || undefined,
          title: article.title,
          clientId: article.clientId,
          type: "POST",
          cloudinaryPublicId: featuredUploadResult.public_id,
          cloudinaryVersion: featuredUploadResult.version?.toString(),
        },
      });

      await db.article.update({
        where: { id: article.id },
        data: { featuredImageId: media.id },
      });

      createdMedia.push(media);

      if ((idx + 1) % 10 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        log(
          `    ✓ Created ${idx + 1}/${articles.length} article featured images - ${elapsed}s`,
          "info"
        );
      }
    }
  } else {
    log("  Skipping article media (no articles)...", "info");
  }

  log("  Creating client logos and OG images...", "info");
  
  // Configure Cloudinary (matches testCreateClientWithMedia pattern)
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  for (let idx = 0; idx < clients.length; idx++) {
    const client = clients[idx];
    
    // Skip if client already has media (Phase 2 - using existing clients from Phase 1)
    if (client.logoMediaId && client.ogImageMediaId && client.twitterImageMediaId) {
      log(`  Skipping media for client ${idx + 1}/${clients.length}: ${client.name} (already has media)`, "info");
      continue;
    }
    
    totalCount += 3; // Logo + OG image + Twitter image

    // Logo image - Use real Unsplash API (matches testCreateClientWithMedia pattern)
    const logoUrl = await fetchUnsplashImageUrl(
      "logo",
      "squarish",
      "https://picsum.photos/400/400?random=1"
    );

    const logoAltText = `Logo ${client.name}`;
    const logoSeoFileName = generateSEOFileName(logoAltText, "", "", undefined, true);
    const logoPublicId = generateCloudinaryPublicId(logoSeoFileName, "seed/client-logos");

    const logoUploadResult = await cloudinary.uploader.upload(logoUrl, {
      public_id: logoPublicId,
      resource_type: "image" as const,
      asset_folder: "seed/client-logos",
    });

    const logoCloudinaryUrl = logoUploadResult.secure_url || logoUploadResult.url;
    const logoOptimizedUrl = optimizeCloudinaryUrl(
      logoCloudinaryUrl,
      logoUploadResult.public_id,
      logoUploadResult.format || "png",
      "image"
    );

    if (logoUploadResult.public_id) {
      cloudinaryCount++;
    }

    const logoMedia = await db.media.create({
      data: {
        filename: `logo-${client.slug}.png`,
        url: logoOptimizedUrl, // Use optimized URL (matches SOT pattern)
        mimeType: "image/png",
        fileSize: logoUploadResult.bytes || Math.floor(Math.random() * 200000) + 50000,
        width: 400,
        height: 400,
        encodingFormat: "image/png",
        altText: logoAltText,
        title: logoAltText,
        clientId: client.id,
        type: "LOGO",
        cloudinaryPublicId: logoUploadResult.public_id,
        cloudinaryVersion: logoUploadResult.version?.toString(),
      },
    });

    // OG image - Use real Unsplash API (matches testCreateClientWithMedia pattern)
    const ogImageUrl = await fetchUnsplashImageUrl(
      "business",
      "landscape",
      "https://picsum.photos/1200/630?random=2"
    );

    const ogAltText = `OG Image ${client.name}`;
    const ogSeoFileName = generateSEOFileName(ogAltText, "", "", undefined, true);
    const ogPublicId = generateCloudinaryPublicId(ogSeoFileName, "seed/client-og-images");

    const ogUploadResult = await cloudinary.uploader.upload(ogImageUrl, {
      public_id: ogPublicId,
      resource_type: "image" as const,
      asset_folder: "seed/client-og-images",
    });

    const ogCloudinaryUrl = ogUploadResult.secure_url || ogUploadResult.url;
    const ogOptimizedUrl = optimizeCloudinaryUrl(
      ogCloudinaryUrl,
      ogUploadResult.public_id,
      ogUploadResult.format || "jpg",
      "image"
    );

    if (ogUploadResult.public_id) {
      cloudinaryCount++;
    }

    const ogMedia = await db.media.create({
      data: {
        filename: `og-${client.slug}.jpg`,
        url: ogOptimizedUrl, // Use optimized URL (matches SOT pattern)
        mimeType: "image/jpeg",
        fileSize: ogUploadResult.bytes || Math.floor(Math.random() * 500000) + 100000,
        width: 1200,
        height: 630,
        encodingFormat: "image/jpeg",
        altText: ogAltText,
        title: ogAltText,
        clientId: client.id,
        type: "OGIMAGE",
        cloudinaryPublicId: ogUploadResult.public_id,
        cloudinaryVersion: ogUploadResult.version?.toString(),
      },
    });

    // Twitter image - Use real Unsplash API (matches testCreateClientWithMedia pattern)
    const twitterImageUrl = await fetchUnsplashImageUrl(
      "business",
      "landscape",
      "https://picsum.photos/1200/675?random=3"
    );

    const twitterAltText = `Twitter Image ${client.name}`;
    const twitterSeoFileName = generateSEOFileName(twitterAltText, "", "", undefined, true);
    const twitterPublicId = generateCloudinaryPublicId(twitterSeoFileName, "seed/client-twitter-images");

    const twitterUploadResult = await cloudinary.uploader.upload(twitterImageUrl, {
      public_id: twitterPublicId,
      resource_type: "image" as const,
      asset_folder: "seed/client-twitter-images",
    });

    const twitterCloudinaryUrl = twitterUploadResult.secure_url || twitterUploadResult.url;
    const twitterOptimizedUrl = optimizeCloudinaryUrl(
      twitterCloudinaryUrl,
      twitterUploadResult.public_id,
      twitterUploadResult.format || "jpg",
      "image"
    );

    if (twitterUploadResult.public_id) {
      cloudinaryCount++;
    }

    const twitterMedia = await db.media.create({
      data: {
        filename: `twitter-${client.slug}.jpg`,
        url: twitterOptimizedUrl, // Use optimized URL (matches SOT pattern)
        mimeType: "image/jpeg",
        fileSize: twitterUploadResult.bytes || Math.floor(Math.random() * 500000) + 100000,
        width: 1200,
        height: 675,
        encodingFormat: "image/jpeg",
        altText: twitterAltText,
        title: twitterAltText,
        clientId: client.id,
        type: "TWITTER_IMAGE",
        cloudinaryPublicId: twitterUploadResult.public_id,
        cloudinaryVersion: twitterUploadResult.version?.toString(),
      },
    });

    await db.client.update({
      where: { id: client.id },
      data: {
        logoMediaId: logoMedia.id,
        ogImageMediaId: ogMedia.id,
        twitterImageMediaId: twitterMedia.id,
      },
    });

    createdMedia.push(logoMedia, ogMedia, twitterMedia);

    // Gallery images - Create 3-5 additional GENERAL type media for each client
    const galleryCount = Math.floor(Math.random() * 3) + 3; // 3-5 images
    const galleryQueries = ["business", "office", "team", "workspace", "corporate"];
    
    for (let galleryIdx = 0; galleryIdx < galleryCount; galleryIdx++) {
      const galleryQuery = galleryQueries[galleryIdx % galleryQueries.length];
      const galleryImageUrl = await fetchUnsplashImageUrl(
        galleryQuery,
        Math.random() > 0.5 ? "landscape" : "squarish",
        `https://picsum.photos/800/600?random=${Date.now() + galleryIdx}`
      );

      const galleryAltText = `Gallery Image ${galleryIdx + 1} - ${client.name}`;
      const gallerySeoFileName = generateSEOFileName(galleryAltText, "", "", undefined, true);
      const galleryPublicId = generateCloudinaryPublicId(gallerySeoFileName, `seed/client-gallery/${client.slug}`);

      const galleryUploadResult = await cloudinary.uploader.upload(galleryImageUrl, {
        public_id: galleryPublicId,
        resource_type: "image" as const,
        asset_folder: `seed/client-gallery/${client.slug}`,
      });

      const galleryCloudinaryUrl = galleryUploadResult.secure_url || galleryUploadResult.url;
      const galleryOptimizedUrl = optimizeCloudinaryUrl(
        galleryCloudinaryUrl,
        galleryUploadResult.public_id,
        galleryUploadResult.format || "jpg",
        "image"
      );

      if (galleryUploadResult.public_id) {
        cloudinaryCount++;
      }

      const galleryMedia = await db.media.create({
        data: {
          filename: `gallery-${client.slug}-${galleryIdx + 1}.jpg`,
          url: galleryOptimizedUrl,
          mimeType: "image/jpeg",
          fileSize: galleryUploadResult.bytes || Math.floor(Math.random() * 500000) + 100000,
          width: 800,
          height: 600,
          encodingFormat: "image/jpeg",
          altText: galleryAltText,
          title: galleryAltText,
          clientId: client.id,
          type: "GENERAL",
          cloudinaryPublicId: galleryUploadResult.public_id,
          cloudinaryVersion: galleryUploadResult.version?.toString(),
        },
      });

      createdMedia.push(galleryMedia);
      totalCount++;
    }

    log(`  Created media for client ${idx + 1}/${clients.length}: ${client.name} (logo, OG, Twitter, +${galleryCount} gallery)`, "info");
  }

  // Author image
  totalCount++;
  const authorOriginalUrl = `https://images.unsplash.com/photo-${Math.floor(
    Math.random() * 1000000
  )}?w=400&h=400&fit=crop`;

  const authorImageResult = await processImageUrl(
    authorOriginalUrl,
    "professional portrait",
    "Modonty Author",
    "seed/author-images",
    "image/jpeg",
    logCallback
  );

  if (authorImageResult.cloudinaryPublicId) {
    cloudinaryCount++;
  }

  const authorMedia = await db.media.create({
    data: {
      filename: "author-modonty.jpg",
      url: authorImageResult.cloudinaryPublicId
        ? buildCloudinaryUrlFromPublicId(
          authorImageResult.cloudinaryPublicId,
          authorImageResult.cloudinaryVersion,
          authorImageResult.mimeType,
          "author-modonty.jpg"
        ) || authorImageResult.url
        : authorImageResult.url,
      mimeType: authorImageResult.mimeType,
      fileSize: authorImageResult.fileSize || Math.floor(Math.random() * 200000) + 50000,
      width: 400,
      height: 400,
      encodingFormat: "image/jpeg",
      altText: "Modonty Author",
      title: "Modonty Author",
      type: "GENERAL",
      cloudinaryPublicId: authorImageResult.cloudinaryPublicId || null,
      cloudinaryVersion: authorImageResult.cloudinaryVersion || null,
    },
  });

  await db.author.update({
    where: { id: author.id },
    data: { image: authorMedia.url },
  });

  createdMedia.push(authorMedia);

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${createdMedia.length} media files in ${totalTime} seconds.`, "success");
  log(`  Image validation: ${cloudinaryCount}/${totalCount} uploaded to Cloudinary.`, "info");
  return createdMedia;
}

async function seedAnalytics(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding analytics...", "info");
  const startTime = Date.now();
  let count = 0;
  const publishedArticles = articles.filter((a) => a.status === ArticleStatus.PUBLISHED);
  let processed = 0;

  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
  ];

  log(`  Creating analytics for ${publishedArticles.length} published articles...`, "info");
  for (let idx = 0; idx < publishedArticles.length; idx++) {
    const article = publishedArticles[idx];
    const viewCount = Math.floor(Math.random() * 15) + 5;
    const sessionIds = new Set<string>();

    for (let i = 0; i < viewCount; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 1000)}-${Date.now()}-${i}`;
      sessionIds.add(sessionId);

      await db.analytics.create({
        data: {
          articleId: article.id,
          clientId: article.clientId,
          sessionId,
          lcp: Math.random() * 2 + 1,
          cls: Math.random() * 0.1,
          inp: Math.random() * 200 + 50,
          ttfb: Math.random() * 500 + 200,
          timeOnPage: Math.random() * 300 + 30,
          scrollDepth: Math.random() * 40 + 60,
          bounced: Math.random() > 0.6,
          clickThroughRate: Math.random() > 0.8 ? Math.random() * 5 + 1 : undefined,
          source: getRandomElement([
            TrafficSource.ORGANIC,
            TrafficSource.DIRECT,
            TrafficSource.REFERRAL,
            TrafficSource.SOCIAL,
          ]),
          searchEngine: Math.random() > 0.5 ? "Google" : undefined,
          referrerDomain:
            Math.random() > 0.6
              ? getRandomElement(["twitter.com", "facebook.com", "linkedin.com", "reddit.com"])
              : undefined,
          userAgent: getRandomElement(userAgents),
          timestamp: generateRandomDate(article.datePublished || article.createdAt, new Date()),
        },
      });
      count++;
    }

    processed++;
    if (processed % 5 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      log(
        `    ✓ Processed ${processed}/${publishedArticles.length} articles (${count} analytics records) - ${elapsed}s`,
        "info"
      );
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} analytics records in ${totalTime} seconds.`, "success");
}

async function seedFAQs(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  useOpenAI: boolean,
  industryBrief?: string,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding FAQs...", "info");
  const startTime = Date.now();
  let count = 0;
  const publishedArticles = articles.filter((a) => a.status === ArticleStatus.PUBLISHED);
  let processed = 0;

  let faqTemplates: Array<{
    questionTemplate: string;
    answerTemplate: string;
    description: string;
  }> = [];

  if (useOpenAI) {
    try {
      log("Generating FAQ templates with OpenAI...", "info");
      const aiTemplates = await generateFAQTemplatesWithOpenAI({
        language: "ar",
        industryBrief,
      });
      faqTemplates = aiTemplates.templates.map((t) => ({
        questionTemplate: t.questionTemplate,
        answerTemplate: t.answerTemplate,
        description: t.description,
      }));
      log(`Generated ${faqTemplates.length} FAQ templates with AI.`, "success");
    } catch (error) {
      const logError = logCallback || console.error;
      logError(
        "OpenAI FAQ template generation failed, falling back to templates:",
        "error"
      );
      logError(error instanceof Error ? error.message : String(error), "error");
      // Fall through to hardcoded templates
    }
  }

  if (faqTemplates.length === 0) {
    // Hardcoded fallback templates
    faqTemplates = [
      { questionTemplate: "ما هو {topic}؟", answerTemplate: "{topic} هو {definition}.", description: "" },
      { questionTemplate: "كيف يمكنني استخدام {topic}؟", answerTemplate: "يمكنك استخدام {topic} من خلال {method}.", description: "" },
      { questionTemplate: "ما هي فوائد {topic}؟", answerTemplate: "من فوائد {topic} {benefits}.", description: "" },
      { questionTemplate: "ما هي أفضل الممارسات في {topic}؟", answerTemplate: "أفضل الممارسات في {topic} تشمل {practices}.", description: "" },
    ];
  }

  log(`  Creating FAQs for ${publishedArticles.length} published articles...`, "info");
  const articleCount = publishedArticles.length;
  const faqRange = getProportionalCount(articleCount, 2, 5);
  for (let idx = 0; idx < publishedArticles.length; idx++) {
    const article = publishedArticles[idx];
    const faqCount = Math.floor(Math.random() * (faqRange.max - faqRange.min + 1)) + faqRange.min;
    for (let i = 0; i < faqCount; i++) {
      const template = getRandomElement(faqTemplates);
      const topic = article.title.split(" ")[0];
      const question = template.questionTemplate.replace(/{topic}/g, topic);
      const answer = template.answerTemplate
        .replace(/{topic}/g, topic)
        .replace(/{definition}/g, "أحد أهم المفاهيم في تحسين محركات البحث")
        .replace(/{method}/g, "اتباع الخطوات المذكورة في هذا المقال")
        .replace(/{benefits}/g, "تحسين ترتيب موقعك في نتائج البحث وزيادة الزيارات")
        .replace(/{practices}/g, "اتباع أفضل الممارسات المذكورة في هذا المقال");

      await db.articleFAQ.create({
        data: {
          articleId: article.id,
          question,
          answer,
          position: i + 1,
        },
      });
      count++;
    }

    processed++;
    if (processed % 10 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      log(
        `    ✓ Processed ${processed}/${publishedArticles.length} articles (${count} FAQs) - ${elapsed}s`,
        "info"
      );
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} FAQs in ${totalTime} seconds.`, "success");
}

async function seedRelatedArticles(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding related articles...", "info");
  const startTime = Date.now();
  let count = 0;
  const publishedArticles = articles.filter((a) => a.status === ArticleStatus.PUBLISHED);
  let processed = 0;

  log(`  Creating relationships for ${publishedArticles.length} published articles...`, "info");
  for (let idx = 0; idx < publishedArticles.length; idx++) {
    const article = publishedArticles[idx];
    const relatedCount = Math.floor(Math.random() * 3) + 2;
    const otherArticles = articles.filter(
      (a) =>
        a.id !== article.id &&
        a.status === ArticleStatus.PUBLISHED &&
        a.categoryId === article.categoryId
    );
    const relatedArticles = getRandomElements(
      otherArticles,
      Math.min(relatedCount, otherArticles.length)
    );

    for (const related of relatedArticles) {
      await db.relatedArticle.upsert({
        where: {
          articleId_relatedId: {
            articleId: article.id,
            relatedId: related.id,
          },
        },
        update: {},
        create: {
          articleId: article.id,
          relatedId: related.id,
          relationshipType: "related",
        },
      });
      count++;
    }

    processed++;
    if (processed % 10 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      log(
        `    ✓ Processed ${processed}/${publishedArticles.length} articles (${count} relationships) - ${elapsed}s`,
        "info"
      );
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} related article relationships in ${totalTime} seconds.`, "success");
}

async function seedSubscribers(
  clients: Awaited<ReturnType<typeof seedClients>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding subscribers...", "info");
  const startTime = Date.now();
  let count = 0;

  const firstNames = [
    "أحمد",
    "محمد",
    "علي",
    "خالد",
    "سعد",
    "فهد",
    "عمر",
    "يوسف",
    "عبدالله",
    "عبدالرحمن",
    "فاطمة",
    "مريم",
    "سارة",
    "نورا",
    "ليلى",
    "هند",
    "ريم",
    "لينا",
    "دانا",
    "سما",
  ];
  const lastNames = [
    "الخالدي",
    "العلي",
    "المحمد",
    "السعد",
    "الفهد",
    "العمر",
    "اليوسف",
    "العبدالله",
    "الرحمن",
    "الزهراني",
    "القحطاني",
    "الدوسري",
    "العتيبي",
    "الحربي",
    "الغامدي",
  ];

  log(`  Creating subscribers for ${clients.length} clients...`, "info");
  for (let clientIdx = 0; clientIdx < clients.length; clientIdx++) {
    const client = clients[clientIdx];
    const subscriberCount = Math.floor(Math.random() * 15) + 10;

    for (let i = 0; i < subscriberCount; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const email = `${slugify(firstName)}.${slugify(lastName)}.${i}@example.com`;

      await db.subscriber.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          clientId: client.id,
          subscribed: Math.random() > 0.1,
          subscribedAt: generateRandomDate(
            new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            new Date()
          ),
          unsubscribedAt:
            Math.random() > 0.9
              ? generateRandomDate(
                new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
                new Date()
              )
              : undefined,
          consentGiven: true,
          consentDate: generateRandomDate(
            new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            new Date()
          ),
        },
      });
      count++;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log(
      `    ✓ Created ${subscriberCount} subscribers for client ${clientIdx + 1}/${clients.length
      }: ${client.name} (total: ${count}) - ${elapsed}s`,
      "info"
    );
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} subscribers in ${totalTime} seconds.`, "success");
}

async function seedSettings(logCallback?: (message: string, level?: "info" | "success" | "error") => void) {
  const log = logCallback || console.log;
  log("Seeding settings (singleton)...", "info");

  const existingSettings = await db.settings.findFirst();

  if (existingSettings) {
    const settings = await db.settings.update({
      where: { id: existingSettings.id },
      data: {
        seoTitleMin: 30,
        seoTitleMax: 60,
        seoTitleRestrict: false,
        seoDescriptionMin: 120,
        seoDescriptionMax: 160,
        seoDescriptionRestrict: false,
        twitterTitleMax: 70,
        twitterTitleRestrict: true,
        twitterDescriptionMax: 200,
        twitterDescriptionRestrict: true,
        ogTitleMax: 60,
        ogTitleRestrict: false,
        ogDescriptionMax: 200,
        ogDescriptionRestrict: false,
        gtmContainerId: "GTM-XXXXXXX",
        gtmEnabled: true,
        hotjarSiteId: "1234567",
        hotjarEnabled: true,
        facebookUrl: "https://facebook.com/modonty",
        twitterUrl: "https://twitter.com/modonty",
        linkedInUrl: "https://linkedin.com/company/modonty",
        instagramUrl: "https://instagram.com/modonty",
        youtubeUrl: "https://youtube.com/modonty",
      },
    });
    log("Updated existing settings.", "success");
    return settings;
  } else {
    const settings = await db.settings.create({
      data: {
        seoTitleMin: 30,
        seoTitleMax: 60,
        seoTitleRestrict: false,
        seoDescriptionMin: 120,
        seoDescriptionMax: 160,
        seoDescriptionRestrict: false,
        twitterTitleMax: 70,
        twitterTitleRestrict: true,
        twitterDescriptionMax: 200,
        twitterDescriptionRestrict: true,
        ogTitleMax: 60,
        ogTitleRestrict: false,
        ogDescriptionMax: 200,
        ogDescriptionRestrict: false,
        gtmContainerId: "GTM-XXXXXXX",
        gtmEnabled: true,
        hotjarSiteId: "1234567",
        hotjarEnabled: true,
        facebookUrl: "https://facebook.com/modonty",
        twitterUrl: "https://twitter.com/modonty",
        linkedInUrl: "https://linkedin.com/company/modonty",
        instagramUrl: "https://instagram.com/modonty",
        youtubeUrl: "https://youtube.com/modonty",
      },
    });
    log("Created new settings.", "success");
    return settings;
  }
}

async function seedArticleVersions(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding article versions...", "info");
  const startTime = Date.now();
  let count = 0;

  const articlesToVersion = getRandomElements(articles, Math.floor(articles.length * 0.4));

  log(`  Creating versions for ${articlesToVersion.length} articles...`, "info");

  for (let idx = 0; idx < articlesToVersion.length; idx++) {
    const article = articlesToVersion[idx];
    const versionCount = Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < versionCount; i++) {
      await db.articleVersion.create({
        data: {
          articleId: article.id,
          title: article.title,
          content: article.content,
          excerpt: article.excerpt || undefined,
          seoTitle: article.seoTitle || undefined,
          seoDescription: article.seoDescription || undefined,
          createdAt: generateRandomDate(article.createdAt, new Date()),
        },
      });
      count++;
    }

    if ((idx + 1) % 10 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      log(
        `    ✓ Processed ${idx + 1}/${articlesToVersion.length} articles (${count} versions) - ${elapsed}s`,
        "info"
      );
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} article versions in ${totalTime} seconds.`, "success");
}

async function seedArticleMedia(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding article media gallery...", "info");
  const startTime = Date.now();
  let count = 0;

  const articleCount = articles.length;
  // Scale gallery percentage based on article count
  // For small counts: 30-40% of articles get galleries
  // For large counts: 45% of articles get galleries
  const galleryPercentage = articleCount <= 5 ? 0.3 + (articleCount / 5) * 0.1 : 0.45;
  const articlesForGallery = getRandomElements(articles, Math.floor(articles.length * galleryPercentage));

  log(`  Creating galleries for ${articlesForGallery.length} articles...`, "info");

  // Configure Cloudinary (matches SOT pattern)
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  // Scale media count per article based on total article count
  const mediaRange = getProportionalCount(articleCount, 2, 5);
  const galleryQueries = ["article", "content", "blog", "writing", "publishing"];

  for (let idx = 0; idx < articlesForGallery.length; idx++) {
    const article = articlesForGallery[idx];
    const mediaCount = Math.floor(Math.random() * (mediaRange.max - mediaRange.min + 1)) + mediaRange.min;

    for (let i = 0; i < mediaCount; i++) {
      // Use SOT pattern: fetchUnsplashImageUrl + cloudinary.uploader.upload + optimizeCloudinaryUrl
      const galleryQuery = galleryQueries[i % galleryQueries.length];
      const galleryImageUrl = await fetchUnsplashImageUrl(
        galleryQuery,
        Math.random() > 0.5 ? "landscape" : "squarish",
        `https://picsum.photos/800/600?random=${Date.now() + idx * 100 + i}`
      );

      const galleryAltText = `${article.title} - Gallery Image ${i + 1}`;
      const gallerySeoFileName = generateSEOFileName(galleryAltText, "", "", undefined, true);
      const galleryPublicId = generateCloudinaryPublicId(gallerySeoFileName, `seed/article-gallery/${article.slug}`);

      const galleryUploadResult = await cloudinary.uploader.upload(galleryImageUrl, {
        public_id: galleryPublicId,
        resource_type: "image" as const,
        asset_folder: `seed/article-gallery/${article.slug}`,
      });

      const galleryCloudinaryUrl = galleryUploadResult.secure_url || galleryUploadResult.url;
      const galleryOptimizedUrl = optimizeCloudinaryUrl(
        galleryCloudinaryUrl,
        galleryUploadResult.public_id,
        galleryUploadResult.format || "jpg",
        "image"
      );

      const media = await db.media.create({
        data: {
          filename: `gallery-${article.slug}-${i + 1}.jpg`,
          url: galleryOptimizedUrl, // Use optimized URL (matches SOT pattern)
          mimeType: "image/jpeg",
          fileSize: galleryUploadResult.bytes || Math.floor(Math.random() * 300000) + 50000,
          width: 800,
          height: 600,
          encodingFormat: "image/jpeg",
          altText: galleryAltText,
          caption: `Gallery image ${i + 1} for ${article.title}`,
          title: `${article.title} - Gallery Image ${i + 1}`,
          clientId: article.clientId,
          type: "GENERAL",
          cloudinaryPublicId: galleryUploadResult.public_id,
          cloudinaryVersion: galleryUploadResult.version?.toString(),
        },
      });

      await db.articleMedia.upsert({
        where: {
          articleId_mediaId: {
            articleId: article.id,
            mediaId: media.id,
          },
        },
        update: {},
        create: {
          articleId: article.id,
          mediaId: media.id,
          position: i,
          caption: `Gallery image ${i + 1} for ${article.title}`,
          altText: galleryAltText,
        },
      });
      count++;
    }

    if ((idx + 1) % 10 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      log(
        `    ✓ Processed ${idx + 1}/${articlesForGallery.length} articles (${count} gallery items) - ${elapsed}s`,
        "info"
      );
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} article media gallery items in ${totalTime} seconds.`, "success");
}

async function seedComments(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding comments...", "info");
  const startTime = Date.now();
  let count = 0;
  const publishedArticles = articles.filter((a) => a.status === ArticleStatus.PUBLISHED);
  let processed = 0;

  const commentTemplates = [
    "مقال رائع! شكراً لك على هذه المعلومات المفيدة.",
    "محتوى قيم جداً. أستفدت كثيراً من قراءة هذا المقال.",
    "هذا بالضبط ما كنت أبحث عنه. شكراً جزيلاً!",
    "معلومات دقيقة ومفيدة. استمر في الكتابة الرائعة.",
    "مقال شامل ومفصل. أحسنت!",
    "شكراً على هذه النصائح العملية.",
    "محتوى ممتاز ومفيد. سأشاركه مع الأصدقاء.",
    "مقال احترافي ومفيد جداً. استمر في العطاء.",
  ];

  const replyTemplates = [
    "شكراً لك! سعيد لأن المقال كان مفيداً.",
    "نعم، هذا صحيح. شكراً على التعليق الإيجابي.",
    "أنا سعيد لأنك استفدت من المقال.",
  ];

  log(`  Creating comments for ${publishedArticles.length} published articles...`, "info");
  const articleCount = publishedArticles.length;
  const commentRange = getProportionalCount(articleCount, 2, 6);
  for (let idx = 0; idx < publishedArticles.length; idx++) {
    const article = publishedArticles[idx];
    const commentCount = Math.floor(Math.random() * (commentRange.max - commentRange.min + 1)) + commentRange.min;
    const topLevelComments: string[] = [];

    for (let i = 0; i < commentCount; i++) {
      const content = getRandomElement(commentTemplates);
      const status = Math.random() > 0.2 ? CommentStatus.APPROVED : CommentStatus.PENDING;
      const createdAt = generateRandomDate(article.datePublished || article.createdAt, new Date());

      const comment = await db.comment.create({
        data: {
          articleId: article.id,
          content,
          status,
          createdAt,
        },
      });
      topLevelComments.push(comment.id);
      count++;

      // Add 0-2 replies to this comment (proportional)
      const replyRange = getProportionalCount(articleCount, 0, 2);
      if (status === CommentStatus.APPROVED && Math.random() > 0.5) {
        const replyCount = Math.floor(Math.random() * (replyRange.max - replyRange.min + 1)) + replyRange.min;
        for (let j = 0; j < replyCount; j++) {
          const replyContent = getRandomElement(replyTemplates);
          await db.comment.create({
            data: {
              articleId: article.id,
              parentId: comment.id,
              content: replyContent,
              status: CommentStatus.APPROVED,
              createdAt: generateRandomDate(createdAt, new Date()),
            },
          });
          count++;
        }
      }
    }

    processed++;
    if (processed % 10 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      log(
        `    ✓ Processed ${processed}/${publishedArticles.length} articles (${count} comments) - ${elapsed}s`,
        "info"
      );
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} comments in ${totalTime} seconds.`, "success");
}

async function seedClientComments(
  clients: Awaited<ReturnType<typeof seedClients>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding client comments...", "info");
  const startTime = Date.now();
  let count = 0;

  const commentTemplates = [
    "خدمة ممتازة! أنصح بهذه الشركة بشدة.",
    "فريق محترف وعمل منظم. تجربة رائعة!",
    "شركة موثوقة ومحترفة. سعدت بالتعامل معها.",
  ];

  log(`  Creating comments for ${clients.length} clients...`, "info");
  for (let idx = 0; idx < clients.length; idx++) {
    const client = clients[idx];
    const commentCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < commentCount; i++) {
      const content = getRandomElement(commentTemplates);
      const status = Math.random() > 0.3 ? CommentStatus.APPROVED : CommentStatus.PENDING;

      const comment = await db.clientComment.create({
        data: {
          clientId: client.id,
          content,
          status,
        },
      });

      if (Math.random() > 0.6) {
        await db.clientComment.create({
          data: {
            clientId: client.id,
            parentId: comment.id,
            content: "شكراً لك!",
            status: CommentStatus.APPROVED,
          },
        });
        count++;
      }
      count++;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} client comments in ${totalTime} seconds.`, "success");
}

async function seedArticleInteractions(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding article interactions...", "info");
  const startTime = Date.now();
  let likeCount = 0;
  let dislikeCount = 0;
  let favoriteCount = 0;
  const publishedArticles = articles.filter((a) => a.status === ArticleStatus.PUBLISHED);

  log(`  Creating interactions for ${publishedArticles.length} published articles...`, "info");
  const articleCount = publishedArticles.length;
  const likeRange = getProportionalCount(articleCount, 5, 15);
  const dislikeRange = getProportionalCount(articleCount, 0, 3);
  for (let idx = 0; idx < publishedArticles.length; idx++) {
    const article = publishedArticles[idx];

    // Likes (proportional)
    const likeNum = Math.floor(Math.random() * (likeRange.max - likeRange.min + 1)) + likeRange.min;
    for (let i = 0; i < likeNum; i++) {
      const sessionId = Math.random() > 0.3 ? `session-${Math.floor(Math.random() * 10000)}` : undefined;
      await db.articleLike.create({
        data: {
          articleId: article.id,
          sessionId,
        },
      });
      likeCount++;
    }

    // Dislikes (proportional)
    const dislikeNum = Math.floor(Math.random() * (dislikeRange.max - dislikeRange.min + 1)) + dislikeRange.min;
    for (let i = 0; i < dislikeNum; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      await db.articleDislike.create({
        data: {
          articleId: article.id,
          sessionId,
        },
      });
      dislikeCount++;
    }

    // Favorites (2-5 per article, user-only but we'll use sessionId as placeholder)
    const favoriteNum = Math.floor(Math.random() * 4) + 2;
    // Note: ArticleFavorite requires userId, but we don't have users in seed
    // Skipping favorites for now as they require authenticated users
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(
    `✅ Seeded ${likeCount} likes, ${dislikeCount} dislikes, ${favoriteCount} favorites in ${totalTime} seconds.`,
    "success"
  );
}

async function seedClientInteractions(
  clients: Awaited<ReturnType<typeof seedClients>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding client interactions...", "info");
  const startTime = Date.now();
  let likeCount = 0;
  let dislikeCount = 0;

  log(`  Creating interactions for ${clients.length} clients...`, "info");
  for (let idx = 0; idx < clients.length; idx++) {
    const client = clients[idx];

    const likeNum = Math.floor(Math.random() * 8) + 3;
    for (let i = 0; i < likeNum; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      await db.clientLike.create({
        data: {
          clientId: client.id,
          sessionId,
        },
      });
      likeCount++;
    }

    const dislikeNum = Math.floor(Math.random() * 3);
    for (let i = 0; i < dislikeNum; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      await db.clientDislike.create({
        data: {
          clientId: client.id,
          sessionId,
        },
      });
      dislikeCount++;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${likeCount} likes, ${dislikeCount} dislikes in ${totalTime} seconds.`, "success");
}

async function seedCommentInteractions(
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding comment interactions...", "info");
  const startTime = Date.now();
  let commentLikeCount = 0;
  let commentDislikeCount = 0;
  let clientCommentLikeCount = 0;
  let clientCommentDislikeCount = 0;

  const comments = await db.comment.findMany({ where: { status: CommentStatus.APPROVED } });
  log(`  Creating interactions for ${comments.length} approved comments...`, "info");

  for (const comment of comments) {
    const likeNum = Math.floor(Math.random() * 6);
    for (let i = 0; i < likeNum; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      await db.commentLike.create({
        data: {
          commentId: comment.id,
          sessionId,
        },
      });
      commentLikeCount++;
    }

    const dislikeNum = Math.floor(Math.random() * 3);
    for (let i = 0; i < dislikeNum; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      await db.commentDislike.create({
        data: {
          commentId: comment.id,
          sessionId,
        },
      });
      commentDislikeCount++;
    }
  }

  const clientComments = await db.clientComment.findMany({ where: { status: CommentStatus.APPROVED } });
  log(`  Creating interactions for ${clientComments.length} approved client comments...`, "info");

  for (const comment of clientComments) {
    const likeNum = Math.floor(Math.random() * 6);
    for (let i = 0; i < likeNum; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      await db.clientCommentLike.create({
        data: {
          commentId: comment.id,
          sessionId,
        },
      });
      clientCommentLikeCount++;
    }

    const dislikeNum = Math.floor(Math.random() * 3);
    for (let i = 0; i < dislikeNum; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      await db.clientCommentDislike.create({
        data: {
          commentId: comment.id,
          sessionId,
        },
      });
      clientCommentDislikeCount++;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(
    `✅ Seeded ${commentLikeCount + clientCommentLikeCount} comment likes, ${commentDislikeCount + clientCommentDislikeCount} comment dislikes in ${totalTime} seconds.`,
    "success"
  );
}

async function seedArticleViews(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding article views...", "info");
  const startTime = Date.now();
  let count = 0;
  const publishedArticles = articles.filter((a) => a.status === ArticleStatus.PUBLISHED);
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
  ];

  log(`  Creating views for ${publishedArticles.length} published articles...`, "info");
  const articleCount = publishedArticles.length;
  const viewRange = getProportionalCount(articleCount, 10, 50);
  for (let idx = 0; idx < publishedArticles.length; idx++) {
    const article = publishedArticles[idx];
    const viewCount = Math.floor(Math.random() * (viewRange.max - viewRange.min + 1)) + viewRange.min;

    for (let i = 0; i < viewCount; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      const createdAt = generateRandomDate(article.datePublished || article.createdAt, new Date());

      await db.articleView.create({
        data: {
          articleId: article.id,
          sessionId,
          userAgent: getRandomElement(userAgents),
          referrer: Math.random() > 0.5 ? "https://google.com/search?q=seo" : undefined,
          createdAt,
        },
      });
      count++;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} article views in ${totalTime} seconds.`, "success");
}

async function seedClientViews(
  clients: Awaited<ReturnType<typeof seedClients>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding client views...", "info");
  const startTime = Date.now();
  let count = 0;
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  ];

  log(`  Creating views for ${clients.length} clients...`, "info");
  for (let idx = 0; idx < clients.length; idx++) {
    const client = clients[idx];
    const viewCount = Math.floor(Math.random() * 16) + 5;

    for (let i = 0; i < viewCount; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      const createdAt = generateRandomDate(client.createdAt || new Date(), new Date());

      await db.clientView.create({
        data: {
          clientId: client.id,
          sessionId,
          userAgent: getRandomElement(userAgents),
          referrer: Math.random() > 0.4 ? "https://linkedin.com" : undefined,
          createdAt,
        },
      });
      count++;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} client views in ${totalTime} seconds.`, "success");
}

async function seedShares(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  clients: Awaited<ReturnType<typeof seedClients>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding shares...", "info");
  const startTime = Date.now();
  let count = 0;
  const publishedArticles = articles.filter((a) => a.status === ArticleStatus.PUBLISHED);
  const platforms = [
    SharePlatform.FACEBOOK,
    SharePlatform.TWITTER,
    SharePlatform.LINKEDIN,
    SharePlatform.WHATSAPP,
    SharePlatform.EMAIL,
    SharePlatform.COPY_LINK,
  ];

  log(`  Creating shares for ${publishedArticles.length} published articles...`, "info");
  const articleCount = publishedArticles.length;
  const shareRange = getProportionalCount(articleCount, 1, 10);
  for (const article of publishedArticles) {
    const shareCount = Math.floor(Math.random() * (shareRange.max - shareRange.min + 1)) + shareRange.min;
    for (let i = 0; i < shareCount; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      const createdAt = generateRandomDate(article.datePublished || article.createdAt, new Date());

      await db.share.create({
        data: {
          articleId: article.id,
          platform: getRandomElement(platforms),
          sessionId,
          createdAt,
        },
      });
      count++;
    }
  }

  log(`  Creating shares for ${clients.length} clients...`, "info");
  for (const client of clients) {
    const shareCount = Math.floor(Math.random() * 6);
    for (let i = 0; i < shareCount; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      await db.share.create({
        data: {
          clientId: client.id,
          platform: getRandomElement(platforms),
          sessionId,
        },
      });
      count++;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} shares in ${totalTime} seconds.`, "success");
}

async function seedConversions(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  clients: Awaited<ReturnType<typeof seedClients>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding conversions...", "info");
  const startTime = Date.now();
  let count = 0;
  const publishedArticles = articles.filter((a) => a.status === ArticleStatus.PUBLISHED);
  const conversionTypes = [
    ConversionType.SIGNUP,
    ConversionType.NEWSLETTER,
    ConversionType.CONTACT_FORM,
    ConversionType.DOWNLOAD,
    ConversionType.PURCHASE,
    ConversionType.TRIAL_START,
  ];

  log(`  Creating conversions for ${publishedArticles.length} published articles...`, "info");
  const articleCount = publishedArticles.length;
  const conversionRange = getProportionalCount(articleCount, 0, 3);
  for (const article of publishedArticles) {
    if (Math.random() > 0.6) continue; // 40% of articles get conversions
    const conversionCount = Math.floor(Math.random() * (conversionRange.max - conversionRange.min + 1)) + conversionRange.min;
    for (let i = 0; i < conversionCount; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      const type = getRandomElement(conversionTypes);
      const createdAt = generateRandomDate(article.datePublished || article.createdAt, new Date());

      await db.conversion.create({
        data: {
          articleId: article.id,
          type,
          value: type === ConversionType.PURCHASE ? Math.random() * 1000 + 50 : undefined,
          currency: type === ConversionType.PURCHASE ? "USD" : undefined,
          sessionId,
          createdAt,
        },
      });
      count++;
    }
  }

  log(`  Creating conversions for ${clients.length} clients...`, "info");
  for (const client of clients) {
    const conversionCount = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < conversionCount; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      const type = getRandomElement(conversionTypes);
      await db.conversion.create({
        data: {
          clientId: client.id,
          type,
          value: type === ConversionType.PURCHASE ? Math.random() * 2000 + 100 : undefined,
          currency: type === ConversionType.PURCHASE ? "USD" : undefined,
          sessionId,
        },
      });
      count++;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} conversions in ${totalTime} seconds.`, "success");
}

async function seedCTAClicks(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  clients: Awaited<ReturnType<typeof seedClients>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding CTA clicks...", "info");
  const startTime = Date.now();
  let count = 0;
  const publishedArticles = articles.filter((a) => a.status === ArticleStatus.PUBLISHED);
  const ctaTypes = [CTAType.BUTTON, CTAType.LINK, CTAType.FORM, CTAType.BANNER];

  log(`  Creating CTA clicks for ${publishedArticles.length} published articles...`, "info");
  for (const article of publishedArticles) {
    const clickCount = Math.floor(Math.random() * 7) + 2;
    for (let i = 0; i < clickCount; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      await db.cTAClick.create({
        data: {
          articleId: article.id,
          type: getRandomElement(ctaTypes),
          label: "اشترك الآن",
          targetUrl: "/subscribe",
          sessionId,
          timeOnPage: Math.random() * 300 + 30,
          scrollDepth: Math.random() * 100,
        },
      });
      count++;
    }
  }

  log(`  Creating CTA clicks for ${clients.length} clients...`, "info");
  for (const client of clients) {
    const clickCount = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < clickCount; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      await db.cTAClick.create({
        data: {
          clientId: client.id,
          type: getRandomElement(ctaTypes),
          label: "تواصل معنا",
          targetUrl: "/contact",
          sessionId,
        },
      });
      count++;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} CTA clicks in ${totalTime} seconds.`, "success");
}

async function seedCampaignTracking(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  clients: Awaited<ReturnType<typeof seedClients>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding campaign tracking...", "info");
  const startTime = Date.now();
  let count = 0;
  const publishedArticles = articles.filter((a) => a.status === ArticleStatus.PUBLISHED);
  const campaignTypes = [
    CampaignType.EMAIL,
    CampaignType.SOCIAL,
    CampaignType.PAID_ADS,
    CampaignType.SEO,
    CampaignType.AFFILIATE,
  ];

  log(`  Creating campaign tracking for ${publishedArticles.length} published articles...`, "info");
  for (const article of publishedArticles) {
    if (Math.random() > 0.4) continue; // 60% of articles get campaigns
    const campaignCount = Math.floor(Math.random() * 6);
    for (let i = 0; i < campaignCount; i++) {
      const campaignId = `campaign-${Math.floor(Math.random() * 1000)}`;
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      const type = getRandomElement(campaignTypes);
      await db.campaignTracking.create({
        data: {
          campaignId,
          campaignName: `Campaign ${campaignId}`,
          type,
          articleId: article.id,
          utmSource: type === CampaignType.EMAIL ? "email" : type === CampaignType.SOCIAL ? "facebook" : "google",
          utmMedium: type === CampaignType.EMAIL ? "email" : type === CampaignType.SOCIAL ? "social" : "cpc",
          utmCampaign: `campaign-${i + 1}`,
          sessionId,
        },
      });
      count++;
    }
  }

  log(`  Creating campaign tracking for ${clients.length} clients...`, "info");
  for (const client of clients) {
    const campaignCount = Math.floor(Math.random() * 10) + 1;
    for (let i = 0; i < campaignCount; i++) {
      const campaignId = `campaign-client-${client.id}-${i}`;
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      const type = getRandomElement(campaignTypes);
      await db.campaignTracking.create({
        data: {
          campaignId,
          campaignName: `Client Campaign ${i + 1}`,
          type,
          clientId: client.id,
          utmSource: "google",
          utmMedium: "cpc",
          utmCampaign: `client-campaign-${i + 1}`,
          sessionId,
        },
      });
      count++;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} campaign tracking records in ${totalTime} seconds.`, "success");
}

async function seedLeadScoring(
  clients: Awaited<ReturnType<typeof seedClients>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding lead scoring...", "info");
  const startTime = Date.now();
  let count = 0;

  log(`  Creating lead scoring for ${clients.length} clients...`, "info");
  for (const client of clients) {
    const leadCount = Math.floor(Math.random() * 16) + 5;
    for (let i = 0; i < leadCount; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      const viewScore = Math.floor(Math.random() * 30) + 10;
      const timeScore = Math.floor(Math.random() * 25) + 10;
      const interactionScore = Math.floor(Math.random() * 20) + 5;
      const conversionScore = Math.floor(Math.random() * 25) + 10;
      const engagementScore = viewScore + timeScore + interactionScore + conversionScore;

      await db.leadScoring.create({
        data: {
          clientId: client.id,
          sessionId,
          engagementScore,
          viewScore,
          timeScore,
          interactionScore,
          conversionScore,
          pagesViewed: Math.floor(Math.random() * 10) + 1,
          totalTimeSpent: Math.random() * 600 + 60,
          interactions: Math.floor(Math.random() * 5) + 1,
          conversions: Math.random() > 0.7 ? 1 : 0,
          isQualified: engagementScore > 60,
          qualificationLevel: engagementScore > 70 ? "HOT" : engagementScore > 50 ? "WARM" : "COLD",
        },
      });
      count++;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} lead scoring records in ${totalTime} seconds.`, "success");
}

async function seedEngagementDuration(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  clients: Awaited<ReturnType<typeof seedClients>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding engagement duration...", "info");
  const startTime = Date.now();
  let count = 0;
  const publishedArticles = articles.filter((a) => a.status === ArticleStatus.PUBLISHED);

  log(`  Creating engagement duration for ${publishedArticles.length} published articles...`, "info");
  for (const article of publishedArticles) {
    const viewCount = Math.floor(Math.random() * 10) + 5; // Sample of views get engagement tracking
    for (let i = 0; i < viewCount; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      const timeOnPage = Math.random() * 600 + 30;
      const scrollDepth = Math.random() * 100;
      const bounced = timeOnPage < 30;

      await db.engagementDuration.create({
        data: {
          articleId: article.id,
          sessionId,
          timeOnPage,
          activeTime: Math.random() * timeOnPage * 0.8,
          scrollDepth,
          maxScrollDepth: Math.min(scrollDepth + Math.random() * 20, 100),
          readingTime: Math.ceil((article.wordCount || 1000) / 200),
          completionRate: scrollDepth > 75 ? 90 + Math.random() * 10 : scrollDepth * 1.2,
          bounced,
          engagedSession: timeOnPage > 120 || scrollDepth > 75,
          createdAt: generateRandomDate(article.datePublished || article.createdAt, new Date()),
        },
      });
      count++;
    }
  }

  log(`  Creating engagement duration for ${clients.length} clients...`, "info");
  for (const client of clients) {
    const viewCount = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < viewCount; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      const timeOnPage = Math.random() * 400 + 20;
      await db.engagementDuration.create({
        data: {
          clientId: client.id,
          sessionId,
          timeOnPage,
          activeTime: Math.random() * timeOnPage * 0.7,
          scrollDepth: Math.random() * 100,
          maxScrollDepth: Math.random() * 100,
          bounced: timeOnPage < 30,
          engagedSession: timeOnPage > 120,
        },
      });
      count++;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} engagement duration records in ${totalTime} seconds.`, "success");
}

async function seedArticleLinkClicks(
  articles: Awaited<ReturnType<typeof seedArticles>>,
  logCallback?: (message: string, level?: "info" | "success" | "error") => void
) {
  const log = logCallback || console.log;
  log("Seeding article link clicks...", "info");
  const startTime = Date.now();
  let count = 0;
  const publishedArticles = articles.filter((a) => a.status === ArticleStatus.PUBLISHED);
  const linkTypes = [
    LinkType.INTERNAL,
    LinkType.EXTERNAL,
    LinkType.CITATION,
    LinkType.SOCIAL,
    LinkType.AFFILIATE,
  ];
  const linkUrls = [
    "https://example.com/article",
    "https://google.com",
    "https://wikipedia.org/wiki/SEO",
    "https://twitter.com/modonty",
    "https://affiliate.example.com/product",
  ];

  log(`  Creating link clicks for ${publishedArticles.length} published articles...`, "info");
  for (const article of publishedArticles) {
    const clickCount = Math.floor(Math.random() * 13) + 3;
    for (let i = 0; i < clickCount; i++) {
      const sessionId = `session-${Math.floor(Math.random() * 10000)}`;
      const linkType = getRandomElement(linkTypes);
      const linkUrl = getRandomElement(linkUrls);
      await db.articleLinkClick.create({
        data: {
          articleId: article.id,
          linkUrl,
          linkText: "رابط مفيد",
          linkType,
          isExternal: linkType !== LinkType.INTERNAL,
          linkPosition: Math.floor(Math.random() * 10),
          sectionContext: "المحتوى الرئيسي",
          linkDomain: new URL(linkUrl).hostname,
          sessionId,
          timeOnPage: Math.random() * 300 + 30,
          scrollDepth: Math.random() * 100,
        },
      });
      count++;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ Seeded ${count} article link clicks in ${totalTime} seconds.`, "success");
}

export interface SeedSummary {
  industries: number;
  clients: number;
  categories: number;
  tags: number;
  articles: {
    total: number;
    published: number;
    draft: number;
  };
}

export async function runFullSeed(options: {
  articleCount: number;
  clientCount?: number;
  useOpenAI: boolean;
  industryBrief?: string;
  clearDatabase?: boolean;
  seedPhase?: "clients-only" | "full";
  useNewsAPI?: boolean;
  logCallback?: (message: string, level?: "info" | "success" | "error") => void;
}): Promise<SeedSummary> {
  const { articleCount, clientCount, useOpenAI, industryBrief, clearDatabase: shouldClearDatabase, seedPhase = "full", useNewsAPI = false, logCallback } = options;
  const log = logCallback || console.log;

  if (seedPhase === "clients-only") {
    log("Starting Phase 1: Clients + Media only...", "info");
  } else {
    log("Starting comprehensive seed process via runFullSeed...", "info");
  }

  const startTime = Date.now();

  // Phase 2: If clients exist, skip database clear to preserve them
  // Phase 1: Can clear database since we're creating clients
  if (seedPhase === "full") {
    const existingClientsCount = await db.client.count();
    if (existingClientsCount > 0 && shouldClearDatabase !== false) {
      log(`⚠ Found ${existingClientsCount} existing clients. Skipping database clear to preserve clients...`, "info");
      log("   (Articles will be created for existing clients)", "info");
      // Don't clear - we want to preserve existing clients and their media
      // Articles and related data will be appended or replaced by the seed process
    } else if (shouldClearDatabase !== false) {
      // No clients exist, safe to clear everything
      await clearDatabase(logCallback);
    } else {
      log("Skipping database clearing (append mode)...", "info");
    }
  } else {
    // Phase 1: Normal clear database behavior
    if (shouldClearDatabase !== false) {
      await clearDatabase(logCallback);
    } else {
      log("Skipping database clearing (append mode)...", "info");
    }
  }

  const tierConfigs = await seedSubscriptionTierConfigs(logCallback);
  const industries = await seedIndustries(useOpenAI, industryBrief, logCallback);

  // Phase 1: Create clients if needed
  // Phase 2: Use existing clients ONLY (no client creation)
  let clients;
  if (seedPhase === "clients-only") {
    // Phase 1: Create clients
    const targetClientCount = clientCount || undefined;
    clients = await seedClients(industries, tierConfigs, articleCount, logCallback, targetClientCount);
  } else {
    // Phase 2: Use existing clients ONLY - NO client creation
    const existingClientsCount = await db.client.count();
    if (existingClientsCount > 0) {
      log(`Using ${existingClientsCount} existing clients from database...`, "info");
      clients = await db.client.findMany({
        take: Math.min(existingClientsCount, 20), // Limit to 20 for distribution
      });
    } else {
      // No clients exist - throw error (articles require clients)
      const errorMessage = "Cannot create articles: No clients found. Please create clients first using 'Create Client Seed'.";
      log(`❌ ${errorMessage}`, "error");
      throw new Error(errorMessage);
    }
  }

  const author = await seedAuthors(logCallback);

  // Phase 1: Clients + Media only
  if (seedPhase === "clients-only") {
    log("Phase 1: Seeding client and author media...", "info");
    await seedMedia([], clients, author, logCallback); // Empty articles array, only creates client/author media

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`\n✅ Phase 1 completed successfully in ${duration} seconds.`, "success");
    log(`   Created: ${clients.length} clients with media`, "success");

    return {
      industries: industries.length,
      clients: clients.length,
      categories: 0,
      tags: 0,
      articles: {
        total: 0,
        published: 0,
        draft: 0,
      },
    };
  }

  // Phase 2: Full seed (articles + everything else)
  // Clients are already determined above (existing or newly created)
  
  // Fetch NewsAPI articles once (if enabled) for reuse in both seedTags and seedArticles
  let newsAPIArticles: NewsArticle[] | undefined = undefined;
  if (useNewsAPI && seedPhase === "full") {
    try {
      log("Fetching articles from NewsAPI for titles and tags...", "info");
      const newsData = await fetchArticleTitlesFromNewsAPI({
        language: "ar",
        pageSize: articleCount,
        query: industryBrief || "SEO technology",
        industryBrief,
      });
      newsAPIArticles = newsData.articles;
      log(`Fetched ${newsAPIArticles.length} articles from NewsAPI.`, "success");
    } catch (error) {
      const logError = logCallback || console.error;
      logError("NewsAPI fetch failed, continuing with OpenAI/templates:", "error");
      logError(error instanceof Error ? error.message : String(error), "error");
      // Continue without NewsAPI articles - will fall back to OpenAI/templates
    }
  }
  
  const categories = await seedCategories(useOpenAI, industryBrief, articleCount, logCallback);
  const tags = await seedTags(useOpenAI, industryBrief, articleCount, useNewsAPI, newsAPIArticles, logCallback);
  const articles = await seedArticles(clients, author, categories, articleCount, useOpenAI, industryBrief, useNewsAPI, newsAPIArticles, logCallback);

  await seedArticleTags(articles, tags, logCallback);
  await seedMedia(articles, clients, author, logCallback);
  await seedAnalytics(articles, logCallback);
  await seedFAQs(articles, useOpenAI, industryBrief, logCallback);
  await seedRelatedArticles(articles, logCallback);
  await seedSubscribers(clients, logCallback);
  await seedSettings(logCallback);
  await seedArticleVersions(articles, logCallback);
  await seedArticleMedia(articles, logCallback);
  await seedComments(articles, logCallback);
  await seedClientComments(clients, logCallback);
  await seedArticleInteractions(articles, logCallback);
  await seedClientInteractions(clients, logCallback);
  await seedCommentInteractions(logCallback);
  await seedArticleViews(articles, logCallback);
  await seedClientViews(clients, logCallback);
  await seedShares(articles, clients, logCallback);
  await seedConversions(articles, clients, logCallback);
  await seedCTAClicks(articles, clients, logCallback);
  await seedCampaignTracking(articles, clients, logCallback);
  await seedLeadScoring(clients, logCallback);
  await seedEngagementDuration(articles, clients, logCallback);
  await seedArticleLinkClicks(articles, logCallback);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log(`\n✅ Comprehensive seed process completed successfully in ${duration} seconds.`, "success");

  const publishedCount = articles.filter((a) => a.status === ArticleStatus.PUBLISHED).length;
  const draftCount = articles.filter((a) => a.status === ArticleStatus.DRAFT).length;

  return {
    industries: industries.length,
    clients: clients.length,
    categories: categories.length,
    tags: tags.length,
    articles: {
      total: articles.length,
      published: publishedCount,
      draft: draftCount,
    },
  };
}

