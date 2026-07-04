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

// Small grouping sub-header — same visual as the Modonty Homepage form.
function GroupHeader({ icon, title, note, tone }: { icon: string; title: string; note?: string; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`grid h-6 w-6 place-items-center rounded-md text-xs ${tone}`}>{icon}</span>
      <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
      {note && <span className="text-[11px] text-muted-foreground">— {note}</span>}
    </div>
  );
}

// The organization's factual details (Organization structured data) — moved
// out of the Modonty Homepage form into its own settings area. Saves ONLY these fields.
const BUSINESS_FIELDS = [
  "orgContactEmail", "orgContactTelephone",
  "orgStreetAddress", "orgAddressLocality", "orgAddressRegion", "orgPostalCode",
  "orgAddressCountry", "orgGeoLatitude", "orgGeoLongitude",
  "googleBusinessProfileUrl",
] as const satisfies readonly (keyof AllSettings)[];

const norm = (v: unknown) => (v === undefined || v === null ? "" : v);

export function BusinessInfoForm({ initialSettings }: Props) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AllSettings>(initialSettings);
  // Snapshot of what's persisted — dirty = fields differ from this.
  const [savedSnapshot, setSavedSnapshot] = useState<AllSettings>(initialSettings);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isSaving, startSaving] = useTransition();

  const set = useCallback(<K extends keyof AllSettings>(key: K, value: AllSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const dirty = BUSINESS_FIELDS.some((f) => norm(settings[f]) !== norm(savedSnapshot[f]));

  function handleSave() {
    startSaving(async () => {
      const scoped: Partial<AllSettings> = {};
      for (const f of BUSINESS_FIELDS) {
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
        title="Business Info"
        description="Your organization's factual details — contact, address & location. Used in Google's structured data (Knowledge Panel)."
      >
        {/* Contact */}
        <div className="space-y-3">
          <GroupHeader icon="📞" title="Contact" note="Organization contactPoint" tone="bg-primary/10 text-primary" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Email">
              <Input type="email" value={settings.orgContactEmail ?? ""} onChange={(e) => set("orgContactEmail", e.target.value)} placeholder="info@modonty.com" />
            </Field>
            <Field label="Phone">
              <Input value={settings.orgContactTelephone ?? ""} onChange={(e) => set("orgContactTelephone", e.target.value)} placeholder="+966500000000" />
            </Field>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Hours: always 24/7 (online platform) — emitted automatically as round-the-clock structured data.
          </p>
        </div>

        {/* Address */}
        <div className="space-y-3 border-t border-border pt-4">
          <GroupHeader icon="📍" title="Address" tone="bg-amber-500/15 text-amber-600" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Street">
              <Input value={settings.orgStreetAddress ?? ""} onChange={(e) => set("orgStreetAddress", e.target.value)} />
            </Field>
            <Field label="City">
              <Input value={settings.orgAddressLocality ?? ""} onChange={(e) => set("orgAddressLocality", e.target.value)} />
            </Field>
            <Field label="Region">
              <Input value={settings.orgAddressRegion ?? ""} onChange={(e) => set("orgAddressRegion", e.target.value)} />
            </Field>
            <Field label="Postal Code">
              <Input value={settings.orgPostalCode ?? ""} onChange={(e) => set("orgPostalCode", e.target.value)} />
            </Field>
            <Field label="Country" hint="Two-letter code (e.g. SA, EG)">
              <Input value={settings.orgAddressCountry ?? ""} onChange={(e) => set("orgAddressCountry", e.target.value)} placeholder="SA" />
            </Field>
          </div>
        </div>

        {/* Location & Google */}
        <div className="space-y-3 border-t border-border pt-4">
          <GroupHeader icon="🗺️" title="Location & Google" note="map pin + verified business link" tone="bg-emerald-500/15 text-emerald-600" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Latitude">
              <Input
                type="number"
                step="any"
                value={settings.orgGeoLatitude ?? ""}
                onChange={(e) => set("orgGeoLatitude", e.target.value ? parseFloat(e.target.value) : null)}
              />
            </Field>
            <Field label="Longitude">
              <Input
                type="number"
                step="any"
                value={settings.orgGeoLongitude ?? ""}
                onChange={(e) => set("orgGeoLongitude", e.target.value ? parseFloat(e.target.value) : null)}
              />
            </Field>
          </div>
          <Field
            label="Google Business Profile URL"
            hint="Paste the Google Maps / Business Profile link after the team creates & verifies it — feeds the Organization sameAs (proves you're a real, verified business)."
          >
            <Input
              value={settings.googleBusinessProfileUrl ?? ""}
              onChange={(e) => set("googleBusinessProfileUrl", e.target.value)}
              placeholder="https://g.co/kgs/… أو https://maps.google.com/?cid=…"
            />
          </Field>
        </div>

        {/* Save footer — bleeds to the Section card edges. */}
        <div className="-mx-5 -mb-5 mt-1 flex items-center justify-between gap-3 border-t bg-muted/20 px-5 py-3.5">
          <StatusBadge isDirty={dirty} isSaving={isSaving} savedAt={savedAt} />
          <Button onClick={handleSave} disabled={isSaving || !dirty} size="sm" className="h-8 gap-1.5">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            {isSaving ? "Saving..." : "Save Business"}
          </Button>
        </div>
      </Section>
    </TooltipProvider>
  );
}
