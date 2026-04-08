"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { messages } from "@/lib/messages";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Eye } from "lucide-react";
import { deleteTag } from "../actions/tags-actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function TagRowActions({ tagId }: { tagId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    setIsDeleting(true);
    try {
      const result = await deleteTag(tagId);
      if (result.success) { toast({ title: messages.success.deleted, description: messages.descriptions.tag_deleted, variant: "success" }); router.refresh(); }
      else { toast({ title: messages.error.delete_failed, description: result.error || messages.descriptions.tag_delete_failed, variant: "destructive" }); }
    } catch { toast({ title: messages.error.delete_failed, description: messages.descriptions.tag_delete_failed, variant: "destructive" }); }
    finally { setIsDeleting(false); }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/tags/${tagId}`)} aria-label="View"><Eye className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/tags/${tagId}/edit`)} aria-label="Edit"><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteDialogOpen(true)} disabled={isDeleting} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete this tag.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? "Deleting…" : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
