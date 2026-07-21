"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { messages } from "@/lib/messages";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Info, Copy, ChevronDown, ImageOff, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkMediaCompliance } from "@/lib/media/media-specs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { computeMediaSeoScore } from "@modonty/database/lib/seo/media/seo-score";
import { SeoScoreBadge } from "@/components/shared/seo-score-badge";
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
  groupByClient?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function MediaGrid({
  media,
  viewMode = "grid",
  gridSize = "standard",
  groupByClient = false,
  onDelete,
  isDeleting = false,
}: MediaGridProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [infoMedia, setInfoMedia] = useState<Media | null>(null);

  const isImage = (mimeType: string) => mimeType.startsWith("image/");

  // Hosts allowed in next.config.ts → images.remotePatterns
  const isHostAllowed = (url: string): boolean => {
    try {
      const h = new URL(url).hostname;
      return (
        h === "images.unsplash.com" ||
        h.endsWith(".unsplash.com") ||
        h.endsWith(".cloudinary.com") ||
        h.endsWith(".amazonaws.com") ||
        h.endsWith(".googleapis.com")
      );
    } catch {
      return false;
    }
  };

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
        format = item.mimeType.split("/")[1] || "png";
      }

      // Remove extension from cloudinaryPublicId if it exists (Cloudinary stores public_id without extension)
      let publicId = item.cloudinaryPublicId;
      const lastDot = publicId.lastIndexOf(".");
      if (lastDot > 0) {
        const possibleExt = publicId.substring(lastDot + 1).toLowerCase();
        const validExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "mp4", "mov", "avi"];
        if (validExtensions.includes(possibleExt)) {
          publicId = publicId.substring(0, lastDot);
        }
      }

      if (version) {
        return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/v${version}/${publicId}.${format}`;
      } else {
        return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${publicId}.${format}`;
      }
    }

    // Fallback to stored URL (for old records or non-Cloudinary URLs)
    return item.url;
  };

  // Group media by client (used for the optional "Group by client" view)
  const groupedMedia = media.reduce<Record<string, { name: string; logoUrl: string | null; items: Media[] }>>((acc, item) => {
    const key = item.client?.id || "unknown";
    if (!acc[key]) {
      acc[key] = { name: item.client?.name || "General", logoUrl: item.client?.logoMedia?.url || null, items: [] };
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
            {isImage(infoMedia.mimeType) && isHostAllowed(getImageUrl(infoMedia)) && (
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
                {(() => {
                  const c = checkMediaCompliance(infoMedia);
                  return (
                    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-border/50">
                      <span className="shrink-0 text-muted-foreground">Spec</span>
                      {c.ok ? (
                        <span className="flex items-center gap-1 font-medium text-emerald-500">
                          <Check className="h-3.5 w-3.5" /> Compliant
                        </span>
                      ) : (
                        <span className="text-end font-medium text-red-500">{c.issues.join(" · ")}</span>
                      )}
                    </div>
                  );
                })()}
                {isImage(infoMedia.mimeType) && (() => {
                  // ONE image SEO score — the shared dataLayer SOT (computeMediaSeoScore),
                  // the same number the SEO Images section shows. No second local rubric.
                  const { score } = computeMediaSeoScore({
                    altText: infoMedia.altText,
                    description: infoMedia.description,
                    width: infoMedia.width,
                    height: infoMedia.height,
                    filename: infoMedia.filename,
                    cloudinaryPublicId: infoMedia.cloudinaryPublicId,
                    type: infoMedia.type,
                  });
                  return (
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-muted-foreground">SEO Score</span>
                      <SeoScoreBadge score={score} size="sm" />
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  // ---- LIST VIEW ---------------------------------------------------------
  if (viewMode === "list") {
    const rows = (items: Media[]) => (
      <div className="divide-y border rounded-lg overflow-hidden bg-card">
        {items.map((item) => {
          const c = checkMediaCompliance(item);
          return (
          <div key={item.id} className={`flex items-center gap-3 px-3 py-2 transition-colors ${c.ok ? "hover:bg-muted/30" : "bg-red-500/5 hover:bg-red-500/10"}`}>
            <div className="shrink-0" title={c.ok ? "Matches its role spec" : c.issues.join(" · ")}>
              {c.ok ? <Check className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
            </div>
            <div className="relative w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
              {isImage(item.mimeType) && isHostAllowed(item.url) ? (
                <NextImage src={item.url} alt={item.altText || item.filename} fill className="object-cover" sizes="40px" />
              ) : isImage(item.mimeType) ? (
                <div className="flex h-full items-center justify-center"><ImageOff className="h-4 w-4 text-muted-foreground" /></div>
              ) : (
                <div className="flex items-center justify-center h-full text-[10px] text-muted-foreground">{item.mimeType.split("/")[1]}</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.filename}</p>
              {item.altText && <p className="text-[11px] text-muted-foreground truncate">{item.altText}</p>}
            </div>
            {item.width && item.height && (
              <span className="text-[11px] text-muted-foreground hidden md:block shrink-0">{item.width}×{item.height}</span>
            )}
            <span className="text-[11px] text-muted-foreground hidden sm:block shrink-0 w-16 text-end">{formatFileSize(item.fileSize)}</span>
            <div className="shrink-0 hidden lg:block">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${item.isUsed ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                {getMediaTypeLabel(item.type)}{item.isUsed ? " · In Use" : " · Unused"}
              </span>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <button type="button" onClick={() => copyUrl(item)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Copy URL"><Copy className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => setInfoMedia(item)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Details"><Info className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => router.push(`/media/${item.id}/edit`)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit"><Edit className="h-3.5 w-3.5" /></button>
              {onDelete && (
                <button type="button" onClick={() => onDelete(item.id)} disabled={isDeleting} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
              )}
            </div>
          </div>
          );
        })}
      </div>
    );

    const listContent = groupByClient ? (
      <div className="space-y-6">
        {clientGroups.map((group) => (
          <Collapsible key={group.name} defaultOpen className="group/c">
            <CollapsibleTrigger asChild>
              <button type="button" className="flex items-center gap-2.5 w-full mb-2">
                <GroupAvatar name={group.name} logoUrl={group.logoUrl} />
                <h3 className="text-sm font-semibold">{group.name}</h3>
                <span className="text-xs text-muted-foreground">{group.items.length}</span>
                <div className="h-px flex-1 bg-border/70 ms-2" />
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=closed]/c:-rotate-90" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>{rows(group.items)}</CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    ) : (
      rows(media)
    );

    return <TooltipProvider delayDuration={100}>{listContent}{infoDialog}</TooltipProvider>;
  }

  // ---- GRID VIEW ---------------------------------------------------------
  // DAM best practice for mixed asset types (transparent logos, 6:1 covers,
  // articles): one uniform 4:3 cell + object-contain → consistent scale AND the
  // whole image visible (cover would crop logos/covers to death).
  const gridCols = gridSize === "compact"
    ? "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2"
    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3";

  const cardSizes = gridSize === "compact"
    ? "(max-width: 639px) 33vw, (max-width: 1023px) 25vw, (max-width: 1279px) 16vw, 12vw"
    : "(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw";

  const renderCard = (item: Media, index: number) => {
    const showImage = isImage(item.mimeType) && isHostAllowed(item.url);
    // Automatic spec audit — pure, from the row. Drives the colour + badge.
    const compliance = checkMediaCompliance(item);
    return (
      <Card
        key={item.id}
        className={`group relative overflow-hidden transition-all hover:shadow-md ${
          compliance.ok
            ? "border-border/50 hover:border-primary/40"
            : "border-red-500/50 ring-1 ring-red-500/30 hover:border-red-500/70"
        }`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
          {showImage ? (
            <NextImage
              src={item.url}
              alt={item.altText || item.filename}
              fill
              priority={index < 10}
              className="object-contain p-2"
              sizes={cardSizes}
            />
          ) : isImage(item.mimeType) ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center">
              <ImageOff className="h-5 w-5 text-muted-foreground" />
              <span className="line-clamp-2 break-all text-[10px] text-muted-foreground">Host not allowed</span>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-sm text-muted-foreground">{item.mimeType}</span>
            </div>
          )}

          {/* Compliance badge + usage dot (top-start). z-20 keeps the badge above
              the hover overlay so its tooltip stays reachable. */}
          <div className="absolute top-2 start-2 z-20 flex items-center gap-1.5">
            {compliance.ok ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/90 text-white shadow-sm ring-2 ring-background" title="Matches its role spec">
                <Check className="h-3 w-3" />
              </span>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-red-500 text-white shadow-sm ring-2 ring-background">
                    <AlertTriangle className="h-3 w-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[240px]">
                  <p className="font-semibold">Doesn&apos;t match its role spec</p>
                  <ul className="mt-1 list-disc space-y-0.5 ps-4">
                    {compliance.issues.map((iss) => (
                      <li key={iss}>{iss}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            )}
            <span
              className={`h-2.5 w-2.5 rounded-full ring-2 ring-background ${item.isUsed ? "bg-emerald-500" : "bg-muted-foreground/50"}`}
              title={item.isUsed ? "In use" : "Unused"}
            />
          </div>

          {/* Type badge (top-end) */}
          <span className="absolute top-2 end-2 z-10 rounded-md bg-background/85 px-1.5 py-0.5 text-[10px] font-medium text-foreground/80 backdrop-blur-sm">
            {getMediaTypeLabel(item.type)}
          </span>

          {/* Client name strip — flat view only, so you know whose image it is at a
              glance. Fades out on hover to reveal the actions overlay below. */}
          {!groupByClient && item.client?.name && (
            <div className="absolute inset-x-0 bottom-0 z-[5] bg-gradient-to-t from-black/75 to-transparent px-2 pb-1.5 pt-4 transition-opacity duration-200 group-hover:opacity-0">
              <p className="truncate text-[11px] font-medium text-white/90" title={item.client.name}>
                {item.client.name}
              </p>
            </div>
          )}

          {/* Hover overlay: gradient + name + actions */}
          <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="space-y-1 p-2">
              <p className="truncate text-[11px] font-medium text-white/90" title={item.filename}>{item.filename}</p>
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-[10px] text-white/60">
                  {[item.width && item.height ? `${item.width}×${item.height}` : null, item.fileSize ? formatFileSize(item.fileSize) : null].filter(Boolean).join(" · ")}
                </span>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button type="button" onClick={() => copyUrl(item)} className="rounded p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white" title="Copy URL"><Copy className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => setInfoMedia(item)} className="rounded p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white" title="Details"><Info className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => router.push(`/media/${item.id}/edit`)} className="rounded p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white" title="Edit"><Edit className="h-3.5 w-3.5" /></button>
                  {onDelete && (
                    <button type="button" onClick={() => onDelete(item.id)} disabled={isDeleting} className="rounded p-1 text-white/80 transition-colors hover:bg-red-500/30 hover:text-white" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const gridContent = groupByClient ? (
    <div className="space-y-8">
      {clientGroups.map((group) => (
        <Collapsible key={group.name} defaultOpen className="group/c">
          <CollapsibleTrigger asChild>
            <button type="button" className="mb-3 flex w-full items-center gap-2.5">
              <GroupAvatar name={group.name} logoUrl={group.logoUrl} />
              <h3 className="truncate text-sm font-semibold">{group.name}</h3>
              <span className="text-xs text-muted-foreground">{group.items.length}</span>
              <div className="h-px flex-1 bg-border/70 ms-2" />
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=closed]/c:-rotate-90" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className={gridCols}>{group.items.map(renderCard)}</div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  ) : (
    <div className={gridCols}>{media.map(renderCard)}</div>
  );

  return <TooltipProvider delayDuration={100}>{gridContent}{infoDialog}</TooltipProvider>;
}

function GroupAvatar({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  if (logoUrl) {
    return (
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-muted">
        <NextImage src={logoUrl} alt={name} fill className="object-contain p-0.5" sizes="32px" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
      {name.charAt(0)}
    </div>
  );
}
