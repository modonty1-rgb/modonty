import OpenAI from "openai";

export interface GeneratedArticleData {
  title: string;
  content: string; // TipTap HTML format
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  faqs: Array<{ question: string; answer: string }>;
  wordCount: number;
  readingTimeMinutes: number;
  contentDepth: 'short' | 'medium' | 'long';
}

const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
const temperature = process.env.OPENAI_TEMPERATURE
  ? Number(process.env.OPENAI_TEMPERATURE)
  : 0.2;

let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export async function generateComprehensiveArticleData(params: {
  keywords: string;
  length: "short" | "medium" | "long";
  clientName?: string;
  categoryName?: string;
}): Promise<GeneratedArticleData> {
  const { keywords, length, clientName, categoryName } = params;
  const openaiClient = getOpenAIClient();

  const targetWordCount =
    length === "short" ? 500 : length === "medium" ? 1000 : 2000;

  const systemMessage = `You are a senior Arabic article editor with 15+ years of experience in content creation and SEO optimization. Your expertise includes:
- Creating high-quality, publication-ready Arabic content
- Perfect Arabic grammar, RTL formatting, and cultural context
- SEO optimization with natural keyword integration
- Structuring content with proper hierarchy and readability
- Generating comprehensive, valuable content that serves readers

Your primary focus is QUALITY: depth, accuracy, readability, and value. SEO optimization is secondary but important.

Always generate content in TipTap-compatible HTML format. Use only these HTML tags:
- <h1>, <h2>, <h3> for headings
- <p> for paragraphs
- <ul>, <ol>, <li> for lists
- <strong>, <em> for emphasis
- <a href="..."> for links
- <blockquote> for quotes

DO NOT use:
- Inline styles (style="...")
- Script tags
- Complex nested structures
- Non-semantic HTML

Always respond with valid JSON only, no markdown formatting or code blocks.`;

  const userPrompt = `اكتب مقالاً احترافياً باللغة العربية حول الموضوع التالي:

الكلمات المفتاحية: "${keywords}"
${clientName ? `العميل: ${clientName}` : ''}
${categoryName ? `التصنيف: ${categoryName}` : ''}
الطول المطلوب: ${length === 'short' ? 'قصير' : length === 'medium' ? 'متوسط' : 'طويل'} (${targetWordCount} كلمة تقريباً)

المتطلبات:
1. العنوان: عنوان جذاب ومحسّن لـ SEO (40-60 حرفاً)
2. المحتوى: مقال كامل بصيغة TipTap HTML مع:
   - هيكل واضح مع عناوين فرعية (h1, h2, h3)
   - فقرات منظمة ومقروءة
   - قوائم حيثما يكون مناسباً
   - تأكيد على النقاط المهمة (<strong>, <em>)
   - روابط داخلية/خارجية ذات صلة
3. الملخص: ملخص قصير (130-170 حرفاً)
4. SEO Title: عنوان محسّن (40-60 حرفاً)
5. SEO Description: وصف محسّن (130-170 حرفاً)
6. الكلمات المفتاحية: 5-8 كلمات مفتاحية ذات صلة
7. الأسئلة الشائعة: 3-5 أسئلة شائعة مع إجابات مفصلة

أرجع JSON فقط بالشكل التالي (بدون markdown أو code blocks):
{
  "title": "عنوان المقال",
  "content": "<h1>العنوان الرئيسي</h1><p>المحتوى بصيغة TipTap HTML...</p>",
  "excerpt": "ملخص المقال (130-170 حرفاً)",
  "seoTitle": "عنوان SEO (40-60 حرفاً)",
  "seoDescription": "وصف SEO (130-170 حرفاً)",
  "keywords": ["كلمة 1", "كلمة 2", "كلمة 3"],
  "faqs": [
    {"question": "سؤال 1؟", "answer": "إجابة مفصلة..."},
    {"question": "سؤال 2؟", "answer": "إجابة مفصلة..."}
  ],
  "wordCount": ${targetWordCount},
  "readingTimeMinutes": ${Math.ceil(targetWordCount / 200)},
  "contentDepth": "${length}"
}

تأكد من:
- المحتوى جاهز للنشر مباشرة
- HTML صحيح وصالح لـ TipTap
- اللغة العربية صحيحة ومحترفة
- الكلمات المفتاحية مدمجة بشكل طبيعي
- المحتوى ذو قيمة حقيقية للقارئ`;

  try {
    const response = await openaiClient.chat.completions.create({
      model,
      temperature,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "";
    
    if (!raw) {
      throw new Error("OpenAI response is empty");
    }

    let parsed: any;
    try {
      // Remove markdown code blocks if present
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      throw new Error(`Failed to parse OpenAI JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Validate and extract data
    const title: string = parsed.title || keywords;
    const content: string = parsed.content || "";
    const excerpt: string = parsed.excerpt || "";
    const seoTitle: string = parsed.seoTitle || title;
    const seoDescription: string = parsed.seoDescription || excerpt.substring(0, 160);
    const keywordsArray: string[] = Array.isArray(parsed.keywords) ? parsed.keywords : [];
    const faqs: Array<{ question: string; answer: string }> = Array.isArray(parsed.faqs)
      ? parsed.faqs.map((faq: any) => ({
          question: faq.question || "",
          answer: faq.answer || "",
        }))
      : [];

    // Calculate word count from content (strip HTML tags)
    const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const calculatedWordCount = plainText.split(/\s+/).filter(Boolean).length;
    
    const wordCount =
      typeof parsed.wordCount === "number" && parsed.wordCount > 0
        ? parsed.wordCount
        : calculatedWordCount;

    const readingTimeMinutes = Math.ceil(wordCount / 200);
    
    const contentDepth: 'short' | 'medium' | 'long' = 
      wordCount < 800 ? 'short' : wordCount < 1500 ? 'medium' : 'long';

    if (!content || !excerpt) {
      throw new Error("OpenAI article response missing content or excerpt");
    }

    return {
      title,
      content,
      excerpt,
      seoTitle,
      seoDescription,
      keywords: keywordsArray,
      faqs,
      wordCount,
      readingTimeMinutes,
      contentDepth,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate article with OpenAI");
  }
}
