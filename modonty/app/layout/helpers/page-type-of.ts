/** First path segment → the kind of page, so Clarity recordings can be filtered by it. */
export function pageTypeOf(pathname: string): string {
  const [first, second] = pathname.split("/").filter(Boolean);
  if (!first) return "home";
  if (first === "articles") return second ? "article" : "articles";
  if (first === "clients") return second ? "client" : "clients";
  if (first === "reels") return second ? "reel" : "reels";
  if (first === "users") return "account";
  if (["categories", "tags", "industries", "authors", "trending"].includes(first)) return "listing";
  return "other";
}
