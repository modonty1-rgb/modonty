import { randomBytes } from "crypto";

/** Prefix so a leaked key is recognizable at a glance in a log or a support ticket. */
const API_KEY_PREFIX = "mdk_";

/**
 * One read-only key per client, generated the moment «Client Site Publishing» is
 * switched on. 32 random bytes — collision is not a practical concern, which is why
 * the column carries a plain index and not a unique one (a unique index in Mongo
 * treats an ABSENT field as null, so the first two clients without a key would
 * collide with each other).
 *
 * Stored in plaintext on purpose: it grants read access to articles that are about
 * to be public anyway, and the client must be able to see their own key in the
 * console. A lost key is replaced by us on request — there is no self-service
 * rotation and no expiry (one key + an expiry date is a scheduled outage).
 */
export function generateApiKey(): string {
  return `${API_KEY_PREFIX}${randomBytes(32).toString("base64url")}`;
}

/** Shows enough to recognise the key, never enough to use it. */
export function maskApiKey(key: string): string {
  if (key.length <= API_KEY_PREFIX.length + 8) return `${API_KEY_PREFIX}••••`;
  return `${key.slice(0, API_KEY_PREFIX.length + 4)}••••${key.slice(-4)}`;
}
