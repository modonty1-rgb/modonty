"use client";

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ImageIcon, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaGrid } from "./media-grid";
import { MediaToolbar } from "./media-toolbar";
import { reencodeMediaToWebp } from "@/lib/media/reencode-media-to-webp";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MediaType } from "@prisma/client";
import Link from "next/link";

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
  /** Overrides the type label (e.g. a GENERAL upload that is a client's logo). */
  roleLabel?: string;
  /** Set on reel videos: where the reel is managed. */
  reelHref?: string;
  thumbnailUrl?: string | null;
  scope?: string | null;
  clientId?: string | null;
  status?: { label: string; tone: "ok" | "warn" | "bad" | "muted" };
  client?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface MediaPageClientProps {
  media: Media[];
  sortBy: string;
  searchQuery: string;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    perPage: number;
  };
  /**
   * The delete pair is passed in, not imported: this grid is shared by the Media library and
   * Clients › Media, and shared code never reaches into a route's own actions.
   */
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
  canDeleteAction: (id: string) => Promise<{ canDelete: boolean; reason?: string }>;
  /** The page this grid lives on — search, sort and paging write their params back here. */
  basePath?: string;
  uploadHref?: string;
  /** Page controls shown in the toolbar row, after search. */
  toolbarExtra?: ReactNode;
  /** Copy for an empty result — a filtered page says what is missing, not «upload your first file». */
  emptyState?: { title: string; hint: string; actionLabel?: string; actionHref?: string; action?: ReactNode };
  /** See MediaToolbar.uploadSlot. */
  uploadSlot?: ReactNode;
  /** A line above the grid saying what it holds (Clients › Media: «Other files»). */
  gridHeading?: ReactNode;
  /**
   * Server half of «Convert to WebP» (saveOptimizedImage): swaps the re-encoded file into the
   * same Media row. Passed in like the delete pair; omit to hide the button.
   */
  convertAction?: (
    id: string,
    input: { url: string; publicId?: string | null; mimeType: string; fileSize: number | null; width: number | null; height: number | null; blurDataURL?: string | null },
  ) => Promise<{ success: true; seoWarning?: string } | { success: false; error: string }>;
  /** See MediaGrid.lockUsedDelete. */
  lockUsedDelete?: boolean;
  /** Hide «Group by client» — Clients › Media picks one client instead, and its pages hold 20. */
  allowGroup?: boolean;
}

export function MediaPageClient({
  media,
  sortBy: initialSort,
  searchQuery,
  pagination,
  deleteAction,
  canDeleteAction,
  basePath = "/media",
  uploadHref = "/media/upload",
  toolbarExtra,
  emptyState,
  lockUsedDelete = false,
  allowGroup = true,
  uploadSlot,
  gridHeading,
  convertAction,
}: MediaPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [gridSize, setGridSize] = useState<"compact" | "standard">("standard");
  const [groupByClient, setGroupByClient] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  // A deleted card leaves the grid at once. It used to stay until the server refresh landed
  // (5–12 s on dev), and a second click on it answered «Cannot delete — Media not found»
  // (Khalid's live test, 26 Sep 2026).
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set());
  const shown = removedIds.size ? media.filter((m) => !removedIds.has(m.id)) : media;
  const markRemoved = (id: string) => setRemovedIds((prev) => new Set(prev).add(id));

  // «Convert to WebP» — the Maintenance page's procedure, one card at a time.
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const handleConvert = async (id: string) => {
    const item = media.find((m) => m.id === id);
    if (!item || !convertAction) return;
    setConvertingId(id);
    try {
      const before = item.fileSize ?? 0;
      // Re-encode on the server: the browser can't fetch every Bunny file (no CORS header on
      // extension-less names), the server can.
      const encoded = await reencodeMediaToWebp(id);
      if (!encoded.success) throw new Error(encoded.error);
      const fields = encoded.fields;
      const saved = await convertAction(id, fields);
      if (!saved.success) throw new Error(saved.error);
      const kb = (n: number) => `${Math.round(n / 1024)} KB`;
      toast({
        title: "Converted to WebP",
        description: `${item.filename}: ${kb(before)} → ${kb(fields.fileSize)}. Same file, same links.${saved.seoWarning ? " " + saved.seoWarning : ""}`,
        variant: "success",
      });
      router.refresh();
    } catch (e) {
      toast({ title: "Conversion failed", description: e instanceof Error ? e.message : "Try again.", variant: "destructive" });
    } finally {
      setConvertingId(null);
    }
  };

  const updateURLParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.set("page", "1");
    router.push(`${basePath}?${params.toString()}`);
  }, [router, searchParams, basePath]);

  const handleSortChange = (sort: string) => {
    updateURLParam("sort", sort);
  };

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateURLParam("search", value.trim());
    }, 400);
  };

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleSearchSubmit = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateURLParam("search", localSearch.trim());
  };

  const handleSearchClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLocalSearch("");
    updateURLParam("search", "");
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    setIsChecking(true);
    try {
      const canDelete = await canDeleteAction(id);
      setIsChecking(false);
      // Already gone (deleted in another tab, or a double click): drop the card, no error.
      if (!canDelete.canDelete && canDelete.reason === "Media not found") {
        markRemoved(id);
        return;
      }
      if (!canDelete.canDelete) {
        setDeleteError(canDelete.reason || "Cannot delete this media file.");
        setDeleteTarget({ id });
        setDeleteDialogOpen(true);
        return;
      }
      setDeleteTarget({ id });
      setDeleteDialogOpen(true);
    } catch {
      setIsChecking(false);
      toast({ title: messages.error.delete_failed, description: messages.descriptions.media_verify_failed, variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteAction(deleteTarget.id);
      if (result.success) {
        markRemoved(deleteTarget.id);
        toast({ title: messages.success.deleted, description: messages.descriptions.media_deleted, variant: "success" });
        router.refresh();
      } else {
        toast({ title: messages.error.delete_failed, description: result.error || messages.descriptions.media_delete_failed, variant: "destructive" });
      }
    } catch {
      toast({ title: messages.error.delete_failed, description: messages.descriptions.unexpected_error, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      setDeleteError(null);
    }
  };

  const startItem = (pagination.page - 1) * pagination.perPage + 1;
  const endItem = Math.min(pagination.page * pagination.perPage, pagination.total);

  return (
    <>
      <div className="space-y-4">
        <MediaToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          gridSize={gridSize}
          onGridSizeChange={setGridSize}
          groupByClient={groupByClient}
          onGroupByClientChange={setGroupByClient}
          sortBy={initialSort}
          onSortChange={handleSortChange}
          searchValue={localSearch}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onSearchClear={handleSearchClear}
          uploadHref={uploadHref}
          extra={toolbarExtra}
          showGroup={allowGroup}
          uploadSlot={uploadSlot}
        />

        {gridHeading}

        {shown.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 border border-dashed rounded-lg bg-muted/20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">{!searchQuery && emptyState ? emptyState.title : "No media found"}</p>
              <p className="text-xs text-muted-foreground max-w-[300px]">
                {searchQuery
                  ? "Try a different search term or clear filters"
                  : emptyState?.hint ?? "Upload your first file to get started"}
              </p>
            </div>
            {!searchQuery && emptyState?.action ? (
              <div className="mt-2">{emptyState.action}</div>
            ) : !searchQuery && (
              <Link href={emptyState?.actionHref ?? uploadHref}>
                <Button size="sm" className="gap-1.5 mt-2">
                  <Upload className="h-4 w-4" />
                  {emptyState?.actionLabel ?? "Upload Media"}
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <MediaGrid
              media={shown}
              viewMode={viewMode}
              gridSize={gridSize}
              groupByClient={groupByClient}
              onDelete={handleDelete}
              isDeleting={isChecking || isDeleting}
              lockUsedDelete={lockUsedDelete}
              onConvert={convertAction ? handleConvert : undefined}
              convertingId={convertingId}
              backPath={`${basePath}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {startItem}–{endItem} of {pagination.total}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => { if (!isDeleting) setDeleteDialogOpen(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteError ? "Cannot delete" : "Confirm delete"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteError
                ? deleteError
                : (() => {
                    // Name what is lost — «Are you sure?» alone asks for trust, not a decision.
                    const target = media.find((m) => m.id === deleteTarget?.id);
                    return target
                      ? `«${target.filename}»${target.client?.name ? ` of ${target.client.name}` : ""} will be removed from the library and its storage. This cannot be undone.`
                      : "This file will be removed from the library and its storage. This cannot be undone.";
                  })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {deleteError ? "Close" : "Cancel"}
            </AlertDialogCancel>
            {!deleteError && (
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
