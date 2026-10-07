/**
 * Where a comment was written. Reel comments moderate on this same page rather than a
 * page of their own (ق10, 2026-08-05): the client reviews everything in one place, and
 * splitting them across two screens is how a comment goes days without a reply.
 */
export type CommentKind = "article" | "reel";
