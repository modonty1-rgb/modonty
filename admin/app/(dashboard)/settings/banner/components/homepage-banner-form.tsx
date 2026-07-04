"use client";

import { useState, useTransition, useCallback } from "react";
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import { updateAllSettings, type AllSettings } from "../../actions/settings-actions";
import { Section } from "../../_shared/section";
import { Field } from "../../_shared/field";
import { StatusBadge } from "../../_shared/status-badge";

interface Props {
  initialSettings: AllSettings;
}

// Visible welcome banner at the top of the homepage feed (NOT meta) — moved
// out of the Modonty Homepage form into its own area. Future home for landing /
// hero / overlay-image options. Saves ONLY these fields.
const BANNER_FIELDS = ["platformTagline", "platformDescription"] as const satisfies readonly (keyof AllSettings)[];

const norm = (v: unknown) => (v === undefined || v === null ? "" : v);

export function HomepageBannerForm({ initialSettings }: Props) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AllSettings>(initialSettings);
  // Snapshot of what's persisted — dirty = fields differ from this.
  const [savedSnapshot, setSavedSnapshot] = useState<AllSettings>(initialSettings);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isSaving, startSaving] = useTransition();

  const set = useCallback(<K extends keyof AllSettings>(key: K, value: AllSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const dirty = BANNER_FIELDS.some((f) => norm(settings[f]) !== norm(savedSnapshot[f]));

  function handleSave() {
    startSaving(async () => {
      const scoped: Partial<AllSettings> = {};
      for (const f of BANNER_FIELDS) {
        (scoped as Record<string, unknown>)[f] = (settings as unknown as Record<string, unknown>)[f];
      }
      const r = await updateAllSettings(scoped);
      if (!r.success) {
        toast({ title: messages.error.update_failed, description: r.error || "فشل حفظ الإعدادات", variant: "destructive" });
        return;
      }
      setSavedSnapshot((prev) => ({ ...prev, ...scoped }));
      setSavedAt(new Date());
      toast({ title: messages.success.saved, description: "يجري تحديث المحتوى في الخلفية.", variant: "success" });
    });
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Section
        title="Homepage Banner"
        description="The welcome banner shown at the top of the homepage feed on modonty.com (visible on-page text)."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Fields */}
          <div className="space-y-4">
            <Field
              label="Tagline"
              hint="سطر واحد فقط — يظهر في كرت الترحيب أعلى الصفحة الرئيسية."
              counter={settings.platformTagline?.length ?? 0}
              counterMax={45}
              counterMin={10}
            >
              <Input
                value={settings.platformTagline ?? ""}
                onChange={(e) => set("platformTagline", e.target.value)}
                placeholder="مرحباً بك في مودونتي"
                maxLength={45}
              />
            </Field>
            <Field
              label="Description"
              hint="سطر واحد فقط — أي نص زائد يُقصّ في الكرت."
              counter={settings.platformDescription?.length ?? 0}
              counterMax={80}
              counterMin={20}
            >
              <Input
                value={settings.platformDescription ?? ""}
                onChange={(e) => set("platformDescription", e.target.value)}
                placeholder="منصة المحتوى العربي — اكتشف مقالات من خبراء ومتخصصين..."
                maxLength={80}
              />
            </Field>
          </div>

          {/* Live preview of the on-page banner */}
          <div className="min-w-0">
            <p className="mb-2 text-[11px] font-semibold text-muted-foreground">Preview on the homepage</p>
            <div
              dir="rtl"
              className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border bg-gradient-to-br from-primary/10 via-card to-background p-6 text-center"
            >
              <h3 className="text-xl font-bold text-foreground line-clamp-1 w-full">
                {settings.platformTagline?.trim() || "مرحباً بك في مدوّنتي"}
              </h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground line-clamp-1 w-full">
                {settings.platformDescription?.trim() || "منصة المحتوى العربي — اكتشف مقالات من خبراء ومتخصصين."}
              </p>
            </div>
          </div>
        </div>

        {/* Save footer — bleeds to the Section card edges. */}
        <div className="-mx-5 -mb-5 mt-1 flex items-center justify-between gap-3 border-t bg-muted/20 px-5 py-3.5">
          <StatusBadge isDirty={dirty} isSaving={isSaving} savedAt={savedAt} />
          <Button onClick={handleSave} disabled={isSaving || !dirty} size="sm" className="h-8 gap-1.5">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            {isSaving ? "Saving..." : "Save Banner"}
          </Button>
        </div>
      </Section>
    </TooltipProvider>
  );
}
