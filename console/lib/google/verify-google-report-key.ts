import { createHmac, timingSafeEqual } from "crypto";

/**
 * `<clientId>.<signature>` → the client id when the signature is ours, otherwise null.
 * Constant-time compare, like console/lib/admin-access.ts. See sign-google-report-key.ts.
 */
export function verifyGoogleReportKey(key: string | null | undefined): string | null {
  const secret = process.env.ADMIN_CONSOLE_ACCESS_SECRET;
  if (!secret || !key) return null;
  const [clientId, sig] = key.split(".");
  if (!clientId || !sig || !/^[0-9a-f]{24}$/i.test(clientId)) return null;
  const expected = createHmac("sha256", secret).update(`google-report:${clientId}`).digest();
  const provided = Buffer.from(sig, "base64url");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  return clientId;
}
