"use client";

import { useState, useTransition } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { ArticleStatus } from "@prisma/client";
import { transitionArticleAction } from "../actions/transition-article";
import { ArrowRight, Loader2, Lock } from "lucide-react";

interface TransitionButtonProps {
  articleId: string;
  articleTitle: string;
  expectedFrom: ArticleStatus;
  toStatus: ArticleStatus;
  actionLabel: string;
  confirmTitle: string;
  confirmDescription: string;
  successMessage: string;
  /** When true, button is disabled with a lock icon (used when SEO checks fail). */
  hasErrors?: boolean;
}

export function TransitionButton({
  articleId,
  articleTitle,
  expectedFrom,
  toStatus,
  actionLabel,
  confirmTitle,
  confirmDescription,
  successMessage,
  hasErrors = false,
}: TransitionButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await transitionArticleAction(articleId, expectedFrom, toStatus);
      if (result.success) {
        toast({ title: successMessage, description: articleTitle });
        setOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Transition failed",
          description: result.error || "Unknown error",
        });
      }
    });
  };

  if (hasErrors) {
    return (
      <Button
        size="sm"
        variant="default"
        disabled
        className="whitespace-nowrap gap-1.5 cursor-not-allowed"
        title="Fix SEO issues first — click the issues pill to see details"
      >
        <Lock className="h-3.5 w-3.5" />
        {actionLabel}
      </Button>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="default"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="whitespace-nowrap gap-1.5"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ArrowRight className="h-3.5 w-3.5" />
        )}
        {actionLabel}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">{confirmDescription}</span>
              <span className="block font-semibold text-foreground">
                Article: {articleTitle}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Working…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
