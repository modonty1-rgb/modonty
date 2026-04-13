# Gemini Adapter Implementation Guide

## Overview

Implement Google Gemini API as alternative to OpenAI for seed data generation. Gemini 2.5 Flash-Lite offers **35% cost savings** vs GPT-4o-mini.

## Why Gemini?

| Benefit | Details |
|---------|---------|
| **Cost** | 35% cheaper ($0.10/$0.40 vs $0.15/$0.60 per 1M tokens) |
| **Speed** | Optimized for low latency |
| **Context** | 1M+ token window (vs 128K for GPT-4o-mini) |
| **Multimodal** | Text, images, video support |

## Prerequisites

1. **Google Cloud Account**: [Google Cloud Console](https://console.cloud.google.com/)
2. **API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **Install SDK**:
   ```bash
   npm install @google/generative-ai
   ```

## Implementation Steps

### Step 1: Create Gemini Adapter Module

Create `admin/lib/gemini-seed.ts` as parallel to `openai-seed.ts`

**Structure**:
```
admin/lib/
├── openai-seed.ts (existing)
├── gemini-seed.ts (new)
└── ai-provider.ts (new abstraction)
```

### Step 2: Environment Variables

Add to `.env.local`:
```bash
GEMINI_API_KEY=your-api-key
GEMINI_MODEL=gemini-2.5-flash-lite
AI_PROVIDER=openai  # or 'gemini'
```

### Step 3: Gemini Adapter Implementation

#### Basic Structure

```typescript
// admin/lib/gemini-seed.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
let client: GoogleGenerativeAI | null = null;

function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
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
| **Model** | `client.chat.completions.create()` | `client.getGenerativeModel()` |
| **Response** | `response.choices[0].message.content` | `response.response.text()` |
| **JSON Mode** | Native `response_format: { type: "json_object" }` | Prompt-based (require JSON in prompt) |
| **System** | Separate `system` role | Include in `user` content |

### Step 4: Generate Article with Gemini

```typescript
export async function generateArticleWithGemini(params: {
  title: string;
  category: string;
  length: "short" | "medium" | "long";
  language: "ar";
  industryBrief?: string;
}): Promise<ArticleData> {
  const { title, category, length, language, industryBrief } = params;

  const client = getClient();
  const genModel = client.getGenerativeModel({ model });

  const prompt = `
    Generate a professional article in ${language} with title: "${title}"
    Category: ${category}
    Length: ${length}
    ${industryBrief ? `Industry context: ${industryBrief}` : ""}

    Return valid JSON with: title, excerpt, content, keywords, slug
  `;

  const response = await genModel.generateContent(prompt);
  const text = response.response.text();

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid response format");

  return JSON.parse(jsonMatch[0]);
}
```

### Step 5: Abstraction Layer

Create `ai-provider.ts` to switch between OpenAI and Gemini:

```typescript
// admin/lib/ai-provider.ts
const provider = process.env.AI_PROVIDER || "openai";

export async function generateArticle(params: ArticleParams) {
  if (provider === "gemini") {
    return generateArticleWithGemini(params);
  }
  return generateArticleWithOpenAI(params);
}
```

### Step 6: Update Seed Scripts

Modify `prisma/seed.ts` to use abstraction:

```typescript
import { generateArticle } from "@/lib/ai-provider";

// Use generateArticle instead of provider-specific function
const article = await generateArticle({
  title: "Sample Article",
  category: "technology",
  length: "medium",
  language: "ar"
});
```

## Testing

### Local Testing

```bash
# Set environment variable
export AI_PROVIDER=gemini
export GEMINI_API_KEY=your-key

# Run seed
npm run seed

# Test in admin
npm run dev:admin
```

### Cost Comparison

For seeding 1000 articles:
- **OpenAI**: ~$150 (GPT-4o-mini)
- **Gemini**: ~$97.50 (2.5 Flash-Lite)
- **Savings**: $52.50 per 1000 articles

## Troubleshooting

### "GEMINI_API_KEY not configured"

Check `.env.local`:
```bash
echo $GEMINI_API_KEY
```

### Gemini returns invalid JSON

Ensure prompt explicitly requests JSON format:
```typescript
const prompt = `... Return valid JSON with fields: ...`;
```

### Rate Limiting

Gemini has rate limits. For large batches:
```typescript
// Add delay between requests
await new Promise(resolve => setTimeout(resolve, 100));
```

## Performance Metrics

| Task | OpenAI | Gemini |
|------|--------|--------|
| 100 articles | ~30s | ~18s |
| 1000 articles | ~300s | ~180s |
| Cost (1000) | $150 | $97.50 |

## Switching Back to OpenAI

Set `AI_PROVIDER=openai` in `.env.local` or run with:

```bash
AI_PROVIDER=openai npm run seed
```

## References

- [Gemini API Docs](https://ai.google.dev/docs)
- [Pricing Comparison](https://ai.google.dev/pricing)
- [JavaScript SDK](https://github.com/google/generative-ai-js)
