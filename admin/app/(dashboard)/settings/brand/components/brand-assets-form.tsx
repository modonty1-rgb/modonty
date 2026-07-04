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

interface Props {
  initialSettings: AllSettings;
}

// Brand identity used site-wide: the organization description (Knowledge Panel +
// publisher line under every article/author page) + site logo + mobile icon + alt
// text. Moved out of the Modonty Homepage form into its own settings area.
// Saves ONLY these fields.
const BRAND_FIELDS = ["brandDescription", "logoUrl", "logoIconUrl", "altImage"] as const satisfies readonly (keyof AllSettings)[];

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

const norm = (v: unknown) => (v === undefined || v === null ? "" : v);

export function BrandAssetsForm({ initialSettings }: Props) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AllSettings>(initialSettings);
  // Snapshot of what's persisted — dirty = fields differ from this.
  const [savedSnapshot, setSavedSnapshot] = useState<AllSettings>(initialSettings);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isSaving, startSaving] = useTransition();

  const set = useCallback(<K extends keyof AllSettings>(key: K, value: AllSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const dirty = BRAND_FIELDS.some((f) => norm(settings[f]) !== norm(savedSnapshot[f]));

  function handleSave() {
    startSaving(async () => {
      const scoped: Partial<AllSettings> = {};
      for (const f of BRAND_FIELDS) {
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
        title="Logo & Brand Assets"
        description="The site logo shown in the navbar on every page — and your Organization logo & description in Google's structured data."
      >
        {/* Brand identity — Organization description */}
        <div className="space-y-3">
          <GroupHeader
            icon="✨"
            title="Brand identity"
            note="Organization description — Knowledge Panel + every page"
            tone="bg-amber-500/15 text-amber-600"
          />
          <Field
            label="Brand Description"
            hint="Modonty's identity in one or two evergreen sentences. Different from the homepage SEO Description (which is only the search snippet)."
            counter={settings.brandDescription?.length ?? 0}
            counterMax={250}
            counterMin={40}
          >
            <Textarea
              value={settings.brandDescription ?? ""}
              onChange={(e) => set("brandDescription", e.target.value)}
              placeholder="منصة المحتوى العربي الرائدة التي تمنح كل نشاط صفحة موثّقة ومحتوى احترافي..."
              className="resize-none min-h-[64px]"
              maxLength={250}
            />
            <div dir="rtl" className="mt-2 flex items-start gap-2 rounded-md border-s-4 border-primary bg-primary/10 px-3 py-2 text-[12px] leading-relaxed text-foreground/90">
              <span aria-hidden className="mt-0.5 text-sm leading-none">✍️</span>
              <div className="space-y-1">
                <p>
                  <span className="font-semibold text-primary">إيش تكتب؟</span> عرّف مدوّنتي بجملة وحدة واضحة — معلومة ثابتة، مش عرض مؤقّت.
                </p>
                <p>
                  <span className="font-semibold text-primary">وين تظهر؟</span> في البطاقة التعريفية بجوجل + كسطر الناشر تحت{" "}
                  <span className="font-semibold text-foreground">كل مقال وكل صفحة كاتب</span> — مش بس الصفحة الرئيسية.
                </p>
              </div>
            </div>
          </Field>
        </div>

        {/* Logos & alt */}
        <div className="space-y-3 border-t border-border pt-4">
          <GroupHeader icon="🖼️" title="Logos & alt text" tone="bg-emerald-500/15 text-emerald-600" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageField
            label="Logo (Desktop)"
            value={settings.logoUrl ?? ""}
            onChange={(v) => set("logoUrl", v)}
            hint="Wide wordmark (≈351×85) — desktop navbar. Also your Organization logo in Google."
            aspect="wide"
          />
          <ImageField
            label="Logo (Mobile Icon)"
            value={settings.logoIconUrl ?? ""}
            onChange={(v) => set("logoIconUrl", v)}
            hint="Small square mark for the mobile navbar. Falls back to the desktop logo if empty."
            aspect="square"
          />
        </div>
        <Field
          label="Image Alt Text"
          hint="Accessibility text for the logo and share image (also used as the image caption)."
          counter={settings.altImage?.length ?? 0}
          counterMax={125}
        >
          <Input
            value={settings.altImage ?? ""}
            onChange={(e) => set("altImage", e.target.value)}
            placeholder="مدونتي — منصة المحتوى العربي"
            maxLength={125}
          />
        </Field>
        </div>

        {/* Save footer — bleeds to the Section card edges. */}
        <div className="-mx-5 -mb-5 mt-1 flex items-center justify-between gap-3 border-t bg-muted/20 px-5 py-3.5">
          <StatusBadge isDirty={dirty} isSaving={isSaving} savedAt={savedAt} />
          <Button onClick={handleSave} disabled={isSaving || !dirty} size="sm" className="h-8 gap-1.5">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            {isSaving ? "Saving..." : "Save Brand"}
          </Button>
        </div>
      </Section>
    </TooltipProvider>
  );
}
