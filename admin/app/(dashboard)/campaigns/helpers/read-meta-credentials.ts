import "server-only";

import { createDecipheriv, createHash } from "crypto";

import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

export type MetaBrand = "modonty" | "jbrseo";

/** Tokens are stored as `v1.<iv>.<tag>.<body>` (aes-256-gcm, key from AUTH_SECRET) by Settings › Advertising Platforms. */
function decrypt(value: string | undefined) {
  if (!value) return "";
  if (!value.startsWith("v1.")) return value;
  try {
    const [, iv, tag, body] = value.split(".");
    const key = createHash("sha256").update(process.env.AUTH_SECRET ?? "advertising-platforms").digest();
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(body, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

/**
 * حساب ميتا ومفتاحه لعلامةٍ واحدة — من Settings › Advertising Platforms. يقرؤه تقرير ميتا وربط
 * الحملات معاً (خالد ٢٩ سبتمبر ٢٠٢٦: البيانات من ميتا لا نسخةٌ ثانية عندنا). `null` = الربط ناقص.
 * المفتاح لا يخرج من السيرفر.
 */
export async function readMetaCredentials(brand: MetaBrand): Promise<{ accountId: string; accessToken: string } | null> {
  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: { adPlatformAccounts: true },
  });
  const raw = settings?.adPlatformAccounts as {
    accounts?: { meta?: Record<MetaBrand, { accountId?: string | null }> };
    credentials?: { meta?: { tokens?: Record<MetaBrand, string | undefined> } };
  } | null;
  const accountId = raw?.accounts?.meta?.[brand]?.accountId?.trim() ?? "";
  const accessToken = decrypt(raw?.credentials?.meta?.tokens?.[brand]);
  return accountId && accessToken ? { accountId, accessToken } : null;
}
