"use client";

import type { MediaType } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import { uploadImageToBunny } from "../../../actions/upload-image-to-bunny";
import type { UploadFile } from "../types";

interface UseBunnyUploadProps {
  clientId: string;
  mediaType: MediaType | "";
  setFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>;
}

// Vercel serverless request body ceiling (hard, no override). Cropped roles are WebP < 1MB;
// this fast-fails a rare large GENERAL image before the network round-trip.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/**
 * Bunny-primary upload (retire Cloudinary). Sends the cropped/compressed image to a server
 * action → Bunny → sets `uploadResult` in the shape the save flow already reads.
 */
export function useBunnyUpload({ clientId, mediaType, setFiles }: UseBunnyUploadProps) {
  const { toast } = useToast();

  const fail = (fileId: string, error: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status: "error", error, progress: 0 } : f))
    );
    toast({ title: messages.error.upload_failed, description: error, variant: "destructive" });
  };

  const uploadToBunny = async (file: File, fileId: string): Promise<void> => {
    if (file.size > MAX_UPLOAD_BYTES) {
      fail(fileId, `Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 4MB — crop or compress first.`);
      return;
    }

    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "uploading", progress: 20 } : f)));

    const resolvedClientId = clientId === "none" || clientId === "modonty" || clientId === "" ? "" : clientId;
    const resolvedScope = clientId === "modonty" ? "PLATFORM" : clientId === "none" ? "GENERAL" : "CLIENT";

    try {
      const formData = new FormData();
      formData.append("file", file);
      // Raw file.name keeps the ".webp" extension — buildBunnyMediaPath derives the
      // basename+ext from it, and Bunny serves the correct image/webp content-type.
      formData.append("filename", file.name);
      if (mediaType) formData.append("type", mediaType);
      formData.append("scope", resolvedScope);
      if (resolvedClientId) formData.append("clientId", resolvedClientId);

      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: 50 } : f)));

      const result = await uploadImageToBunny(formData);

      if (!result.success || !result.url) {
        fail(fileId, result.error || "Failed to upload to Bunny.");
        return;
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "success",
                progress: 100,
                uploadResult: {
                  url: result.url!,
                  secure_url: result.url!,
                  public_id: "",
                  version: "",
                  width: result.width || 0,
                  height: result.height || 0,
                  format: result.format || "",
                  signature: "",
                },
              }
            : f
        )
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Network error. Please check your internet connection.";
      fail(fileId, errorMessage);
    }
  };

  return { uploadToBunny };
}
