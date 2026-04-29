"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ar } from "@/lib/ar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, FileText, CheckCircle2, MessageSquare, Mail } from "lucide-react";
import {
  updateNotificationPreferences,
  type NotificationPreferences,
} from "../actions/settings-actions";

interface Props {
  initial: NotificationPreferences | null;
}

export function SettingsForm({ initial }: Props) {
  const s = ar.settings;
  const [prefs, setPrefs] = useState<NotificationPreferences>(initial ?? {});
  const [isPending, startTransition] = useTransition();

  function setBool(key: keyof NotificationPreferences, value: boolean) {
    setPrefs((p: NotificationPreferences) => ({ ...p, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateNotificationPreferences(prefs);
      if (res.success) toast.success(s.saved);
      else toast.error(res.error || s.updateFailed);
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-4 w-4 text-primary" />
          {s.notifications}
        </CardTitle>
        <CardDescription>{s.notificationsHint}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <PrefRow
              icon={FileText}
              label={s.articlePublished}
              checked={!!prefs.articlePublished}
              onChange={(v) => setBool("articlePublished", v)}
            />
            <PrefRow
              icon={CheckCircle2}
              label={s.articleApprovedOption}
              checked={!!prefs.articleApproved}
              onChange={(v) => setBool("articleApproved", v)}
            />
            <PrefRow
              icon={MessageSquare}
              label={s.commentsNew}
              checked={!!prefs.commentsNew}
              onChange={(v) => setBool("commentsNew", v)}
            />
            <PrefRow
              icon={Mail}
              label={s.supportReplies}
              checked={!!prefs.supportReplies}
              onChange={(v) => setBool("supportReplies", v)}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? s.saving : s.save}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PrefRow({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/40">
      <span className="flex items-center gap-2.5 text-sm text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </span>
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
      />
    </label>
  );
}
