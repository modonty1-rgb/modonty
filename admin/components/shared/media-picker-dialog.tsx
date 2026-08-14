"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { Loader2, Search, Upload, RefreshCw } from "lucide-react";
import { getMedia, type MediaFilters } from "@/app/(dashboard)/media/actions/media-actions";
import Link from "next/link";
import { MediaType } from "@prisma/client";
import { getMediaTypeLabel, getMediaTypeBadgeVariant } from "@/app/(dashboard)/media/helpers/media-utils";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { justifyRows, tileAspectRatio, shouldContainTile } from "@modonty/shared/lib/justify-rows";

/** DialogContent is `max-w-4xl` (896px) minus padding. Only decides tiles-per-row —
 *  the widths come back as percentages, so the row fills its parent at any size. */
const PICKER_WIDTH = 848;

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
}

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
  onSelect: (media: { url: string; bunnyUrl: string | null; blurDataURL: string | null; altText: string | null; mediaId: string; width?: number | null; height?: number | null }) => void;
  /** Modonty Core (T2): hard-lock the picker to this client's own library — no General
   *  fallback. Used by platform entity forms (Tag/Category/…). */
  lockClient?: boolean;
}

// PLATFORM source mode removed (T2 decision 1, 2026-07-31): platform images live in
// the Modonty core client's own library — one source, real ownership, no magic scope.
export function MediaPickerDialog({
  open,
  onOpenChange,
  clientId,
  onSelect,
  lockClient = false,
}: MediaPickerDialogProps) {
  const router = useRouter();
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaType | "all">("all");

  useEffect(() => {
    if (open && clientId) {
      loadMedia();
    }
  }, [open, clientId, typeFilter]);

  const loadMedia = async () => {
    if (!clientId) return;

    setLoading(true);
    try {
      const filters: MediaFilters = {
        clientId,
        includeGeneral: !lockClient,
        mimeType: "image",
        type: typeFilter !== "all" ? typeFilter : undefined,
        ...(lockClient ? { perPage: 100 } : {}),
      };
      const result = await getMedia(filters);
      setMedia(result.items as Media[]);
    } catch (error) {
      console.error("Failed to load media:", error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: Media) => {
    onSelect({
      url: mediaSrc(item) ?? item.url,
      bunnyUrl: null, // already resolved into url
      blurDataURL: item.blurDataURL,
      altText: item.altText,
      mediaId: item.id,
      width: item.width,
      height: item.height,
    });
    onOpenChange(false);
  };

  const filteredMedia = search
    ? media.filter(
      (item) =>
        item.filename.toLowerCase().includes(search.toLowerCase()) ||
        item.altText?.toLowerCase().includes(search.toLowerCase())
    )
    : media;

  const getImageUrl = (item: Media): string => {
    // Bunny FIRST (bunnyUrl ?? url) — otherwise the picker rebuilds a Cloudinary URL from
    // the publicId even for rows that already have a Bunny copy.
    const src = mediaSrc(item);
    if (src) return src;

    // Legacy fallback ONLY when neither bunnyUrl nor url exists.
    if (item.cloudinaryPublicId) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dfegnpgwx";
      const version = item.cloudinaryVersion || "";
      const format = item.filename.split(".").pop() || "png";
      let publicId = item.cloudinaryPublicId;
      const lastDot = publicId.lastIndexOf(".");
      if (lastDot > 0) {
        const possibleExt = publicId.substring(lastDot + 1).toLowerCase();
        const validExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
        if (validExtensions.includes(possibleExt)) {
          publicId = publicId.substring(0, lastDot);
        }
      }
      if (version) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/v${version}/${publicId}.${format}`;
      } else {
        return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.${format}`;
      }
    }
    return item.url;
  };

  if (!clientId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Media</DialogTitle>
            <DialogDescription>
              Please select a client first before choosing media.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No client selected</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Select Media</DialogTitle>
          <DialogDescription className="mt-1.5">
            Choose an image from the media library for this client.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-6 pt-4 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search media by filename or alt text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="w-[130px] shrink-0">
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as MediaType | "all")}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="LOGO">Logo</SelectItem>
                  <SelectItem value="POST">Post</SelectItem>
                  <SelectItem value="CLIENT_MINI">Client Mini</SelectItem>
                  <SelectItem value="OGIMAGE">OG Image</SelectItem>
                  <SelectItem value="TWITTER_IMAGE">Twitter Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Link href={`/media/upload?clientId=${clientId}`} target="_blank" className="shrink-0">
              <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Upload
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={loadMedia}
              disabled={loading}
              title="Refresh media list"
              className="h-9 w-9 shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {search
                  ? "No media found matching your search."
                  : typeFilter !== "all"
                    ? `No ${getMediaTypeLabel(typeFilter).toLowerCase()} media available for this client.`
                    : "No media available for this client."}
              </p>
              <Link href={`/media/upload?clientId=${clientId}`}>
                <Button variant="outline" size="sm" className="mt-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Media
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto -mx-2 px-2 pb-2">
                {/* Justified rows (sm+) — the project gallery standard. A square box would
                    crop the majority of this library: 165 landscape · 39 portrait · 10
                    square · 6 at 6:1, measured 2026-08-07. */}
                <div className="hidden sm:block">
                  {justifyRows(filteredMedia, PICKER_WIDTH).map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-3 mb-3">
                      {row.items.map(({ tile, grow }) => (
                        <Card
                          key={tile.id}
                          // Full rows: flex-grow by ratio so the browser fills the width
                          // exactly after the gaps. Last row: fixed at the target height,
                          // never stretched — a lone trailing image blown up reads as a bug.
                          style={
                            row.isLast
                              ? { flex: "0 0 auto", width: `${row.height * grow}px` }
                              : { flexGrow: grow, flexBasis: 0, minWidth: 0 }
                          }
                          className="cursor-pointer hover:shadow-md transition-all border hover:border-primary/50 overflow-hidden"
                          onClick={() => handleSelect(tile)}
                          title={tile.filename}
                        >
                          <CardContent className="p-0">
                            <div
                              style={{ aspectRatio: tileAspectRatio(tile) }}
                              className="relative overflow-hidden bg-muted"
                            >
                              <OptimizedImage
                                media={asMedia(getImageUrl(tile), tile.altText || tile.filename)} alt={tile.altText || tile.filename}
                                fill
                                // كانت مفقودة قبل التحويل — المكوّن يجعلها خطأ تصريف
                                sizes="(max-width: 640px) 50vw, 220px"
                                className={shouldContainTile(tile) ? "object-contain" : "object-cover"}
                                unoptimized
                              />
                            </div>
                            <p className="px-2 py-1.5 text-[11px] leading-tight truncate text-muted-foreground">
                              {tile.filename}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Under 640px justified rows go too fine-grained — two fixed columns. */}
                <div className="grid grid-cols-2 gap-3 sm:hidden">
                  {filteredMedia.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:shadow-md transition-all border hover:border-primary/50 overflow-hidden"
                      onClick={() => handleSelect(item)}
                    >
                      <CardContent className="p-0">
                        <div
                          style={{ aspectRatio: tileAspectRatio(item) }}
                          className="relative overflow-hidden bg-muted"
                        >
                          <OptimizedImage
                            media={asMedia(getImageUrl(item), item.altText || item.filename)} alt={item.altText || item.filename}
                            fill
                            // كانت مفقودة قبل التحويل — المكوّن يجعلها خطأ تصريف
                            sizes="(max-width: 640px) 50vw, 220px"
                            className={shouldContainTile(item) ? "object-contain" : "object-cover"}
                            unoptimized
                          />
                        </div>
                        <div className="p-2 space-y-1.5">
                          <p className="text-xs font-medium line-clamp-2 leading-tight">{item.filename}</p>
                          <Badge variant={getMediaTypeBadgeVariant(item.type)} className="text-[10px] font-normal">
                            {getMediaTypeLabel(item.type)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
