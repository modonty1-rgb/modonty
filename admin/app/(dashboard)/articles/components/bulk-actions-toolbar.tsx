"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ArticleStatus } from "@prisma/client";
import { getStatusLabel } from "../helpers/status-utils";
import { bulkDeleteArticles, bulkUpdateArticleStatus } from "../actions/articles-actions";
import { Trash2, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface BulkActionsToolbarProps {
  selectedIds: string[];
  onClearSelection: () => void;
}

export function BulkActionsToolbar({
  selectedIds,
  onClearSelection,
}: BulkActionsToolbarProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ArticleStatus | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleBulkDelete = async () => {
    setDeleteDialogOpen(false);
    setIsDeleting(true);
    try {
      const result = await bulkDeleteArticles(selectedIds);
      if (result.success) {
        toast({
          title: "Success",
          description: `Deleted ${selectedIds.length} article(s)`,
        });
        onClearSelection();
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete articles",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete articles",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusSelect = (status: ArticleStatus) => {
    setPendingStatus(status);
    setStatusDialogOpen(true);
  };

  const handleBulkStatusChange = async () => {
    if (!pendingStatus) return;
    
    setStatusDialogOpen(false);
    setIsUpdating(true);
    try {
      const result = await bulkUpdateArticleStatus(selectedIds, pendingStatus);
      if (result.success) {
        toast({
          title: "Success",
          description: `Updated ${selectedIds.length} article(s) status to ${getStatusLabel(pendingStatus)}`,
        });
        onClearSelection();
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update article status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update article status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setPendingStatus(null);
    }
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between border rounded-lg p-3 bg-muted/50">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedIds.length} article(s) selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            disabled={isDeleting || isUpdating}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) => handleStatusSelect(value as ArticleStatus)}
            disabled={isDeleting || isUpdating}
            value={pendingStatus && statusDialogOpen ? pendingStatus : undefined}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Change status..." />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ArticleStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {getStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isDeleting || isUpdating}
          >
            {isDeleting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedIds.length} article(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          setStatusDialogOpen(open);
          if (!open) {
            setPendingStatus(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of {selectedIds.length} article(s) to {pendingStatus ? getStatusLabel(pendingStatus) : ""}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkStatusChange} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Status"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
