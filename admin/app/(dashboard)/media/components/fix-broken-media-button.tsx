"use client";

import { useState, useTransition } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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

import { fixBrokenMedia, type FixBrokenMediaResult } from "../actions/fix-broken-media";

export function FixBrokenMediaButton() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleRun = () => {
    setConfirmOpen(false);
    startTransition(async () => {
      const result: FixBrokenMediaResult = await fixBrokenMedia();
      if (!result.ok) {
        toast({ title: "Scan failed", description: result.error ?? "Unknown error", variant: "destructive" });
        return;
      }
      toast({
        title: "Broken-image scan complete",
        description: `Scanned ${result.scanned} · broken ${result.broken} · replaced ${result.fixed}${result.skipped ? ` · skipped ${result.skipped}` : ""}`,
        variant: result.fixed > 0 ? "success" : "default",
      });
      if (result.fixed > 0) router.refresh();
    });
  };

  return (
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setConfirmOpen(true)} disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageOff className="h-4 w-4" />}
        {isPending ? "Scanning…" : "Fix broken images"}
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Scan for broken images?</AlertDialogTitle>
          <AlertDialogDescription>
            Checks every media file against Cloudinary. Any image whose file is missing (deleted) gets its link
            swapped to the platform default so the public site shows the placeholder instead of a broken image.
            The creative can re-upload the real image later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRun}>Run scan</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
