"use client";

/**
 * ⛔ RETIRED (2026-07-29, Khalid's tripwire rule) — Cloudinary uploads are DEAD.
 * All uploads go to Bunny via `use-bunny-upload.ts` → `upload-image-to-bunny.ts`.
 *
 * The original file was renamed on purpose: any stale import of
 * "./use-cloudinary-upload" now fails the build immediately, and any runtime
 * call of this hook throws — so a hidden Cloudinary code path can NEVER fail
 * silently. If you hit this error, a code path still references Cloudinary:
 * fix it to use Bunny, do not resurrect this file.
 */
export function useCloudinaryUpload(): never {
  throw new Error(
    "RETIRED: Cloudinary upload is disabled — all uploads go to Bunny (use-bunny-upload). " +
      "A code path still references Cloudinary; fix it, don't restore this hook."
  );
}
