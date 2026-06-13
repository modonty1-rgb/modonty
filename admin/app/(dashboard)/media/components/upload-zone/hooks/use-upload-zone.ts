"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { MediaType } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import { optimizeCloudinaryUrl } from "@/lib/utils/image-seo";
import { requiresCrop } from "@/lib/media/media-specs";
import { createMedia, getClients } from "../../../actions/media-actions";
import { validateFile } from "../utils/file-validation";
import { useCloudinaryUpload } from "./use-cloudinary-upload";
import type { UploadFile, Client, SEOFormData, UploadZoneProps } from "../types";

interface EditorState {
  source: string;
  fileName: string;
}

export function useUploadZone({ onUploadComplete, initialClientId }: UploadZoneProps) {
  const { toast } = useToast();
  const [clientId, setClientId] = useState<string>(initialClientId || "");
  const [mediaType, setMediaType] = useState<MediaType | "">("");
  const [clients, setClients] = useState<Client[]>([]);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  // Bytes of the file the designer picked — shown next to the compressed WebP size.
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [savingFileId, setSavingFileId] = useState<string | null>(null);
  const filesRef = useRef<UploadFile[]>([]);

  // SEO form state
  const [seoForm, setSeoForm] = useState<SEOFormData>({
    altText: "",
    title: "",
    description: "",
  });

  // Cloudinary upload hook
  const { uploadToCloudinary } = useCloudinaryUpload({
    clients,
    clientId,
    seoForm,
    setFiles,
  });

  // Keep ref in sync with state
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((uploadFile) => {
        if (uploadFile.previewUrl) {
          URL.revokeObjectURL(uploadFile.previewUrl);
        }
      });
    };
  }, [files]);

  // Load clients on mount
  useEffect(() => {
    const loadClients = async () => {
      const clientsList = await getClients();
      setClients(clientsList);
      if (initialClientId && clientsList.some((c) => c.id === initialClientId)) {
        setClientId(initialClientId);
      }
      // Do NOT auto-select — user must consciously pick a client (OBS-004 fix)
      setIsLoadingClients(false);
    };
    loadClients();
  }, [initialClientId]);

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      if (!clientId) {
        toast({
          title: "Client Required",
          description: "Please select a client first before uploading a file.",
          variant: "destructive",
        });
        return;
      }
      if (!mediaType) {
        toast({
          title: "Role Required",
          description: "Pick the image role first — it sets the required crop ratio.",
          variant: "destructive",
        });
        return;
      }

      const file = Array.isArray(fileList) ? fileList[0] : fileList[0];
      if (!file) return;
      setOriginalSize(file.size);

      // Cleanup previous preview URLs before anything else.
      setFiles((prev) => {
        prev.forEach((f) => {
          if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        });
        return [];
      });

      const error = validateFile(file);
      if (error) {
        toast({
          title: "File Validation Failed",
          description: error,
          variant: "destructive",
        });
        setFiles([
          { id: `${Date.now()}-${Math.random()}`, file, progress: 0, status: "error", error },
        ]);
        return;
      }

      const isImage = file.type.startsWith("image/");
      const objectUrl = isImage ? URL.createObjectURL(file) : undefined;

      // Fixed-ratio role + image → force the editor so the output ALWAYS
      // matches the spec (the "control"). The active file is set on editor save.
      if (isImage && objectUrl && requiresCrop(mediaType)) {
        setEditorState({ source: objectUrl, fileName: file.name });
        return;
      }

      // Free role (GENERAL / GALLERY) or video → set the file directly.
      setFiles([
        { id: `${Date.now()}-${Math.random()}`, file, progress: 0, status: "pending", previewUrl: objectUrl },
      ]);
    },
    [clientId, mediaType, toast]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading && clientId && mediaType) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!isUploading && clientId && mediaType && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUploading && clientId && mediaType && e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = "";
  };

  // Clear any picked/cropped file + editor + size + SEO — a clean slate.
  const resetFlowFiles = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
      return [];
    });
    setEditorState((prev) => {
      if (prev) URL.revokeObjectURL(prev.source);
      return null;
    });
    setOriginalSize(0);
    setSeoForm({ altText: "", title: "", description: "" });
  }, []);

  // Changing the role resets any chosen file so the new ratio is enforced cleanly.
  const handleMediaTypeChange = useCallback(
    (type: MediaType) => {
      setMediaType(type);
      resetFlowFiles();
    },
    [resetFlowFiles]
  );

  // "Change" from the summary rail — reopen the client step (role kept, it's
  // client-independent) or the role step. Both drop any in-progress file.
  const handleChangeClient = useCallback(() => {
    resetFlowFiles();
    setClientId("");
  }, [resetFlowFiles]);

  const handleChangeRole = useCallback(() => {
    resetFlowFiles();
    setMediaType("");
  }, [resetFlowFiles]);

  // Editor saved a cropped/enhanced image → it becomes the active upload file.
  const handleEditorSave = useCallback((croppedFile: File) => {
    setEditorState((prev) => {
      if (prev) URL.revokeObjectURL(prev.source);
      return null;
    });
    setFiles((prev) => {
      prev.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
      return [];
    });
    const previewUrl = URL.createObjectURL(croppedFile);
    setFiles([
      { id: `${Date.now()}-${Math.random()}`, file: croppedFile, progress: 0, status: "pending", previewUrl },
    ]);
  }, []);

  const handleEditorClose = useCallback(() => {
    setEditorState((prev) => {
      if (prev) URL.revokeObjectURL(prev.source);
      return null;
    });
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
    setSeoForm({
      altText: "",
      title: "",
      description: "",
      });
  };

  const handleAddNew = () => {
    setFiles([]);
    setOriginalSize(0);
    setSeoForm({
      altText: "",
      title: "",
      description: "",
      });
  };

  const waitForUploadCompletion = async (fileId: string): Promise<UploadFile | null> => {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 60;

      const checkUpload = () => {
        attempts++;
        const currentFile = filesRef.current.find((f) => f.id === fileId);

        if (currentFile?.uploadResult) {
          resolve(currentFile);
          return;
        }

        if (currentFile?.status === "error") {
          resolve(null);
          return;
        }

        if (attempts >= maxAttempts) {
          resolve(null);
          return;
        }

        setTimeout(checkUpload, 500);
      };

      checkUpload();
    });
  };

  const saveMediaToDatabase = async (uploadFile: UploadFile) => {
    const originalUrl = uploadFile.uploadResult!.url;
    const fileWidth = uploadFile.uploadResult!.width || 0;
    const fileHeight = uploadFile.uploadResult!.height || 0;
    const fileFormat = uploadFile.uploadResult!.format || "";

    try {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, progress: 50 } : f
        )
      );

      const cloudinaryPublicId = uploadFile.uploadResult?.public_id;
      const cloudinaryVersion = uploadFile.uploadResult?.version;
      const cloudinarySignature = uploadFile.uploadResult?.signature;

      const resourceType = uploadFile.file.type.startsWith("image/") ? "image" : "video";
      const optimizedUrl = optimizeCloudinaryUrl(
        originalUrl,
        cloudinaryPublicId || "",
        fileFormat,
        resourceType
      );

      const resolvedClientId = (clientId === "none" || clientId === "modonty") ? null : clientId;
      const resolvedScope = clientId === "modonty" ? "PLATFORM" : clientId === "none" ? "GENERAL" : "CLIENT";

      const mediaResult = await createMedia({
        filename: uploadFile.file.name,
        url: optimizedUrl,
        mimeType: uploadFile.file.type,
        clientId: resolvedClientId,
        scope: resolvedScope as import("@prisma/client").MediaScope,
        type: (mediaType || undefined) as MediaType | undefined,
        fileSize: uploadFile.file.size,
        width: fileWidth,
        height: fileHeight,
        encodingFormat: uploadFile.file.type || undefined,
        cloudinaryPublicId,
        cloudinaryVersion,
        cloudinarySignature,
        altText: seoForm.altText.trim(),
        title: seoForm.title.trim() || undefined,
        description: seoForm.description.trim() || undefined,
        credit: "مدونتي",
        license: "All Rights Reserved",
        geoLatitude: undefined,
        geoLongitude: undefined,
        geoLocationName: undefined,
        contentLocation: undefined,
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, progress: 75 } : f
        )
      );

      if (mediaResult.success && mediaResult.media) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? {
                ...f,
                status: "saved",
                progress: 100,
                mediaId: mediaResult.media?.id,
              }
              : f
          )
        );

        toast({
          title: "Media Saved",
          description: `${uploadFile.file.name} has been saved to the media library.`,
        });

        onUploadComplete?.();
      } else {
        const errorMsg = mediaResult.error || "Failed to save media record.";
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save media";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "error", error: errorMessage } : f
        )
      );
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSaveMedia = async (uploadFile: UploadFile) => {
    if (savingFileId === uploadFile.id) {
      return;
    }

    if (!seoForm.altText || seoForm.altText.trim().length === 0) {
      toast({
        title: "Alt Text Required",
        description: "Alt text is required for SEO and accessibility.",
        variant: "destructive",
      });
      return;
    }

    setSavingFileId(uploadFile.id);

    const currentFile = files.find((f) => f.id === uploadFile.id);

    if (!(currentFile?.status === "uploading" && !currentFile?.uploadResult)) {
      setFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "uploading", progress: 0 } : f)),
      );
    }

    try {
      const currentFile = files.find((f) => f.id === uploadFile.id);

      if (currentFile?.status === "uploading" && !currentFile?.uploadResult) {
        const completedFile = await waitForUploadCompletion(uploadFile.id);
        if (!completedFile?.uploadResult) {
          setSavingFileId(null);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, status: "error" } : f
            )
          );
          toast({
            title: "Upload Required",
            description: "Please wait for the file to upload to Cloudinary before saving.",
            variant: "default",
          });
          return;
        }
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "uploading", progress: 0 } : f
          )
        );
        await saveMediaToDatabase(completedFile);
        setSavingFileId(null);
        return;
      }

      if (!uploadFile.uploadResult) {
        await uploadToCloudinary(uploadFile.file, uploadFile.id);
        const completedFile = await waitForUploadCompletion(uploadFile.id);
        if (!completedFile?.uploadResult) {
          setSavingFileId(null);
          toast({
            title: "Upload Failed",
            description: "Failed to upload file to Cloudinary. Please try again.",
            variant: "destructive",
          });
          return;
        }
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "uploading", progress: 0 } : f
          )
        );
        await saveMediaToDatabase(completedFile);
        setSavingFileId(null);
        return;
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "uploading", progress: 0 } : f
        )
      );
      await saveMediaToDatabase(uploadFile);
      setSavingFileId(null);
    } catch (error) {
      setSavingFileId(null);
      toast({
        title: "Error",
        description: "Failed to save media. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isUploading = files.some((f) => f.status === "uploading");
  const isDisabled = isUploading || !clientId || !mediaType;

  return {
    // State
    clientId,
    setClientId,
    mediaType,
    clients,
    files,
    editorState,
    originalSize,
    isDragging,
    isLoadingClients,
    savingFileId,
    seoForm,
    setSeoForm,
    isUploading,
    isDisabled,
    // Handlers
    handleMediaTypeChange,
    handleChangeClient,
    handleChangeRole,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    handleAddNew,
    handleSaveMedia,
    handleEditorSave,
    handleEditorClose,
  };
}
