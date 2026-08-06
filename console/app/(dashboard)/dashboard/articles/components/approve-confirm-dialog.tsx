"use client";

import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ar } from "@/lib/ar";

interface ApproveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending: boolean;
  articleTitle: string;
}

/**
 * Approval confirmation for the client.
 *
 * Replaces the previous 8-second sonner toast: a publish decision must not expire on a
 * timer. The dialog stays until the client answers, and outside-click / Esc are blocked
 * so the choice is always deliberate — the same contract as the admin publish gate.
 */
export function ApproveConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  pending,
  articleTitle,
}: ApproveConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        role="alertdialog"
        // زرّ الإغلاق (X) مخفيّ: المخرج الوحيد «نعم، وافق» أو «إلغاء».
        // إخفاء بالـCSS لا تعديل في مكوّن shadcn — بقية الحوارات تحتفظ بالـX.
        className="sm:max-w-md [&>button:last-child]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{ar.articles.approveArticle}</DialogTitle>
          <DialogDescription>{ar.articles.approveConfirm}</DialogDescription>
        </DialogHeader>

        <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm font-medium">
          {articleTitle}
        </p>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {ar.articles.cancel}
          </Button>
          <Button onClick={onConfirm} disabled={pending}>
            {pending ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="me-2 h-4 w-4" />
            )}
            {ar.articles.confirmYes}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
