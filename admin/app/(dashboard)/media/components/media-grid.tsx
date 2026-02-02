"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Copy, Eye, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEOHealthGauge } from "@/components/shared/seo-doctor/seo-health-gauge";
import { mediaSEOConfig } from "../helpers/media-seo-config";
import { MediaType } from "@prisma/client";
import { getMediaTypeLabel, getMediaTypeBadgeVariant } from "../helpers/media-utils";
import { updateMedia, deleteCloudinaryAsset } from "../actions";
import { validateFile } from "./upload-zone/utils/file-validation";
import { getCloudinaryErrorMessage } from "./upload-zone/utils/error-handler";
import { generateSEOFileName, generateCloudinaryPublicId, isValidCloudinaryPublicId, optimizeCloudinaryUrl } from "@/lib/utils/image-seo";

interface Media {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  title: string | null;
  description: string | null;
  type: MediaType;
  createdAt: Date;
  cloudinaryPublicId?: string | null;
  cloudinaryVersion?: string | null;
  client?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface MediaGridProps {
  media: Media[];
  viewMode?: "grid" | "list";
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function MediaGrid({
  media,
  viewMode = "grid",
  selectedIds = new Set(),
  onSelectionChange,
  onDelete,
  isDeleting = false,
}: MediaGridProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [replacingMediaId, setReplacingMediaId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentReplacingMedia = useRef<Media | null>(null);

  const isImage = (mimeType: string) => mimeType.startsWith("image/");

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "Unknown";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleSelect = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;
    const newSelection = new Set(selectedIds);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    onSelectionChange(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(new Set(media.map((m) => m.id)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const getImageUrl = (item: Media): string => {
    // If we have cloudinaryPublicId, construct the URL from it (more reliable)
    if (item.cloudinaryPublicId) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dfegnpgwx";
      const resourceType = item.mimeType.startsWith("image/") ? "image" : "video";
      const version = item.cloudinaryVersion || "";
      
      // Extract format from filename or mimeType
      let format = item.filename.split(".").pop() || "";
      if (!format) {
        // Fallback to mimeType
        format = item.mimeType.split("/")[1] || "png";
      }
      
      // Remove extension from cloudinaryPublicId if it exists (Cloudinary stores public_id without extension)
      let publicId = item.cloudinaryPublicId;
      const lastDot = publicId.lastIndexOf(".");
      if (lastDot > 0) {
        // Check if the part after the dot looks like a file extension
        const possibleExt = publicId.substring(lastDot + 1).toLowerCase();
        const validExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "mp4", "mov", "avi"];
        if (validExtensions.includes(possibleExt)) {
          publicId = publicId.substring(0, lastDot);
        }
      }
      
      // Construct Cloudinary URL: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
      if (version) {
        return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/v${version}/${publicId}.${format}`;
      } else {
        return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${publicId}.${format}`;
      }
    }
    
    // Fallback to stored URL (for old records or non-Cloudinary URLs)
    return item.url;
  };

  const copyUrl = async (item: Media) => {
    try {
      const urlToCopy = getImageUrl(item);
      await navigator.clipboard.writeText(urlToCopy);
      toast({
        title: "URL Copied",
        description: "Image URL has been copied to clipboard. You can now share it with clients.",
      });
    } catch (error) {
      console.error("Failed to copy URL:", error);
      toast({
        title: "Failed to copy",
        description: "Could not copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleReplaceImageClick = (item: Media) => {
    currentReplacingMedia.current = item;
    fileInputRef.current?.click();
  };

  const handleReplaceImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentReplacingMedia.current) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const media = currentReplacingMedia.current;
    setReplacingMediaId(media.id);

    // Validate file
    const error = validateFile(file);
    if (error) {
      toast({
        title: "File Error",
        description: error,
        variant: "destructive",
      });
      setReplacingMediaId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        toast({
          title: "Configuration Error",
          description: "Cloudinary configuration missing. Please check your environment variables.",
          variant: "destructive",
        });
        setReplacingMediaId(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const clientId = media.client?.id || "default";

      // Generate SEO-friendly public_id from existing alt text/title
      // Use altText, title, filename, or fallback to media ID
      const altText = media.altText?.trim() || "";
      const title = media.title?.trim() || "";
      let seoFileName = generateSEOFileName(
        altText,
        title,
        file.name,
        undefined
      );

      const folderPath = `clients/${clientId}`;
      let publicId = generateCloudinaryPublicId(seoFileName, folderPath);

      // If validation fails, try using media ID as fallback
      if (!isValidCloudinaryPublicId(publicId)) {
        seoFileName = generateSEOFileName(
          "",
          "",
          media.id,
          undefined
        );
        publicId = generateCloudinaryPublicId(seoFileName, folderPath);
        
        // If still invalid, use a simple fallback with ID
        if (!isValidCloudinaryPublicId(publicId)) {
          publicId = `${folderPath}/image-${media.id}`;
        }
      }

      // Upload to Cloudinary
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("upload_preset", uploadPreset);
      uploadFormData.append("public_id", publicId);
      uploadFormData.append("asset_folder", folderPath);

      const resourceType = "image"; // Only images for fast replace
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      if (!uploadResponse.ok) {
        const errorMessage = await getCloudinaryErrorMessage(uploadResponse);
        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setReplacingMediaId(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const uploadResult = await uploadResponse.json();
      const cloudinaryUrl = uploadResult.secure_url || uploadResult.url;
      const cloudinaryPublicId = uploadResult.public_id;

      const optimizedUrl = optimizeCloudinaryUrl(
        cloudinaryUrl,
        cloudinaryPublicId,
        uploadResult.format,
        resourceType
      );

      // Delete old Cloudinary asset if public_id exists
      if (media.cloudinaryPublicId) {
        const oldResourceType = media.mimeType.startsWith("image/") ? "image" : "video";
        const deleteResult = await deleteCloudinaryAsset(media.cloudinaryPublicId, oldResourceType);
        if (!deleteResult.success) {
          console.error("Failed to delete old Cloudinary asset:", deleteResult.error);
        }
      }

      // Update media record with new file details, keeping existing metadata
      const result = await updateMedia(media.id, {
        url: optimizedUrl,
        filename: file.name,
        mimeType: file.type,
        width: uploadResult.width || null,
        height: uploadResult.height || null,
        fileSize: uploadResult.bytes || file.size,
        encodingFormat: uploadResult.format || undefined,
        cloudinaryPublicId: cloudinaryPublicId,
        cloudinaryVersion: uploadResult.version?.toString(),
        cloudinarySignature: uploadResult.signature,
        // Preserve existing metadata
        type: media.type,
        altText: media.altText || undefined,
        title: media.title || undefined,
        description: media.description || undefined,
      });

      if (result.success) {
        toast({
          title: "Image Replaced",
          description: "Image has been replaced successfully.",
        });
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to update media");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to replace image",
        variant: "destructive",
      });
    } finally {
      setReplacingMediaId(null);
      currentReplacingMedia.current = null;
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };


  if (viewMode === "list") {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleReplaceImageFileChange}
          className="hidden"
        />
        <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 font-medium text-sm">
              <div className="col-span-1">
                {onSelectionChange && (
                  <Checkbox
                    checked={selectedIds.size === media.length && media.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                )}
              </div>
              <div className="col-span-2">Preview</div>
              <div className="col-span-2">Filename</div>
              <div className="col-span-1">SEO</div>
              <div className="col-span-2">Client</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Size</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Rows */}
            {media.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 transition-colors items-center"
              >
                <div className="col-span-1">
                  {onSelectionChange && (
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={(checked) => handleSelect(item.id, checked as boolean)}
                    />
                  )}
                </div>
                <div className="col-span-2">
                  {isImage(item.mimeType) ? (
                    <div className="relative w-16 h-16 rounded overflow-hidden">
                      <NextImage
                        src={item.url}
                        alt={item.altText || item.filename}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        {item.mimeType.split("/")[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <Link
                    href={`/media/${item.id}`}
                    className="font-medium text-sm hover:text-primary transition-colors underline"
                  >
                    {item.filename}
                  </Link>
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  {isImage(item.mimeType) && (
                    <SEOHealthGauge
                      data={{
                        altText: item.altText,
                        title: item.title,
                        description: item.description,
                        // Keywords removed from SEO scoring - they should be naturally in alt text, title, description
                        width: item.width,
                        height: item.height,
                        filename: item.filename,
                        cloudinaryPublicId: item.cloudinaryPublicId,
                      }}
                      config={mediaSEOConfig}
                      size="xs"
                      showScore={false}
                    />
                  )}
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">
                    {item.client?.name || "Unknown"}
                  </span>
                </div>
                <div className="col-span-1">
                  <div className="flex flex-col gap-1">
                    <Badge variant={getMediaTypeBadgeVariant(item.type)} className="text-xs">
                      {getMediaTypeLabel(item.type)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {item.mimeType.split("/")[0]}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-1">
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(item.fileSize)}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  {isImage(item.mimeType) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleReplaceImageClick(item);
                            }}
                            disabled={replacingMediaId === item.id}
                            className="h-8 w-8 p-0"
                          >
                            {replacingMediaId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Replace Image</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/media/${item.id}/edit`);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      disabled={isDeleting}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </>
    );
  }

  // Grid View
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceImageFileChange}
        className="hidden"
      />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {media.map((item) => (
        <Card
          key={item.id}
          className="hover:shadow-lg transition-all duration-200 h-full relative group overflow-hidden border-border/50"
        >
          <CardContent className="p-0">
            {isImage(item.mimeType) ? (
              <div className="aspect-square relative overflow-hidden bg-muted">
                <NextImage
                  src={item.url}
                  alt={item.altText || item.filename}
                  fill
                  className="object-cover"
                />
                
                {/* Badges Overlay - Top Right */}
                <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
                  <Badge 
                    variant={getMediaTypeBadgeVariant(item.type)} 
                    className="text-xs shadow-md backdrop-blur-sm bg-background/90 border border-border/50"
                  >
                    {getMediaTypeLabel(item.type)}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="text-xs shadow-md backdrop-blur-sm bg-background/90 border border-border/50"
                  >
                    {item.mimeType.split("/")[0]}
                  </Badge>
                </div>

              </div>
            ) : (
              <div className="aspect-square bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">{item.mimeType}</span>
              </div>
            )}
            
            {/* Card Footer - Clear and Organized */}
            <div className="p-3 border-t bg-card space-y-3">
              {/* Filename with Checkbox and SEO Gauge */}
              <div className="flex items-center gap-2">
                {onSelectionChange && (
                  <Checkbox
                    checked={selectedIds.has(item.id)}
                    onCheckedChange={(checked) => handleSelect(item.id, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <Link
                  href={`/media/${item.id}`}
                  className="flex-1"
                >
                  <p className="font-medium text-sm line-clamp-1 hover:text-primary transition-colors">
                    {item.filename}
                  </p>
                </Link>
                {isImage(item.mimeType) && (
                  <SEOHealthGauge
                    data={{
                      altText: item.altText,
                      title: item.title,
                      description: item.description,
                      width: item.width,
                      height: item.height,
                      filename: item.filename,
                      cloudinaryPublicId: item.cloudinaryPublicId,
                    }}
                    config={mediaSEOConfig}
                    size="xs"
                    showScore={false}
                  />
                )}
              </div>
              
              {/* Metadata - Two Rows for Clarity */}
              <div className="space-y-1.5">
                {/* Row 1: Technical Info */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {item.width && item.height && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Size:</span>
                      <span>{item.width} × {item.height}px</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="font-medium">File:</span>
                    <span>{formatFileSize(item.fileSize)}</span>
                  </div>
                </div>
                
                {/* Row 2: Client */}
                {item.client && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                          <span className="font-medium">Client:</span>
                          <span className="truncate">{item.client.name}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.client.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {/* Row 3: Date */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="font-medium">Date:</span>
                  <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>

              {/* Action Buttons - Always Visible */}
              <div className="flex items-center gap-1 pt-2 border-t">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(item.url, "_blank");
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View in new tab</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          copyUrl(item);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy URL</p>
                    </TooltipContent>
                  </Tooltip>

                  {isImage(item.mimeType) && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleReplaceImageClick(item);
                          }}
                          disabled={replacingMediaId === item.id}
                        >
                          {replacingMediaId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Replace Image</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(`/media/${item.id}/edit`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit</p>
                    </TooltipContent>
                  </Tooltip>

                  {onDelete && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDelete(item.id);
                          }}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    </>
  );
}

