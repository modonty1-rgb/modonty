import { google } from "googleapis";

function getCredentials() {
  const b64 = process.env.GSC_MODONTY_KEY_BASE64;
  if (!b64) throw new Error("GSC_MODONTY_KEY_BASE64 is not set");
  const json = Buffer.from(b64, "base64").toString("utf-8");
  return JSON.parse(json) as {
    client_email: string;
    private_key: string;
  };
}

function buildJwt(scopes: string[]) {
  const creds = getCredentials();
  return new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes,
  });
}

export function getGscClient() {
  return google.webmasters({
    version: "v3",
    auth: buildJwt(["https://www.googleapis.com/auth/webmasters.readonly"]),
  });
}

/** Same as getGscClient but with full webmasters scope (required for sitemap submit/delete). */
export function getGscWriteClient() {
  return google.webmasters({
    version: "v3",
    auth: buildJwt(["https://www.googleapis.com/auth/webmasters"]),
  });
}

export function getSearchConsoleClient() {
  return google.searchconsole({
    version: "v1",
    auth: buildJwt(["https://www.googleapis.com/auth/webmasters.readonly"]),
  });
}

export function getIndexingClient() {
  return google.indexing({
    version: "v3",
    auth: buildJwt(["https://www.googleapis.com/auth/indexing"]),
  });
}

export const GSC_PROPERTY = process.env.GSC_MODONTY_PROPERTY ?? "sc-domain:modonty.com";
export const SITE_BASE_URL = process.env.NEXT_PUBLIC_SITE_BASE_URL ?? "https://www.modonty.com";
