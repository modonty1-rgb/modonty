"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Eye } from "lucide-react";
import { deleteIndustry } from "../actions/industries-actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function IndustryRowActions({ industryId }: { industryId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    setIsDeleting(true);
    try {
      const result = await deleteIndustry(industryId);
      if (result.success) { toast({ title: "Success", description: "Industry deleted successfully" }); router.refresh(); }
      else { toast({ title: "Error", description: result.error || "Failed to delete industry", variant: "destructive" }); }
    } catch { toast({ title: "Error", description: "Failed to delete industry", variant: "destructive" }); }
    finally { setIsDeleting(false); }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/industries/${industryId}`)} aria-label="View"><Eye className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/industries/${industryId}/edit`)} aria-label="Edit"><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteDialogOpen(true)} disabled={isDeleting} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete this industry.</AlertDialogDescription>
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
