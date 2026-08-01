"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, CircleAlert, CircleCheck, Building2, Newspaper, PanelTop } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { ImageField } from "../../_shared/image-field";
import {
  savePlatformDefault,
  type PlatformDefaults,
  type DefaultRole,
} from "../actions/defaults-actions";

const ROLES: Array<{
  role: DefaultRole;
  icon: typeof Building2;
  title: string;
  description: string;
  aspect: "square" | "og";
}> = [
  {
    role: "LOGO",
    icon: Building2,
    title: "Client logo",
    description: "Client has no logo, or it fails to load. Square.",
    aspect: "square",
  },
  {
    role: "POST",
    icon: Newspaper,
    title: "Article image",
    description: "Article has no featured image. 1200×630.",
    aspect: "og",
  },
  {
    role: "HERO",
    icon: PanelTop,
    title: "Client hero",
    description: "Client page has no hero image. Wide.",
    aspect: "og",
  },
];

export function DefaultsForm({
  initial,
  coreClientId,
}: {
  initial: PlatformDefaults;
  coreClientId: string | null;
}) {
  const { toast } = useToast();
  const [values, setValues] = useState<PlatformDefaults>(initial);
  const [pending, startTransition] = useTransition();

  const isDirty = ROLES.some(({ role }) => (values[role] ?? "") !== (initial[role] ?? ""));
  const configured = ROLES.filter(({ role }) => (values[role] ?? "").trim().length > 0).length;
  const allSet = configured === ROLES.length;

  function set(role: DefaultRole, v: string) {
    setValues((prev) => ({ ...prev, [role]: v }));
  }

  function handleSave() {
    startTransition(async () => {
      const changed = ROLES.map((r) => r.role).filter(
        (r) => (values[r] ?? "") !== (initial[r] ?? "")
      );

      for (const role of changed) {
        const res = await savePlatformDefault(role, values[role] ?? "");
        if (!res.ok) {
          toast({ title: "فشل الحفظ", description: `${role}: ${res.error}`, variant: "destructive" });
          return;
        }
      }
      toast({ title: "تم حفظ الصور الافتراضية", description: `${changed.length} محدّثة` });
      // Sync baseline so the form is no longer dirty
      for (const role of changed) initial[role] = values[role];
    });
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Status + save — the page's one answer, always above the fold */}
        <div
          className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 ${
            allSet ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/40 bg-amber-500/5"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {allSet ? (
              <CircleCheck className="h-4 w-4 text-emerald-500" />
            ) : (
              <CircleAlert className="h-4 w-4 text-amber-500" />
            )}
            <span>{configured}/3 defaults configured</span>
            {isDirty && (
              <span className="text-xs font-normal text-amber-600">· unsaved changes</span>
            )}
          </div>
          <Button size="sm" onClick={handleSave} disabled={pending || !isDirty} className="gap-1.5">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {pending ? "Saving..." : "Save defaults"}
          </Button>
        </div>

        {/* One column per role — the images are the page */}
        <div className="grid gap-4 md:grid-cols-3">
          {ROLES.map(({ role, icon: Icon, title, description, aspect }) => {
            const isSet = (values[role] ?? "").trim().length > 0;
            return (
              <div key={role} className="rounded-lg border bg-card p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold leading-tight">{title}</h2>
                      <p className="text-[11px] text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      isSet
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/15 text-amber-600"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isSet ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {isSet ? "Set" : "Not set"}
                  </span>
                </div>

                <ImageField
                  label=""
                  value={values[role] ?? ""}
                  onChange={(v) => set(role, v)}
                  aspect={aspect}
                  coreClientId={coreClientId}
                />
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
