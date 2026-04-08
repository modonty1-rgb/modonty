"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ImageIcon, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaGrid } from "./media-grid";
import { MediaToolbar } from "./media-toolbar";
import { deleteMedia, canDeleteMedia } from "../actions/media-actions";
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
  cloudinaryPublicId?: string | null;
  cloudinaryVersion?: string | null;
  isUsed?: boolean;
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
}

export function MediaPageClient({ media, sortBy: initialSort, searchQuery, pagination }: MediaPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [gridSize, setGridSize] = useState<"compact" | "standard">("standard");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const updateURLParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.set("page", "1");
    router.push(`/media?${params.toString()}`);
  }, [router, searchParams]);

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
    router.push(`/media?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    setIsChecking(true);
    try {
      const canDelete = await canDeleteMedia(id);
      setIsChecking(false);
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
      const result = await deleteMedia(deleteTarget.id);
      if (result.success) {
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
          sortBy={initialSort}
          onSortChange={handleSortChange}
          searchValue={localSearch}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onSearchClear={handleSearchClear}
        />

        {media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 border border-dashed rounded-lg bg-muted/20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">No media found</p>
              <p className="text-xs text-muted-foreground max-w-[300px]">
                {searchQuery ? "Try a different search term or clear filters" : "Upload your first file to get started"}
              </p>
            </div>
            {!searchQuery && (
              <Link href="/media/upload">
                <Button size="sm" className="gap-1.5 mt-2">
                  <Upload className="h-4 w-4" />
                  Upload Media
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <MediaGrid
              media={media}
              viewMode={viewMode}
              gridSize={gridSize}
              onDelete={handleDelete}
              isDeleting={isChecking || isDeleting}
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
                : "Are you sure? This action cannot be undone."}
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
