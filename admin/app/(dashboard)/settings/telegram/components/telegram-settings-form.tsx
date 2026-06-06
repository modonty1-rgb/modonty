"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

import { saveTelegramAdminMirror } from "../actions/telegram-settings-actions";

export function TelegramSettingsForm({ initialMirrorAll }: { initialMirrorAll: boolean }) {
  const { toast } = useToast();
  const router = useRouter();
  const [mirrorAll, setMirrorAll] = useState(initialMirrorAll);
  const [pending, startTransition] = useTransition();

  function handleToggle(next: boolean) {
    const prev = mirrorAll;
    setMirrorAll(next); // optimistic
    startTransition(async () => {
      const res = await saveTelegramAdminMirror(next);
      if (res.ok) {
        toast({
          title: next
            ? "Activity feed ON — all events mirrored to admin"
            : "Activity feed OFF — only key events mirrored",
        });
        router.refresh();
      } else {
        setMirrorAll(prev); // revert
        toast({ title: "Failed to save", description: res.error, variant: "destructive" });
      }
    });
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Send className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">Admin activity feed</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            When ON, every client Telegram event (views, likes, comments, bookings…) is also mirrored to the
            admin Telegram channel — a full site-activity firehose for live monitoring. Turn OFF to mirror only
            high-signal events (booking, support message, direct question, campaign interest).
          </p>
          <label className="mt-4 flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={mirrorAll}
              disabled={pending}
              onCheckedChange={(v) => handleToggle(v === true)}
            />
            <span className="flex items-center gap-2 text-sm font-medium">
              Mirror all events to the admin channel
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
