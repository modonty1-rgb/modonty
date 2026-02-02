# Gemini Adapter Implementation Guide

## Overview

This guide explains how to implement Google Gemini API as an alternative to OpenAI for seed data generation. Gemini 2.5 Flash-Lite offers **35% cost savings** compared to GPT-4o-mini.

## Why Consider Gemini?

| Benefit | Details |
|---------|---------|
| **Cost Savings** | 35% cheaper than GPT-4o-mini ($0.10/$0.40 vs $0.15/$0.60 per 1M tokens) |
| **Speed** | Optimized for low latency, faster responses |
| **Large Context** | 1M+ token context window (vs 128K for GPT-4o-mini) |
| **Multimodal** | Supports text, images, video (future-proofing) |

## Prerequisites

1. **Google Cloud Account**: Sign up at [Google Cloud Console](https://console.cloud.google.com/)
2. **API Key**: Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **Install Google AI SDK**:
   ```bash
   npm install @google/generative-ai
   ```

## Implementation Steps

### Step 1: Create Gemini Adapter Module

Create `admin/lib/gemini-seed.ts` as a parallel implementation to `openai-seed.ts`.

**File Structure**:
```
admin/lib/
├── openai-seed.ts (existing)
├── gemini-seed.ts (new)
└── ai-provider.ts (new - abstraction layer)
```

### Step 2: Environment Variables

Add to `.env.local`:
```bash
# OpenAI (existing)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Gemini (new)
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.5-flash-lite
AI_PROVIDER=openai  # or 'gemini'
```

### Step 3: Gemini Adapter Implementation

#### Basic Structure

```typescript
// admin/lib/gemini-seed.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const temperature = process.env.GEMINI_TEMPERATURE
  ? Number(process.env.GEMINI_TEMPERATURE)
  : 0.2;

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
```

#### Key Differences from OpenAI

| Aspect | OpenAI | Gemini |
|--------|--------|--------|
| **Client** | `OpenAI()` | `GoogleGenerativeAI()` |
| **Model Access** | `client.chat.completions.create()` | `client.getGenerativeModel()` |
| **Response Format** | `response.choices[0].message.content` | `response.response.text()` |
| **JSON Mode** | Native `response_format: { type: "json_object" }` | Prompt-based (require JSON in prompt) |
| **System Messages** | Separate `system` role | Include in `user` content |

### Step 4: Generate Article with Gemini

```typescript
export async function generateArticleWithGemini(params: {
  title: string;
  category: string;
  length: "short" | "medium" | "long";
  language: "ar";
  industryBrief?: string;
}): Promise<OpenAIArticleData> {
  const { title, category, length, language, industryBrief } = params;
  const genAI = getClient();

  const targetWordCount =
    length === "short" ? 400 : length === "medium" ? 900 : 1500;

  const industryContext = industryBrief
    ? `\n\n⚠️ مهم جداً - السياق الصناعي/القطاعي الأساسي:\n"${industryBrief}"\n\nهذا هو السياق الصناعي الرئيسي الذي يجب أن يكون المقال موجهاً له بشكل كامل ومتخصص.`
    : "";

  // Gemini doesn't have native JSON mode, so we must be explicit in prompt
  const prompt = `
أنت كاتب محتوى SEO محترف ومتخصص بخبرة 10+ سنوات في كتابة المحتوى العربي المتخصص.

${industryContext}

📋 متطلبات المقال:
- العنوان: "${title}"
- التصنيف: "${category}"
- الطول المطلوب: ${length} (${targetWordCount} كلمة تقريباً)

⚠️ مهم جداً: يجب أن تُرجع JSON فقط، بدون أي نص آخر، بالشكل التالي:

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

  const geminiModel = genAI.getGenerativeModel({ 
    model,
    generationConfig: {
      temperature,
      responseMimeType: "application/json", // Gemini 2.5+ supports JSON mode
    },
  });

  const result = await geminiModel.generateContent(prompt);
  const response = result.response;
  const raw = response.text();

  // Parse JSON response
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse Gemini JSON response for article generation.");
  }

  // Validate and return (same structure as OpenAI)
  const content: string = parsed.content || "";
  const excerpt: string = parsed.excerpt || "";
  // ... rest of validation (same as OpenAI version)

  return {
    content,
    excerpt,
    wordCount: parsed.wordCount || content.split(/\s+/).filter(Boolean).length,
    seoTitle: parsed.seoTitle || title,
    seoDescription: parsed.seoDescription || excerpt,
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
  };
}
```

### Step 5: Create Provider Abstraction Layer

Create `admin/lib/ai-provider.ts` to abstract OpenAI vs Gemini:

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

### Step 6: Update Seed Functions

Update `admin/app/(dashboard)/settings/seed/actions/seed-core.ts`:

```typescript
// Replace OpenAI imports
import { generateArticleWithAI } from "@/lib/ai-provider";

// Use abstracted function
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

1. **Test JSON Parsing**:
   ```typescript
   // Test with simple prompts
   const result = await generateArticleWithGemini({
     title: "Test",
     category: "test",
     length: "short",
     language: "ar",
   });
   expect(result.content).toBeDefined();
   expect(JSON.parse(JSON.stringify(result))).toBeValidJSON();
   ```

2. **Test Arabic Support**:
   - Verify Arabic text generation quality
   - Check RTL (right-to-left) formatting
   - Validate Arabic keyword generation

### Phase 2: Comparative Testing

1. **Side-by-Side Comparison**:
   - Generate 10 articles with GPT-4o-mini
   - Generate 10 articles with Gemini Flash-Lite
   - Compare:
     - JSON parsing success rate
     - Arabic content quality
     - Token usage
     - Response time

2. **Metrics to Track**:
   ```typescript
   {
     provider: "gemini",
     articlesGenerated: 10,
     jsonParsingSuccess: 9, // 90%
     averageTokens: 2500,
     averageCost: 0.00025,
     averageResponseTime: 2.3, // seconds
     arabicQuality: "good" | "excellent" | "needs-improvement"
   }
   ```

### Phase 3: Production Testing

1. **Gradual Rollout**:
   - Start with 10% of requests → Gemini
   - Monitor for 1 week
   - Increase to 50% if successful
   - Full migration if stable

2. **Fallback Mechanism**:
   ```typescript
   try {
     return await generateArticleWithGemini(params);
   } catch (error) {
     console.warn("Gemini failed, falling back to OpenAI:", error);
     return await generateArticleWithOpenAI(params);
   }
   ```

## Cost Comparison Matrix

| Scenario | GPT-4o-mini | Gemini Flash-Lite | Savings |
|----------|-------------|-------------------|---------|
| **3 articles** | $0.00486 | $0.00324 | 33% |
| **10 articles** | $0.0162 | $0.0108 | 33% |
| **50 articles** | $0.081 | $0.054 | 33% |
| **100 articles** | $0.162 | $0.108 | 33% |
| **Monthly (100 runs of 50 articles)** | $8.10 | $5.40 | **$2.70/month** |

## Migration Checklist

### Pre-Migration

- [ ] Install `@google/generative-ai` package
- [ ] Get Gemini API key from Google AI Studio
- [ ] Add `GEMINI_API_KEY` to `.env.local`
- [ ] Create `gemini-seed.ts` file
- [ ] Implement all generation functions:
  - [ ] `generateArticleWithGemini`
  - [ ] `generateCategoriesWithGemini`
  - [ ] `generateTagsWithGemini`
  - [ ] `generateIndustriesWithGemini`
  - [ ] `generateArticleTitlesWithGemini`
  - [ ] `generateFAQTemplatesWithGemini`

### Testing Phase

- [ ] Run unit tests for JSON parsing
- [ ] Test Arabic content generation (10 articles)
- [ ] Compare quality with OpenAI version
- [ ] Measure token usage and costs
- [ ] Test all seed functions individually
- [ ] Run full seed with Gemini (3 articles)
- [ ] Verify all data types (categories, tags, etc.)

### Production Rollout

- [ ] Add provider abstraction layer (`ai-provider.ts`)
- [ ] Update seed functions to use abstraction
- [ ] Add fallback mechanism (Gemini → OpenAI)
- [ ] Set `AI_PROVIDER=gemini` in `.env.local`
- [ ] Monitor error rates and costs
- [ ] Document any issues encountered

### Post-Migration

- [ ] Monitor cost savings (compare bills)
- [ ] Track JSON parsing success rate
- [ ] Monitor API response times
- [ ] Collect user feedback on content quality
- [ ] Keep OpenAI as fallback for 1 month

## Troubleshooting

### Issue: JSON Parsing Fails

**Symptom**: `Failed to parse Gemini JSON response`

**Solutions**:
1. Use `responseMimeType: "application/json"` in generation config
2. Add explicit JSON requirement in prompt (already done)
3. Add retry logic with JSON cleanup:
   ```typescript
   // Remove markdown code blocks if present
   const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "");
   ```

### Issue: Arabic Content Quality Issues

**Symptom**: Poor Arabic text generation or formatting

**Solutions**:
1. Explicitly mention Arabic in system message
2. Provide Arabic examples in prompt
3. Increase temperature slightly (0.3 instead of 0.2)
4. Add post-processing for RTL text

### Issue: Response Time Too Slow

**Symptom**: Gemini takes longer than OpenAI

**Solutions**:
1. Use `gemini-2.5-flash-lite` (not Pro)
2. Reduce prompt length if possible
3. Cache common prompts
4. Implement request timeout with fallback

### Issue: Rate Limiting

**Symptom**: 429 errors from Gemini API

**Solutions**:
1. Implement exponential backoff
2. Add request queuing
3. Monitor rate limits in Google Cloud Console
4. Use fallback to OpenAI when rate limited

## Code Examples

### Complete Gemini Adapter Example

See implementation template in:
- `admin/lib/gemini-seed.ts` (create from template above)

### Usage Example

```typescript
// In seed-core.ts

import { generateArticleWithAI } from "@/lib/ai-provider";

// Automatically uses provider from AI_PROVIDER env var
const articleData = await generateArticleWithAI({
  title: "مقال عن SEO",
  category: "technical-seo",
  length: "medium",
  language: "ar",
  industryBrief: "كرة السلة",
});
```

## Next Steps

1. **Implement Gemini Adapter**: Follow Step 3-4 above
2. **Run Test Suite**: Generate 10-20 test articles
3. **Compare Quality**: Side-by-side with OpenAI
4. **Calculate Savings**: Measure actual token usage
5. **Make Decision**: Switch if quality is acceptable

## Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [@google/generative-ai npm package](https://www.npmjs.com/package/@google/generative-ai)

## Support

If you encounter issues:
1. Check Gemini API status: [Google Cloud Status](https://status.cloud.google.com/)
2. Review error logs in seed console output
3. Test with minimal prompts first
4. Use OpenAI fallback as backup

---

**Remember**: Always test thoroughly before full migration. Quality > Cost savings.
