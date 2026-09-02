"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { restoreTask } from "../actions/task-actions";

/**
 * The only client island on the archive screen.
 *
 * The list itself stays a server component — a row with one button must not
 * drag two hundred rows into the browser, the same reason the reels record list
 * mounts its lifecycle button and nothing else on the client.
 */
export function RestoreTaskButton({
  id,
  title,
  column,
}: {
  id: string;
  title: string;
  column: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      className="h-8 shrink-0 gap-1.5 text-xs"
      onClick={() =>
        startTransition(async () => {
          const result = await restoreTask(id);
          toast(
            result.success
              ? { title: "Restored", description: `${title} is back in ${column}.` }
              : { title: "Restore failed", description: result.error, variant: "destructive" },
          );
          router.refresh();
        })
      }
    >
      <Undo2 className="size-3.5" aria-hidden />
      {isPending ? "Restoring…" : "Restore"}
    </Button>
  );
}
