/** Per-reader like/save flags folded into each feed item — the cached feed never carries them. */
export function withReelState<T extends { id: string }>(items: T[], liked: Set<string>, fav: Set<string>) {
  return items.map((r) => ({
    ...r,
    likedByMe: liked.has(r.id),
    favoritedByMe: fav.has(r.id),
  }));
}
