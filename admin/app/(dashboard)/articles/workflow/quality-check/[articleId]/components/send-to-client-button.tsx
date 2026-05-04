"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Send, Loader2 } from "lucide-react";
import { gatedTransitionAction } from "../../../actions/gated-transition";

interface Props {
  articleId: string;
  articleTitle: string;
  disabled: boolean;
}

export function SendToClientButton({ articleId, articleTitle, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleSend = () => {
    startTransition(async () => {
      const result = await gatedTransitionAction(articleId);
      if (result.success) {
        toast({
          title: "Article sent for client approval",
          description: articleTitle,
        });
        setOpen(false);
        router.push("/articles/workflow/draft-to-approval");
      } else {
        toast({
          variant: "destructive",
          title: "Send failed",
          description: result.error || "Unknown error — refresh the page.",
        });
        setOpen(false);
        // Refresh to re-run validation in case article state changed
        router.refresh();
      }
    });
  };

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        disabled={disabled || isPending}
        className="gap-1.5"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        Send for Approval
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send to client for approval?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Article will move from Draft to Awaiting Approval. Client will be notified.
              </span>
              <span className="block font-semibold text-foreground" dir="rtl">
                {articleTitle}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend} disabled={isPending}>
              {isPending ? "Sending…" : "Send"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
