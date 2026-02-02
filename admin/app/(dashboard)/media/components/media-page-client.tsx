"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { MediaGrid } from "./media-grid";
import { MediaToolbar } from "./media-toolbar";
import { deleteMedia, bulkDeleteMedia, canDeleteMedia } from "../actions/media-actions";
import { useToast } from "@/hooks/use-toast";
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
  client?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface MediaPageClientProps {
  media: Media[];
  sortBy: string;
}

export function MediaPageClient({ media, sortBy: initialSort }: MediaPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState(initialSort);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "single" | "bulk"; id?: string; ids?: string[]; deletableIds?: string[] } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sort media
  const sortedMedia = [...media].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "name-asc":
        return a.filename.localeCompare(b.filename);
      case "name-desc":
        return b.filename.localeCompare(a.filename);
      case "size-asc":
        return (a.fileSize || 0) - (b.fileSize || 0);
      case "size-desc":
        return (b.fileSize || 0) - (a.fileSize || 0);
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    setIsChecking(true);

    try {
      const canDelete = await canDeleteMedia(id);
      setIsChecking(false);

      if (!canDelete.canDelete) {
        setDeleteError(canDelete.reason || "Cannot delete this media file.");
        setDeleteTarget({ type: "single", id });
        setDeleteDialogOpen(true);
        return;
      }

      setDeleteTarget({ type: "single", id });
      setDeleteDialogOpen(true);
    } catch (error) {
      setIsChecking(false);
      toast({
        title: "Error",
        description: "Failed to check media usage. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    setDeleteError(null);
    setIsChecking(true);

    try {
      const idsArray = Array.from(selectedIds);
      const checks = await Promise.all(
        idsArray.map((id) => canDeleteMedia(id))
      );

      const cannotDelete = checks
        .map((check, index) => ({ check, id: idsArray[index] }))
        .filter(({ check }) => !check.canDelete);

      const canDelete = checks
        .map((check, index) => ({ check, id: idsArray[index] }))
        .filter(({ check }) => check.canDelete);

      setIsChecking(false);

      if (cannotDelete.length > 0 && canDelete.length > 0) {
        // Some can be deleted, some cannot - show partial deletion option
        const errorDetails = cannotDelete.map(({ check, id }) => {
          const mediaItem = media.find((m) => m.id === id);
          return {
            filename: mediaItem?.filename || id,
            reason: check.reason,
            id,
          };
        });

        const deletableIds = canDelete.map(({ id }) => id);
        setDeleteError(JSON.stringify(errorDetails));
        setDeleteTarget({ type: "bulk", ids: idsArray, deletableIds });
        setDeleteDialogOpen(true);
        return;
      }

      if (cannotDelete.length > 0) {
        // All cannot be deleted - show error only
        const errorDetails = cannotDelete.map(({ check, id }) => {
          const mediaItem = media.find((m) => m.id === id);
          return {
            filename: mediaItem?.filename || id,
            reason: check.reason,
            id,
          };
        });

        setDeleteError(JSON.stringify(errorDetails));
        setDeleteTarget({ type: "bulk", ids: idsArray });
        setDeleteDialogOpen(true);
        return;
      }

      // All can be deleted
      setDeleteTarget({ type: "bulk", ids: idsArray });
      setDeleteDialogOpen(true);
    } catch (error) {
      setIsChecking(false);
      toast({
        title: "Error",
        description: "Failed to check media usage. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      if (deleteTarget.type === "single" && deleteTarget.id) {
        const result = await deleteMedia(deleteTarget.id);

        if (result.success) {
          toast({
            title: "Success",
            description: "Media file deleted successfully.",
          });
          setSelectedIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(deleteTarget.id!);
            return newSet;
          });
          router.refresh();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to delete media file.",
            variant: "destructive",
          });
        }
      } else if (deleteTarget.type === "bulk" && deleteTarget.ids) {
        // If partial deletion (deletableIds provided), only delete those
        const idsToDelete = deleteTarget.deletableIds || deleteTarget.ids;
        const result = await bulkDeleteMedia(idsToDelete);

        if (result.success) {
          const deletedCount = result.deleted || idsToDelete.length;
          const skippedCount = result.skipped || 0;

          if (skippedCount > 0) {
            toast({
              title: "Partial Success",
              description: `Successfully deleted ${deletedCount} item${deletedCount !== 1 ? "s" : ""}. ${skippedCount} item${skippedCount !== 1 ? "s were" : " was"} protected and could not be deleted.`,
            });
          } else {
            toast({
              title: "Success",
              description: `Successfully deleted ${deletedCount} media file${deletedCount !== 1 ? "s" : ""}.`,
            });
          }

          // Remove deleted items from selection
          setSelectedIds((prev) => {
            const newSet = new Set(prev);
            idsToDelete.forEach((id) => newSet.delete(id));
            return newSet;
          });
          router.refresh();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to delete media files.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      setDeleteError(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <MediaToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedCount={selectedIds.size}
          onBulkDelete={selectedIds.size > 0 ? handleBulkDelete : undefined}
          isDeleting={isChecking || isDeleting}
        />
        {sortedMedia.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No media found. Upload your first file to get started.</p>
          </div>
        ) : (
          <MediaGrid
            media={sortedMedia}
            viewMode={viewMode}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDelete={handleDelete}
            isDeleting={isChecking || isDeleting}
          />
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
          if (!isDeleting && !isChecking) {
            setDeleteDialogOpen(open);
          }
        }}>
        <AlertDialogContent>
          <div className="relative">
            {isDeleting && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <div className="text-sm text-muted-foreground">Deleting media...</div>
                </div>
              </div>
            )}
          <AlertDialogHeader>
            <AlertDialogTitle>
              {(() => {
                if (deleteError && deleteTarget?.deletableIds && deleteTarget.deletableIds.length > 0) {
                  return "Partial Deletion Available";
                }
                return deleteError ? "Cannot Delete Media" : "Confirm Delete";
              })()}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                // Partial deletion scenario - show both deletable and non-deletable
                if (deleteError && deleteTarget?.deletableIds && deleteTarget.deletableIds.length > 0) {
                  try {
                    const errorDetails = JSON.parse(deleteError);
                    const deletableCount = deleteTarget.deletableIds.length;
                    const deletableItems = deleteTarget.deletableIds.map((id) => {
                      const mediaItem = media.find((m) => m.id === id);
                      return { filename: mediaItem?.filename || id, id };
                    });

                    return (
                      <span className="block space-y-4">
                        <span className="block text-sm font-medium text-green-600 dark:text-green-400">
                          Can Delete ({deletableCount} item{deletableCount !== 1 ? "s" : ""}):
                        </span>
                        <span className="block max-h-[150px] overflow-y-auto border-l-2 border-green-500 pl-3">
                          <span className="flex flex-col gap-2">
                            {deletableItems.map((item) => (
                              <span key={item.id} className="block text-sm">{item.filename}</span>
                            ))}
                          </span>
                        </span>

                        <span className="block text-sm font-medium text-destructive">
                          Cannot Delete ({errorDetails.length} item{errorDetails.length !== 1 ? "s" : ""}):
                        </span>
                        <span className="block max-h-[150px] overflow-y-auto">
                          <span className="flex flex-col gap-3">
                            {errorDetails.map((item: { filename: string; reason: string }, index: number) => (
                              <span key={index} className="block border-l-2 border-destructive pl-3 py-1">
                                <span className="block text-sm font-medium">{item.filename}</span>
                                <span className="block text-xs text-muted-foreground mt-0.5">{item.reason}</span>
                              </span>
                            ))}
                          </span>
                        </span>
                        <span className="block text-xs text-muted-foreground pt-2 border-t">
                          You can delete the {deletableCount} item{deletableCount !== 1 ? "s" : ""} that are not in use.
                        </span>
                      </span>
                    );
                  } catch {
                    return <span className="block text-sm">{deleteError}</span>;
                  }
                }

                // All cannot be deleted scenario
                if (deleteError) {
                  try {
                    const errorDetails = JSON.parse(deleteError);
                    return (
                      <span className="block space-y-4">
                        <span className="block text-sm font-medium text-destructive">
                          {errorDetails.length} media file(s) cannot be deleted:
                        </span>
                        <span className="block max-h-[300px] overflow-y-auto">
                          <span className="flex flex-col gap-3">
                            {errorDetails.map((item: { filename: string; reason: string }, index: number) => (
                              <span key={index} className="block border-l-2 border-destructive pl-3 py-1">
                                <span className="block text-sm font-medium">{item.filename}</span>
                                <span className="block text-xs text-muted-foreground mt-0.5">{item.reason}</span>
                              </span>
                            ))}
                          </span>
                        </span>
                        <span className="block text-xs text-muted-foreground pt-2 border-t">
                          Tip: Remove media from client settings or articles before attempting to delete.
                        </span>
                      </span>
                    );
                  } catch {
                    return (
                      <span className="block space-y-4">
                        <span className="block border-l-2 border-destructive pl-3 py-1">
                          <span className="block text-sm">{deleteError}</span>
                        </span>
                      </span>
                    );
                  }
                }

                // Normal confirmation
                return deleteTarget?.type === "single" ? (
                  `Are you sure you want to delete this media file? This action cannot be undone.`
                ) : (
                  `Are you sure you want to delete ${deleteTarget?.ids?.length || 0} media file(s)? This action cannot be undone.`
                );
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting || isChecking}>
              {deleteError && !deleteTarget?.deletableIds ? "Close" : "Cancel"}
            </AlertDialogCancel>
            {(() => {
              // Show delete button for partial deletion
              if (deleteError && deleteTarget?.deletableIds && deleteTarget.deletableIds.length > 0) {
                return (
                  <AlertDialogAction
                    onClick={confirmDelete}
                    disabled={isDeleting || isChecking}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      `Delete ${deleteTarget.deletableIds.length} Item${deleteTarget.deletableIds.length !== 1 ? "s" : ""}`
                    )}
                  </AlertDialogAction>
                );
              }
              // Show delete button for normal deletion
              if (!deleteError) {
                return (
                  <AlertDialogAction
                    onClick={confirmDelete}
                    disabled={isDeleting || isChecking}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                );
              }
              return null;
            })()}
          </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
