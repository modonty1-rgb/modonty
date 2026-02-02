import OpenAI from "openai";

export interface OpenAIArticleData {
  content: string;
  excerpt: string;
  wordCount: number;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  faqs: { question: string; answer: string }[];
}

const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
const temperature = process.env.OPENAI_TEMPERATURE
  ? Number(process.env.OPENAI_TEMPERATURE)
  : 0.2;

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export async function generateArticleWithOpenAI(params: {
  title: string;
  category: string;
  length: "short" | "medium" | "long";
  language: "ar";
  industryBrief?: string;
}): Promise<OpenAIArticleData> {
  const { title, category, length, language, industryBrief } = params;
  const client = getClient();

  const targetWordCount =
    length === "short" ? 400 : length === "medium" ? 900 : 1500;

  const industryContext = industryBrief
    ? `\n\n⚠️ مهم جداً - السياق الصناعي/القطاعي الأساسي:
"${industryBrief}"

هذا هو السياق الصناعي الرئيسي الذي يجب أن يكون المقال موجهاً له بشكل كامل ومتخصص. يجب أن:
- يربط جميع المفاهيم والمعلومات بهذا القطاع بشكل طبيعي ومحترف
- يستخدم أمثلة واقعية وتطبيقات من هذا المجال
- يظهر معرفة عميقة ودراية متخصصة بهذا القطاع
- يكتب بأسلوب خبير محتوى متخصص وليس عام
- يجعل المحتوى مفيداً وقابلاً للتطبيق الفوري في هذا المجال`
    : "";

  const prompt = `
أنت كاتب محتوى SEO محترف ومتخصص بخبرة 10+ سنوات في كتابة المحتوى العربي المتخصص. تكتب بأسلوب خبير محتوى عالي المستوى يركز على القيمة العملية والتطبيق الفوري.

${industryContext}

📋 متطلبات المقال:
- العنوان: "${title}"
- التصنيف: "${category}"
- الطول المطلوب: ${length} (${targetWordCount} كلمة تقريباً)
- اللغة: ${language}

أريد منك أن تُرجع JSON فقط، بدون أي نص آخر، بالشكل التالي:
{
  "content": "محتوى المقال الكامل بصيغة Markdown...",
  "excerpt": "ملخص قصير للمقال بطول 130-170 حرفاً...",
  "wordCount": 1234,
  "seoTitle": "عنوان SEO من 40-60 حرفاً...",
  "seoDescription": "وصف SEO من 130-170 حرفاً...",
  "keywords": ["كلمة 1", "كلمة 2", "كلمة 3"],
  "faqs": [
    { "question": "سؤال 1؟", "answer": "إجابة مفصلة 1..." },
    { "question": "سؤال 2؟", "answer": "إجابة مفصلة 2..." }
  ]
}

يرجى الالتزام الصارم بصيغة JSON الصحيحة فقط بدون تعليقات أو نص خارج JSON.
`;

  const response = await client.chat.completions.create({
    model,
    temperature,
    messages: [
      {
        role: "system",
        content:
          "You are a senior Arabic SEO content writer with 10+ years of experience. You write professional, expert-level content that is practical, actionable, and demonstrates deep industry knowledge. Always respond with valid JSON only, no additional text or explanations.",
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse OpenAI JSON response for article generation.");
  }

  const content: string = parsed.content || "";
  const excerpt: string = parsed.excerpt || "";
  const seoTitle: string = parsed.seoTitle || title;
  const seoDescription: string = parsed.seoDescription || excerpt;
  const keywords: string[] = Array.isArray(parsed.keywords) ? parsed.keywords : [];
  const faqs: { question: string; answer: string }[] = Array.isArray(parsed.faqs)
    ? parsed.faqs
    : [];

  const wordCount =
    typeof parsed.wordCount === "number" && parsed.wordCount > 0
      ? parsed.wordCount
      : content.split(/\s+/).filter(Boolean).length;

  if (!content || !excerpt) {
    throw new Error("OpenAI article response missing content or excerpt.");
  }

  return {
    content,
    excerpt,
    wordCount,
    seoTitle,
    seoDescription,
    keywords,
    faqs,
  };
}

export interface OpenAICategoryData {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}

export interface OpenAICategoriesData {
  parentCategories: OpenAICategoryData[];
  childCategories: {
    name: string;
    slug: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    parentSlug: string;
  }[];
}

export async function generateCategoriesWithOpenAI(params: {
  language: "ar";
  industryBrief?: string;
  articleCount?: number;
}): Promise<OpenAICategoriesData> {
  const { language, industryBrief, articleCount = 10 } = params;
  const client = getClient();

  // Calculate category count based on article count (proportional scaling)
  // Minimum: 3 parent categories, Maximum: 10 parent categories
  // For 3 articles: 3-4 parent, 1-2 child
  // For 10 articles: 5-7 parent, 2-3 child  
  // For 50+ articles: 8-10 parent, 4-6 child
  const parentCategoryMin = Math.max(3, Math.min(5, Math.ceil(articleCount / 3)));
  const parentCategoryMax = Math.min(10, Math.max(6, Math.ceil(articleCount / 5)));
  const childCategoryMin = Math.max(1, Math.min(2, Math.floor(articleCount / 5)));
  const childCategoryMax = Math.min(6, Math.max(3, Math.ceil(articleCount / 8)));

  const industryContext = industryBrief
    ? `\n\n⚠️ مهم جداً - السياق الصناعي/القطاعي الأساسي:
"${industryBrief}"

هذا هو السياق الصناعي الرئيسي الذي يجب أن تكون جميع التصنيفات موجّهة له ومصممة خصيصاً له. يجب أن:
- تعكس التصنيفات الموضوعات والاهتمامات الأساسية في هذا القطاع
- تكون التصنيفات منطقية ومنظمة بطريقة احترافية
- تظهر معرفة عميقة بالمجال والتخصصات الفرعية فيه`
    : "";

  const prompt = `
أنت خبير استراتيجي في SEO وتنظيم المحتوى بخبرة 10+ سنوات. تخصصك يكمن في إنشاء هياكل تصنيفية احترافية ومنطقية تناسب المحتوى المتخصص.

${industryContext}

📋 سيتم إنشاء ${articleCount} مقال - يجب أن تكون التصنيفات متناسبة ومفيدة لتنظيم هذه المقالات.

أريد منك أن تنشئ تصنيفات محتوى SEO منطقية ومنظمة:
- ${parentCategoryMin}-${parentCategoryMax} تصنيفات رئيسية (parent categories) متنوعة ومناسبة
- ${childCategoryMin}-${childCategoryMax} تصنيفات فرعية (child categories) مرتبطة ببعض التصنيفات الرئيسية

أريد منك أن تُرجع JSON فقط، بدون أي نص آخر، بالشكل التالي:
{
  "parentCategories": [
    {
      "name": "اسم التصنيف الرئيسي (مثل: Technical SEO)",
      "slug": "slug-بالإنجليزية-مثل-technical-seo",
      "description": "وصف قصير بالعربية يشرح ما يتضمنه هذا التصنيف (30-50 كلمة)",
      "seoTitle": "عنوان SEO من 40-60 حرفاً",
      "seoDescription": "وصف SEO من 130-170 حرفاً"
    }
  ],
  "childCategories": [
    {
      "name": "اسم التصنيف الفرعي (مثل: Core Web Vitals)",
      "slug": "slug-بالإنجليزية-مثل-core-web-vitals",
      "description": "وصف قصير بالعربية (30-50 كلمة)",
      "seoTitle": "عنوان SEO من 40-60 حرفاً",
      "seoDescription": "وصف SEO من 130-170 حرفاً",
      "parentSlug": "slug-التصنيف-الرئيسي-المرتبط-به"
    }
  ]
}

يرجى الالتزام الصارم بصيغة JSON الصحيحة فقط بدون تعليقات أو نص خارج JSON.
`;

  const response = await client.chat.completions.create({
    model,
    temperature,
    messages: [
      {
        role: "system",
        content:
          "You are a senior SEO content strategist with 10+ years of experience in content categorization and taxonomy design. You create professional, logical category structures that reflect deep industry knowledge. Always respond with valid JSON only, no additional text.",
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse OpenAI JSON response for category generation.");
  }

  const parentCategories: OpenAICategoryData[] = Array.isArray(parsed.parentCategories)
    ? parsed.parentCategories
    : [];
  const childCategories = Array.isArray(parsed.childCategories)
    ? parsed.childCategories
    : [];

  if (parentCategories.length === 0) {
    throw new Error("OpenAI category response missing parent categories.");
  }

  return {
    parentCategories,
    childCategories,
  };
}

export interface OpenAITagsData {
  tags: string[];
}

export async function generateTagsWithOpenAI(params: {
  language: "ar";
  industryBrief?: string;
  articleCount?: number;
}): Promise<OpenAITagsData> {
  const { language, industryBrief, articleCount = 10 } = params;
  const client = getClient();

  // Calculate tag count based on article count (proportional scaling)
  // Minimum: 5 tags per article, Maximum: 20 tags per article
  // For 3 articles: 15-20 tags
  // For 10 articles: 30-40 tags
  // For 50+ articles: 40-60 tags
  const tagCountMin = Math.max(10, Math.min(15, articleCount * 5));
  const tagCountMax = Math.min(60, Math.max(20, articleCount * 7));

  const industryContext = industryBrief
    ? `\n\n⚠️ مهم جداً - السياق الصناعي/القطاعي الأساسي:
"${industryBrief}"

هذا هو السياق الصناعي الرئيسي الذي يجب أن تكون جميع الكلمات المفتاحية (tags) مصممة له. يجب أن:
- تعكس الكلمات المفتاحية المصطلحات والمفاهيم الأساسية في هذا القطاع
- تغطي الكلمات الأساسية والتخصصية والفرعية للمجال
- تكون دقيقة ومتخصصة وليست عامة`
    : "";

  const prompt = `
أنت خبير SEO متخصص في الكلمات المفتاحية والتصنيف الدلالي بخبرة 10+ سنوات. تخصصك يكمن في اختيار الكلمات المفتاحية الاستراتيجية والدقيقة التي تعكس معرفة عميقة بالمجال.

${industryContext}

📋 سيتم إنشاء ${articleCount} مقال - يجب أن تكون الكلمات المفتاحية متناسبة ومفيدة لتصنيف هذه المقالات.

أريد منك أن تنشئ قائمة كلمات مفتاحية (tags) متنوعة ومناسبة للمحتوى SEO:
- ${tagCountMin}-${tagCountMax} كلمة مفتاحية متنوعة
- تغطي مواضيع SEO الأساسية والتخصصية
- مناسبة للسياق/القطاع المحدد

أريد منك أن تُرجع JSON فقط، بدون أي نص آخر، بالشكل التالي:
{
  "tags": [
    "كلمة مفتاحية 1",
    "كلمة مفتاحية 2",
    "كلمة مفتاحية 3",
    ...
  ]
}

يرجى الالتزام الصارم بصيغة JSON الصحيحة فقط بدون تعليقات أو نص خارج JSON.
`;

  const response = await client.chat.completions.create({
    model,
    temperature,
    messages: [
      {
        role: "system",
        content:
          "You are a senior SEO keyword strategist with 10+ years of experience in keyword research and semantic tagging. You select precise, industry-specific tags that demonstrate deep domain knowledge. Always respond with valid JSON only, no additional text.",
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse OpenAI JSON response for tag generation.");
  }

  const tags: string[] = Array.isArray(parsed.tags) ? parsed.tags : [];

  if (tags.length === 0) {
    throw new Error("OpenAI tag response missing tags.");
  }

  return {
    tags,
  };
}

export interface OpenAIIndustryData {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}

export interface OpenAIIndustriesData {
  industries: OpenAIIndustryData[];
}

export async function generateIndustriesWithOpenAI(params: {
  language: "ar";
  industryBrief?: string;
}): Promise<OpenAIIndustriesData> {
  const { language, industryBrief } = params;
  const client = getClient();

  const industryContext = industryBrief
    ? `\n\n⚠️ مهم جداً - السياق الصناعي/القطاعي الأساسي:
"${industryBrief}"

بناءً على هذا السياق الصناعي، يجب أن تنشئ قائمة قطاعات صناعية متنوعة ومناسبة:
- القطاعات يجب أن تكون متعددة ومتنوعة (6-10 قطاعات)
- يجب أن تشمل القطاع الرئيسي المذكور في السياق بالإضافة إلى قطاعات ذات صلة
- كل قطاع يجب أن يكون منطقياً ومتخصصاً وليس عاماً`
    : `\n\nيجب أن تنشئ قائمة قطاعات صناعية متنوعة ومناسبة للمحتوى العربي:
- 6-10 قطاعات متنوعة
- تغطي القطاعات الأساسية والتخصصية`;

  const prompt = `
أنت خبير استراتيجي في تحليل القطاعات الصناعية وتصنيفها بخبرة 10+ سنوات. تخصصك يكمن في فهم العلاقات بين القطاعات وإنشاء تصنيفات منطقية ومهنية.

${industryContext}

📋 متطلبات القطاعات:
- 6-10 قطاعات صناعية متنوعة ومنطقية
- كل قطاع يجب أن يكون محدداً ومتخصصاً وليس عاماً
- الأسماء بالعربية مع slugs بالإنجليزية
- كل قطاع يحتوي على وصف مختصر (30-50 كلمة) يشرح مجال التخصص
- عنوان SEO من 40-60 حرفاً
- وصف SEO من 130-170 حرفاً

أريد منك أن تُرجع JSON فقط، بدون أي نص آخر، بالشكل التالي:
{
  "industries": [
    {
      "name": "اسم القطاع بالعربية (مثل: التقنية والبرمجيات)",
      "slug": "slug-بالإنجليزية-مثل-technology-software",
      "description": "وصف مختصر بالعربية يشرح مجال التخصص (30-50 كلمة)",
      "seoTitle": "عنوان SEO من 40-60 حرفاً",
      "seoDescription": "وصف SEO من 130-170 حرفاً"
    }
  ]
}

يرجى الالتزام الصارم بصيغة JSON الصحيحة فقط بدون تعليقات أو نص خارج JSON.
`;

  const response = await client.chat.completions.create({
    model,
    temperature,
    messages: [
      {
        role: "system",
        content:
          "You are a senior industry analyst with 10+ years of experience in industry categorization and classification. You create professional, logical industry taxonomies that reflect deep market knowledge. Always respond with valid JSON only, no additional text.",
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse OpenAI JSON response for industry generation.");
  }

  const industries: OpenAIIndustryData[] = Array.isArray(parsed.industries)
    ? parsed.industries
    : [];

  if (industries.length === 0) {
    throw new Error("OpenAI industry response missing industries.");
  }

  return {
    industries,
  };
}

export interface OpenAIArticleTitlesData {
  titles: string[];
}

export async function generateArticleTitlesWithOpenAI(params: {
  language: "ar";
  industryBrief?: string;
  count?: number;
}): Promise<OpenAIArticleTitlesData> {
  const { language, industryBrief, count = 50 } = params;
  const client = getClient();

  const industryContext = industryBrief
    ? `\n\n⚠️ مهم جداً - السياق الصناعي/القطاعي الأساسي:
"${industryBrief}"

بناءً على هذا السياق الصناعي، يجب أن تنشئ عناوين مقالات SEO احترافية ومتخصصة:
- جميع العناوين يجب أن تكون متخصصة في هذا القطاع ومتعلقة به
- العناوين يجب أن تكون عملية وقابلة للتطبيق في هذا المجال
- استخدام مصطلحات متخصصة ومهنية تعكس معرفة عميقة بالمجال
- العناوين يجب أن تكون جذابة ومفيدة للمهنيين في هذا القطاع`
    : "";

  const prompt = `
أنت كاتب عناوين SEO محترف ومتخصص بخبرة 10+ سنوات في كتابة العناوين التي تحول الزوار إلى قراء وتحقق ترتيب عالي في محركات البحث.

${industryContext}

📋 متطلبات العناوين:
- ${count} عنوان مقال SEO احترافي ومتخصص
- كل عنوان يجب أن يكون:
  * واضحاً ومباشراً ومفيداً
  * متخصصاً وعملياً وقابلاً للتطبيق
  * جذاباً للقارئ المهني
  * محسّناً لـ SEO (يحتوي على كلمات مفتاحية مناسبة)
  * باللغة ${language}
- العناوين يجب أن تكون متنوعة ومختلفة (دلائل، نصائح، استراتيجيات، تحليلات، إلخ)
- العناوين يجب أن تعكس معرفة عميقة بالمجال وليست عامة

أريد منك أن تُرجع JSON فقط، بدون أي نص آخر، بالشكل التالي:
{
  "titles": [
    "عنوان المقال الأول",
    "عنوان المقال الثاني",
    ...
  ]
}

يرجى الالتزام الصارم بصيغة JSON الصحيحة فقط بدون تعليقات أو نص خارج JSON.
`;

  const response = await client.chat.completions.create({
    model,
    temperature,
    messages: [
      {
        role: "system",
        content:
          "You are a senior SEO headline writer with 10+ years of experience. You craft professional, industry-specific titles that are compelling, actionable, and optimized for search engines. Always respond with valid JSON only, no additional text.",
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse OpenAI JSON response for article title generation.");
  }

  const titles: string[] = Array.isArray(parsed.titles) ? parsed.titles : [];

  if (titles.length === 0) {
    throw new Error("OpenAI article title response missing titles.");
  }

  return {
    titles,
  };
}

export interface OpenAIFAQTemplateData {
  templates: Array<{
    questionTemplate: string;
    answerTemplate: string;
    description: string;
  }>;
}

export async function generateFAQTemplatesWithOpenAI(params: {
  language: "ar";
  industryBrief?: string;
}): Promise<OpenAIFAQTemplateData> {
  const { language, industryBrief } = params;
  const client = getClient();

  const industryContext = industryBrief
    ? `\n\n⚠️ مهم جداً - السياق الصناعي/القطاعي الأساسي:
"${industryBrief}"

بناءً على هذا السياق الصناعي، يجب أن تنشئ قوالب FAQ احترافية:
- القوالب يجب أن تكون متخصصة في هذا القطاع
- الأسئلة والأجوبة يجب أن تستخدم مصطلحات متخصصة ومهنية
- القوالب يجب أن تعكس معرفة عميقة بالمجال والمشاكل الحقيقية للمهنيين فيه`
    : "";

  const prompt = `
أنت خبير في كتابة محتوى FAQ محترف بخبرة 10+ سنوات. تخصصك يكمن في فهم الأسئلة الحقيقية التي يطرحها المهنيون وإنشاء إجابات شاملة ومفيدة.

${industryContext}

📋 متطلبات القوالب:
- 6-10 قوالب FAQ احترافية ومتخصصة
- كل قالب يتكون من:
  * سؤال نموذجي يمكن تخصيصه باستخدام {topic} أو {industry}
  * إجابة نموذجية شاملة يمكن تخصيصها
  * وصف قصير يشرح متى يستخدم هذا القالب
- القوالب يجب أن تغطي أنواع مختلفة من الأسئلة:
  * تعريفية (ما هو...؟)
  * عملية (كيف...؟)
  * مقارنة (ما الفرق بين...؟)
  * أفضل الممارسات (ما هي أفضل طريقة...؟)
  * استراتيجية (كيف يمكنني...؟)
  * تحليلية (لماذا...؟)

أريد منك أن تُرجع JSON فقط، بدون أي نص آخر، بالشكل التالي:
{
  "templates": [
    {
      "questionTemplate": "نموذج السؤال (يمكن استخدام {topic} أو {industry})",
      "answerTemplate": "نموذج الإجابة الشاملة (يمكن استخدام {topic} أو {industry})",
      "description": "وصف قصير يشرح متى يستخدم هذا القالب"
    }
  ]
}

يرجى الالتزام الصارم بصيغة JSON الصحيحة فقط بدون تعليقات أو نص خارج JSON.
`;

  const response = await client.chat.completions.create({
    model,
    temperature,
    messages: [
      {
        role: "system",
        content:
          "You are a senior FAQ content writer with 10+ years of experience. You create professional, industry-specific FAQ templates that address real professional questions with comprehensive, actionable answers. Always respond with valid JSON only, no additional text.",
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse OpenAI JSON response for FAQ template generation.");
  }

  const templates = Array.isArray(parsed.templates) ? parsed.templates : [];

  if (templates.length === 0) {
    throw new Error("OpenAI FAQ template response missing templates.");
  }

  return {
    templates,
  };
}

