"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { messages } from "@/lib/messages";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Info, Copy, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SEOHealthGauge } from "@/components/shared/seo-doctor/seo-health-gauge";
import { mediaSEOConfig } from "../helpers/media-seo-config";
import { MediaType } from "@prisma/client";
import { getMediaTypeLabel } from "../helpers/media-utils";

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
  isUsed?: boolean;
  client?: {
    id: string;
    name: string;
    slug: string;
    logoMedia?: { url: string } | null;
  };
}

interface MediaGridProps {
  media: Media[];
  viewMode?: "grid" | "list";
  gridSize?: "compact" | "standard";
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function MediaGrid({
  media,
  viewMode = "grid",
  gridSize = "standard",
  onDelete,
  isDeleting = false,
}: MediaGridProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [infoMedia, setInfoMedia] = useState<Media | null>(null);

  const isImage = (mimeType: string) => mimeType.startsWith("image/");

  const copyUrl = async (item: Media) => {
    try {
      await navigator.clipboard.writeText(getImageUrl(item));
      toast({ title: messages.success.copied, description: messages.descriptions.media_copied, variant: "success" });
    } catch {
      toast({ title: messages.error.copy_failed, description: messages.descriptions.media_copy_failed, variant: "destructive" });
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "Unknown";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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




  // Group media by client (shared between list and grid)
  const groupedMedia = media.reduce<Record<string, { name: string; logoUrl: string | null; items: Media[] }>>((acc, item) => {
    const key = item.client?.id || "unknown";
    if (!acc[key]) {
      acc[key] = { name: item.client?.name || "Unknown", logoUrl: item.client?.logoMedia?.url || null, items: [] };
    }
    acc[key].items.push(item);
    return acc;
  }, {});
  const clientGroups = Object.values(groupedMedia);

  // Info dialog (shared between list and grid)
  const infoDialog = (
    <Dialog open={!!infoMedia} onOpenChange={(open) => { if (!open) setInfoMedia(null); }}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {infoMedia && (
          <div className="flex flex-col md:flex-row">
            {isImage(infoMedia.mimeType) && (
              <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto md:min-h-[360px] bg-black/90 flex items-center justify-center">
                <NextImage src={getImageUrl(infoMedia)} alt={infoMedia.altText || infoMedia.filename} fill className="object-contain p-4" sizes="400px" />
              </div>
            )}
            <div className="flex-1 p-5 space-y-5 overflow-y-auto max-h-[80vh]">
              <div>
                <DialogHeader className="p-0">
                  <DialogTitle className="text-base line-clamp-2">{infoMedia.filename}</DialogTitle>
                </DialogHeader>
                {infoMedia.altText && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3">{infoMedia.altText}</p>
                )}
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{getMediaTypeLabel(infoMedia.type)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium">{infoMedia.mimeType.split("/")[1]?.toUpperCase()}</span>
                </div>
                {infoMedia.width && infoMedia.height && (
                  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span className="font-medium">{infoMedia.width} × {infoMedia.height}px</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">File Size</span>
                  <span className="font-medium">{formatFileSize(infoMedia.fileSize)}</span>
                </div>
                {infoMedia.client && (
                  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Client</span>
                    <span className="font-medium">{infoMedia.client.name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{format(new Date(infoMedia.createdAt), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${infoMedia.isUsed ? "text-emerald-500" : "text-muted-foreground"}`}>
                    {infoMedia.isUsed ? "In Use" : "Unused"}
                  </span>
                </div>
                {isImage(infoMedia.mimeType) && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-muted-foreground">SEO Score</span>
                    <SEOHealthGauge
                      data={{ altText: infoMedia.altText, title: infoMedia.title, description: infoMedia.description, width: infoMedia.width, height: infoMedia.height, filename: infoMedia.filename, cloudinaryPublicId: infoMedia.cloudinaryPublicId }}
                      config={mediaSEOConfig}
                      size="sm"
                      showScore
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  if (viewMode === "list") {
    const listContent = (
        <div className="space-y-6">
          {clientGroups.map((group) => (
            <Collapsible key={group.name} defaultOpen>
              <CollapsibleTrigger asChild>
                <button type="button" className="flex items-center gap-3 w-full mb-2 pb-2 border-b hover:bg-muted/30 rounded-t px-1 -mx-1 transition-colors">
                  {group.logoUrl ? (
                    <div className="relative h-7 w-7 rounded-md overflow-hidden bg-muted shrink-0">
                      <NextImage src={group.logoUrl} alt={group.name} fill className="object-contain p-0.5" sizes="28px" />
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {group.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="text-sm font-semibold">{group.name}</h3>
                  <span className="text-xs text-muted-foreground">({group.items.length})</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground ms-auto transition-transform duration-200 group-data-[state=closed]:rotate-[-90deg]" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
              <div className="divide-y border rounded-lg overflow-hidden">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/30 transition-colors">
                    {/* Thumbnail */}
                    <div className="relative w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                      {isImage(item.mimeType) ? (
                        <NextImage src={item.url} alt={item.altText || item.filename} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[10px] text-muted-foreground">{item.mimeType.split("/")[1]}</div>
                      )}
                    </div>

                    {/* Name + alt text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.filename}</p>
                      {item.altText && <p className="text-[11px] text-muted-foreground truncate">{item.altText}</p>}
                    </div>

                    {/* Dimensions */}
                    {item.width && item.height && (
                      <span className="text-[11px] text-muted-foreground hidden md:block shrink-0">{item.width}×{item.height}</span>
                    )}

                    {/* Size */}
                    <span className="text-[11px] text-muted-foreground hidden sm:block shrink-0 w-16 text-end">{formatFileSize(item.fileSize)}</span>

                    {/* Type + Status badge */}
                    <div className="shrink-0 hidden lg:block">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${item.isUsed ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        {getMediaTypeLabel(item.type)}{item.isUsed ? " · In Use" : " · Unused"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button type="button" onClick={() => copyUrl(item)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Copy URL">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => setInfoMedia(item)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Details">
                        <Info className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => router.push(`/media/${item.id}/edit`)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      {onDelete && (
                        <button type="button" onClick={() => onDelete(item.id)} disabled={isDeleting} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
    );
    return <>{listContent}{infoDialog}</>;
  }

  const gridCols = gridSize === "compact"
    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2"
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3";

  // Grid View
  const gridContent = (
    <div className="space-y-8">
      {clientGroups.map((group) => (
        <Collapsible key={group.name} defaultOpen>
          <CollapsibleTrigger asChild>
            <button type="button" className="flex items-center gap-3 w-full mb-3 pb-2 border-b hover:bg-muted/30 rounded-t px-1 -mx-1 transition-colors">
              {group.logoUrl ? (
                <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-muted shrink-0">
                  <NextImage src={group.logoUrl} alt={group.name} fill className="object-contain p-0.5" sizes="32px" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold shrink-0">
                  {group.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0 text-start">
                <h3 className="text-sm font-semibold truncate">{group.name}</h3>
                <p className="text-[11px] text-muted-foreground">{group.items.length} files</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=closed]:rotate-[-90deg]" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
          <div className={gridCols}>
      {group.items.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden border-border/50 hover:border-primary/30 transition-colors"
        >
          <CardContent className="p-0">
            {/* Image */}
            <div className={`${gridSize === "compact" ? "aspect-square" : "aspect-[4/3]"} relative overflow-hidden bg-muted`}>
              {isImage(item.mimeType) ? (
                <NextImage
                  src={item.url}
                  alt={item.altText || item.filename}
                  fill
                  className="object-cover"
                  sizes={
                    gridSize === "compact"
                      ? "(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 17vw"
                      : "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
                  }
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-muted-foreground text-sm">{item.mimeType}</span>
                </div>
              )}

              {/* Corner badge */}
              <div className="absolute top-0 end-0 z-10">
                <div className={`px-2 py-1 rounded-es-lg text-[10px] font-medium backdrop-blur-md ${item.isUsed ? "bg-emerald-500/85 text-white" : "bg-black/60 text-white/90"}`}>
                  {getMediaTypeLabel(item.type)}
                </div>
              </div>
              {/* Usage dot */}
              <div className="absolute top-1.5 start-1.5 z-10">
                <div className={`h-2.5 w-2.5 rounded-full border-2 border-white/50 ${item.isUsed ? "bg-emerald-400" : "bg-zinc-400"}`} title={item.isUsed ? "In Use" : "Unused"} />
              </div>

            </div>

            {/* Footer with actions */}
            <div className={`flex items-center ${gridSize === "compact" ? "px-1.5 py-1" : "px-2 py-1.5"}`}>
              {gridSize === "standard" && item.width && item.height && (
                <span className="text-[10px] text-muted-foreground/60 me-auto">{item.width}×{item.height}</span>
              )}
              <div className="flex items-center gap-0.5 ms-auto">
                <button type="button" onClick={() => copyUrl(item)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Copy URL">
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setInfoMedia(item)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Details">
                  <Info className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => router.push(`/media/${item.id}/edit`)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                  <Edit className="h-3.5 w-3.5" />
                </button>
                {onDelete && (
                  <button type="button" onClick={() => onDelete(item.id)} disabled={isDeleting} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
          </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );

  return <>{gridContent}{infoDialog}</>;
}

