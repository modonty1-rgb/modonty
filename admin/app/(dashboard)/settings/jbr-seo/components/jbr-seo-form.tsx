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

// Everything that belongs to the JBR SEO sales channel (the "بوابة البيع" B2B promo panel).
const FIELDS = [
  "b2bLabel", "b2bHeadline", "b2bBullet1", "b2bBullet2", "b2bBullet3", "b2bCtaText", "b2bCtaUrl",
] as const satisfies readonly (keyof AllSettings)[];

const norm = (v: unknown) => (v === undefined || v === null ? "" : v);

export function JbrSeoForm({ initialSettings }: { initialSettings: AllSettings }) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AllSettings>(initialSettings);
  const [savedSnapshot, setSavedSnapshot] = useState<AllSettings>(initialSettings);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isSaving, startSaving] = useTransition();

  const set = useCallback(<K extends keyof AllSettings>(key: K, value: AllSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const dirty = FIELDS.some((f) => norm(settings[f]) !== norm(savedSnapshot[f]));

  function handleSave() {
    startSaving(async () => {
      const scoped: Partial<AllSettings> = {};
      for (const f of FIELDS) {
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
        title="JBR SEO — Sales Channel"
        description="Your B2B sales gateway — the promo panel that pitches JBR SEO services to business owners. Shown on the clients page hero (CTA leads to jbrseo.com)."
      >
        <Field label="Label" hint="Small tagline above the headline (e.g. 'For business owners').">
          <Input value={settings.b2bLabel ?? ""} onChange={(e) => set("b2bLabel", e.target.value)} placeholder="لأصحاب الأعمال والشركات" />
        </Field>
        <Field label="Headline" hint="The main attention-grabbing line.">
          <Input value={settings.b2bHeadline ?? ""} onChange={(e) => set("b2bHeadline", e.target.value)} placeholder="عملاؤك يبحثون عنك على جوجل" />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Bullet 1">
            <Input value={settings.b2bBullet1 ?? ""} onChange={(e) => set("b2bBullet1", e.target.value)} placeholder="ظهور مضمون على جوجل بمحتوى يُقنع..." />
          </Field>
          <Field label="Bullet 2">
            <Input value={settings.b2bBullet2 ?? ""} onChange={(e) => set("b2bBullet2", e.target.value)} placeholder="عملاء جاهزون للشراء — بلا ميزانية..." />
          </Field>
          <Field label="Bullet 3">
            <Input value={settings.b2bBullet3 ?? ""} onChange={(e) => set("b2bBullet3", e.target.value)} placeholder="نتائج تقيسها: زيارات، مشاهدات..." />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
          <Field label="CTA Text" hint="Text shown on the call-to-action button.">
            <Input value={settings.b2bCtaText ?? ""} onChange={(e) => set("b2bCtaText", e.target.value)} placeholder="عملاء بلا إعلانات" />
          </Field>
          <Field label="CTA URL" hint="Where the CTA button leads (full URL).">
            <Input value={settings.b2bCtaUrl ?? ""} onChange={(e) => set("b2bCtaUrl", e.target.value)} placeholder="https://www.jbrseo.com" />
          </Field>
        </div>
        <div className="-mx-5 -mb-5 mt-1 flex items-center justify-between gap-3 border-t bg-muted/20 px-5 py-3.5">
          <StatusBadge isDirty={dirty} isSaving={isSaving} savedAt={savedAt} />
          <Button onClick={handleSave} disabled={isSaving || !dirty} size="sm" className="h-8 gap-1.5">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            {isSaving ? "Saving..." : "Save JBR SEO"}
          </Button>
        </div>
      </Section>
    </TooltipProvider>
  );
}
