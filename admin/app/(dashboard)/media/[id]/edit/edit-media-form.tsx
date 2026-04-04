"use client";

import { useState, useRef, useEffect } from "react";
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
import { ArrowLeft, Upload, X, Save } from "lucide-react";
import { updateMedia, renameCloudinaryAsset, deleteCloudinaryAsset } from "../../actions/media-actions";
import { useToast } from "@/hooks/use-toast";
import NextImage from "next/image";
import { generateSEOFileName, generateCloudinaryPublicId, isValidCloudinaryPublicId, optimizeCloudinaryUrl } from "@/lib/utils/image-seo";
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
    credit: media.credit || "مدونتي",
    license: media.license || "All Rights Reserved",
    creator: media.creator || "",
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
      toast({ title: "File Error", description: error, variant: "destructive" });
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setNewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = "";
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

      if (newFile) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
          toast({ title: "Configuration Error", description: "Cloudinary configuration missing.", variant: "destructive" });
          setIsSaving(false);
          return;
        }

        const clientId = media.client?.id || "default";
        const seoFileName = generateSEOFileName(formData.altText.trim() || "", formData.title.trim() || "", newFile.name, undefined);
        const folderPath = `clients/${clientId}`;
        const publicId = generateCloudinaryPublicId(seoFileName, folderPath);

        if (!isValidCloudinaryPublicId(publicId)) {
          toast({ title: "Validation Error", description: "Generated filename is invalid.", variant: "destructive" });
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
            { method: "POST", body: uploadFormData }
          );

          if (!uploadResponse.ok) {
            const errorMessage = await getCloudinaryErrorMessage(uploadResponse);
            toast({ title: "Upload Failed", description: errorMessage, variant: "destructive" });
            setIsSaving(false);
            return;
          }

          const uploadResult = await uploadResponse.json();
          const cloudinaryUrl = uploadResult.secure_url || uploadResult.url;
          const cloudinaryPublicId = uploadResult.public_id;

          newCloudinaryPublicId = cloudinaryPublicId;
          newCloudinaryUrl = optimizeCloudinaryUrl(cloudinaryUrl, cloudinaryPublicId, uploadResult.format, resourceType);
          newCloudinaryVersion = uploadResult.version?.toString();
          newCloudinarySignature = uploadResult.signature;
          newFilename = newFile.name;
          newMimeType = newFile.type;
          newWidth = uploadResult.width || null;
          newHeight = uploadResult.height || null;
          newFileSize = uploadResult.bytes || newFile.size;
          newEncodingFormat = uploadResult.format || undefined;

          if (media.cloudinaryPublicId) {
            const oldResourceType = media.mimeType.startsWith("image/") ? "image" : "video";
            await deleteCloudinaryAsset(media.cloudinaryPublicId, oldResourceType);
          }
        } catch (error) {
          toast({ title: "Upload Failed", description: error instanceof Error ? error.message : "Failed to upload file", variant: "destructive" });
          setIsSaving(false);
          return;
        }
      }

      if (!newFile) {
        const originalAltText = media.altText || "";
        const originalTitle = media.title || "";
        const altTextChanged = formData.altText.trim() !== originalAltText;
        const titleChanged = formData.title.trim() !== originalTitle;

        if ((altTextChanged || titleChanged) && media.cloudinaryPublicId) {
          const clientId = media.client?.id || "default";
          const oldPublicIdParts = media.cloudinaryPublicId.split("/");
          const oldFileName = oldPublicIdParts[oldPublicIdParts.length - 1];
          const oldSuffixMatch = oldFileName.match(/-([a-z0-9]{8,})$/);
          const existingSuffix = oldSuffixMatch ? oldSuffixMatch[1] : null;

          let seoFileName = generateSEOFileName(formData.altText.trim() || "", formData.title.trim() || "", media.filename, undefined, false);

          if (existingSuffix) {
            seoFileName = `${seoFileName}-${existingSuffix}`;
          } else {
            seoFileName = generateSEOFileName(formData.altText.trim() || "", formData.title.trim() || "", media.filename, undefined, true);
          }

          const folderPath = `clients/${clientId}`;
          const newPublicId = generateCloudinaryPublicId(seoFileName, folderPath);

          if (newPublicId !== media.cloudinaryPublicId) {
            const resourceType = media.mimeType.startsWith("image/") ? "image" : "video";
            const renameResult = await renameCloudinaryAsset(media.cloudinaryPublicId, newPublicId, resourceType);

            if (renameResult.success && renameResult.newPublicId) {
              newCloudinaryPublicId = renameResult.newPublicId;
              newCloudinaryUrl = renameResult.newUrl || media.url;
            } else {
              toast({ title: "Warning", description: renameResult.error || "Could not rename file in Cloudinary.", variant: "destructive" });
            }
          }
        }
      }

      const result = await updateMedia(media.id, {
        type: formData.type,
        altText: formData.altText.trim(),
        title: formData.title.trim() || undefined,
        description: formData.description.trim() || undefined,
        credit: formData.credit.trim() || undefined,
        creator: formData.creator.trim() || undefined,
        license: formData.license || undefined,
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
        toast({ title: "Media updated", description: "Media metadata has been updated successfully." });
        router.refresh();
        router.push("/media");
      } else {
        throw new Error(result.error || "Failed to update media");
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update media", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const isImage = media.mimeType.startsWith("image/");

  return (
    <div className="max-w-[1200px] mx-auto space-y-4 px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/media")}>
          <ArrowLeft className="h-4 w-4 me-1.5" />
          Back
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold">Edit Media</h1>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {media.filename}{media.client ? ` · ${media.client.name}` : ""}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Form Fields (col-span-2) */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6 space-y-5">
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
                </div>

                {/* Alt Text */}
                <div className="space-y-2">
                  <Label htmlFor="altText">
                    Alt Text <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="altText"
                    placeholder="Describe the image content..."
                    value={formData.altText}
                    onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                    rows={3}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Helps search engines and visitors understand the image.
                  </p>
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
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

                {/* Creator */}
                <div className="space-y-2">
                  <Label htmlFor="creator">Creator</Label>
                  <Input
                    id="creator"
                    placeholder="Photographer or designer name (optional)"
                    value={formData.creator}
                    onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                  />
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
                      <SelectItem value="CC0">CC0 - Public Domain</SelectItem>
                      <SelectItem value="CC-BY">CC-BY - Attribution</SelectItem>
                      <SelectItem value="CC-BY-SA">CC-BY-SA - ShareAlike</SelectItem>
                      <SelectItem value="CC-BY-NC">CC-BY-NC - NonCommercial</SelectItem>
                      <SelectItem value="Commercial">Commercial License</SelectItem>
                      <SelectItem value="All Rights Reserved">All Rights Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT — Preview + Save (col-span-1, sticky) */}
          <div>
            <div className="lg:sticky lg:top-4 space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {/* Image Preview */}
                  {isImage && (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Preview</h3>
                        <div className="flex gap-1.5">
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
                            className="h-8 gap-1.5"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSaving}
                          >
                            <Upload className="h-3.5 w-3.5" />
                            Replace
                          </Button>
                          {newFile && (
                            <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0" onClick={handleRemoveFile} disabled={isSaving}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="rounded-lg overflow-hidden bg-muted/50 border">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt={formData.altText || media.filename}
                            className="w-full h-auto max-h-56 object-contain"
                          />
                        ) : (
                          <NextImage
                            src={media.url}
                            alt={formData.altText || media.filename}
                            width={400}
                            height={400}
                            className="w-full h-auto max-h-56 object-contain"
                            unoptimized
                          />
                        )}
                      </div>
                      {media.width && media.height && (
                        <p className="text-xs text-muted-foreground text-center">
                          {media.width} × {media.height}px
                        </p>
                      )}
                    </>
                  )}

                  {/* Save */}
                  <div className="space-y-2 pt-2 border-t">
                    <Button type="submit" className="w-full gap-1.5" disabled={isSaving || !formData.altText.trim()}>
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/media")}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
