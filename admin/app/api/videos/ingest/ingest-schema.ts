import { z } from "zod";

import { ASSET_KEYS } from "@/lib/videos";

const https = z.string().trim().url().startsWith("https://").max(1000);
const text = (max: number) => z.string().trim().max(max);

const platformCopy = z
  .object({
    // `tags` added 16 Oct 2026 (factory M8 → snippet.tags) — Zod strips unknown keys, so it has to be named here or it is lost.
    youtube: z
      .object({ title: text(200), description: text(5000), chapters: text(3000).optional(), tags: z.array(text(100)).max(30).optional() })
      .optional(),
    tiktok: z.object({ caption: text(2200), hashtags: z.array(text(100)).max(30).default([]) }).optional(),
    instagram: z.object({ caption: text(2200) }).optional(),
  })
  .strict();

/** جسم `POST /api/videos/ingest` بالحرف كما في العقد (documents/video-factory/03-contract.md §١). */
export const ingestSchema = z.object({
  articleUrl: https,
  revision: z.number().int().min(1),
  engineVersion: text(60).optional(),
  voiceId: text(120).optional(),
  scriptUrl: https.optional(),
  assets: z.object({
    long: z.object({ url: https, seconds: z.number().positive(), thumbnail: https.optional(), srt: https.optional() }),
    shorts: z
      .array(z.object({ key: z.enum(["short-1", "short-2", "short-3"]), series: text(80).optional(), url: https, seconds: z.number().positive() }))
      .max(3)
      .refine((s) => new Set(s.map((x) => x.key)).size === s.length, "duplicate short key"),
  }),
  copy: z.record(z.enum(ASSET_KEYS), platformCopy).default({}),
  qa: z.object({ passed: z.boolean(), failures: z.array(text(500)).max(50).default([]) }).optional(),
  usage: z
    .object({
      claude: z.object({ inputTokens: z.number(), outputTokens: z.number(), seconds: z.number() }).partial().optional(),
      gemini: z.object({ ttsRequests: z.number(), retries429: z.number() }).partial().optional(),
      stepSeconds: z.record(z.string(), z.number()).optional(),
    })
    .optional(),
});

export type IngestInput = z.infer<typeof ingestSchema>;
