"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ar } from "@/lib/ar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateClientSettings } from "../actions/settings-actions";
import type { NotificationPreferences } from "../actions/settings-actions";

interface SettingsFormProps {
  clientId: string;
  initial: {
    notificationPreferences?: NotificationPreferences | null;
  };
}

export function SettingsForm({ clientId, initial }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<NotificationPreferences>(
    initial.notificationPreferences ?? {}
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await updateClientSettings(clientId, {
        notificationPreferences: prefs,
      });
      if (res.success) {
        router.refresh();
      } else {
        setError(res.error ?? ar.settings.updateFailed);
      }
    } catch {
      setError(ar.settings.somethingWrong);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{ar.settings.notifications}</CardTitle>
        <CardDescription>{ar.settings.notificationsDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!prefs.articlePublished}
                    onChange={(e) =>
                      setPrefs((p) => ({
                        ...p,
                        articlePublished: e.target.checked,
                      }))
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">{ar.settings.articlePublished}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!prefs.articleApproved}
                    onChange={(e) =>
                      setPrefs((p) => ({
                        ...p,
                        articleApproved: e.target.checked,
                      }))
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">{ar.settings.articleApproved}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!prefs.commentsNew}
                    onChange={(e) =>
                      setPrefs((p) => ({
                        ...p,
                        commentsNew: e.target.checked,
                      }))
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">{ar.settings.commentsNew}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!prefs.supportReplies}
                    onChange={(e) =>
                      setPrefs((p) => ({
                        ...p,
                        supportReplies: e.target.checked,
                      }))
                    }
                    className="rounded border-input"
                  />
                  <span className="text-sm">{ar.settings.supportReplies}</span>
                </label>
                <div className="space-y-2">
                  <Label className="text-sm">{ar.settings.digest}</Label>
                  <select
                    value={prefs.digest ?? "none"}
                    onChange={(e) =>
                      setPrefs((p) => ({
                        ...p,
                        digest: e.target.value as "none" | "weekly" | "monthly",
                      }))
                    }
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="none">{ar.settings.digestNone}</option>
                    <option value="weekly">{ar.settings.digestWeekly}</option>
                    <option value="monthly">{ar.settings.digestMonthly}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? ar.settings.saving : ar.settings.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
