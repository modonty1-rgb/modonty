// Whole-database sweep — read-only. Run at the start (baseline) and at the end of a session.
// For every article and reel: each stored counter against the rows it counts. Plus the rules that
// must hold everywhere: nobody likes AND dislikes the same thing, one review per user per client,
// no interaction left pointing at a deleted user/article.
//   node invariants.mjs [--show 10]
import { db, arg } from "./_db.mjs";

const show = Number(arg("show", "10"));
const count = (rows, k) => rows.reduce((m, r) => (r[k] ? m.set(r[k], (m.get(r[k]) ?? 0) + 1) : m), new Map());
const report = [];
const fail = (area, msg, items) => report.push({ area, msg, n: items.length, items: items.slice(0, show) });

// ── Articles ──
const articles = await db.article.findMany({
  select: { id: true, slug: true, status: true, likesCount: true, dislikesCount: true, favoritesCount: true, commentsCount: true, viewsCount: true },
});
const [al, ad, af, ac, av] = await Promise.all([
  db.articleLike.findMany({ select: { articleId: true, userId: true } }),
  db.articleDislike.findMany({ select: { articleId: true, userId: true } }),
  db.articleFavorite.findMany({ select: { articleId: true, userId: true } }),
  db.comment.findMany({ where: { status: "APPROVED" }, select: { articleId: true } }),
  db.articleView.findMany({ select: { articleId: true } }),
]);
const L = count(al, "articleId"), D = count(ad, "articleId"), F = count(af, "articleId"), C = count(ac, "articleId"), V = count(av, "articleId");
for (const [field, map, label] of [["likesCount", L, "likes"], ["dislikesCount", D, "dislikes"], ["favoritesCount", F, "favorites"], ["commentsCount", C, "approved comments"]]) {
  const off = articles.filter((a) => a[field] !== (map.get(a.id) ?? 0)).map((a) => `${a.slug} (${a.status}) stored=${a[field]} rows=${map.get(a.id) ?? 0}`);
  if (off.length) fail("article", `${field} ≠ ${label}`, off);
}
const viewsOff = articles.filter((a) => a.viewsCount !== (V.get(a.id) ?? 0)).length;
const conflictA = al.filter((l) => l.userId && ad.some((d) => d.articleId === l.articleId && d.userId === l.userId)).map((l) => `${l.articleId} user=${l.userId}`);
if (conflictA.length) fail("article", "same user likes AND dislikes", conflictA);

// ── Reels ──
const media = await db.media.findMany({
  where: { OR: [{ likesCount: { gt: 0 } }, { favoritesCount: { gt: 0 } }, { commentsCount: { gt: 0 } }, { reelSlug: { not: null } }] },
  select: { id: true, reelSlug: true, likesCount: true, favoritesCount: true, commentsCount: true },
});
const [mr, mc] = await Promise.all([
  db.mediaReaction.findMany({ select: { mediaId: true, kind: true } }),
  db.mediaComment.findMany({ where: { status: "APPROVED" }, select: { mediaId: true } }),
]);
const ML = count(mr.filter((r) => r.kind === "LIKE"), "mediaId"), MF = count(mr.filter((r) => r.kind === "FAVORITE"), "mediaId"), MC = count(mc, "mediaId");
for (const [field, map, label] of [["likesCount", ML, "LIKE reactions"], ["favoritesCount", MF, "FAVORITE reactions"], ["commentsCount", MC, "approved comments"]]) {
  const off = media.filter((m) => m[field] !== (map.get(m.id) ?? 0)).map((m) => `${m.reelSlug ?? m.id} stored=${m[field]} rows=${map.get(m.id) ?? 0}`);
  if (off.length) fail("reel", `${field} ≠ ${label}`, off);
}

// ── Clients ──
const [cl, cd, rv] = await Promise.all([
  db.clientLike.findMany({ select: { clientId: true, userId: true } }),
  db.clientDislike.findMany({ select: { clientId: true, userId: true } }),
  db.clientReview.findMany({ select: { clientId: true, reviewerId: true } }),
]);
const conflictC = cl.filter((l) => l.userId && cd.some((d) => d.clientId === l.clientId && d.userId === l.userId)).map((l) => `${l.clientId} user=${l.userId}`);
if (conflictC.length) fail("client", "same user likes AND dislikes", conflictC);
const seen = new Map();
for (const r of rv) { const k = `${r.clientId}:${r.reviewerId}`; seen.set(k, (seen.get(k) ?? 0) + 1); }
const dupRv = [...seen.entries()].filter(([, n]) => n > 1).map(([k, n]) => `${k} ×${n}`);
if (dupRv.length) fail("client", "more than one review per user", dupRv);

// ── Orphans: interaction rows pointing at a user that no longer exists ──
const userIds = new Set((await db.user.findMany({ select: { id: true } })).map((u) => u.id));
const orphan = [...al, ...ad, ...af].filter((r) => r.userId && !userIds.has(r.userId)).map((r) => `${r.articleId} user=${r.userId}`);
if (orphan.length) fail("orphans", "article reactions by a deleted user", orphan);

console.log(`invariants · articles=${articles.length} reels=${media.length} · articleLikes=${al.length} dislikes=${ad.length} favorites=${af.length} reelReactions=${mr.length}`);
console.log(`  info: articles whose viewsCount ≠ ArticleView rows = ${viewsOff} (views may be counted without a row — not a failure by itself)`);
if (!report.length) console.log("  ✓ all invariants hold");
for (const r of report) {
  console.log(`  ✗ [${r.area}] ${r.msg} — ${r.n}`);
  for (const i of r.items) console.log(`      ${i}`);
}
await db.$disconnect();
process.exitCode = report.length ? 1 : 0;
