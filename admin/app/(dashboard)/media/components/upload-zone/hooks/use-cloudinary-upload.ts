"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateSEOFileName, generateCloudinaryPublicId, isValidCloudinaryPublicId } from "@/lib/utils/image-seo";
import { getCloudinaryErrorMessage } from "../utils/error-handler";
import type { UploadFile, Client, SEOFormData } from "../types";

interface UseCloudinaryUploadProps {
  clients: Client[];
  clientId: string;
  seoForm: SEOFormData;
  setFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>;
}

export function useCloudinaryUpload({
  clients,
  clientId,
  seoForm,
  setFiles,
}: UseCloudinaryUploadProps) {
  const { toast } = useToast();

  const uploadToCloudinary = async (file: File, fileId: string): Promise<void> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      const errorMsg = "Cloudinary configuration missing. Please check your environment variables.";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "error", error: errorMsg }
            : f
        )
      );
      toast({
        title: "Configuration Error",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    // Validate client exists
    const selectedClient = clients.find((c) => c.id === clientId);
    if (!selectedClient) {
      const errorMsg = "Client not found. Please select a valid client.";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "error", error: errorMsg }
            : f
        )
      );
      toast({
        title: "Client Error",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    // Generate SEO-friendly public_id from alt text/title
    const seoFileName = generateSEOFileName(
      seoForm.altText || "",
      seoForm.title || "",
      file.name,
      undefined
    );

    // Build folder structure: clients/[clientId]
    // Use client ID (immutable) instead of slug (can change) for stable folder structure
    // Use asset_folder for Media Library organization (works in both Fixed and Dynamic modes)
    const folderPath = `clients/${clientId}`;
    const publicId = generateCloudinaryPublicId(seoFileName, folderPath);

    // Validate public_id format
    if (!isValidCloudinaryPublicId(publicId)) {
      const errorMsg = "Generated filename is invalid. Please check your alt text or title.";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "error", error: errorMsg }
            : f
        )
      );
      toast({
        title: "Validation Error",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    // Update status to uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, status: "uploading", progress: 10 } : f
      )
    );

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("public_id", publicId); // SEO-friendly public_id
      formData.append("asset_folder", folderPath); // Organize in Media Library folders

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, progress: 30 } : f
        )
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, progress: 70 } : f
        )
      );

      if (!response.ok) {
        const errorMessage = await getCloudinaryErrorMessage(response);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: "error", error: errorMessage, progress: 0 }
              : f
          )
        );
        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      const result = await response.json();

      // Store upload result with SEO-friendly public_id
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
              ...f,
              status: "success",
              progress: 100,
              uploadResult: {
                url: result.secure_url || result.url,
                secure_url: result.secure_url || result.url,
                public_id: result.public_id,
                version: result.version?.toString() || "",
                width: result.width,
                height: result.height,
                format: result.format,
                signature: result.signature,
              },
            }
            : f
        )
      );

      toast({
        title: "Upload Successful",
        description: "File uploaded to Cloudinary with SEO-friendly filename.",
        variant: "default",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Network error. Please check your internet connection.";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "error", error: errorMessage, progress: 0 }
            : f
        )
      );
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return { uploadToCloudinary };
}
