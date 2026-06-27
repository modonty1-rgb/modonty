"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Trash2, ImageOff, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteMedia } from "../actions/media-actions";
import { formatBytes } from "@modonty/database/lib/utils";

interface UnusedItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  fileSize: number | null;
  createdAt: Date;
  type: string;
}

const ALLOWED_HOST_RE =
  /(^|\.)((images\.unsplash\.com)|(.*\.unsplash\.com)|(.*\.cloudinary\.com)|(.*\.amazonaws\.com)|(.*\.googleapis\.com))$/;

function isHostAllowed(url: string): boolean {
  try {
    return ALLOWED_HOST_RE.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function UnusedMediaButton({ items }: { items: UnusedItem[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UnusedItem | null>(null);
  const [isDeleting, startDelete] = useTransition();

  if (items.length === 0) return null;

  const handleDelete = (item: UnusedItem) => {
    startDelete(async () => {
      const result = await deleteMedia(item.id);
      if (result.success) {
        toast({ title: `Deleted ${item.filename}` });
        setPendingDelete(null);
        router.refresh();
      } else {
        toast({
          title: "Couldn't delete",
          description: result.error ?? "Unknown error",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between gap-4 rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 hover:bg-amber-500/10 transition-colors text-start"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-amber-500/15">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {items.length} unused file{items.length === 1 ? "" : "s"} — not linked to any article or client
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click to review and decide whether to keep, reassign, or delete.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
          Review now
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Unused files ({items.length})</DialogTitle>
            <DialogDescription>
              These files were uploaded but are not linked to any article or client. Decide each one: keep, edit to reassign, or delete.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="py-3 flex items-center gap-3">
                  <div className="relative h-14 w-14 rounded-md overflow-hidden bg-muted shrink-0">
                    {item.mimeType.startsWith("image/") && isHostAllowed(item.url) ? (
                      <NextImage
                        src={item.url}
                        alt={item.filename}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageOff className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={item.filename}>
                      {item.filename}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.type} · {formatBytes(item.fileSize)} · uploaded {new Date(item.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/media/${item.id}/edit`}>
                      <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPendingDelete(item)}
                      className="h-8 gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <DialogFooter className="border-t pt-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && !isDeleting && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="block mb-1">{pendingDelete?.filename}</strong>
              This deletes the file from Cloudinary AND from the database. Cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => pendingDelete && handleDelete(pendingDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Trash2 className="h-4 w-4 me-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
