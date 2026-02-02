/**
 * Seed Helper Functions
 * Utility functions used across seed operations
 */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function generateRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Calculate proportional count based on article count
 * For small article counts (1-5): reduce per-article counts
 * For medium counts (6-20): moderate counts
 * For large counts (21+): full counts
 */
export function getProportionalCount(
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

export function generateSEOArticleContent(
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

export function generateSEOFields(title: string, excerpt: string, category: string) {
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
