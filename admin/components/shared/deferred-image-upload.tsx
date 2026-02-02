"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ImageUploadData {
  file: File;
  altText: string;
  previewUrl: string;
}

export interface ImageUploadState {
  imageData: ImageUploadData | null;
  isRemoved: boolean; // true if user explicitly removed the image
}

interface DeferredImageUploadProps {
  categorySlug?: string;
  initialImageUrl?: string;
  initialAltText?: string;
  onImageSelected?: (imageData: ImageUploadData | null) => void;
  onImageRemoved?: () => void; // Called when user explicitly removes image
  className?: string;
}

export function DeferredImageUpload({

  initialImageUrl,
  initialAltText,
  onImageSelected,
  onImageRemoved,
  className,
}: DeferredImageUploadProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [altText, setAltText] = useState<string>(initialAltText || "");
  const [isDragging, setIsDragging] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize preview and alt text on mount (for edit mode)
  useEffect(() => {
    if (initialImageUrl && !file && !isRemoved) {
      setPreviewUrl(initialImageUrl);
      if (initialAltText) {
        setAltText(initialAltText);
      }
    }
  }, []); // Empty dependency array = run only on mount

  // Update preview and alt text when initialImageUrl changes (for edit mode)
  useEffect(() => {
    // Don't update if user has selected a new file
    if (file) {
      return;
    }

    // Don't update if user explicitly removed the image
    if (isRemoved) {
      return;
    }

    // Set preview from initialImageUrl if available
    if (initialImageUrl) {
      setPreviewUrl(initialImageUrl);
      if (initialAltText) {
        setAltText(initialAltText);
      }
    } else {
      // Clear preview if no initialImageUrl
      setPreviewUrl(null);
      setAltText("");
    }
  }, [initialImageUrl, initialAltText, file, isRemoved]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file: File): string | null => {
    if (!file.type || file.type === "") {
      return `File type could not be detected for "${file.name}". Please ensure the file has a valid extension.`;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return `File type "${file.type}" is not supported. Supported types: JPG, PNG, GIF, WebP, SVG.`;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const fileSizeMB = Math.round((file.size / (1024 * 1024)) * 100) / 100;
      return `File size (${fileSizeMB}MB) exceeds the maximum allowed size of 10MB.`;
    }

    return null;
  };

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      const error = validateFile(selectedFile);
      if (error) {
        toast({
          title: "File Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      const preview = URL.createObjectURL(selectedFile);

      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      setFile(selectedFile);
      setPreviewUrl(preview);
      setIsRemoved(false); // Reset removed state when new image is selected

      // Preserve existing altText or use initialAltText as fallback
      const preservedAltText = altText || initialAltText || "";

      const imageData: ImageUploadData = {
        file: selectedFile,
        altText: preservedAltText,
        previewUrl: preview,
      };

      // Update altText state to preserve it
      setAltText(preservedAltText);

      onImageSelected?.(imageData);
    },
    [altText, initialAltText, previewUrl, onImageSelected, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
    e.target.value = "";
  };

  const handleAltTextChange = (text: string) => {
    setAltText(text);
    if (file && previewUrl) {
      const imageData: ImageUploadData = {
        file,
        altText: text,
        previewUrl,
      };
      onImageSelected?.(imageData);
    }
  };

  const removeImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setAltText("");
    setIsRemoved(true); // Mark as explicitly removed
    onImageSelected?.(null);
    onImageRemoved?.(); // Notify parent that image was removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6 space-y-4">
        <div>
          <Label>Image</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Choose an image or drag it here. It will be uploaded upon final submission of the form.
          </p>
        </div>

        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative border rounded-lg overflow-hidden group">
              <img
                src={previewUrl}
                alt={altText || "Preview"}
                className="w-full h-auto max-h-64 object-contain"
              />
              <div className="absolute top-2 right-2 flex gap-2">

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeImage}
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="alt-text">
                Alt Text <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="alt-text"
                value={altText}
                onChange={(e) => handleAltTextChange(e.target.value)}
                placeholder="Describe the image for SEO and accessibility..."
                rows={3}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Required. Describe what the image shows for search engines and screen readers.
              </p>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-4">
              <div
                className={`
                  rounded-full p-4
                  ${isDragging ? "bg-primary/10" : "bg-muted"}
                `}
              >
                <Upload className={`h-8 w-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="space-y-2">
                <p className="text-base font-medium">
                  {isDragging ? "Drop image here" : "Click or drag to upload image"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported: JPG, PNG, GIF, WebP, SVG (max 10MB)
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
