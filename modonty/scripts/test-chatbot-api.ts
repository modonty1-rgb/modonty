/**
 * Chatbot API test script - run with: pnpm exec tsx scripts/test-chatbot-api.ts
 * Requires server at http://localhost:3000
 */
const BASE_URL = "http://localhost:3000";

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    console.error(`✗ ${name}:`, e instanceof Error ? e.message : e);
  }
}

async function main() {
  console.log("Chatbot API Tests\n");

  await test("1. GET /api/chatbot/topics returns 200", async () => {
    const r = await fetch(`${BASE_URL}/api/chatbot/topics`);
    if (!r.ok) throw new Error(`status ${r.status}`);
    const d = await r.json();
    if (!d.success || !Array.isArray(d.topics)) throw new Error("invalid response");
    console.log(`   Topics: ${d.topics.length}`);
  });

  await test("2. POST /api/chatbot/chat without auth returns 401", async () => {
    const r = await fetch(`${BASE_URL}/api/chatbot/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "مرحبا" }],
        categorySlug: "content-seo",
      }),
    });
    if (r.status !== 401) throw new Error(`expected 401, got ${r.status}`);
    const d = await r.json();
    if (!d.error?.includes("تسجيل")) throw new Error("expected login error message");
  });

  await test("3. POST /api/articles/[slug]/chat without auth returns 401", async () => {
    const r = await fetch(`${BASE_URL}/api/articles/test-slug/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "مرحبا" }] }),
    });
    if (r.status !== 401) throw new Error(`expected 401, got ${r.status}`);
  });

  console.log("\nDone.");
}

main();
export {};
