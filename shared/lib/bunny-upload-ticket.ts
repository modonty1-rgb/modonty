import { createHash, createHmac } from "node:crypto";

import { bunnyWritePath, getBunnyPublicUrl } from "./bunny";

/**
 * Browser → Bunny Storage directly, without the file passing through Vercel.
 *
 * Bunny Storage only accepts the zone password (`AccessKey`) for writes (bunny.net/docs/storage/http),
 * so the browser can't write by itself. An Edge Script on Bunny (`admin/scripts/bunny-edge/upload-script.js`)
 * holds the password as a secret (bunny.net/docs/scripting/secrets); the server signs a ticket for one
 * path, one size and a few minutes, and the script verifies it before writing.
 *
 * Signature: HMAC-SHA256(BUNNY_UPLOAD_SIGNING_SECRET, `${zone}|${path}|${exp}|${max}`) — identical in
 * the Edge Script. Measured 11 Oct 2026: 10MB and 25MB uploads arrive byte-identical; a tampered size → 403.
 *
 * Without `BUNNY_UPLOAD_EDGE_URL` + `BUNNY_UPLOAD_SIGNING_SECRET` this returns null and callers keep
 * their server-side upload path.
 */
export type DirectUploadZone = "clients" | "assets" | "reels";

export interface BunnyUploadTicket {
  /** PUT the raw file body here. */
  url: string;
  /** Final storage path (dev-prefixed outside production). */
  path: string;
  publicUrl: string;
  expires: number;
  maxBytes: number;
}

export function createBunnyUploadTicket(opts: {
  zone: DirectUploadZone;
  path: string;
  maxBytes: number;
  ttlSeconds?: number;
}): BunnyUploadTicket | null {
  const base = process.env.BUNNY_UPLOAD_EDGE_URL;
  const secret = process.env.BUNNY_UPLOAD_SIGNING_SECRET;
  if (!base || !secret) return null;

  const path = bunnyWritePath(opts.path);
  const expires = Math.floor(Date.now() / 1000) + (opts.ttlSeconds ?? 300);
  const sig = createHmac("sha256", secret).update(`${opts.zone}|${path}|${expires}|${opts.maxBytes}`).digest("hex");
  const query = new URLSearchParams({ zone: opts.zone, path, exp: String(expires), max: String(opts.maxBytes), sig });
  return {
    url: `${base.replace(/\/$/, "")}/?${query.toString()}`,
    path,
    publicUrl: getBunnyPublicUrl(opts.zone, path),
    expires,
    maxBytes: opts.maxBytes,
  };
}

/**
 * Read back a direct upload when the server needs its bytes (blur · dimensions · crops).
 * Null unless the object is there with exactly `bytes` bytes — and, given a `contentKey`,
 * the same first 10 hex of SHA-256 the browser computed (`fileContentKey`, `direct-upload.ts`).
 */
export async function readUploadedObject(
  zone: DirectUploadZone,
  path: string,
  expect: { bytes: number; contentKey?: string },
): Promise<Buffer | null> {
  const res = await fetch(getBunnyPublicUrl(zone, path), { cache: "no-store" });
  if (!res.ok) return null;
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length !== expect.bytes) return null;
  if (expect.contentKey && createHash("sha256").update(buffer).digest("hex").slice(0, 10) !== expect.contentKey) return null;
  return buffer;
}

/** Size of the object as Bunny serves it, or null if it isn't there — confirms a direct upload landed. */
export async function bunnyObjectSize(zone: DirectUploadZone, path: string): Promise<number | null> {
  const res = await fetch(getBunnyPublicUrl(zone, path), { method: "HEAD", cache: "no-store" });
  if (!res.ok) return null;
  const n = Number(res.headers.get("content-length"));
  return Number.isFinite(n) ? n : null;
}
