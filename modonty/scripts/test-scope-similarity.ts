/**
 * Test scope similarity: English vs Arabic query for Core Web Vitals
 * Confirms whether embedding handles English better than Arabic+English mix
 * Run: cd modonty && pnpm exec tsx scripts/test-scope-similarity.ts
 * Requires: COHERE_API_KEY in .env
 */
import "dotenv/config";
import { embed } from "../lib/cohere";

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

const THRESHOLD = 0.45;
const scopeText = "Content SEO Core Web Vitals هي مجموعة من المؤشرات الأساسية التي يستخدمها Google لتقييم جودة تجربة المستخدم. LCP Largest Contentful Paint On-Page SEO تحسين محركات البحث";

async function main() {
  const queries = [
    { name: "English", text: "What are Core Web Vitals?" },
    { name: "Arabic + English", text: "ما هي Core Web Vitals؟" },
  ];

  const [queryEmbs, docEmb] = await Promise.all([
    embed(queries.map((q) => q.text), "search_query"),
    embed([scopeText], "search_document"),
  ]);

  if (!docEmb?.[0]) throw new Error("embed failed");
  const docVec = docEmb[0];

  console.log("\n=== Scope Similarity Test (Content SEO) ===\n");
  console.log("Scope text (excerpt):", scopeText.slice(0, 80) + "...\n");
  console.log("Threshold:", THRESHOLD, "(below = out-of-scope)\n");

  for (let i = 0; i < queries.length; i++) {
    const vec = queryEmbs?.[i];
    if (!vec) continue;
    const sim = cosineSimilarity(vec, docVec);
    const outOfScope = sim < THRESHOLD;
    console.log(`${queries[i].name}: "${queries[i].text}"`);
    console.log(`  similarity: ${sim.toFixed(4)} | out-of-scope: ${outOfScope}\n`);
  }

  const enSim = cosineSimilarity(queryEmbs![0], docVec);
  const arSim = cosineSimilarity(queryEmbs![1], docVec);
  if (enSim > arSim) {
    console.log("→ English query scores HIGHER than Arabic+English. Language hypothesis confirmed.");
  }
}

main().catch(console.error);
