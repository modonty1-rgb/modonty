"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Section } from "../../_shared/section";
import { ImageField } from "../../_shared/image-field";
import {
  savePlatformDefault,
  type PlatformDefaults,
  type DefaultRole,
} from "../actions/defaults-actions";

export function DefaultsForm({ initial }: { initial: PlatformDefaults }) {
  const { toast } = useToast();
  const [values, setValues] = useState<PlatformDefaults>(initial);
  const [pending, startTransition] = useTransition();

  const isDirty =
    values.LOGO !== initial.LOGO ||
    values.POST !== initial.POST ||
    values.HERO !== initial.HERO;

  function set(role: DefaultRole, v: string) {
    setValues((prev) => ({ ...prev, [role]: v }));
  }

  function handleSave() {
    startTransition(async () => {
      const roles: DefaultRole[] = ["LOGO", "POST", "HERO"];
      const changed = roles.filter((r) => (values[r] ?? "") !== (initial[r] ?? ""));

      for (const role of changed) {
        const res = await savePlatformDefault(role, values[role] ?? "");
        if (!res.ok) {
          toast({ title: "فشل الحفظ", description: `${role}: ${res.error}`, variant: "destructive" });
          return;
        }
      }
      toast({ title: "تم حفظ الصور الافتراضية", description: `${changed.length} محدّثة` });
      // Sync baseline so the form is no longer dirty
      initial.LOGO = values.LOGO;
      initial.POST = values.POST;
      initial.HERO = values.HERO;
    });
  }

  return (
    <TooltipProvider>
    <div className="space-y-6">
      <Section
        title="Default client logo"
        description="Used when a client has no logo or the logo image is broken. Square image recommended."
      >
        <ImageField
          label="Logo URL (Cloudinary)"
          value={values.LOGO ?? ""}
          onChange={(v) => set("LOGO", v)}
          aspect="square"
          hint="اترك الحقل فارغاً لإلغاء الافتراضي."
        />
      </Section>

      <Section
        title="Default article image"
        description="Used when an article has no featured image. 1200×630 recommended."
      >
        <ImageField
          label="Article image URL (Cloudinary)"
          value={values.POST ?? ""}
          onChange={(v) => set("POST", v)}
          aspect="og"
          hint="اترك الحقل فارغاً لإلغاء الافتراضي."
        />
      </Section>

      <Section
        title="Default client hero"
        description="Used when a client page has no hero image. Wide image recommended."
      >
        <ImageField
          label="Hero image URL (Cloudinary)"
          value={values.HERO ?? ""}
          onChange={(v) => set("HERO", v)}
          aspect="og"
          hint="اترك الحقل فارغاً لإلغاء الافتراضي."
        />
      </Section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={pending || !isDirty} className="gap-1.5">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {pending ? "Saving..." : "Save defaults"}
        </Button>
      </div>
    </div>
    </TooltipProvider>
  );
}
