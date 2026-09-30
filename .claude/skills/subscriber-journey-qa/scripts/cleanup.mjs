// Remove every test subscriber (qa-sub-NN@test.local) and everything they did, then recount the
// stored counters of every article/reel they touched from the rows that remain.
//   node cleanup.mjs            — dry run: prints what would go
//   node cleanup.mjs --apply    — does it (modonty_dev only; _db.mjs refuses anything else)
import { db, testUsers } from "./_db.mjs";

const apply = process.argv.includes("--apply");
const users = await testUsers();
const ids = users.map((u) => u.id);
if (!ids.length) { console.log("no test subscribers"); await db.$disconnect(); process.exit(0); }
const byUser = { userId: { in: ids } };

const touchedArticles = new Set(), touchedMedia = new Set();
for (const r of await db.articleLike.findMany({ where: byUser, select: { articleId: true } })) touchedArticles.add(r.articleId);
for (const r of await db.articleDislike.findMany({ where: byUser, select: { articleId: true } })) touchedArticles.add(r.articleId);
for (const r of await db.articleFavorite.findMany({ where: byUser, select: { articleId: true } })) touchedArticles.add(r.articleId);
for (const r of await db.comment.findMany({ where: { authorId: { in: ids } }, select: { articleId: true } })) touchedArticles.add(r.articleId);
for (const r of await db.mediaReaction.findMany({ where: byUser, select: { mediaId: true } })) touchedMedia.add(r.mediaId);
for (const r of await db.mediaComment.findMany({ where: { authorId: { in: ids } }, select: { mediaId: true } })) touchedMedia.add(r.mediaId);

// Their comments, and every reply/reaction hanging off them (by anyone), deepest first.
async function commentTree(model, authorWhere) {
  let level = (await db[model].findMany({ where: authorWhere, select: { id: true } })).map((c) => c.id);
  const all = [...level];
  while (level.length) {
    level = (await db[model].findMany({ where: { parentId: { in: level } }, select: { id: true } })).map((c) => c.id);
    all.push(...level);
  }
  return [...new Set(all)];
}
const articleComments = await commentTree("comment", { authorId: { in: ids } });
const clientComments = await commentTree("clientComment", { authorId: { in: ids } });
const mediaComments = await commentTree("mediaComment", { authorId: { in: ids } });

const plan = [
  ["commentLike", { OR: [byUser, { commentId: { in: articleComments } }] }],
  ["commentDislike", { OR: [byUser, { commentId: { in: articleComments } }] }],
  ["clientCommentLike", { OR: [byUser, { commentId: { in: clientComments } }] }],
  ["clientCommentDislike", { OR: [byUser, { commentId: { in: clientComments } }] }],
  ["commentReaction", { OR: [byUser, { commentId: { in: mediaComments } }] }],
  ["articleLike", byUser], ["articleDislike", byUser], ["articleFavorite", byUser], ["articleView", byUser],
  ["clientLike", byUser], ["clientDislike", byUser], ["clientFavorite", byUser], ["clientView", byUser],
  ["clientReview", { reviewerId: { in: ids } }],
  ["mediaReaction", byUser], ["share", byUser], ["notification", byUser],
];
console.log(`${apply ? "DELETING" : "dry run —"} ${users.length} test subscribers`);
for (const [model, where] of plan) {
  const n = await db[model].count({ where });
  if (n) console.log(`  ${model.padEnd(22)} ${n}`);
  if (apply && n) await db[model].deleteMany({ where });
}
for (const [model, list] of [["comment", articleComments], ["clientComment", clientComments], ["mediaComment", mediaComments]]) {
  if (list.length) console.log(`  ${model.padEnd(22)} ${list.length} (with replies)`);
  if (apply && list.length) for (const id of [...list].reverse()) await db[model].delete({ where: { id } }).catch(() => {});
}

if (apply) {
  // Recount from the rows that remain — the counters the test pushed around go back to the truth.
  for (const id of touchedArticles) {
    const [likes, dislikes, favs, comments] = await Promise.all([
      db.articleLike.count({ where: { articleId: id } }), db.articleDislike.count({ where: { articleId: id } }),
      db.articleFavorite.count({ where: { articleId: id } }), db.comment.count({ where: { articleId: id, status: "APPROVED" } }),
    ]);
    await db.article.update({ where: { id }, data: { likesCount: likes, dislikesCount: dislikes, favoritesCount: favs, commentsCount: comments } }).catch(() => {});
  }
  for (const id of touchedMedia) {
    const [likes, favs, comments] = await Promise.all([
      db.mediaReaction.count({ where: { mediaId: id, kind: "LIKE" } }), db.mediaReaction.count({ where: { mediaId: id, kind: "FAVORITE" } }),
      db.mediaComment.count({ where: { mediaId: id, status: "APPROVED" } }),
    ]);
    await db.media.update({ where: { id }, data: { likesCount: likes, favoritesCount: favs, commentsCount: comments } }).catch(() => {});
  }
  await db.account.deleteMany({ where: byUser });
  await db.session.deleteMany({ where: byUser });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  console.log(`  recounted articles=${touchedArticles.size} reels=${touchedMedia.size} · removed users=${ids.length}`);
} else {
  console.log(`  would recount articles=${touchedArticles.size} reels=${touchedMedia.size} — run with --apply`);
}
await db.$disconnect();
