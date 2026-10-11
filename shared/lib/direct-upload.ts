import { putWithProgress, type UploadProgress, type UploadResponse } from "./upload-with-progress";

/**
 * THE browser upload pipeline for every app (admin · console) — browser → Bunny, never through Vercel.
 *
 *   1. `request()`  — the app's server action: auth + where the file may go → a signed ticket
 *                     (`createBunnyUploadTicket`, `bunny-upload-ticket.ts`), or `null` when direct
 *                     upload isn't configured.
 *   2. PUT          — the raw file to the Bunny Edge Script (`admin/scripts/bunny-edge/upload-script.js`).
 *   3. `finalize()` — the app's server action: confirms the bytes on Bunny (`readUploadedObject`)
 *                     and does any server work (dimensions, blur, crops, DB row).
 *   `fallback()`    — runs instead of 2–3 when the ticket is null (the old server-side upload).
 *
 * Each app only decides WHO may upload and WHERE; the moving parts live here once.
 */
/** `path` is set when the server chose the storage path (random name) and `finalize` needs it back. */
export type TicketResult = { ok: true; url: string | null; path?: string } | { ok: false; error: string };

export async function uploadDirect<T>(opts: {
  file: File;
  request: () => Promise<TicketResult>;
  finalize: (ticket: { url: string; path?: string }) => Promise<T>;
  fallback?: () => Promise<T>;
  onProgress?: (p: UploadProgress) => void;
  signal?: AbortSignal;
}): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const ticket = await opts.request();
  if (!ticket.ok) return { ok: false, error: ticket.error };
  if (!ticket.url) {
    if (!opts.fallback) return { ok: false, error: "Direct upload is not configured" };
    return { ok: true, data: await opts.fallback() };
  }

  const put: UploadResponse = await putWithProgress({ url: ticket.url, file: opts.file, onProgress: opts.onProgress, signal: opts.signal });
  if (!put.ok) return { ok: false, error: `Upload to Bunny failed (HTTP ${put.status})` };

  return { ok: true, data: await opts.finalize({ url: ticket.url, path: ticket.path }) };
}

/** First 10 hex of the file's SHA-256 — the content key the server re-checks on Bunny. */
export async function fileContentKey(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 10);
}
