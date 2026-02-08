/**
 * Chatbot Live Test - QA Plan implementation
 * Run: pnpm exec tsx scripts/test-chatbot-live.ts
 * Optional: CHATBOT_TEST_COOKIE="next-auth.session-token=..." for authenticated tests
 * Requires: server at http://localhost:3000
 */
const BASE_URL = "http://localhost:3000";
const COOKIE = process.env.CHATBOT_TEST_COOKIE ?? "";

function headers(withAuth: boolean): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (withAuth && COOKIE) h["Cookie"] = COOKIE;
  return h;
}

let passed = 0;
let failed = 0;

async function test(section: string, name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
    return true;
  } catch (e) {
    failed++;
    console.error(`  ✗ ${name}:`, e instanceof Error ? e.message : e);
    return false;
  }
}

async function main() {
  console.log("=== Chatbot Live Test (QA Plan) ===\n");
  console.log("Base URL:", BASE_URL);
  console.log("Auth:", COOKIE ? "cookie provided" : "no cookie (auth tests only)\n");

  // --- 1. Auth and Access ---
  console.log("1. Auth and Access");
  await test("1", "1.2 POST /api/chatbot/chat without session → 401", async () => {
    const r = await fetch(`${BASE_URL}/api/chatbot/chat`, {
      method: "POST",
      headers: headers(false),
      body: JSON.stringify({
        messages: [{ role: "user", content: "مرحبا" }],
        categorySlug: "content-seo",
      }),
    });
    if (r.status !== 401) throw new Error(`expected 401, got ${r.status}`);
    const d = await r.json();
    if (!d.error?.includes("تسجيل")) throw new Error("expected login error message");
  });

  await test("1", "1.2 POST /api/articles/[slug]/chat without session → 401", async () => {
    const r = await fetch(`${BASE_URL}/api/articles/any-slug/chat`, {
      method: "POST",
      headers: headers(false),
      body: JSON.stringify({ messages: [{ role: "user", content: "مرحبا" }] }),
    });
    if (r.status !== 401) throw new Error(`expected 401, got ${r.status}`);
  });

  // --- 9. Topics API ---
  console.log("\n9. Topics API");
  let categorySlug = "";
  let articleSlug = "";

  await test("9", "9.1 GET /api/chatbot/topics → 200, topics array", async () => {
    const r = await fetch(`${BASE_URL}/api/chatbot/topics`);
    if (!r.ok) throw new Error(`status ${r.status}`);
    const d = await r.json();
    if (!d.success || !Array.isArray(d.topics)) throw new Error("invalid response");
    if (d.topics.length > 0) {
      categorySlug = d.topics[0].categorySlug;
    }
  });

  await test("9", "9.2 Topics have categoryName, categorySlug, suggestedQuestion", async () => {
    const r = await fetch(`${BASE_URL}/api/chatbot/topics`);
    const d = await r.json();
    if (d.topics?.length > 0) {
      const t = d.topics[0];
      if (!t.categoryName || !t.categorySlug || !t.suggestedQuestion)
        throw new Error("missing topic fields");
    }
  });

  // --- 8. Edge Cases ---
  console.log("\n8. Edge Cases");
  await test("8", "8.1 Empty message → 400", async () => {
    const r = await fetch(`${BASE_URL}/api/chatbot/chat`, {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify({
        messages: [{ role: "user", content: "   " }],
        categorySlug: "x",
      }),
    });
    if (r.status !== 400 && r.status !== 401) throw new Error(`expected 400 or 401, got ${r.status}`);
  });

  await test("8", "8.2 Message > 2000 chars → 400", async () => {
    const r = await fetch(`${BASE_URL}/api/chatbot/chat`, {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify({
        messages: [{ role: "user", content: "x".repeat(2001) }],
        categorySlug: "x",
      }),
    });
    if (r.status !== 400 && r.status !== 401) throw new Error(`expected 400 or 401, got ${r.status}`);
  });

  await test("8", "8.5 Malformed body → 400", async () => {
    const r = await fetch(`${BASE_URL}/api/chatbot/chat`, {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify({}),
    });
    if (r.status !== 400 && r.status !== 401) throw new Error(`expected 400 or 401, got ${r.status}`);
  });

  // --- Authenticated tests (need cookie) ---
  if (COOKIE) {
    if (!categorySlug) {
      const tr = await fetch(`${BASE_URL}/api/chatbot/topics`);
      const td = await tr.json();
      categorySlug = td.topics?.[0]?.categorySlug ?? "content-seo";
    }
    const ar = await fetch(`${BASE_URL}/api/articles?limit=3`);
    const ad = await ar.json();
    if (ad?.data?.length > 0) articleSlug = ad.data[0].slug;

    console.log("\n--- Authenticated Tests ---");
    console.log("Category:", categorySlug, "| Article:", articleSlug || "none");

    // 8.3 Invalid category → 404
    await test("8", "8.3 Invalid categorySlug → 404", async () => {
      const r = await fetch(`${BASE_URL}/api/chatbot/chat`, {
        method: "POST",
        headers: headers(true),
        body: JSON.stringify({
          messages: [{ role: "user", content: "مرحبا" }],
          categorySlug: "non-existent-category-xyz-123",
        }),
      });
      if (r.status !== 404) throw new Error(`expected 404, got ${r.status}`);
    });

    // 8.4 Invalid article → 404
    await test("8", "8.4 Invalid article slug → 404", async () => {
      const r = await fetch(`${BASE_URL}/api/articles/invalid-slug-xyz-123/chat`, {
        method: "POST",
        headers: headers(true),
        body: JSON.stringify({ messages: [{ role: "user", content: "مرحبا" }] }),
      });
      if (r.status !== 404) throw new Error(`expected 404, got ${r.status}`);
    });

    // 7.6 stream: false → JSON response
    if (categorySlug) {
      await test("7", "7.6 stream: false → { type: 'message', text }", async () => {
        const r = await fetch(`${BASE_URL}/api/chatbot/chat`, {
          method: "POST",
          headers: headers(true),
          body: JSON.stringify({
            messages: [{ role: "user", content: "مرحبا" }],
            categorySlug,
            stream: false,
          }),
        });
        if (!r.ok) throw new Error(`status ${r.status}`);
        const d = await r.json();
        if (d.type !== "message" && d.type !== "redirect" && d.type !== "outOfScope") throw new Error("expected type message, redirect, or outOfScope");
        if (d.type === "message" && typeof d.text !== "string") throw new Error("expected text in message");
      });
    }

    // 7.1–7.2 Stream format
    if (categorySlug) {
      await test("7", "7.1–7.2 Stream Content-Type + NDJSON parse", async () => {
        const r = await fetch(`${BASE_URL}/api/chatbot/chat`, {
          method: "POST",
          headers: headers(true),
          body: JSON.stringify({
            messages: [{ role: "user", content: "مرحبا" }],
            categorySlug,
            stream: true,
          }),
        });
        if (!r.ok) throw new Error(`status ${r.status}`);
        const ct = r.headers.get("content-type") ?? "";
        if (!ct.includes("ndjson") && !ct.includes("json")) throw new Error("expected ndjson content-type");
        const text = await r.text();
        const lines = text.trim().split("\n").filter(Boolean);
        if (lines.length === 0) throw new Error("no NDJSON lines");
        let seenDelta = false;
        let seenDone = false;
        for (const line of lines) {
          const p = JSON.parse(line);
          if (p.type === "delta") seenDelta = true;
          if (p.type === "done") seenDone = true;
        }
        if (!seenDone) throw new Error("expected done event");
      });
    }
  } else {
    console.log("\n(Set CHATBOT_TEST_COOKIE for authenticated tests)");
  }

  // --- Summary ---
  console.log("\n=== Summary ===");
  console.log(`Passed: ${passed} | Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
export {};
