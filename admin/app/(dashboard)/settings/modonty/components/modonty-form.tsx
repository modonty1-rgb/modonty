"use client";

import { useState, useTransition, useCallback } from "react";
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import { updateAllSettings, type AllSettings } from "../../actions/settings-actions";
import { Section } from "../../_shared/section";
import { Field } from "../../_shared/field";
import { ImageField } from "../../_shared/image-field";
import { StatusBadge } from "../../_shared/status-badge";
import { formatTimeAgo } from "../../_shared/format-time-ago";
import { SEO_HINTS } from "../../_shared/seo-hints";

interface Props {
  initialSettings: AllSettings;
}

// Small grouping sub-header used inside the SEO tab to chunk fields by purpose.
function GroupHeader({ icon, title, note, tone }: { icon: string; title: string; note?: string; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`grid h-6 w-6 place-items-center rounded-md text-xs ${tone}`}>{icon}</span>
      <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
      {note && <span className="text-[11px] text-muted-foreground">— {note}</span>}
    </div>
  );
}

// Fields owned by this form. The homepage form is now SEO-only — social links,
// business info, the homepage banner, and the brand identity (description + logos)
// each moved to their own settings area (/settings/social, /settings/business,
// /settings/banner, /settings/brand).
const F = {
  // How the homepage looks in Google + when shared (meta + OG image).
  search: ["modontySeoTitle", "modontySeoDescription", "ogImageUrl"],
} satisfies Record<string, (keyof AllSettings)[]>;

const norm = (v: unknown) => (v === undefined || v === null ? "" : v);

export function ModontyForm({ initialSettings }: Props) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AllSettings>(initialSettings);
  // Snapshot of what's persisted — per-tab dirty = fields differ from this.
  const [savedSnapshot, setSavedSnapshot] = useState<AllSettings>(initialSettings);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [savingTab, setSavingTab] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  const set = useCallback(<K extends keyof AllSettings>(key: K, value: AllSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isTabDirty = (fields: readonly (keyof AllSettings)[]) =>
    fields.some((f) => norm(settings[f]) !== norm(savedSnapshot[f]));

  function handleSaveTab(tabKey: string, fields: readonly (keyof AllSettings)[]) {
    startSaving(async () => {
      setSavingTab(tabKey);
      const scoped: Partial<AllSettings> = {};
      for (const f of fields) {
        (scoped as Record<string, unknown>)[f] = (settings as unknown as Record<string, unknown>)[f];
      }
      const r = await updateAllSettings(scoped);
      if (!r.success) {
        toast({ title: messages.error.update_failed, description: r.error || "فشل حفظ الإعدادات", variant: "destructive" });
        setSavingTab(null);
        return;
      }
      setSavedSnapshot((prev) => ({ ...prev, ...scoped }));
      setSavedAt(new Date());
      setSavingTab(null);
      toast({ title: messages.success.saved, description: "يجري تحديث المحتوى في الخلفية.", variant: "success" });
    });
  }

  const cacheLabel = formatTimeAgo(settings.jsonLdLastGenerated);

  // Per-tab save footer — bleeds to the Section card edges.
  const tabFooter = (tabKey: string, fields: readonly (keyof AllSettings)[], label: string) => {
    const dirty = isTabDirty(fields);
    const saving = isSaving && savingTab === tabKey;
    return (
      <div className="-mx-5 -mb-5 mt-1 flex items-center justify-between gap-3 border-t bg-muted/20 px-5 py-3.5">
        <StatusBadge isDirty={dirty} isSaving={saving} savedAt={savedAt} />
        <Button onClick={() => handleSaveTab(tabKey, fields)} disabled={isSaving || !dirty} size="sm" className="h-8 gap-1.5">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          {saving ? "Saving..." : `Save ${label}`}
        </Button>
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      {/* Cache strip — homepage-wide, above the form */}
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-2.5 text-xs">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {/* suppressHydrationWarning: relative time is computed from Date.now() — server and client
              text legitimately differ when a minute boundary passes between SSR and hydration. */}
          Homepage SEO cache · refreshed <span suppressHydrationWarning className="font-medium text-foreground">{cacheLabel}</span>
        </span>
        <span className="text-[11px] text-muted-foreground/70">Updates automatically on Save</span>
      </div>

      {/* ─── SEO & Sharing (the form's only section now) ─── */}
      <Section
            title="SEO & Sharing"
            description="How the homepage appears in Google search results and when shared on social media."
          >
            <div className="min-w-0 space-y-6">
            {/* Group 1 — Search appearance */}
            <div className="space-y-3">
              <GroupHeader icon="🔍" title="Search appearance" note="the snippet shown in Google" tone="bg-primary/10 text-primary" />
              <Field
                label="SEO Title"
                hint={SEO_HINTS.title}
                counter={settings.modontySeoTitle?.length ?? 0}
                counterMax={60}
                counterMin={30}
              >
                <Input
                  value={settings.modontySeoTitle ?? ""}
                  onChange={(e) => set("modontySeoTitle", e.target.value)}
                  placeholder="مدونتي | منصة المحتوى العربي"
                  maxLength={60}
                />
              </Field>
              <Field
                label="SEO Description"
                hint={SEO_HINTS.description}
                counter={settings.modontySeoDescription?.length ?? 0}
                counterMax={160}
                counterMin={120}
              >
                <Textarea
                  value={settings.modontySeoDescription ?? ""}
                  onChange={(e) => set("modontySeoDescription", e.target.value)}
                  placeholder="تصفح آلاف المقالات من أفضل الكتّاب..."
                  className="resize-none min-h-[72px]"
                  maxLength={160}
                />
              </Field>
            </div>

            {/* Group 2 — Share image (brand identity + logos moved to /settings/brand) */}
            <div className="space-y-3 border-t border-border pt-4">
              <GroupHeader icon="🖼️" title="Share image" note="Open Graph — shown when the homepage is shared" tone="bg-emerald-500/15 text-emerald-600" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageField
                  label="Share Image"
                  value={settings.ogImageUrl ?? ""}
                  onChange={(v) => set("ogImageUrl", v)}
                  hint="1200×630 px — the Open Graph image shown when the page is shared on social media."
                  aspect="og"
                />
              </div>
            </div>
            </div>

            {tabFooter("search", F.search, "SEO")}
      </Section>
    </TooltipProvider>
  );
}
