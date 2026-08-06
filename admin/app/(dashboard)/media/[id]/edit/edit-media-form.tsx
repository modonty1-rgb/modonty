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
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, X, Save } from "lucide-react";
import { updateMedia } from "../../actions/media-actions";
import { uploadImageToBunny } from "../../actions/upload-image-to-bunny";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import NextImage from "next/image";
import { MediaType, MediaScope } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@modonty/database/lib/utils";
import { getMediaSpec, requiresCrop } from "@/lib/media/media-specs";
import { validateFile } from "../../components/upload-zone/utils/file-validation";
import { ImageEditorModal } from "../../components/upload-zone/components/image-editor-modal";

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
  scope: MediaScope;
  client?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Client {
  id: string;
  name: string;
  slug: string;
}

interface EditMediaFormProps {
  media: Media;
  clients: Client[];
}

export function EditMediaForm({ media, clients }: EditMediaFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Crop editor for a replacement image — same locked editor as /media/upload.
  const [editorState, setEditorState] = useState<{ source: string; fileName: string } | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The role is fixed once uploaded — it dictates the locked crop ratio + size.
  const typeSpec = getMediaSpec(media.type);

  // Alt / title / description are NOT edited here — they belong to the writer-owned
  // "SEO Images" section (/seo-images). This form owns file management + rights only.
  const [formData, setFormData] = useState({
    type: media.type || ("GENERAL" as MediaType),
    credit: media.credit || "مدونتي",
    license: media.license || "All Rights Reserved",
    creator: media.creator || "",
    // PLATFORM scope removed (T2 decision 1) — legacy PLATFORM rows display as
    // General; saving one converts it (T2b later assigns real core ownership).
    clientId: media.client?.id || "none",
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
    if (file) processReplacement(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // A replacement image goes through the SAME locked editor as /media/upload —
  // fixed-ratio roles are cropped to spec + saved as WebP, no back door.
  const processReplacement = (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast({ title: messages.error.upload_failed, description: error, variant: "destructive" });
      return;
    }
    setOriginalSize(file.size);

    if (file.type.startsWith("image/") && requiresCrop(media.type)) {
      setEditorState({ source: URL.createObjectURL(file), fileName: file.name });
      return;
    }

    // Free role (GENERAL / GALLERY) or video → direct replace, as before.
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setNewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Editor produced the cropped WebP → it becomes the replacement file.
  const handleEditorSave = (croppedFile: File) => {
    setEditorState((prev) => {
      if (prev) URL.revokeObjectURL(prev.source);
      return null;
    });
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setNewFile(croppedFile);
    setPreviewUrl(URL.createObjectURL(croppedFile));
  };

  const handleEditorClose = () => {
    setEditorState((prev) => {
      if (prev) URL.revokeObjectURL(prev.source);
      return null;
    });
    setOriginalSize(0);
  };

  const handleRemoveFile = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setNewFile(null);
    setPreviewUrl(null);
    setOriginalSize(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let newUrl = media.url;
      let newBunnyUrl: string | undefined = undefined;
      let newBlurDataURL: string | null | undefined = undefined;
      let newFilename = media.filename;
      let newMimeType = media.mimeType;
      let newWidth = media.width;
      let newHeight = media.height;
      let newFileSize = undefined;
      let newEncodingFormat = undefined;

      const resolvedScope: MediaScope = formData.clientId === "none" ? "GENERAL" : "CLIENT";
      const resolvedClientId = formData.clientId === "none" ? null : formData.clientId;

      if (newFile) {
        // Bunny-primary (2026-07-29): replacement files upload straight to Bunny.
        if (!newFile.type.startsWith("image/")) {
          toast({ title: messages.error.upload_failed, description: "استبدال الفيديو غير مدعوم هنا — الفيديو عبر مسار الريلز.", variant: "destructive" });
          setIsSaving(false);
          return;
        }

        try {
          const uploadFormData = new FormData();
          uploadFormData.append("file", newFile);
          uploadFormData.append("filename", newFile.name);
          uploadFormData.append("type", formData.type);
          uploadFormData.append("scope", resolvedScope);
          if (resolvedClientId) uploadFormData.append("clientId", resolvedClientId);

          const uploadResult = await uploadImageToBunny(uploadFormData);
          if (!uploadResult.success || !uploadResult.url) {
            toast({ title: messages.error.upload_failed, description: uploadResult.error || "تعذّر رفع الملف إلى Bunny", variant: "destructive" });
            setIsSaving(false);
            return;
          }

          newUrl = uploadResult.url;
          newBunnyUrl = uploadResult.url; // keep bunnyUrl in sync — else a stale bunnyUrl shows the OLD image
          newFilename = newFile.name;
          newMimeType = newFile.type;
          newWidth = uploadResult.width || null;
          newHeight = uploadResult.height || null;
          newFileSize = newFile.size;
          newEncodingFormat = uploadResult.format || undefined;
          // Replacing the file makes the stored placeholder describe an image that's gone.
          newBlurDataURL = uploadResult.blurDataURL ?? null;

          // NOTE (tripwire phase): the old flow deleted the previous Cloudinary asset here.
          // Deletion is intentionally STOPPED — Cloudinary stays untouched until the final
          // retirement phase (prod fallback may still serve the old asset).
        } catch (error) {
          toast({ title: messages.error.upload_failed, description: error instanceof Error ? error.message : "تعذّر رفع الملف", variant: "destructive" });
          setIsSaving(false);
          return;
        }
      }

      const result = await updateMedia(media.id, {
        scope: resolvedScope,
        type: formData.type,
        credit: formData.credit.trim() || undefined,
        creator: formData.creator.trim() || undefined,
        license: formData.license || undefined,
        clientId: resolvedClientId,
        ...(newUrl !== media.url ? { url: newUrl } : {}),
        ...(newBunnyUrl !== undefined ? { bunnyUrl: newBunnyUrl } : {}),
        ...(newBlurDataURL !== undefined ? { blurDataURL: newBlurDataURL } : {}),
        ...(newFilename !== media.filename ? { filename: newFilename } : {}),
        ...(newMimeType !== media.mimeType ? { mimeType: newMimeType } : {}),
        ...(newWidth !== media.width ? { width: newWidth ?? undefined } : {}),
        ...(newHeight !== media.height ? { height: newHeight ?? undefined } : {}),
        ...(newFileSize !== undefined ? { fileSize: newFileSize } : {}),
        ...(newEncodingFormat !== undefined ? { encodingFormat: newEncodingFormat } : {}),
      });

      if (result.success) {
        toast({ title: messages.success.updated, description: messages.descriptions.media_metadata_updated, variant: "success" });
        router.refresh();
        router.push("/media");
      } else {
        throw new Error(result.error || "Failed to update media");
      }
    } catch (error) {
      toast({ title: messages.error.update_failed, description: error instanceof Error ? error.message : "تعذّر تحديث بيانات الملف", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const isImage = media.mimeType.startsWith("image/");

  return (
    <div className="max-w-[1200px] mx-auto space-y-4 px-6 py-6">
      {/* Full-screen locked crop editor for a replacement image */}
      {editorState && (
        <ImageEditorModal
          source={editorState.source}
          mediaType={media.type}
          fileName={editorState.fileName}
          originalSize={originalSize}
          onSave={handleEditorSave}
          onClose={handleEditorClose}
        />
      )}

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
                {/* Media Role — fixed (the role dictates the locked crop ratio/size) */}
                <div className="space-y-2">
                  <Label>Media Role</Label>
                  <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                    <span className="text-sm font-semibold">{typeSpec.label}</span>
                    {typeSpec.width && typeSpec.height && (
                      <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-primary">
                        {typeSpec.width}×{typeSpec.height}
                      </code>
                    )}
                    <Badge variant="outline" className="border-primary/40 text-[11px] text-primary">
                      {typeSpec.ratioLabel}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{typeSpec.formats}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {requiresCrop(media.type)
                      ? "Fixed role. Replacing the image re-crops to this ratio and saves as WebP."
                      : "Free role. Replacing the image keeps its original size."}
                  </p>
                </div>

                {/* Client */}
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                  >
                    <SelectTrigger id="clientId">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">General (no client)</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Assigns this image to a client. General images appear in all client media pickers.
                  </p>
                </div>

                {/* Alt text, title & description moved to the writer-owned SEO Images section. */}
                <div className="rounded-md border border-dashed bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                  Alt text, title &amp; description are edited in{" "}
                  <span className="font-semibold text-foreground">SEO Images</span> — owned by the
                  content writer, not here.
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
                          <NextImage
                            src={previewUrl}
                            alt={media.altText || media.filename}
                            width={400}
                            height={224}
                            className="w-full h-auto max-h-56 object-contain"
                            sizes="400px"
                            unoptimized
                          />
                        ) : (
                          <NextImage
                            src={media.url}
                            alt={media.altText || media.filename}
                            width={400}
                            height={400}
                            priority
                            className="w-full h-auto max-h-56 object-contain"
                            unoptimized
                          />
                        )}
                      </div>
                      {media.width && media.height && !newFile && (
                        <p className="text-xs text-muted-foreground text-center">
                          {media.width} × {media.height}px
                        </p>
                      )}
                      {newFile && originalSize > 0 && (
                        newFile.type === "image/webp" ? (
                          <div className="flex flex-wrap items-center justify-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-xs">
                            <span className="text-muted-foreground">Original {formatBytes(originalSize)}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-semibold">WebP {formatBytes(newFile.size)}</span>
                            {newFile.size < originalSize && (
                              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                −{Math.round((1 - newFile.size / originalSize) * 100)}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-center text-xs text-muted-foreground">
                            New file: {formatBytes(newFile.size)}
                          </p>
                        )
                      )}
                    </>
                  )}

                  {/* Save */}
                  <div className="space-y-2 pt-2 border-t">
                    <Button type="submit" className="w-full gap-1.5" disabled={isSaving}>
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
