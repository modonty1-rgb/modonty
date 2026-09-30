// Set every article's and reel's stored counters to the rows they count — dev only (_db.mjs guard).
// For after a load test leaves counters drifted. Prints only what changed.
//   node recount.mjs
import { db } from "./_db.mjs";

const arts = await db.article.findMany({ select: { id: true, slug: true, likesCount: true, dislikesCount: true, favoritesCount: true } });
let fixed = 0;
for (const a of arts) {
  const [l, d, f] = await Promise.all([
    db.articleLike.count({ where: { articleId: a.id } }),
    db.articleDislike.count({ where: { articleId: a.id } }),
    db.articleFavorite.count({ where: { articleId: a.id } }),
  ]);
  if (l !== a.likesCount || d !== a.dislikesCount || f !== a.favoritesCount) {
    await db.article.update({ where: { id: a.id }, data: { likesCount: l, dislikesCount: d, favoritesCount: f } });
    console.log(`article ${a.slug}: likes ${a.likesCount}→${l} dislikes ${a.dislikesCount}→${d} favorites ${a.favoritesCount}→${f}`);
    fixed++;
  }
}
const media = await db.media.findMany({ where: { reelSlug: { not: null } }, select: { id: true, reelSlug: true, likesCount: true, favoritesCount: true } });
for (const m of media) {
  const [l, f] = await Promise.all([
    db.mediaReaction.count({ where: { mediaId: m.id, kind: "LIKE" } }),
    db.mediaReaction.count({ where: { mediaId: m.id, kind: "FAVORITE" } }),
  ]);
  if (l !== m.likesCount || f !== m.favoritesCount) {
    await db.media.update({ where: { id: m.id }, data: { likesCount: l, favoritesCount: f } });
    console.log(`reel ${m.reelSlug}: likes ${m.likesCount}→${l} favorites ${m.favoritesCount}→${f}`);
    fixed++;
  }
}
console.log(`recounted · changed ${fixed}`);
await db.$disconnect();
