/**
 * Chatbot Flow Cases Test
 * Simulates all 4 cases and validates expected outcomes.
 * Run: CHATBOT_TEST_COOKIE="next-auth.session-token=..." pnpm exec tsx scripts/test-chatbot-cases.ts
 * Requires: server at http://localhost:3000
 */
const BASE_URL = "http://localhost:3000";
const COOKIE = process.env.CHATBOT_TEST_COOKIE ?? "";

const CASES = [
  {
    id: "out-of-scope",
    query: "ما هو الطقس اليوم في الرياض؟",
    expectedType: "outOfScope",
    description: "Out-of-scope: unrelated question → outOfScope message",
  },
  {
    id: "in-scope-db-match",
    query: "ما هي أفضل ممارسات تحسين المحتوى لمحركات البحث؟",
    expectedType: "redirect",
    description: "In-scope + DB match → article cards (redirect)",
  },
  {
    id: "in-scope-no-db-1",
    query: "ما هي تحديثات Google March 2026؟",
    expectedType: "message",
    description: "In-scope + no DB → Serper stream (message, not redirect)",
  },
  {
    id: "in-scope-no-db-2",
    query: "كيف أستخدم Ahrefs لتحليل المنافسين؟",
    expectedType: "message",
    description: "In-scope + no DB → Serper stream (message, not redirect)",
  },
] as const;

async function postChat(query: string, stream = false) {
  const res = await fetch(`${BASE_URL}/api/chatbot/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(COOKIE && { Cookie: COOKIE }),
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: query }],
      categorySlug: "content-seo",
      stream,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`HTTP ${res.status}: ${err.error ?? res.statusText}`);
  }
  return res;
}

async function runCase(
  c: (typeof CASES)[number]
): Promise<{ passed: boolean; actualType?: string; error?: string }> {
  try {
    const res = await postChat(c.query, false);
    const data = (await res.json()) as { type?: string; message?: string; articles?: unknown[] };

    if (data.type === "outOfScope") {
      return {
        passed: c.expectedType === "outOfScope",
        actualType: "outOfScope",
        error: c.expectedType !== "outOfScope" ? `Expected ${c.expectedType}` : undefined,
      };
    }
    if (data.type === "redirect") {
      return {
        passed: c.expectedType === "redirect",
        actualType: "redirect",
        error: c.expectedType !== "redirect" ? `Expected ${c.expectedType}, got redirect (cards)` : undefined,
      };
    }
    if (data.type === "message") {
      return {
        passed: c.expectedType === "message",
        actualType: "message",
        error: c.expectedType !== "message" ? `Expected ${c.expectedType}` : undefined,
      };
    }
    return { passed: false, actualType: data.type, error: `Unknown type: ${data.type}` };
  } catch (e) {
    return { passed: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function main() {
  console.log("=== Chatbot Flow Cases Test ===\n");
  console.log("Base:", BASE_URL);
  console.log("Auth:", COOKIE ? "cookie provided" : "NO COOKIE - set CHATBOT_TEST_COOKIE\n");

  if (!COOKIE) {
    console.log("Skipping (requires CHATBOT_TEST_COOKIE for authenticated requests)");
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  for (const c of CASES) {
    const result = await runCase(c);
    if (result.passed) {
      passed++;
      console.log(`  ✓ ${c.id}: ${c.description}`);
      console.log(`    → ${result.actualType} (expected)\n`);
    } else {
      failed++;
      console.log(`  ✗ ${c.id}: ${c.description}`);
      console.log(`    → Got: ${result.actualType ?? "error"} | Expected: ${c.expectedType}`);
      if (result.error) console.log(`    Error: ${result.error}`);
      console.log("");
    }
  }

  console.log("=== Summary ===");
  console.log(`Passed: ${passed}/${CASES.length} | Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
export {};
