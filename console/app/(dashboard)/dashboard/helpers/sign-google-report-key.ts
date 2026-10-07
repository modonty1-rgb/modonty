import { createHmac } from "crypto";

/**
 * The key a client's Google report is opened with: `<clientId>.<signature>`.
 *
 * Not the bare client id — that one is public (it ships in every partner page's GTM context), so
 * anyone could swap it into the report link and read another client's Search Console numbers.
 * The signature needs a secret only our server holds, so a changed id is simply rejected. No
 * database field and no copy anywhere to maintain: the key is recomputed on demand.
 *
 * Signed with ADMIN_CONSOLE_ACCESS_SECRET under its own label ("google-report:"), so a key for this
 * report can never be replayed as an admin→console access ticket and vice versa.
 */
export function signGoogleReportKey(clientId: string): string {
  const secret = process.env.ADMIN_CONSOLE_ACCESS_SECRET;
  if (!secret) throw new Error("ADMIN_CONSOLE_ACCESS_SECRET is not set");
  const sig = createHmac("sha256", secret).update(`google-report:${clientId}`).digest("base64url");
  return `${clientId}.${sig}`;
}
