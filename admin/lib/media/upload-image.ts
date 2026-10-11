import type { MediaScope, MediaType } from "@prisma/client";

import { fileContentKey, uploadDirect } from "@modonty/shared/lib/direct-upload";
import type { UploadProgress } from "@modonty/shared/lib/upload-with-progress";

import { finalizeMediaImageUpload, requestMediaImageUpload, type DirectImageInput } from "./direct-image-upload";
import { uploadImageToBunny, type BunnyUploadResult } from "./upload-image-to-bunny";

/**
 * Browser-side image upload for the media library — same FormData in, same result out as
 * `uploadImageToBunny`, but through the shared browser → Bunny pipeline (`shared/lib/direct-upload.ts`).
 * Falls back to `uploadImageToBunny` when direct upload isn't set up.
 */
export async function uploadImage(
  formData: FormData,
  onProgress?: (p: UploadProgress) => void,
): Promise<BunnyUploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { success: false, error: "No file provided" };

  const input: DirectImageInput = {
    filename: String(formData.get("filename") || file.name),
    mime: file.type,
    bytes: file.size,
    contentKey: await fileContentKey(file),
    type: (formData.get("type") as MediaType | null) || undefined,
    scope: (formData.get("scope") as MediaScope | null) || "GENERAL",
    clientId: formData.get("clientId") ? String(formData.get("clientId")) : null,
  };

  const res = await uploadDirect({
    file,
    onProgress,
    request: () => requestMediaImageUpload(input),
    finalize: () => finalizeMediaImageUpload(input),
    fallback: () => uploadImageToBunny(formData),
  });
  return res.ok ? res.data : { success: false, error: res.error };
}
