import "server-only";

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`; anything else is a stranger. */
export function isCronAuthorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return (request.headers.get("authorization")?.replace("Bearer ", "") ?? "") === expected;
}
