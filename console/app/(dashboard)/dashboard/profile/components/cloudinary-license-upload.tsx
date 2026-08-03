/**
 * ⛔ RETIRED (2026-07-30, tripwire rule) — the old unsigned direct-to-Cloudinary
 * YMYL license upload. Kept as a loud tripwire, NOT deleted: if anything still
 * imports it the app fails immediately instead of silently growing Cloudinary.
 *
 * The live component is `LicenseUpload` in `./license-upload.tsx`, which posts to
 * `/api/upload-bunny` (folder `licenses`) so the storage password stays server-side.
 *
 * The old implementation, for reference only (do NOT restore):
 *   POST https://api.cloudinary.com/v1_1/{cloudName}/image/upload
 *   body: file + upload_preset=NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET + asset_folder=ymyl-licenses
 *   → response.secure_url
 */
export function CloudinaryLicenseUpload(): never {
  throw new Error(
    "RETIRED: Cloudinary license upload is disabled — YMYL licenses go to Bunny (license-upload). A code path still references Cloudinary; fix it, don't restore this component.",
  );
}
