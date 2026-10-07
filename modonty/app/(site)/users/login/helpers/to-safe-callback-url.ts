// The post-login redirect target arrives in the query string, so a mailed
// /users/login?callbackUrl=… link decides where a visitor lands the moment they
// authenticate — a phisher points it at a look-alike domain and collects the
// trust of a real sign-in. Only a same-origin path is allowed through:
// "//evil.com" and "/\evil.com" start with a slash but browsers resolve them
// protocol-relative to another host, and tab/CR/LF are stripped during URL
// parsing, so "/<tab>/evil.com" would collapse into one of those after the check.
export function toSafeCallbackUrl(raw: string | undefined): string {
  if (!raw) return "/";
  const cleaned = raw.replace(/[\t\r\n]/g, "");
  if (!cleaned.startsWith("/")) return "/";
  if (cleaned.startsWith("//") || cleaned.startsWith("/\\")) return "/";
  return cleaned;
}
