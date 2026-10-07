"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wand2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { autoFixSchemaAction } from "../actions/pipeline-actions";

interface Props {
  articleId: string;
  onSuccess?: () => void;
}

export function AutoFixSchemaButton({ articleId, onSuccess }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = () => {
    startTransition(async () => {
      const res = await autoFixSchemaAction(articleId);
      if (res.ok) {
        toast({
          title: "Schema regenerated",
          description: res.details ?? "JSON-LD cache updated. Re-run Stages 1-7 to verify.",
        });
        onSuccess?.();
        router.refresh();
      } else {
        toast({
          title: "Auto-fix failed",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
      Auto-fix schema
    </button>
  );
}
