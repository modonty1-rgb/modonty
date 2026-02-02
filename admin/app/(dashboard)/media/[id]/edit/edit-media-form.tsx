"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FileText, MapPin, User, CheckCircle2, ArrowLeft, AlertCircle, XCircle, Info, Lightbulb, ChevronDown, ChevronUp, Upload, X } from "lucide-react";
import { updateMedia, renameCloudinaryAsset, deleteCloudinaryAsset } from "../../actions/media-actions";
import { useToast } from "@/hooks/use-toast";
import NextImage from "next/image";
import { PageHeader } from "@/components/shared/page-header";
import { generateSEOFileName, generateCloudinaryPublicId, isValidCloudinaryPublicId } from "@/lib/utils/image-seo";
import { optimizeCloudinaryUrl } from "@/lib/utils/image-seo";
import { SEOHealthGauge } from "@/components/shared/seo-doctor/seo-health-gauge";
import { mediaSEOConfig } from "../../helpers/media-seo-config";
import { MediaType } from "@prisma/client";
import { validateFile } from "../../components/upload-zone/utils/file-validation";
import { getCloudinaryErrorMessage } from "../../components/upload-zone/utils/error-handler";

interface Media {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  altText: string | null;
  title: string | null;
  description: string | null;
  caption: string | null;
  credit: string | null;
  license: string | null;
  creator: string | null;
  dateCreated: Date | null;
  geoLatitude: number | null;
  geoLongitude: number | null;
  geoLocationName: string | null;
  contentLocation: string | null;
  exifData: Record<string, unknown> | null;
  cloudinaryPublicId: string | null;
  type: MediaType;
  client?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface EditMediaFormProps {
  media: Media;
}

export function EditMediaForm({ media }: EditMediaFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    type: media.type || ("GENERAL" as MediaType),
    altText: media.altText || "",
    title: media.title || "",
    description: media.description || "",
    caption: media.caption || "",
    credit: media.credit || "",
    license: media.license || "",
    creator: media.creator || "",
    dateCreated: media.dateCreated
      ? new Date(media.dateCreated).toISOString().split("T")[0]
      : "",
    geoLatitude: media.geoLatitude?.toString() || "",
    geoLongitude: media.geoLongitude?.toString() || "",
    geoLocationName: media.geoLocationName || "",
    contentLocation: media.contentLocation || "",
  });

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast({
        title: "File Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const preview = URL.createObjectURL(file);
    setNewFile(file);
    setPreviewUrl(preview);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setNewFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {

      // Convert dateCreated string to Date object
      const dateCreated = formData.dateCreated
        ? new Date(formData.dateCreated)
        : undefined;

      // Validate and convert GPS coordinates
      let geoLatitude: number | undefined;
      let geoLongitude: number | undefined;

      if (formData.geoLatitude.trim()) {
        const lat = parseFloat(formData.geoLatitude.trim());
        if (isNaN(lat) || lat < -90 || lat > 90) {
          toast({
            title: "Invalid Latitude",
            description: "Latitude must be a number between -90 and 90.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
        geoLatitude = lat;
      }

      if (formData.geoLongitude.trim()) {
        const lng = parseFloat(formData.geoLongitude.trim());
        if (isNaN(lng) || lng < -180 || lng > 180) {
          toast({
            title: "Invalid Longitude",
            description: "Longitude must be a number between -180 and 180.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
        geoLongitude = lng;
      }

      let newCloudinaryPublicId = media.cloudinaryPublicId || undefined;
      let newCloudinaryUrl = media.url;
      let newCloudinaryVersion = undefined;
      let newCloudinarySignature = undefined;
      let newFilename = media.filename;
      let newMimeType = media.mimeType;
      let newWidth = media.width;
      let newHeight = media.height;
      let newFileSize = undefined;
      let newEncodingFormat = undefined;

      // If a new file is selected, upload it to Cloudinary first
      if (newFile) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
          toast({
            title: "Configuration Error",
            description: "Cloudinary configuration missing. Please check your environment variables.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        const clientId = media.client?.id || "default";

        // Generate SEO-friendly public_id from alt text/title
        const seoFileName = generateSEOFileName(
          formData.altText.trim() || "",
          formData.title.trim() || "",
          newFile.name,
          undefined
        );

        const folderPath = `clients/${clientId}`;
        const publicId = generateCloudinaryPublicId(seoFileName, folderPath);

        if (!isValidCloudinaryPublicId(publicId)) {
          toast({
            title: "Validation Error",
            description: "Generated filename is invalid. Please check your alt text or title.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        try {
          const uploadFormData = new FormData();
          uploadFormData.append("file", newFile);
          uploadFormData.append("upload_preset", uploadPreset);
          uploadFormData.append("public_id", publicId);
          uploadFormData.append("asset_folder", folderPath);

          const resourceType = newFile.type.startsWith("image/") ? "image" : "video";
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
            setIsSaving(false);
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

          newCloudinaryPublicId = cloudinaryPublicId;
          newCloudinaryUrl = optimizedUrl;
          newCloudinaryVersion = uploadResult.version?.toString();
          newCloudinarySignature = uploadResult.signature;
          newFilename = newFile.name;
          newMimeType = newFile.type;
          newWidth = uploadResult.width || null;
          newHeight = uploadResult.height || null;
          newFileSize = uploadResult.bytes || newFile.size;
          newEncodingFormat = uploadResult.format || undefined;

          // Delete old Cloudinary asset if public_id exists
          if (media.cloudinaryPublicId) {
            const oldResourceType = media.mimeType.startsWith("image/") ? "image" : "video";
            const deleteResult = await deleteCloudinaryAsset(media.cloudinaryPublicId, oldResourceType);
            if (!deleteResult.success) {
              console.error("Failed to delete old Cloudinary asset:", deleteResult.error);
            }
          }
        } catch (error) {
          toast({
            title: "Upload Failed",
            description: error instanceof Error ? error.message : "Failed to upload file to Cloudinary",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      }

      // Check if alt text or title changed - if so, rename Cloudinary asset (only if no new file was uploaded)
      if (!newFile) {
        const originalAltText = media.altText || "";
        const originalTitle = media.title || "";
        const altTextChanged = formData.altText.trim() !== originalAltText;
        const titleChanged = formData.title.trim() !== originalTitle;

        // If alt text or title changed, and we have a Cloudinary public_id, rename the asset
        if ((altTextChanged || titleChanged) && media.cloudinaryPublicId) {
        // Use client ID for folder organization (immutable, stable)
        const clientId = media.client?.id || "default";

        // Extract unique suffix from old public_id if it exists
        // Format: clients/clientId/filename-uniquesuffix
        const oldPublicIdParts = media.cloudinaryPublicId.split('/');
        const oldFileName = oldPublicIdParts[oldPublicIdParts.length - 1];
        const oldSuffixMatch = oldFileName.match(/-([a-z0-9]{8,})$/);
        const existingSuffix = oldSuffixMatch ? oldSuffixMatch[1] : null;

        // Generate new SEO-friendly public_id from updated alt text/title
        // Use ensureUnique: false to generate without suffix, then add existing suffix if available
        let seoFileName = generateSEOFileName(
          formData.altText.trim() || "",
          formData.title.trim() || "",
          media.filename,
          undefined, // No client slug in filename (folder structure handles organization)
          false // Don't add new unique suffix
        );

        // If we have an existing suffix, reuse it to maintain the same unique identifier
        if (existingSuffix) {
          seoFileName = `${seoFileName}-${existingSuffix}`;
        } else {
          // If no existing suffix, generate a new one
          seoFileName = generateSEOFileName(
            formData.altText.trim() || "",
            formData.title.trim() || "",
            media.filename,
            undefined, // No client slug in filename
            true // Add new unique suffix
          );
        }

        // Use client ID for folder structure (consistent with upload logic)
        const folderPath = `clients/${clientId}`;
        const newPublicId = generateCloudinaryPublicId(seoFileName, folderPath);

        // Only rename if the new public_id is different
        if (newPublicId !== media.cloudinaryPublicId) {
          const resourceType = media.mimeType.startsWith("image/") ? "image" : "video";
          const renameResult = await renameCloudinaryAsset(
            media.cloudinaryPublicId,
            newPublicId,
            resourceType
          );

          if (renameResult.success && renameResult.newPublicId) {
            newCloudinaryPublicId = renameResult.newPublicId;
            newCloudinaryUrl = renameResult.newUrl || media.url;
            
            toast({
              title: "Cloudinary asset renamed",
              description: `File renamed to: ${renameResult.newPublicId}`,
            });
          } else {
            // If rename fails, continue with database update but show warning
            toast({
              title: "Warning",
              description: renameResult.error || "Could not rename file in Cloudinary, but database was updated.",
              variant: "destructive",
            });
          }
        }
        }
      }

      const result = await updateMedia(media.id, {
        type: formData.type,
        altText: formData.altText.trim(),
        title: formData.title.trim() || undefined,
        description: formData.description.trim() || undefined,
        caption: formData.caption.trim() || undefined,
        credit: formData.credit.trim() || undefined,
        license: formData.license.trim() || undefined,
        creator: formData.creator.trim() || undefined,
        dateCreated: dateCreated,
        geoLatitude: geoLatitude,
        geoLongitude: geoLongitude,
        geoLocationName: formData.geoLocationName.trim() || undefined,
        contentLocation: formData.contentLocation.trim() || undefined,
        exifData: media.exifData || undefined,
        cloudinaryPublicId: newCloudinaryPublicId,
        cloudinaryVersion: newCloudinaryVersion,
        cloudinarySignature: newCloudinarySignature,
        ...(newCloudinaryUrl !== media.url ? { url: newCloudinaryUrl } : {}),
        ...(newFilename !== media.filename ? { filename: newFilename } : {}),
        ...(newMimeType !== media.mimeType ? { mimeType: newMimeType } : {}),
        ...(newWidth !== media.width ? { width: newWidth ?? undefined } : {}),
        ...(newHeight !== media.height ? { height: newHeight ?? undefined } : {}),
        ...(newFileSize !== undefined ? { fileSize: newFileSize } : {}),
        ...(newEncodingFormat !== undefined ? { encodingFormat: newEncodingFormat } : {}),
      });

      if (result.success) {
        toast({
          title: "Media updated",
          description: "Media metadata has been updated successfully.",
        });
        router.push("/media");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to update media");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update media",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isImage = media.mimeType.startsWith("image/");
  const hasAttributionData = formData.license || formData.creator || formData.dateCreated;
  const hasLocationData = formData.geoLatitude || formData.geoLongitude || formData.geoLocationName || formData.contentLocation;

  const seoData = useMemo(() => ({
    altText: formData.altText,
    title: formData.title,
    description: formData.description,
    // Keywords removed from SEO scoring - they should be naturally in alt text, title, description
    width: media.width,
    height: media.height,
    filename: media.filename,
    cloudinaryPublicId: media.cloudinaryPublicId,
  }), [formData, media]);

  const seoFieldDetails = useMemo(() => {
    const details: Array<{ field: string; status: "good" | "warning" | "error" | "info"; message: string; score: number; maxScore: number; fieldName: string }> = [];
    for (const fieldConfig of mediaSEOConfig.fields) {
      const value = seoData[fieldConfig.name as keyof typeof seoData];
      const result = fieldConfig.validator(value, seoData);
      
      let maxFieldScore = 10;
      if (fieldConfig.name === "altText") {
        maxFieldScore = 25;
      } else if (fieldConfig.name === "title" || fieldConfig.name === "description") {
        maxFieldScore = 15;
      }
      
      details.push({
        field: fieldConfig.label,
        status: result.status,
        message: result.message,
        score: result.score,
        maxScore: maxFieldScore,
        fieldName: fieldConfig.name,
      });
    }
    return details;
  }, [seoData]);

  const fieldsNeedingImprovement = seoFieldDetails.filter(f => f.score < f.maxScore);
  const totalScore = seoFieldDetails.reduce((sum, f) => sum + f.score, 0);
  const maxTotalScore = seoFieldDetails.reduce((sum, f) => sum + f.maxScore, 0);
  const scorePercentage = Math.round((totalScore / maxTotalScore) * 100);
  const [isTipsOpen, setIsTipsOpen] = useState(true);

  return (
    <div className="container mx-auto max-w-[1128px] space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/media")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Media Library
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Edit Media"
          description="Update SEO metadata and advanced fields for this media file"
        />
        {isImage && (
          <div className="flex flex-col items-end gap-2">
            <Label className="text-xs text-muted-foreground">SEO Score</Label>
            <SEOHealthGauge
              data={seoData}
              config={mediaSEOConfig}
              size="md"
              showScore={true}
            />
          </div>
        )}
      </div>

      {/* SEO Tips Section - Show when score is not 100% */}
      {isImage && scorePercentage < 100 && fieldsNeedingImprovement.length > 0 && (
        <Collapsible open={isTipsOpen} onOpenChange={setIsTipsOpen}>
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto hover:bg-transparent"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Lightbulb className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-left">
                      <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                        SEO Score: {scorePercentage}% - {100 - scorePercentage} points missing
                      </h4>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                        To reach 100%, improve these fields:
                      </p>
                    </div>
                  </div>
                  {isTipsOpen ? (
                    <ChevronUp className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="space-y-2">
                  {fieldsNeedingImprovement.map((field, index) => {
                    const getStatusIcon = () => {
                      switch (field.status) {
                        case "good":
                          return <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />;
                        case "warning":
                          return <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />;
                        case "error":
                          return <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />;
                        default:
                          return <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
                      }
                    };
                    const pointsLost = field.maxScore - field.score;
                    return (
                      <div key={index} className="flex items-start gap-2 text-sm bg-white dark:bg-gray-900 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                        {getStatusIcon()}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-medium text-yellow-900 dark:text-yellow-100">
                              {field.field}
                            </span>
                            <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 whitespace-nowrap">
                              -{pointsLost} points ({field.score}/{field.maxScore})
                            </span>
                          </div>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            {field.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Essential Information Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Preview - Left Column */}
              {isImage && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Preview</Label>
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isSaving}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSaving}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Replace Image
                      </Button>
                      {newFile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveFile}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-muted/50 sticky top-4 space-y-3">
                    <div className="relative">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={formData.altText || media.filename}
                          className="max-w-full h-auto max-h-96 mx-auto rounded"
                        />
                      ) : (
                        <NextImage
                          src={media.url}
                          alt={formData.altText || media.filename}
                          width={media.mimeType.includes("svg") ? 400 : 400}
                          height={media.mimeType.includes("svg") ? 400 : 400}
                          className="max-w-full h-auto max-h-96 mx-auto rounded"
                          unoptimized
                        />
                      )}
                    </div>
                    {media.width && media.height && (
                      <div className="flex items-start gap-1.5 p-2 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                        <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                          <span className="font-medium">SEO Dimensions:</span> Current {media.width}×{media.height}px. Optimal: 1200×800px+ (10 points)
                          {newFile && " (new image will update dimensions after upload)"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Essential Fields - Right Column */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-4">Essential Information</h4>
                </div>
                
                {/* Media Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Media Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as MediaType })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select media type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="LOGO">Logo</SelectItem>
                      <SelectItem value="POST">Post (Article Featured Image)</SelectItem>
                      <SelectItem value="OGIMAGE">OG Image (Open Graph)</SelectItem>
                      <SelectItem value="TWITTER_IMAGE">Twitter Image</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Categorize this media for better organization and filtering
                  </p>
                </div>
                
                {/* Alt Text - Required */}
                <div className="space-y-2">
                  <Label htmlFor="altText">
                    Alt Text <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="altText"
                    placeholder="Describe the image for SEO and accessibility..."
                    value={formData.altText}
                    onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                    rows={3}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Required. Describe what the image shows for search engines and screen readers.
                  </p>
                  <div className="flex items-start gap-1.5 p-2 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      <span className="font-medium">SEO:</span> 5-125 characters for optimal score (25 points). Current: {formData.altText.trim().length} chars
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Image title (optional)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <div className="flex items-start gap-1.5 p-2 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      <span className="font-medium">SEO:</span> Required for Schema.org ImageObject (15 points)
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                  <div className="flex items-start gap-1.5 p-2 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      <span className="font-medium">SEO:</span> 50-160 characters for optimal score (15 points). Current: {formData.description.trim().length} chars
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Metadata Section */}
        <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <FileText className="h-4 w-4" />
                      <h4 className="text-sm font-semibold">Basic Metadata</h4>
                      {(formData.caption || formData.credit) && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                      )}
                    </div>
                    
                    {/* Caption */}
                    <div className="space-y-2">
                      <Label htmlFor="caption">Caption</Label>
                      <Textarea
                        id="caption"
                        placeholder="Image caption (optional)"
                        value={formData.caption}
                        onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                        rows={2}
                      />
                    </div>

                    {/* Credit */}
                    <div className="space-y-2">
                      <Label htmlFor="credit">Credit</Label>
                      <Input
                        id="credit"
                        placeholder="Photo credit or attribution (optional)"
                        value={formData.credit}
                        onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
                      />
                    </div>

                  </div>
                </CardContent>
        </Card>

        {/* Attribution & License Section */}
        <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <User className="h-4 w-4" />
                      <h4 className="text-sm font-semibold">Attribution & License</h4>
                      {hasAttributionData && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                      )}
                    </div>

                    {/* License */}
                    <div className="space-y-2">
                      <Label htmlFor="license">License</Label>
                      <Select
                        value={formData.license}
                        onValueChange={(value) => setFormData({ ...formData, license: value })}
                      >
                        <SelectTrigger id="license">
                          <SelectValue placeholder="Select a license (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CC0">CC0 - Public Domain Dedication</SelectItem>
                          <SelectItem value="CC-BY">CC-BY - Attribution</SelectItem>
                          <SelectItem value="CC-BY-SA">CC-BY-SA - Attribution-ShareAlike</SelectItem>
                          <SelectItem value="CC-BY-NC">CC-BY-NC - Attribution-NonCommercial</SelectItem>
                          <SelectItem value="Commercial">Commercial License</SelectItem>
                          <SelectItem value="All Rights Reserved">All Rights Reserved</SelectItem>
                          <SelectItem value="Public Domain">Public Domain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Creator */}
                    <div className="space-y-2">
                      <Label htmlFor="creator">Creator/Author</Label>
                      <Input
                        id="creator"
                        placeholder="Name of the image creator or author (optional)"
                        value={formData.creator}
                        onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                      />
                    </div>

                    {/* Date Created */}
                    <div className="space-y-2">
                      <Label htmlFor="dateCreated">Date Created</Label>
                      <Input
                        id="dateCreated"
                        type="date"
                        value={formData.dateCreated}
                        onChange={(e) => setFormData({ ...formData, dateCreated: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Date when the image was created.
                      </p>
                    </div>
                  </div>
                </CardContent>
        </Card>

        {/* Location Information Section */}
        <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <MapPin className="h-4 w-4" />
                      <h4 className="text-sm font-semibold">Location Information</h4>
                      {hasLocationData && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                      )}
                    </div>

                    {/* Geographic Location */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Geographic Location</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          GPS coordinates and location name.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="geoLatitude">Latitude</Label>
                          <Input
                            id="geoLatitude"
                            type="number"
                            step="any"
                            min="-90"
                            max="90"
                            placeholder="e.g., 40.7128"
                            value={formData.geoLatitude}
                            onChange={(e) => setFormData({ ...formData, geoLatitude: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="geoLongitude">Longitude</Label>
                          <Input
                            id="geoLongitude"
                            type="number"
                            step="any"
                            min="-180"
                            max="180"
                            placeholder="e.g., -74.0060"
                            value={formData.geoLongitude}
                            onChange={(e) => setFormData({ ...formData, geoLongitude: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="geoLocationName">Location Name</Label>
                        <Input
                          id="geoLocationName"
                          placeholder="e.g., New York City, Central Park"
                          value={formData.geoLocationName}
                          onChange={(e) => setFormData({ ...formData, geoLocationName: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Human-readable location name
                        </p>
                      </div>
                    </div>

                    {/* Content Location */}
                    <div className="space-y-2 border-t pt-4">
                      <Label htmlFor="contentLocation">Content Location</Label>
                      <Input
                        id="contentLocation"
                        placeholder="Where the image was taken or what it shows (optional)"
                        value={formData.contentLocation}
                        onChange={(e) => setFormData({ ...formData, contentLocation: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Describe where the image was taken or what location it depicts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

        {/* Save Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={isSaving || !formData.altText.trim()}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/media")}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Marketing Value Explanation Section */}
      <Card className="mt-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Why This Data Matters for Marketing</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Understanding how each field impacts your marketing ROI, search visibility, and user engagement.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Essential Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Essential Information
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium mb-1">Alt Text (Required)</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li><strong>SEO Impact:</strong> Direct ranking factor - helps images appear in Google Image Search</li>
                      <li><strong>Accessibility:</strong> Required by law (ADA/WCAG) - opens content to 15% of population</li>
                      <li><strong>User Experience:</strong> Displays when images fail to load, reducing bounce rate</li>
                      <li><strong>Marketing ROI:</strong> Images with proper alt text get 2x more organic traffic</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Title</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li><strong>Schema.org:</strong> Used in structured data for rich search results</li>
                      <li><strong>Social Sharing:</strong> Appears in link previews on Facebook, LinkedIn, Twitter</li>
                      <li><strong>User Experience:</strong> Tooltip on hover provides context</li>
                      <li><strong>SEO:</strong> Additional keyword opportunity for search engines</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Description</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li><strong>Meta Descriptions:</strong> Used in search result snippets (50-160 chars optimal)</li>
                      <li><strong>Social Media:</strong> Primary text in Open Graph previews</li>
                      <li><strong>Content Depth:</strong> Provides context that improves time-on-page metrics</li>
                      <li><strong>SEO:</strong> More indexed content = better ranking potential</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Basic Metadata */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Basic Metadata
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium mb-1">Caption</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li><strong>User Engagement:</strong> Read 300% more than body text - highest engagement element</li>
                      <li><strong>Bounce Rate:</strong> Reduces bounce rate by providing immediate context</li>
                      <li><strong>Schema.org:</strong> Included in ImageObject structured data</li>
                      <li><strong>Accessibility:</strong> Helps users with cognitive challenges understand images</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Credit</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li><strong>Legal Compliance:</strong> Required for copyrighted images - prevents lawsuits</li>
                      <li><strong>Trust & Credibility:</strong> Builds brand trust through proper attribution</li>
                      <li><strong>Structured Data:</strong> Google displays creditText in image search results</li>
                      <li><strong>Professionalism:</strong> Shows respect for creators, enhances brand reputation</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Attribution & License */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-600" />
                  Attribution & License
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium mb-1">License</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li><strong>Google Image Search:</strong> License filter helps users find reusable images</li>
                      <li><strong>Legal Protection:</strong> Clearly defines usage rights - prevents copyright issues</li>
                      <li><strong>Structured Data:</strong> Schema.org license property for rich results</li>
                      <li><strong>Content Reuse:</strong> Enables others to find and properly attribute your content</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Creator/Author</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li><strong>Attribution:</strong> Properly credits creators in Schema.org Person format</li>
                      <li><strong>E-E-A-T Signals:</strong> Shows expertise, authoritativeness, trustworthiness</li>
                      <li><strong>Brand Building:</strong> Builds creator reputation and portfolio visibility</li>
                      <li><strong>Legal Compliance:</strong> Required for many Creative Commons licenses</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Date Created</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li><strong>Content Freshness:</strong> Signals to Google that content is current</li>
                      <li><strong>Schema.org:</strong> dateCreated property for structured data</li>
                      <li><strong>Archive Management:</strong> Helps organize and filter content by date</li>
                      <li><strong>Copyright:</strong> Important for determining copyright duration</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Location & Technical */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  Location & Technical
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium mb-1">Geographic Location (GPS)</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li><strong>Local SEO:</strong> Enables location-based image search results</li>
                      <li><strong>Travel/Real Estate:</strong> Critical for location-specific content marketing</li>
                      <li><strong>Schema.org:</strong> GeoCoordinates in Place schema for local search</li>
                      <li><strong>User Intent:</strong> Helps users find images from specific locations</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Image Dimensions</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li><strong>Social Media:</strong> 1200×800px optimal for Facebook, LinkedIn, Twitter cards</li>
                      <li><strong>Page Speed:</strong> Proper dimensions prevent layout shifts (Core Web Vitals)</li>
                      <li><strong>Mobile Experience:</strong> Ensures images display correctly on all devices</li>
                      <li><strong>SEO:</strong> Schema.org width/height properties improve indexing</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Filename & Cloudinary ID</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li><strong>SEO-Friendly URLs:</strong> Descriptive filenames improve search rankings</li>
                      <li><strong>CDN Optimization:</strong> Organized folder structure improves delivery speed</li>
                      <li><strong>Brand Consistency:</strong> Consistent naming improves brand recognition</li>
                      <li><strong>Analytics:</strong> Better tracking and organization of image assets</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* ROI Summary */}
            <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Marketing ROI Impact
              </h4>
              <div className="grid gap-3 md:grid-cols-3 text-xs">
                <div>
                  <p className="font-medium mb-1">Search Visibility</p>
                  <p className="text-muted-foreground">
                    Complete metadata = 2-3x more image search traffic, better Google Image Search rankings
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">User Engagement</p>
                  <p className="text-muted-foreground">
                    Captions read 300% more than body text, reducing bounce rate by 15-25%
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Social Sharing</p>
                  <p className="text-muted-foreground">
                    Rich metadata = better link previews, 40% higher click-through rates on social platforms
                  </p>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground italic border-t pt-4">
              <p>
                <strong>Note:</strong> All metadata is automatically included in Schema.org structured data (JSON-LD), 
                making your images eligible for rich search results, Google Image Search features, and enhanced social media previews.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
