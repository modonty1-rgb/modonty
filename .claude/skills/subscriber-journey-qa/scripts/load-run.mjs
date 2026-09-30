// Concurrency pass — many subscribers pressing the same thing in the same instant, on dev.
// Not a throughput benchmark (next dev is not production, and modonty_dev shares its Atlas
// cluster with production — Khalid decides before anything heavier). It answers: do counters
// stay exact under simultaneous clicks, does one user in two tabs double-count, can many people
// register in the same second.
//   node load-run.mjs [--base http://localhost:3100] [--users 20] [--signups 15] [--signup-from 60] [--only like,race,follow,signup]
// Afterwards: truth.mjs / invariants.mjs. Test users are qa-sub-NN@test.local (cleanup.mjs).
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { db, TEST_EMAIL, TEST_PASSWORD } from "./_db.mjs";

const root = process.cwd();
const pwDir = fs.readdirSync(path.join(root, "node_modules", ".pnpm")).filter((d) => d.startsWith("playwright@")).sort().pop();
const { chromium } = createRequire(path.join(root, "node_modules", ".pnpm", pwDir, "node_modules", "playwright", "package.json"))("playwright");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const BASE = arg("base", "http://localhost:3000");
const USERS = Number(arg("users", "20"));
const SIGNUPS = Number(arg("signups", "15"));
const ONLY = new Set(arg("only", "like,race,follow,signup").split(","));
const ARTICLE_SLUG = "التجارة-الإلكترونية-في-السعودية-كيف-يختار-العميل";
const CLIENT_SLUG = "شركة-جبر-سيو";
const ARTICLE = `${BASE}/articles/${encodeURIComponent(ARTICLE_SLUG)}`;
const CLIENT = `${BASE}/clients/${encodeURIComponent(CLIENT_SLUG)}`;
const report = { at: new Date().toISOString(), users: USERS, tests: {} };

const pct = (arr, p) => { if (!arr.length) return null; const s = [...arr].sort((a, b) => a - b); return Math.round(s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]); };
const stats = (ms) => ({ n: ms.length, p50: pct(ms, 50), p95: pct(ms, 95), max: ms.length ? Math.round(Math.max(...ms)) : null });

const browser = await chromium.launch();

async function signedInContext(email) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "ar-SA" });
  // Images, media and fonts come from the CDN, not from the server under test — skipping them
  // keeps 50 headless pages inside this machine's memory.
  await ctx.route("**/*", (r) => (["image", "media", "font"].includes(r.request().resourceType()) || /googletagmanager|google-analytics|clarity\.ms/.test(r.request().url()) ? r.abort() : r.continue()));
  const { csrfToken } = await (await ctx.request.get(`${BASE}/api/auth/csrf`)).json();
  await ctx.request.post(`${BASE}/api/auth/callback/credentials`, { form: { csrfToken, email, password: TEST_PASSWORD, callbackUrl: BASE } });
  const s = await (await ctx.request.get(`${BASE}/api/auth/session`)).json();
  if (s?.user?.email !== email) throw new Error(`login failed for ${email}`);
  return ctx;
}

// Time every server-action POST a page makes (the request carries a `next-action` header).
function watchActions(page, sink) {
  page.on("requestfinished", (req) => {
    if (req.method() === "POST" && req.headers()["next-action"]) {
      const t = req.timing();
      if (t.responseEnd > 0) sink.push(t.responseEnd);
    }
  });
}

async function articleCounts() {
  const a = await db.article.findFirst({ where: { slug: ARTICLE_SLUG }, select: { id: true, likesCount: true } });
  const rows = await db.articleLike.count({ where: { articleId: a.id } });
  return { stored: a.likesCount, rows, id: a.id };
}

// ── Sign everyone in (sequential — logging in is not what is under test) ──
const t0 = Date.now();
const contexts = [];
for (let n = 1; n <= USERS; n += 10) {
  const batch = Array.from({ length: Math.min(10, USERS - n + 1) }, (_, i) => TEST_EMAIL(n + i));
  contexts.push(...(await Promise.all(batch.map(async (email) => ({ email, ctx: await signedInContext(email) })))));
}
console.log(`signed in ${contexts.length} subscribers in ${Math.round((Date.now() - t0) / 1000)}s`);

// ── A. Everyone presses «أعجبني» on the same article in the same instant ──
if (ONLY.has("like")) {
  const before = await articleCounts();
  const pages = await Promise.all(contexts.map(async ({ ctx }) => {
    const p = await ctx.newPage();
    await p.goto(ARTICLE, { timeout: 180000 });
    await p.getByRole("button", { name: /^أعجبني/ }).first().waitFor({ timeout: 120000 });
    return p;
  }));
  // Click → the like action's own response, per page, measured from the click. Pages are not
  // closed until every one answered (closing early aborted requests and logged false errors).
  const ms = [];
  const statuses = [];
  const tStart = Date.now();
  await Promise.all(pages.map(async (p) => {
    const answered = p.waitForResponse((r) => r.request().method() === "POST" && !!r.request().headers()["next-action"], { timeout: 180000 })
      .then((r) => { ms.push(Date.now() - tStart); statuses.push(r.status()); })
      .catch(() => statuses.push("timeout"));
    await p.getByRole("button", { name: /^أعجبني/ }).first().click();
    await answered;
  }));
  const wall = Date.now() - tStart;
  report.tests.likeStatuses = statuses.reduce((m, s) => ((m[s] = (m[s] ?? 0) + 1), m), {});
  await new Promise((r) => setTimeout(r, 1500));
  const after = await articleCounts();
  report.tests.like = { before, after, ok: after.stored === after.rows, actions: stats(ms), wallMs: wall };
  console.log(`A like ×${pages.length} simultaneous: stored ${before.stored}→${after.stored} · rows ${before.rows}→${after.rows} · ${after.stored === after.rows ? "✓ exact" : "✗ MISMATCH"} · action p50=${pct(ms, 50)}ms p95=${pct(ms, 95)}ms (n=${ms.length}) wall=${wall}ms · responses ${JSON.stringify(report.tests.likeStatuses)}`);
  await Promise.all(pages.map((p) => p.close()));
}

// ── B. One subscriber, two tabs, «أعجبني» in both at once (the known risk in like-article.ts) ──
if (ONLY.has("race")) {
  const { ctx, email } = contexts[4];
  const results = [];
  for (let round = 1; round <= 3; round++) {
    const before = await articleCounts();
    const [p1, p2] = await Promise.all([ctx.newPage(), ctx.newPage()]);
    await Promise.all([p1, p2].map(async (p) => { await p.goto(ARTICLE, { timeout: 180000 }); await p.getByRole("button", { name: /^أعجبني/ }).first().waitFor({ timeout: 120000 }); }));
    await Promise.all([p1, p2].map(async (p) => {
      const answered = p.waitForResponse((r) => r.request().method() === "POST" && !!r.request().headers()["next-action"], { timeout: 120000 }).catch(() => null);
      await p.getByRole("button", { name: /^أعجبني/ }).first().click();
      await answered;
    }));
    const after = await articleCounts();
    results.push({ round, before, after, ok: after.stored === after.rows });
    console.log(`B race round ${round} (${email}, 2 tabs): stored ${before.stored}→${after.stored} · rows ${before.rows}→${after.rows} · ${after.stored === after.rows ? "✓" : "✗ counter drifted"}`);
    await Promise.all([p1.close(), p2.close()]);
  }
  report.tests.race = results;
}

// ── C. Everyone follows the same partner at once ──
if (ONLY.has("follow")) {
  const c = await db.client.findFirst({ where: { slug: CLIENT_SLUG }, select: { id: true } });
  const before = await db.clientLike.count({ where: { clientId: c.id } });
  const pages = await Promise.all(contexts.map(async ({ ctx }) => {
    const p = await ctx.newPage();
    await p.goto(CLIENT, { timeout: 180000 });
    await p.locator("div.bg-\\[\\#0b0d1f\\]").first().getByRole("button", { name: /متابعة|متابَع/ }).waitFor({ timeout: 120000 });
    await p.waitForTimeout(1500); // the button fetches its own state after mount
    return p;
  }));
  const statusCodes = [];
  pages.forEach((p) => p.on("response", (r) => { if (r.url().includes("/api/follow") && r.request().method() !== "GET") statusCodes.push(r.status()); }));
  await Promise.all(pages.map((p) => p.locator("div.bg-\\[\\#0b0d1f\\]").first().getByRole("button", { name: /متابعة|متابَع/ }).click()));
  for (let i = 0; i < 60 && statusCodes.length < pages.length; i++) await new Promise((r) => setTimeout(r, 500));
  const after = await db.clientLike.count({ where: { clientId: c.id } });
  const dup = await db.clientLike.groupBy({ by: ["userId"], where: { clientId: c.id }, _count: true }).then((g) => g.filter((x) => x._count > 1).length);
  report.tests.follow = { before, after, statusCodes, duplicates: dup };
  console.log(`C follow ×${pages.length} simultaneous: rows ${before}→${after} · responses ${JSON.stringify(statusCodes.reduce((m, s) => ((m[s] = (m[s] ?? 0) + 1), m), {}))} · duplicate rows per user=${dup}`);
  await Promise.all(pages.map((p) => p.close()));
}

// ── D. Many new people register in the same second ──
if (ONLY.has("signup")) {
  const start = Number(arg("signup-from", "60"));
  const emails = Array.from({ length: SIGNUPS }, (_, i) => TEST_EMAIL(start + i));
  const existing = await db.user.count({ where: { email: { in: emails } } });
  if (existing) console.log(`D skipped: ${existing} of qa-sub-${start}… already exist (run cleanup first)`);
  else {
    const ctxs = await Promise.all(emails.map(async () => {
      const c = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ar-SA" });
      await c.route("**/*", (r) => (["image", "media", "font"].includes(r.request().resourceType()) || /googletagmanager|google-analytics|clarity\.ms/.test(r.request().url()) ? r.abort() : r.continue()));
      return c;
    }));
    const pages = await Promise.all(ctxs.map(async (ctx, i) => {
      const p = await ctx.newPage();
      await p.goto(`${BASE}/users/register`, { timeout: 180000 });
      await p.waitForLoadState("networkidle");
      await p.fill("#name", `[تجربة] ضغط ${start + i}`);
      await p.fill("#email", emails[i]);
      await p.fill("#password", TEST_PASSWORD);
      return p;
    }));
    const ms = [];
    pages.forEach((p) => watchActions(p, ms));
    const tStart = Date.now();
    await Promise.all(pages.map((p) => p.click("form button[type=submit]")));
    const outcome = await Promise.all(pages.map(async (p) => {
      try { await p.getByRole("status").first().waitFor({ timeout: 60000 }); return "welcome"; }
      catch { return (await p.locator(".bg-destructive\\/10").first().innerText().catch(() => "no message")).slice(0, 60); }
    }));
    const wall = Date.now() - tStart;
    const created = await db.user.count({ where: { email: { in: emails } } });
    const tally = outcome.reduce((m, o) => ((m[o] = (m[o] ?? 0) + 1), m), {});
    report.tests.signup = { requested: SIGNUPS, created, outcome: tally, actions: stats(ms), wallMs: wall };
    console.log(`D signup ×${SIGNUPS} simultaneous: created ${created}/${SIGNUPS} · screens ${JSON.stringify(tally)} · action p50=${pct(ms, 50)}ms p95=${pct(ms, 95)}ms · wall=${wall}ms`);
    await Promise.all(ctxs.map((c) => c.close()));
  }
}

await browser.close();
const out = path.join(root, "documents", "qa", "subscriber-journey", "load-report.json");
fs.writeFileSync(out, JSON.stringify(report, null, 2));
console.log(`report: ${path.relative(root, out)}`);
await db.$disconnect();
