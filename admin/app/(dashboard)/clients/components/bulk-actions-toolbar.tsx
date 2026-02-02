"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { bulkDeleteClients } from "../actions/clients-actions";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleBulkDelete = async () => {
    setDeleteDialogOpen(false);
    setIsDeleting(true);
    try {
      const result = await bulkDeleteClients(selectedIds);
      if (result.success) {
        toast({
          title: "Success",
          description: `Deleted ${selectedIds.length} client(s)`,
        });
        onClearSelection();
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete clients",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete clients",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
            {selectedIds.length} client(s) selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            disabled={isDeleting}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isDeleting}
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
              This action cannot be undone. This will permanently delete {selectedIds.length} client(s) and all associated data.
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
    </>
  );
}
