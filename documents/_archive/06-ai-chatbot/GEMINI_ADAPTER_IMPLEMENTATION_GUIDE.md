# Gemini Adapter Implementation Guide

## Overview

Implement Google Gemini API as alternative to OpenAI for seed data generation. Gemini 2.5 Flash-Lite offers **35% cost savings** vs GPT-4o-mini.

## Why Gemini?

| Benefit | Details |
|---------|---------|
| **Cost Savings** | 35% cheaper ($0.10/$0.40 vs $0.15/$0.60 per 1M tokens) |
| **Speed** | Optimized for low latency |
| **Large Context** | 1M+ token window |
| **Multimodal** | Supports text, images, video |

## Prerequisites

1. Google Cloud Account: [Google Cloud Console](https://console.cloud.google.com/)
2. API Key: [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Install: `npm install @google/generative-ai`

## Implementation Steps

### Step 1: Create Gemini Adapter Module

```
admin/lib/
├── openai-seed.ts (existing)
├── gemini-seed.ts (new)
└── ai-provider.ts (new - abstraction layer)
```

### Step 2: Environment Variables

Add to `.env.local`:
```bash
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.5-flash-lite
AI_PROVIDER=openai  # or 'gemini'
```

### Step 3: Gemini Adapter Implementation

```typescript
// admin/lib/gemini-seed.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const temperature = process.env.GEMINI_TEMPERATURE ? Number(process.env.GEMINI_TEMPERATURE) : 0.2;

let client: GoogleGenerativeAI | null = null;

function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return client;
}

export async function generateArticleWithGemini(params: {
  title: string;
  category: string;
  length: "short" | "medium" | "long";
  language: "ar";
  industryBrief?: string;
}): Promise<OpenAIArticleData> {
  const { title, category, length, language, industryBrief } = params;
  const genAI = getClient();

  const targetWordCount = length === "short" ? 400 : length === "medium" ? 900 : 1500;

  const industryContext = industryBrief
    ? `\n\nالسياق الصناعي:\n"${industryBrief}"`
    : "";

  const prompt = `
أنت كاتب محتوى SEO محترف بخبرة 10+ سنوات.

${industryContext}

متطلبات:
- العنوان: "${title}"
- التصنيف: "${category}"
- الطول: ${length} (${targetWordCount} كلمة تقريباً)

يرجى إرجاع JSON فقط (بدون نص آخر):

{
  "content": "محتوى المقال الكامل بصيغة Markdown...",
  "excerpt": "ملخص قصير...",
  "wordCount": 1234,
  "seoTitle": "عنوان SEO...",
  "seoDescription": "وصف SEO...",
  "keywords": ["كلمة 1", "كلمة 2"],
  "faqs": [
    { "question": "سؤال؟", "answer": "إجابة..." }
  ]
}`;

  const geminiModel = genAI.getGenerativeModel({
    model,
    generationConfig: {
      temperature,
      responseMimeType: "application/json",
    },
  });

  const result = await geminiModel.generateContent(prompt);
  const raw = result.response.text();

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse Gemini JSON response.");
  }

  return {
    content: parsed.content || "",
    excerpt: parsed.excerpt || "",
    wordCount: parsed.wordCount || 0,
    seoTitle: parsed.seoTitle || title,
    seoDescription: parsed.seoDescription || "",
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
  };
}
```

### Step 4: Create Provider Abstraction Layer

```typescript
// admin/lib/ai-provider.ts

import type { OpenAIArticleData } from "./openai-seed";
import { generateArticleWithOpenAI } from "./openai-seed";
import { generateArticleWithGemini } from "./gemini-seed";

export type AIProvider = "openai" | "gemini";

export function getAIProvider(): AIProvider {
  return (process.env.AI_PROVIDER || "openai") as AIProvider;
}

export async function generateArticleWithAI(
  params: Parameters<typeof generateArticleWithOpenAI>[0]
): Promise<OpenAIArticleData> {
  const provider = getAIProvider();

  if (provider === "gemini") {
    return generateArticleWithGemini(params);
  }

  return generateArticleWithOpenAI(params);
}
```

### Step 5: Update Seed Functions

In `admin/app/(dashboard)/settings/seed/actions/seed-core.ts`:

```typescript
import { generateArticleWithAI } from "@/lib/ai-provider";

aiData = await generateArticleWithAI({
  title,
  category: categorySlug,
  length,
  language: "ar",
  industryBrief,
});
```

## Testing Strategy

### Phase 1: Unit Testing
- Test JSON parsing with simple prompts
- Verify Arabic support and RTL formatting
- Validate Arabic keyword generation

### Phase 2: Comparative Testing
- Generate 10 articles with GPT-4o-mini
- Generate 10 articles with Gemini Flash-Lite
- Compare: JSON success rate, Arabic quality, token usage, response time

### Phase 3: Production Rollout
1. Start: 10% of requests → Gemini
2. Monitor: 1 week
3. Increase: to 50% if successful
4. Full: migration if stable

## Cost Comparison Matrix

| Scenario | GPT-4o-mini | Gemini Flash-Lite | Savings |
|----------|-------------|-------------------|---------|
| 3 articles | $0.00486 | $0.00324 | 33% |
| 10 articles | $0.0162 | $0.0108 | 33% |
| 50 articles | $0.081 | $0.054 | 33% |
| 100 articles | $0.162 | $0.108 | 33% |
| Monthly (5,000 articles) | $810 | $540 | **$270/month** |

## Migration Checklist

### Pre-Migration
- [ ] Install `@google/generative-ai` package
- [ ] Get Gemini API key
- [ ] Add `GEMINI_API_KEY` to `.env.local`
- [ ] Create `gemini-seed.ts` file

### Testing Phase
- [ ] Run unit tests (JSON parsing)
- [ ] Test Arabic content generation (10 articles)
- [ ] Compare quality with OpenAI version
- [ ] Measure token usage and costs
- [ ] Run full seed with Gemini (3 articles)

### Production Rollout
- [ ] Add provider abstraction layer (`ai-provider.ts`)
- [ ] Update seed functions to use abstraction
- [ ] Add fallback mechanism (Gemini → OpenAI)
- [ ] Set `AI_PROVIDER=gemini` in `.env.local`
- [ ] Monitor error rates and costs

### Post-Migration
- [ ] Monitor cost savings
- [ ] Track JSON parsing success rate
- [ ] Monitor API response times
- [ ] Collect user feedback on content quality
- [ ] Keep OpenAI as fallback for 1 month

## Troubleshooting

### JSON Parsing Fails
- Use `responseMimeType: "application/json"` in generation config
- Add explicit JSON requirement in prompt
- Remove markdown code blocks if present:
```typescript
const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "");
```

### Arabic Content Quality Issues
- Explicitly mention Arabic in prompt
- Increase temperature slightly (0.3 instead of 0.2)
- Add post-processing for RTL text

### Response Time Too Slow
- Use `gemini-2.5-flash-lite` (not Pro)
- Reduce prompt length
- Cache common prompts
- Implement request timeout with fallback

### Rate Limiting (429 errors)
- Implement exponential backoff
- Add request queuing
- Use fallback to OpenAI when rate limited

## References

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [@google/generative-ai npm](https://www.npmjs.com/package/@google/generative-ai)
