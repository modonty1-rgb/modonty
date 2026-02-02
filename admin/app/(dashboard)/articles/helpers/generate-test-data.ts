import type { ArticleFormData } from '@/lib/types/form-types';
import type { GalleryFormItem } from '@/lib/types/form-types';

interface GenerateTestDataOptions {
  clients: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
  media?: Array<{ id: string; clientId: string; url: string; altText?: string | null }>;
  articles?: Array<{ id: string; title: string }>;
}

// Helper to get random item from array
const getRandomItem = <T,>(arr: T[]): T | undefined => {
  return arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : undefined;
};

// Helper to get random items (multiple)
const getRandomItems = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
};

export function generateTestData(options: GenerateTestDataOptions): Partial<ArticleFormData> {
  const { clients, categories, authors, tags, media = [], articles = [] } = options;
  
  // Pick RANDOM items from database
  const client = getRandomItem(clients);
  const category = getRandomItem(categories);
  const author = getRandomItem(authors);
  const selectedTags = getRandomItems(tags, 3).map(t => t.id);
  
  // Featured Image - random from selected client's media
  const clientMedia = media.filter(m => m.clientId === client?.id);
  const featuredImage = getRandomItem(clientMedia);
  
  // Related Articles - random 2-3 articles (excluding current)
  const relatedArticles = getRandomItems(articles, 3).map(a => ({
    relatedId: a.id,
    relationshipType: 'related' as const,
  }));
  // Article settings
  const featured = Math.random() > 0.7; // 30% chance
  // Always set a future scheduled date (within next 7 days)
  const scheduledAt = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000);
  
  // Generate test FAQs (3 items)
  const testFaqs = [
    {
      question: 'ما هي الفوائد الرئيسية لهذه الخدمة؟',
      answer: 'توفر هذه الخدمة العديد من الفوائد المهمة التي تشمل تحسين الأداء وزيادة الكفاءة وتوفير الوقت والموارد. كما أنها مصممة لتلبية احتياجات المستخدمين بشكل شامل ومتكامل.',
      order: 0,
    },
    {
      question: 'كيف يمكنني البدء في استخدام هذه الخدمة؟',
      answer: 'يمكنك البدء بسهولة من خلال إنشاء حساب جديد واتباع خطوات التسجيل البسيطة. بعد ذلك، ستتمكن من الوصول إلى جميع الميزات والخدمات المتاحة فوراً.',
      order: 1,
    },
    {
      question: 'هل هناك دعم فني متاح للمساعدة؟',
      answer: 'نعم، نوفر دعم فني شامل على مدار الساعة للإجابة على جميع استفساراتكم ومساعدتكم في حل أي مشكلات قد تواجهكم. فريق الدعم لدينا جاهز دائماً لمساعدتك.',
      order: 2,
    },
  ];
  
  // Generate test content with timestamp for uniqueness
  const timestamp = new Date().toLocaleTimeString('ar-SA', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  
  const testTitle = `اختبار مقال جديد - ${timestamp}`;
  const testExcerpt = 'هذا مقال تجريبي شامل لاختبار النظام. يحتوي على محتوى تجريبي غني ومفصل لأغراض التطوير والاختبار. تم تصميمه ليشمل جميع العناصر الأساسية لمقال كامل مع محتوى واقعي يساعد في اختبار جميع الميزات والوظائف بشكل دقيق.';
  
  // LONG test content (1000+ words) with rich HTML structure
  const testContent = `
<h2>مقدمة شاملة حول الموضوع</h2>
<p>هذا محتوى تجريبي مطول لاختبار النظام بشكل شامل. تم إنشاؤه تلقائياً لأغراض التطوير والتأكد من أن جميع الميزات تعمل بشكل صحيح. يساعد هذا المحتوى في اختبار المحرر النصي، التحليل التلقائي، والتحقق من صحة البيانات في جميع المراحل.</p>

<p>يتضمن هذا المقال التجريبي العديد من الفقرات والأقسام المختلفة لضمان اختبار شامل لجميع وظائف النظام. من المهم أن يكون المحتوى التجريبي طويلاً بما يكفي لاختبار حساب الكلمات، وقت القراءة، وتحليل SEO بدقة.</p>

<h2>القسم الأول: المحتوى الرئيسي والتفاصيل الأساسية</h2>
<p>نص تجريبي طويل يحتوي على معلومات اختبارية شاملة ومفصلة. هذا المحتوى مصمم بعناية لاختبار جميع ميزات المحرر والتحقق من صحة البيانات والتأكد من أن النظام يتعامل مع المحتوى الطويل بشكل صحيح وفعال دون أي مشاكل أو أخطاء.</p>

<p>يتضمن هذا القسم فقرات متعددة للتأكد من أن حساب الكلمات ووقت القراءة يعمل بشكل صحيح ودقيق. كما يساعد في اختبار تحليل SEO والتحقق من جودة المحتوى والتأكد من أن جميع المعايير مستوفاة بشكل كامل.</p>

<p>من الضروري أن يحتوي المقال التجريبي على محتوى كافٍ لاختبار جميع الوظائف المتقدمة مثل تحليل الكلمات المفتاحية، فحص طول الفقرات، والتحقق من وجود روابط خارجية موثوقة تدعم محتوى المقال.</p>

<h2>القسم الثاني: الروابط والمصادر الموثوقة</h2>
<p>هذا القسم يحتوي على <a href="https://example.com">رابط تجريبي خارجي</a> للتحقق من استخراج الروابط والمصادر بشكل تلقائي. كما يتضمن <a href="https://developer.mozilla.org/ar/">رابط آخر لمصدر موثوق</a> لاختبار نظام الاستشهادات والتأكد من أن جميع الروابط يتم التعرف عليها وتصنيفها بشكل صحيح.</p>

<p>يعتبر وجود روابط خارجية موثوقة من العوامل المهمة في تحسين SEO وزيادة مصداقية المحتوى. لذلك، يحتوي هذا المقال التجريبي على عدة روابط لمصادر معروفة مثل <a href="https://schema.org/Article">Schema.org</a> لاختبار نظام استخراج المراجع.</p>

<h2>القسم الثالث: المحتوى الغني والعناصر المتنوعة</h2>
<p>المزيد من المحتوى التجريبي المفصل للتأكد من أن جميع الحقول والوظائف تعمل بشكل صحيح ومتكامل. يتضمن هذا النص فقرات متعددة ومتنوعة لاختبار العد والتحليل والتحقق من الجودة بشكل شامل ودقيق.</p>

<p>هذه فقرة طويلة جداً تحتوي على أكثر من خمسمائة حرف لاختبار ميزة تحديد الفقرات الطويلة في المحرر. من المهم أن يتمكن النظام من تحديد الفقرات التي تتجاوز الطول المثالي وتنبيه المستخدم لتقسيمها إلى فقرات أصغر لتحسين القراءة والفهم. هذا يساعد في تحسين جودة المحتوى بشكل عام ويضمن تجربة قراءة أفضل للزوار والمستخدمين الذين يتصفحون المقال ويبحثون عن معلومات مفيدة ومفهومة بسهولة.</p>

<h2>القسم الرابع: قوائم منظمة ومعلومات هيكلية</h2>
<p>في هذا القسم، سنستعرض بعض النقاط المهمة في شكل قوائم منظمة لتحسين القراءة والفهم:</p>

<ul>
  <li>النقطة الأولى: أهمية المحتوى الجيد في تحسين SEO وجذب الزوار</li>
  <li>النقطة الثانية: ضرورة استخدام عناوين واضحة ومنظمة في المقالات</li>
  <li>النقطة الثالثة: فائدة الروابط الخارجية الموثوقة في دعم المحتوى</li>
  <li>النقطة الرابعة: أهمية تنظيم الفقرات وتقسيمها بشكل منطقي</li>
  <li>النقطة الخامسة: دور الصور والوسائط في إثراء تجربة القارئ</li>
</ul>

<p>هذه القوائم تساعد في تنظيم المعلومات وجعلها أكثر وضوحاً للقراء. كما أنها تحسن من بنية المقال وتسهل على محركات البحث فهم المحتوى وتصنيفه بشكل صحيح.</p>

<h2>القسم الخامس: التحليل والنتائج المتوقعة</h2>
<p>بعد اختبار جميع الميزات باستخدام هذا المحتوى التجريبي الطويل، من المتوقع أن تظهر النتائج التالية:</p>

<p>أولاً، يجب أن يتمكن النظام من حساب عدد الكلمات بدقة والذي يجب أن يتجاوز 1000 كلمة في هذا المقال التجريبي. ثانياً، يجب حساب وقت القراءة المتوقع بناءً على متوسط سرعة القراءة العربية.</p>

<p>ثالثاً، يجب أن يعمل تحليل SEO على فحص جميع العناصر المهمة مثل العناوين، الكلمات المفتاحية، طول المحتوى، وجود الروابط الخارجية، وتنظيم الفقرات. كل هذه العوامل تساهم في تحديد جودة المقال وملاءمته لمحركات البحث.</p>

<h2>القسم السادس: الخلاصة والتوصيات</h2>
<p>في الختام، يوفر هذا المقال التجريبي الطويل فرصة ممتازة لاختبار جميع ميزات النظام بشكل شامل وواقعي. من المهم أن يتم اختبار النظام بمحتوى يشبه المقالات الحقيقية من حيث الطول والتنظيم والتنوع.</p>

<p>ننصح بمراجعة جميع النتائج والتحليلات التي يوفرها النظام للتأكد من دقتها وموثوقيتها. كما يجب التحقق من أن جميع الحقول تم ملؤها بشكل صحيح وأن البيانات المدخلة منطقية ومتسقة مع بعضها البعض.</p>

<p>فقرة ختامية تحتوي على ملخص شامل للمحتوى التجريبي وتأكيد على أن هذا محتوى للاختبار فقط ويجب استبداله بمحتوى حقيقي وذو قيمة قبل النشر الفعلي. نتمنى أن يكون هذا المحتوى التجريبي قد ساعد في اختبار جميع الوظائف بنجاح.</p>
  `.trim();

  // Gallery - 2–4 random images from selected client's media
  const galleryCount = Math.min(
    clientMedia.length,
    Math.floor(Math.random() * 3) + 2 // 2–4 images
  );
  const galleryItems = galleryCount > 0 ? getRandomItems(clientMedia, galleryCount) : [];
  const gallery: GalleryFormItem[] = galleryItems.map((img, index) => ({
    mediaId: img.id,
    position: index,
    caption: `صورة معرض رقم ${index + 1}`,
    altText: img.altText || `صورة توضيحية ${index + 1}`,
  }));
  // SEO keywords
  const seoKeywords = [
    'كلمة مفتاحية رئيسية',
    'تحسين محركات البحث',
    'محتوى عربي احترافي',
    'مقالات تقنية متقدمة',
    'استراتيجيات التسويق الرقمي',
    'تطوير الويب',
    'تجربة المستخدم',
    'الذكاء الاصطناعي',
  ].slice(0, Math.floor(Math.random() * 4) + 5); // 5-8 keywords

  // Semantic keywords (entities)
  const semanticKeywords = [
    {
      name: 'تحسين محركات البحث',
      wikidataId: 'Q180711',
      url: 'https://ar.wikipedia.org/wiki/تحسين_محركات_البحث',
    },
    {
      name: 'الذكاء الاصطناعي',
      wikidataId: 'Q11660',
      url: 'https://ar.wikipedia.org/wiki/ذكاء_اصطناعي',
    },
    {
      name: 'تطوير البرمجيات',
      wikidataId: 'Q638608',
      url: 'https://ar.wikipedia.org/wiki/تطوير_البرمجيات',
    },
    {
      name: 'تجربة المستخدم',
      wikidataId: 'Q1719290',
      url: 'https://ar.wikipedia.org/wiki/تجربة_المستخدم',
    },
    {
      name: 'التسويق الرقمي',
      wikidataId: 'Q1323314',
      url: 'https://ar.wikipedia.org/wiki/تسويق_رقمي',
    },
  ].slice(0, Math.floor(Math.random() * 3) + 3); // 3-5 entities

  // Twitter fields
  const twitterSite = `@${(client?.name || 'modonty').replace(/\s+/g, '')}`;
  const twitterCreator = `@${(author?.name || 'author').replace(/\s+/g, '')}`;
  
  return {
    // Basic Content
    title: testTitle,
    excerpt: testExcerpt,
    content: testContent,
    
    // Relationships (RANDOM from DB)
    clientId: client?.id || '',
    categoryId: category?.id || '',
    authorId: author?.id || '',
    tags: selectedTags,
    
    // Media (RANDOM from selected client)
    featuredImageId: featuredImage?.id || null,
    featuredImageAlt: featuredImage?.altText || `صورة مميزة لـ ${testTitle}`,
    gallery,
    
    // FAQs (3 test items)
    faqs: testFaqs,
    
    // Related Articles (RANDOM from DB)
    relatedArticles: relatedArticles,
    
    // Status & Workflow
    status: 'WRITING',
    featured,
    scheduledAt,
    
    // SEO Meta Tags
    seoTitle: `${testTitle} - دليل شامل ومفصل 2024`,
    seoDescription: testExcerpt,
    metaRobots: 'index, follow',
    
    // Open Graph
    ogTitle: testTitle,
    ogDescription: testExcerpt,
    ogType: 'article',
    ogSiteName: 'مودونتي',
    ogLocale: 'ar_SA',
    ogArticleSection: category?.name || 'عام',
    
    // Twitter Card
    twitterCard: 'summary_large_image',
    twitterTitle: testTitle,
    twitterDescription: testExcerpt.substring(0, 160),
    twitterSite,
    twitterCreator,
    
    // Technical SEO
    inLanguage: 'ar',
    isAccessibleForFree: true,
    license: 'none',
    sitemapPriority: 0.7,
    sitemapChangeFreq: 'weekly',
    
    // Citations (test authoritative URLs)
    citations: [
      'https://developer.mozilla.org/en-US/docs/Web',
      'https://schema.org/Article',
      'https://example.com/authoritative-source',
    ],

    // SEO keywords & semantic entities
    seoKeywords,
    semanticKeywords,
    
    // Content metadata
    contentFormat: 'rich_text',
  };
}
