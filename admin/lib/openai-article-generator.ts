import OpenAI from "openai";

import { resolveAdminPrompt } from "./ai/resolve-admin-prompt";

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

  // النصّان من `ai_prompts` (`admin.article.system` · `admin.article.user`) — يُحرَّران من
  // الأدمن لا من هنا. والاحتياط عند غياب الصفّ هو نفس النصّ في `prompt-defaults.ts`.
  const systemMessage = await resolveAdminPrompt("admin.article.system");
  const userPrompt = await resolveAdminPrompt("admin.article.user", {
    keywords,
    clientLine: clientName ? `العميل: ${clientName}` : "",
    categoryLine: categoryName ? `التصنيف: ${categoryName}` : "",
    lengthLabel: length === "short" ? "قصير" : length === "medium" ? "متوسط" : "طويل",
    targetWordCount,
    readingTimeMinutes: Math.ceil(targetWordCount / 200),
    length,
  });


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
