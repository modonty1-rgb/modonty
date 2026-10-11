import { uploadDirect } from "@modonty/shared/lib/direct-upload";
import { uploadWithProgress, type UploadProgress, type UploadResponse } from "@modonty/shared/lib/upload-with-progress";

import { finalizeConsoleUpload, requestConsoleUpload } from "./direct-upload-actions";

export type ConsoleUploadData = { url?: string; bytes?: number; blurDataURL?: string | null; error?: string };

/**
 * Every console image upload — browser → Bunny through the shared pipeline (`shared/lib/direct-upload.ts`).
 * Same `{ ok, status, data }` shape as `uploadWithProgress`, so callers read `data.url` as before.
 * Without direct-upload env it falls back to `/api/upload-bunny` (4MB, through Vercel). The env is set on
 * Vercel production since 11 Oct 2026 (`BUNNY_UPLOAD_EDGE_URL` · `BUNNY_UPLOAD_SIGNING_SECRET`).
 */
export async function uploadConsoleImage(
  file: File,
  folder: string,
  onProgress?: (p: UploadProgress) => void,
): Promise<UploadResponse<ConsoleUploadData>> {
  const res = await uploadDirect<UploadResponse<ConsoleUploadData>>({
    file,
    onProgress,
    request: () => requestConsoleUpload(folder, file.type, file.size),
    finalize: async ({ path }) => {
      const data = await finalizeConsoleUpload(path ?? "", file.size);
      return { ok: !!data.url, status: data.url ? 200 : 500, data };
    },
    fallback: () => uploadWithProgress<ConsoleUploadData>({ endpoint: "/api/upload-bunny", file, fields: { folder }, onProgress }),
  });
  return res.ok ? res.data : { ok: false, status: 400, data: { error: res.error } };
}
