"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, Search, X } from "lucide-react";
import { MediaWithStats } from "../helpers/media-queries";
import { ar } from "@/lib/ar";

interface MediaGalleryProps {
  clientId: string;
  media: MediaWithStats[];
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDimensions(w: number | null, h: number | null): string {
  if (!w || !h) return "";
  return `${w}×${h}`;
}

function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <Button variant={active ? "default" : "outline"} size="sm" onClick={onClick}>
      {label}
      <span
        className={`ms-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
          active ? "bg-background/20 text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </Button>
  );
}

function getFormatLabel(mimeType: string): string {
  // image/jpeg → JPG, image/png → PNG, image/svg+xml → SVG
  const sub = mimeType.split("/")[1] ?? "";
  if (sub === "jpeg") return "JPG";
  if (sub === "svg+xml") return "SVG";
  return sub.toUpperCase();
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [openMedia, setOpenMedia] = useState<MediaWithStats | null>(null);

  // Filter by ACTUAL USAGE (not stored DB type), since most media is saved as
  // GENERAL and the meaningful classification comes from where it's linked.
  const filteredMedia = useMemo(() => {
    let result: MediaWithStats[];
    switch (filter) {
      case "logo":
        result = media.filter((m) => m.usageRefs.some((r) => r.type === "logo"));
        break;
      case "post":
        result = media.filter((m) => m.usageRefs.some((r) => r.type === "article"));
        break;
      case "cover":
        result = media.filter((m) => m.usageRefs.some((r) => r.type === "heroImage"));
        break;
      case "unused":
        result = media.filter((m) => m.usageRefs.length === 0);
        break;
      default:
        result = media;
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.filename.toLowerCase().includes(q) ||
          (m.altText ?? "").toLowerCase().includes(q) ||
          (m.title ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [media, filter, query]);

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="p-6 space-y-4">
          {/* Top row: search + filters */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث في اسم الملف أو الوصف..."
                className="ps-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={filter === "all"}
                onClick={() => setFilter("all")}
                label={ar.media.all}
                count={media.length}
              />
              <FilterButton
                active={filter === "logo"}
                onClick={() => setFilter("logo")}
                label={ar.media.logos}
                count={media.filter((m) => m.usageRefs.some((r) => r.type === "logo")).length}
              />
              <FilterButton
                active={filter === "post"}
                onClick={() => setFilter("post")}
                label={ar.media.posts}
                count={media.filter((m) => m.usageRefs.some((r) => r.type === "article")).length}
              />
              <FilterButton
                active={filter === "cover"}
                onClick={() => setFilter("cover")}
                label={ar.media.ogImages}
                count={media.filter((m) => m.usageRefs.some((r) => r.type === "heroImage")).length}
              />
              <FilterButton
                active={filter === "unused"}
                onClick={() => setFilter("unused")}
                label={ar.media.unused}
                count={media.filter((m) => m.usageRefs.length === 0).length}
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredMedia.length} {ar.media.files}
          </p>

          {/* Grid */}
          {filteredMedia.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {query.trim()
                  ? ar.media.emptySearch
                  : filter === "logo"
                    ? ar.media.emptyLogo
                    : filter === "post"
                      ? ar.media.emptyPost
                      : filter === "cover"
                        ? ar.media.emptyCover
                        : filter === "unused"
                          ? ar.media.emptyUnused
                          : ar.media.emptyAll}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 items-start">
              {filteredMedia.map((item) => {
                // Use the image's REAL aspect ratio so logos (square), article images
                // (16:9 or portrait), and hero images (wide) all display fully.
                // Falls back to 4:3 if dimensions unknown.
                const ratio =
                  item.width && item.height ? `${item.width}/${item.height}` : "4/3";
                return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOpenMedia(item)}
                  className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-2 text-start transition-all hover:border-primary hover:shadow-md"
                >
                  <div
                    className="relative w-full overflow-hidden rounded-md bg-muted"
                    style={{ aspectRatio: ratio }}
                  >
                    <Image
                      src={item.url}
                      alt={item.altText || item.filename}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <span className="absolute end-1.5 top-1.5 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-bold text-foreground shadow-sm backdrop-blur">
                      {getFormatLabel(item.mimeType)}
                    </span>
                  </div>
                  <div className="space-y-0.5 px-1">
                    <p className="truncate text-xs font-medium text-foreground" title={item.filename}>
                      {item.filename}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDimensions(item.width, item.height)}
                      {item.width && item.height && " · "}
                      {formatBytes(item.fileSize)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.usageCount === 0
                        ? ar.media.notUsed
                        : `${ar.media.usedInPlaces.replace("{n}", String(item.usageCount))}`}
                    </p>
                  </div>
                </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Lightbox modal ─────────────────────────────────────────── */}
      {openMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setOpenMedia(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-background shadow-2xl md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setOpenMedia(null)}
              className="absolute end-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground shadow hover:bg-background"
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Image */}
            <div className="relative flex flex-1 items-center justify-center bg-muted p-4 md:min-h-[400px]">
              {openMedia.url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={openMedia.url}
                  alt={openMedia.altText || openMedia.filename}
                  className="max-h-[60vh] max-w-full object-contain md:max-h-[80vh]"
                />
              )}
            </div>

            {/* Info panel */}
            <div className="flex w-full flex-col gap-3 border-t bg-card p-5 md:w-72 md:border-s md:border-t-0">
              <div>
                <p className="text-xs text-muted-foreground">اسم الملف</p>
                <p className="break-all text-sm font-medium" title={openMedia.filename}>
                  {openMedia.filename}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">الأبعاد</p>
                  <p className="text-sm font-medium tabular-nums">
                    {formatDimensions(openMedia.width, openMedia.height) || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">الحجم</p>
                  <p className="text-sm font-medium tabular-nums">{formatBytes(openMedia.fileSize)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">الصيغة</p>
                  <p className="text-sm font-medium">{getFormatLabel(openMedia.mimeType)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">النوع</p>
                  <p className="text-sm font-medium">{openMedia.type}</p>
                </div>
              </div>

              {openMedia.altText && (
                <div>
                  <p className="text-xs text-muted-foreground">النص البديل (Alt)</p>
                  <p className="text-sm">{openMedia.altText}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground">مستخدمة في</p>
                {openMedia.usageRefs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{ar.media.notUsed}</p>
                ) : (
                  <ul className="mt-1 space-y-1 text-sm">
                    {openMedia.usageRefs.map((ref, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        <span className="truncate" title={ref.label}>
                          {ref.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
