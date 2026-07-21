"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";

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
import { Trash2, ImageOff, ExternalLink, Loader2 } from "lucide-react";
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
  client: { name: string } | null;
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

// Inline (no dialog) — the full unused-files list lives directly on the Maintenance
// page so the admin reviews and acts in place, no drill-down.
export function UnusedMediaList({ items }: { items: UnusedItem[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<UnusedItem | null>(null);
  const [isDeleting, startDelete] = useTransition();

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
    <div className="rounded-xl border bg-card">
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-4 py-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
              {item.mimeType.startsWith("image/") && isHostAllowed(item.url) ? (
                <NextImage src={item.url} alt={item.filename} fill className="object-cover" sizes="48px" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageOff className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={item.filename}>
                {item.filename}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">{item.client?.name ?? "General"}</span>
                {" · "}
                {item.type} · {formatBytes(item.fileSize)} · uploaded{" "}
                {new Date(item.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button asChild size="sm" variant="ghost" className="h-8 gap-1 text-xs">
                <Link href={`/media/${item.id}/edit`}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </Link>
              </Button>
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

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && !isDeleting && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="mb-1 block">{pendingDelete?.filename}</strong>
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
              {isDeleting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Trash2 className="me-2 h-4 w-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
