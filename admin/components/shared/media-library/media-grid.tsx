"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { messages } from "@/lib/messages";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Info, Copy, ChevronDown, ImageOff, Check, AlertTriangle, Clapperboard, Play, Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkMediaCompliance, isFormatIssue } from "@/lib/media/media-specs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { computeMediaSeoScore } from "@modonty/shared/lib/seo/media/seo-score";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { SeoScoreBadge } from "@/components/shared/seo-score-badge";
import { MediaType } from "@prisma/client";
import { getMediaTypeLabel } from "@/lib/media/media-utils";

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
  bunnyUrl: string | null;
  blurDataURL: string | null;
  cloudinaryPublicId?: string | null;
  cloudinaryVersion?: string | null;
  isUsed?: boolean;
  roleLabel?: string;
  reelHref?: string;
  /** Bunny Stream poster for videos — every reel row carries one. */
  thumbnailUrl?: string | null;
  scope?: string | null;
  clientId?: string | null;
  /** A workflow state that says more than «In use» (a reel: Pending · Published · Rejected). */
  status?: { label: string; tone: "ok" | "warn" | "bad" | "muted" };
  client?: {
    id: string;
    name: string;
    slug: string;
    logoMedia?: { url: string; bunnyUrl: string | null; blurDataURL: string | null } | null;
  };
}

interface MediaGridProps {
  media: Media[];
  viewMode?: "grid" | "list";
  gridSize?: "compact" | "standard";
  groupByClient?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  /**
   * Disable Delete on files in use, with the reason on hover — instead of letting the click
   * through to a «Cannot delete» dialog. Opt-in: the Media library keeps its behaviour.
   */
  lockUsedDelete?: boolean;
  /** The page hosting this grid — the editor returns here after Save/Cancel. */
  backPath?: string;
  /** Re-encode a wrong-format image to WebP in place. Omit to hide the button. */
  onConvert?: (id: string) => void;
  /** The id being converted right now (spinner on its button). */
  convertingId?: string | null;
}

/** Role names in Arabic for the library cards — media-specs.ts keeps English for the upload flows. */
const ROLE_AR: Record<string, string> = {
  POST: "صورة مقال",
  HERO: "غلاف",
  HERO_MOBILE: "غلاف الجوال",
  LOGO: "شعار عميل",
  OGIMAGE: "صورة مشاركة",
  CLIENT_MINI: "صورة عميل مصغّرة",
  TWITTER_IMAGE: "بطاقة تويتر",
  GALLERY: "معرض",
  GENERAL: "عامة",
  SECTOR_HERO: "غلاف قطاع",
  SECTOR_HERO_MOBILE: "غلاف قطاع للجوال",
};
const roleAr = (type: string | null | undefined) => (type ? ROLE_AR[type] : undefined) ?? getMediaTypeLabel(type as never);

export function MediaGrid({
  media,
  viewMode = "grid",
  gridSize = "standard",
  groupByClient = false,
  onDelete,
  isDeleting = false,
  lockUsedDelete = false,
  backPath,
  onConvert,
  convertingId = null,
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
        h.endsWith(".b-cdn.net") || // Bunny — primary storage
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

  const deleteLocked = (item: Media) => lockUsedDelete && !!item.isUsed;
  const editHref = (item: Media) =>
    `/media/${item.id}/edit${backPath ? `?back=${encodeURIComponent(backPath)}` : ""}`;
  const STATUS_TONE = { ok: "text-emerald-600", warn: "text-amber-600", bad: "text-red-600", muted: "text-muted-foreground" } as const;
  // Only a format problem is fixable in one click; a wrong ratio or size needs a new crop.
  const canConvert = (item: Media) =>
    !!onConvert && item.mimeType.startsWith("image/") && checkMediaCompliance(item).issues.some(isFormatIssue);
  const convertButton = (item: Media, compact: boolean) =>
    canConvert(item) ? (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onConvert?.(item.id); }}
        disabled={!!convertingId}
        title="حوّل إلى WebP — نفس الملف ونفس الروابط"
        className={compact
          ? "inline-flex h-5 items-center gap-1 rounded-full bg-amber-500 px-2 text-xs font-semibold text-white shadow-sm ring-2 ring-background hover:bg-amber-600 disabled:opacity-60"
          : "inline-flex h-8 items-center gap-1.5 rounded-md border border-amber-500/50 px-3 text-xs font-medium text-amber-700 hover:bg-amber-500/10 disabled:opacity-60 dark:text-amber-400"}
      >
        {convertingId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
        {convertingId === item.id ? "يحوّل…" : compact ? "WebP" : "حوّل إلى WebP"}
      </button>
    ) : null;
  const deleteTitle = (item: Media) => (deleteLocked(item) ? "مستخدمة — غيّرها عند العميل أولاً" : "احذف");

  const copyUrl = async (item: Media) => {
    try {
      await navigator.clipboard.writeText(getImageUrl(item));
      toast({ title: messages.success.copied, description: messages.descriptions.media_copied, variant: "success" });
    } catch {
      toast({ title: messages.error.copy_failed, description: messages.descriptions.media_copy_failed, variant: "destructive" });
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "غير معروف";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getImageUrl = (item: Media): string => {
    // Bunny FIRST — mediaSrc() is the shared resolver (bunnyUrl ?? url). Without this the
    // grid rebuilt a Cloudinary URL from cloudinaryPublicId even for rows that already had
    // a Bunny copy, so the admin kept staring at Cloudinary after the migration.
    const src = mediaSrc(item);
    if (src) return src;

    // Legacy fallback ONLY when neither bunnyUrl nor url exists: rebuild from the publicId.
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
      acc[key] = { name: item.client?.name || "عامة", logoUrl: mediaSrc(item.client?.logoMedia) || null, items: [] };
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
                <OptimizedImage media={asMedia(getImageUrl(infoMedia), infoMedia.altText || infoMedia.filename)} alt={infoMedia.altText || infoMedia.filename} fill className="object-contain p-4" sizes="400px" />
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
                  <span className="text-muted-foreground">الدور</span>
                  <span className="font-medium">{infoMedia.roleLabel ?? roleAr(infoMedia.type)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">الصيغة</span>
                  <span className="font-medium">{infoMedia.mimeType.split("/")[1]?.toUpperCase()}</span>
                </div>
                {infoMedia.width && infoMedia.height && (
                  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">الأبعاد</span>
                    <span className="font-medium">{infoMedia.width} × {infoMedia.height}px</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">الحجم</span>
                  <span className="font-medium">{formatFileSize(infoMedia.fileSize)}</span>
                </div>
                {infoMedia.client && (
                  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">العميل</span>
                    <span className="font-medium">{infoMedia.client.name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">التاريخ</span>
                  <span className="font-medium">{format(new Date(infoMedia.createdAt), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">الحالة</span>
                  <span className={`font-medium ${infoMedia.isUsed ? "text-emerald-500" : "text-muted-foreground"}`}>
                    {infoMedia.isUsed ? "مستخدمة" : "غير مستخدمة"}
                  </span>
                </div>
                {(() => {
                  const c = checkMediaCompliance(infoMedia);
                  return (
                    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-border/50">
                      <span className="shrink-0 text-muted-foreground">المواصفة</span>
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
                  // ONE image SEO score — the shared shared SOT (computeMediaSeoScore),
                  // the same number the SEO Images section shows. No second local rubric.
                  const { score } = computeMediaSeoScore({
                    altText: infoMedia.altText,
                    description: infoMedia.description,
                    width: infoMedia.width,
                    height: infoMedia.height,
                    filename: infoMedia.filename,
                    servedUrl: infoMedia.bunnyUrl ?? infoMedia.url,
                    type: infoMedia.type,
                  });
                  return (
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-muted-foreground">درجة السيو</span>
                      <SeoScoreBadge score={score} size="sm" />
                    </div>
                  );
                })()}
              </div>
              {/* Act from here instead of closing and hunting the card again. */}
              <div className="mt-5 flex flex-wrap gap-2 border-t border-border/50 pt-4">
                {convertButton(infoMedia, false)}
                <button type="button" onClick={() => copyUrl(infoMedia)} className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-muted"><Copy className="h-3.5 w-3.5" />انسخ الرابط</button>
                {infoMedia.reelHref ? (
                  <button type="button" onClick={() => router.push(infoMedia.reelHref!)} className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-muted"><Clapperboard className="h-3.5 w-3.5" />افتح الريل</button>
                ) : (
                  <button type="button" onClick={() => router.push(editHref(infoMedia))} className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-muted"><Edit className="h-3.5 w-3.5" />تعديل</button>
                )}
                {onDelete && !infoMedia.reelHref && (
                  <button
                    type="button"
                    onClick={() => { const id = infoMedia.id; setInfoMedia(null); onDelete(id); }}
                    disabled={isDeleting || deleteLocked(infoMedia)}
                    title={deleteTitle(infoMedia)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-destructive/40 px-3 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />{deleteLocked(infoMedia) ? "مستخدمة — ما تنحذف" : "احذف"}
                  </button>
                )}
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
            <div className="shrink-0" title={c.ok ? "مطابقة لمواصفة دورها" : c.issues.join(" · ")}>
              {c.ok ? <Check className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
            </div>
            <div className="relative w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
              {isImage(item.mimeType) && isHostAllowed(getImageUrl(item)) ? (
                <OptimizedImage media={asMedia(getImageUrl(item), item.altText || item.filename)} alt={item.altText || item.filename} fill className="object-cover" sizes="40px" />
              ) : item.thumbnailUrl ? (
                <OptimizedImage media={asMedia(item.thumbnailUrl, item.filename)} alt="" fill className="object-cover" sizes="40px" />
              ) : isImage(item.mimeType) ? (
                <div className="flex h-full items-center justify-center"><ImageOff className="h-4 w-4 text-muted-foreground" /></div>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">{item.mimeType.split("/")[1]}</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.filename}</p>
              {/* Whose file it is — «cover.webp» alone says nothing in a list of 37 covers. */}
              {(!groupByClient && item.client?.name) || item.altText ? (
                <p className="text-xs text-muted-foreground truncate">
                  {[!groupByClient ? item.client?.name : null, item.altText].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </div>
            {item.width && item.height && (
              <span className="text-xs text-muted-foreground hidden md:block shrink-0">{item.width}×{item.height}</span>
            )}
            <span className="text-xs text-muted-foreground hidden sm:block shrink-0 w-16 text-end">{formatFileSize(item.fileSize)}</span>
            <div className="shrink-0 hidden lg:block">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${item.isUsed ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                {item.roleLabel ?? roleAr(item.type)}{item.status ? ` · ${item.status.label}` : item.isUsed ? " · مستخدمة" : " · غير مستخدمة"}
              </span>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <button type="button" onClick={() => copyUrl(item)} className="inline-flex size-6 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="انسخ الرابط"><Copy className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => setInfoMedia(item)} className="inline-flex size-6 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="التفاصيل"><Info className="h-3.5 w-3.5" /></button>
              {item.reelHref ? (
                <button type="button" onClick={() => router.push(item.reelHref!)} className="inline-flex size-6 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="افتح الريل"><Clapperboard className="h-3.5 w-3.5" /></button>
              ) : (
                <button type="button" onClick={() => router.push(editHref(item))} className="inline-flex size-6 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="تعديل"><Edit className="h-3.5 w-3.5" /></button>
              )}
              {onDelete && !item.reelHref && (
                <button type="button" onClick={() => onDelete(item.id)} disabled={isDeleting || deleteLocked(item)} className="inline-flex size-6 items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:cursor-not-allowed disabled:opacity-40" title={deleteTitle(item)} aria-label={deleteTitle(item)}><Trash2 className="h-3.5 w-3.5" /></button>
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
    const showImage = isImage(item.mimeType) && isHostAllowed(getImageUrl(item));
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
            <OptimizedImage
              media={asMedia(getImageUrl(item), item.altText || item.filename)} alt={item.altText || item.filename}
              fill
              {...(index < 10 ? { preload: true } : {})}
              className="object-contain p-2"
              sizes={cardSizes}
            />
          ) : item.thumbnailUrl ? (
            <>
              {/* Decorative: the filename is on the card already. A poster Bunny has not generated yet (a pending reel 404s) then leaves just the play mark, not its alt text spilling over the card. */}
              <OptimizedImage media={asMedia(item.thumbnailUrl, item.filename)} alt="" fill className="object-contain p-2" sizes={cardSizes} />
              <span className="pointer-events-none absolute inset-0 m-auto flex size-10 items-center justify-center rounded-full bg-black/55 text-white" aria-hidden>
                <Play className="ms-0.5 size-4 fill-current" />
              </span>
            </>
          ) : isImage(item.mimeType) ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center">
              <ImageOff className="h-5 w-5 text-muted-foreground" />
              <span className="line-clamp-2 break-all text-xs text-muted-foreground">المضيف غير مسموح</span>
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
                  <p className="font-semibold">ما تطابق مواصفة دورها</p>
                  <ul className="mt-1 list-disc space-y-0.5 ps-4">
                    {compliance.issues.map((iss) => (
                      <li key={iss}>{iss}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            )}
            {convertButton(item, true)}
          </div>

          {/* Role + usage (top-end). Usage used to be a second green dot next to the green spec
              check — two identical marks meaning different things; it reads as a word now. */}
          <span className="absolute top-2 end-2 z-10 rounded-md bg-background/85 px-1.5 py-0.5 text-xs font-medium text-foreground/80 backdrop-blur-sm">
            {item.roleLabel ?? roleAr(item.type)}
            {item.status ? (
              <span className={STATUS_TONE[item.status.tone]}> · {item.status.label}</span>
            ) : (
              <span className={item.isUsed ? "text-emerald-600" : "text-muted-foreground"}>{item.isUsed ? " · مستخدمة" : " · غير مستخدمة"}</span>
            )}
          </span>

          {/* Client name strip — flat view only, so you know whose image it is at a
              glance. Fades out on hover to reveal the actions overlay below. */}
          {!groupByClient && item.client?.name && (
            <div className="absolute inset-x-0 bottom-0 z-[5] bg-gradient-to-t from-black/75 to-transparent px-2 pb-1.5 pt-4 transition-opacity duration-200 group-hover:opacity-0 group-focus-within:opacity-0">
              <p className="truncate text-xs font-medium text-white/90" title={item.client.name}>
                {item.client.name}
              </p>
            </div>
          )}

          {/* Hover overlay: gradient + name + actions */}
          <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
            <div className="space-y-1 p-2">
              <p className="truncate text-xs font-medium text-white/90" title={item.filename}>{item.filename}</p>
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-xs text-white/60">
                  {[item.width && item.height ? `${item.width}×${item.height}` : null, item.fileSize ? formatFileSize(item.fileSize) : null].filter(Boolean).join(" · ")}
                </span>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button type="button" onClick={() => copyUrl(item)} className="inline-flex size-6 items-center justify-center rounded text-white/80 transition-colors hover:bg-white/20 hover:text-white" title="انسخ الرابط"><Copy className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => setInfoMedia(item)} className="inline-flex size-6 items-center justify-center rounded text-white/80 transition-colors hover:bg-white/20 hover:text-white" title="التفاصيل"><Info className="h-3.5 w-3.5" /></button>
                  {item.reelHref ? (
                    <button type="button" onClick={() => router.push(item.reelHref!)} className="inline-flex size-6 items-center justify-center rounded text-white/80 transition-colors hover:bg-white/20 hover:text-white" title="افتح الريل"><Clapperboard className="h-3.5 w-3.5" /></button>
                  ) : (
                    <button type="button" onClick={() => router.push(editHref(item))} className="inline-flex size-6 items-center justify-center rounded text-white/80 transition-colors hover:bg-white/20 hover:text-white" title="تعديل"><Edit className="h-3.5 w-3.5" /></button>
                  )}
                  {onDelete && !item.reelHref && (
                    <button type="button" onClick={() => onDelete(item.id)} disabled={isDeleting || deleteLocked(item)} className="inline-flex size-6 items-center justify-center rounded text-white/80 transition-colors hover:bg-red-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40" title={deleteTitle(item)} aria-label={deleteTitle(item)}><Trash2 className="h-3.5 w-3.5" /></button>
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
        <OptimizedImage media={asMedia(logoUrl, name)} alt={name} fill className="object-contain p-0.5" sizes="32px" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
      {name.charAt(0)}
    </div>
  );
}
