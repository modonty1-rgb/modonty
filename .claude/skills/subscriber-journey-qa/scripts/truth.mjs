// Ground truth after each click — read-only. What the database says, next to what the page shows.
//   node truth.mjs article <slug>        [--user qa-sub-01@test.local]
//   node truth.mjs reel    <reelSlug|id> [--user …]
//   node truth.mjs client  <slug>        [--user …]
//   node truth.mjs user    <email>
// Every stored counter is printed beside the rows it is supposed to count, marked ✓ / ✗.
import { db, arg } from "./_db.mjs";

const [kind, key] = process.argv.slice(2);
const email = arg("user");
const user = email ? await db.user.findUnique({ where: { email }, select: { id: true, email: true } }) : null;
if (email && !user) console.log(`! no user ${email}`);
const uid = user?.id;
const mark = (a, b) => (a === b ? "✓" : "✗");
const line = (label, stored, rows, note = "") => console.log(`  ${mark(stored, rows)} ${label.padEnd(12)} stored=${stored} rows=${rows}${note ? "  " + note : ""}`);
const byStatus = (rows) => rows.reduce((m, r) => ((m[r.status] = (m[r.status] ?? 0) + 1), m), {});

if (kind === "article") {
  const a = await db.article.findFirst({
    where: { slug: key },
    select: { id: true, slug: true, status: true, likesCount: true, dislikesCount: true, favoritesCount: true, commentsCount: true, viewsCount: true },
  });
  if (!a) throw new Error(`no article ${key}`);
  const [likes, dislikes, favs, comments, views, shares] = await Promise.all([
    db.articleLike.findMany({ where: { articleId: a.id }, select: { userId: true } }),
    db.articleDislike.findMany({ where: { articleId: a.id }, select: { userId: true } }),
    db.articleFavorite.findMany({ where: { articleId: a.id }, select: { userId: true } }),
    db.comment.findMany({ where: { articleId: a.id }, select: { status: true, authorId: true } }),
    db.articleView.count({ where: { articleId: a.id } }),
    db.share.findMany({ where: { articleId: a.id }, select: { platform: true, userId: true } }),
  ]);
  console.log(`article ${a.slug} · ${a.status} · ${a.id}`);
  line("likes", a.likesCount, likes.length);
  line("dislikes", a.dislikesCount, dislikes.length);
  line("favorites", a.favoritesCount, favs.length);
  const cs = byStatus(comments);
  line("comments", a.commentsCount, cs.APPROVED ?? 0, `(approved; all=${JSON.stringify(cs)})`);
  line("views", a.viewsCount, views, "(ArticleView rows — info)");
  console.log(`    shares=${shares.length} ${JSON.stringify(shares.reduce((m, s) => ((m[s.platform] = (m[s.platform] ?? 0) + 1), m), {}))}`);
  const both = likes.filter((l) => l.userId && dislikes.some((d) => d.userId === l.userId)).length;
  console.log(`  ${both === 0 ? "✓" : "✗"} like+dislike by same user = ${both}`);
  if (uid)
    console.log(`  user ${email}: liked=${likes.some((l) => l.userId === uid)} disliked=${dislikes.some((d) => d.userId === uid)} favorited=${favs.some((f) => f.userId === uid)} comments=${comments.filter((c) => c.authorId === uid).length} shares=${shares.filter((s) => s.userId === uid).length}`);
} else if (kind === "reel") {
  const m = await db.media.findFirst({
    where: /^[0-9a-f]{24}$/i.test(key) ? { id: key } : { reelSlug: key },
    select: { id: true, reelSlug: true, likesCount: true, favoritesCount: true, commentsCount: true, viewsCount: true },
  });
  if (!m) throw new Error(`no reel ${key}`);
  const [rx, comments] = await Promise.all([
    db.mediaReaction.findMany({ where: { mediaId: m.id }, select: { kind: true, userId: true } }),
    db.mediaComment.findMany({ where: { mediaId: m.id }, select: { status: true, authorId: true } }),
  ]);
  const likes = rx.filter((r) => r.kind === "LIKE"), favs = rx.filter((r) => r.kind === "FAVORITE");
  console.log(`reel ${m.reelSlug ?? "-"} · ${m.id}`);
  line("likes", m.likesCount, likes.length);
  line("favorites", m.favoritesCount, favs.length);
  const cs = byStatus(comments);
  line("comments", m.commentsCount, cs.APPROVED ?? 0, `(approved; all=${JSON.stringify(cs)})`);
  console.log(`    views stored=${m.viewsCount} (no per-view rows — info)`);
  if (uid) console.log(`  user ${email}: liked=${likes.some((l) => l.userId === uid)} favorited=${favs.some((f) => f.userId === uid)} comments=${comments.filter((c) => c.authorId === uid).length}`);
} else if (kind === "client") {
  const c = await db.client.findFirst({ where: { slug: key }, select: { id: true, slug: true, name: true } });
  if (!c) throw new Error(`no client ${key}`);
  const w = { clientId: c.id };
  const [likes, dislikes, favs, comments, reviews, views, shares] = await Promise.all([
    db.clientLike.findMany({ where: w, select: { userId: true } }),
    db.clientDislike.findMany({ where: w, select: { userId: true } }),
    db.clientFavorite.findMany({ where: w, select: { userId: true } }),
    db.clientComment.findMany({ where: w, select: { status: true, authorId: true } }),
    db.clientReview.findMany({ where: w, select: { reviewerId: true } }),
    db.clientView.count({ where: w }),
    db.share.findMany({ where: w, select: { platform: true, userId: true } }),
  ]);
  console.log(`client ${c.slug} · ${c.name}`);
  console.log(`    likes=${likes.length} dislikes=${dislikes.length} favorites/follows=${favs.length} comments=${JSON.stringify(byStatus(comments))} reviews=${reviews.length} views=${views} shares=${shares.length}`);
  const both = likes.filter((l) => l.userId && dislikes.some((d) => d.userId === l.userId)).length;
  console.log(`  ${both === 0 ? "✓" : "✗"} like+dislike by same user = ${both}`);
  const dupReviews = reviews.length - new Set(reviews.map((r) => r.reviewerId)).size;
  console.log(`  ${dupReviews === 0 ? "✓" : "✗"} duplicate reviews by one user = ${dupReviews}`);
  if (uid)
    console.log(`  user ${email}: liked=${likes.some((l) => l.userId === uid)} disliked=${dislikes.some((d) => d.userId === uid)} favorited=${favs.some((f) => f.userId === uid)} reviews=${reviews.filter((r) => r.reviewerId === uid).length} comments=${comments.filter((x) => x.authorId === uid).length}`);
} else if (kind === "user") {
  const u = await db.user.findUnique({ where: { email: key }, select: { id: true, name: true, bio: true, image: true, avatar: true } });
  if (!u) throw new Error(`no user ${key}`);
  const w = { userId: u.id };
  const [al, ad, af, cm, rx, cl, cf, rv, sh, nt] = await Promise.all([
    db.articleLike.count({ where: w }), db.articleDislike.count({ where: w }), db.articleFavorite.count({ where: w }),
    db.comment.count({ where: { authorId: u.id } }), db.mediaReaction.count({ where: w }),
    db.clientLike.count({ where: w }), db.clientFavorite.count({ where: w }), db.clientReview.count({ where: { reviewerId: u.id } }),
    db.share.count({ where: w }),
    db.notification.findMany({ where: w, select: { type: true, readAt: true }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  console.log(`user ${key} · name=${JSON.stringify(u.name)} bio=${JSON.stringify(u.bio)} image=${u.image ? "yes" : "no"} avatar=${u.avatar ? "yes" : "no"}`);
  console.log(`    articleLikes=${al} articleDislikes=${ad} articleFavorites=${af} comments=${cm} reelReactions=${rx} clientLikes=${cl} clientFollows=${cf} reviews=${rv} shares=${sh}`);
  console.log(`    notifications=${nt.length} unread=${nt.filter((n) => !n.readAt).length} latest=${JSON.stringify(nt.slice(0, 5).map((n) => n.type))}`);
} else {
  console.log("usage: truth.mjs article|reel|client <slug> [--user email]  ·  truth.mjs user <email>");
}
await db.$disconnect();
