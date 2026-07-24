"use client";

/**
 * Primary CTA section — ADMIN.
 *
 * The admin picks ONE button for this client from the shared list managed in
 * Settings → Dropdown Lists → CTA Buttons. Picking a button fills the three fields
 * that actually drive the site (ctaMode / ctaLabel / ctaUrl), so every surface that
 * renders a CTA keeps reading exactly what it read before — the list is a picker,
 * not a new source of truth.
 *
 * The two behaviours live in code and cannot be added from a screen:
 *   FORM → internal booking sheet («احجز الآن») — the lead lands in OUR database
 *   LINK → tracked external destination (store / wa.me / tel:) — we see the click only
 *   NONE → no button anywhere (default; no dead buttons)
 *
 * YMYL clients usually want a booking FORM — when the admin flips YMYL on we SUGGEST
 * the first FORM button (only if nothing is set yet). A suggestion, not a lock.
 */

import { useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { MousePointerClick, Ban, ExternalLink } from "lucide-react";

import { FormSelect, FormInput } from "@/components/admin/form-field";
import { SelectItem } from "@/components/ui/select";

import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

/** Structural shape — matches the `industries` / `countries` props already threaded here. */
export interface CtaPresetOption {
  id: string;
  labelAr: string;
  mode: "FORM" | "LINK";
  defaultUrl: string | null;
}

interface CtaSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  ctaPresets: CtaPresetOption[];
}

const NONE = "__none__";
/** The stored button no longer exists in the list (it was deleted after this client was set
 *  up). Surfaced rather than silently blanked — the client's own wording still works. */
const ORPHAN = "__orphan__";

export function CtaSection({ form, ctaPresets }: CtaSectionProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const ctaMode = (watch("ctaMode") ?? "NONE") as "NONE" | "FORM" | "LINK";
  const ctaPresetId = watch("ctaPresetId") ?? "";
  const ctaLabel = watch("ctaLabel") ?? "";
  const isYmyl = watch("isYmyl") ?? false;

  // The chosen button is STORED, not guessed from the text — so rewording it for this
  // client never makes the picker forget which button they are on.
  const picked = ctaPresets.find((p) => p.id === ctaPresetId);
  const selected = ctaMode === "NONE" ? NONE : picked ? picked.id : ORPHAN;

  // Empty box = «use the button's own text». What reaches the database is always the
  // resolved string, so modonty keeps reading one field and never learns the list exists.
  const isOverridden = Boolean(picked && ctaLabel && ctaLabel !== picked.labelAr);
  const overrideValue = isOverridden ? ctaLabel : "";

  const applyPreset = (presetId: string) => {
    if (presetId === NONE) {
      setValue("ctaMode", "NONE" as ClientFormSchemaType["ctaMode"], {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("ctaPresetId", "", { shouldDirty: true });
      return;
    }
    const preset = ctaPresets.find((p) => p.id === presetId);
    if (!preset) return;

    setValue("ctaPresetId", preset.id, { shouldDirty: true });
    setValue("ctaMode", preset.mode as ClientFormSchemaType["ctaMode"], {
      shouldDirty: true,
      shouldValidate: true,
    });
    // Switching buttons keeps this client's own wording — only the untouched default moves.
    if (!isOverridden) {
      setValue("ctaLabel", preset.labelAr, { shouldDirty: true, shouldValidate: true });
    }
    // Only seed the destination — never overwrite one the admin already set for this client.
    if (preset.mode === "LINK" && preset.defaultUrl && !watch("ctaUrl")) {
      setValue("ctaUrl", preset.defaultUrl, { shouldDirty: true, shouldValidate: true });
    }
  };

  /** Blank goes back to the button's text; anything else is this client's wording. */
  const applyLabelOverride = (typed: string) => {
    const next = typed.trim() ? typed : (picked?.labelAr ?? "");
    setValue("ctaLabel", next, { shouldDirty: true, shouldValidate: true });
  };

  // Fire the YMYL suggestion only on the OFF→ON transition (a user action), never on
  // mount — so an admin who deliberately left a YMYL client with no button keeps it.
  const prevYmyl = useRef(isYmyl);
  useEffect(() => {
    if (!prevYmyl.current && isYmyl && ctaMode === "NONE") {
      const formPreset = ctaPresets.find((p) => p.mode === "FORM");
      if (formPreset) applyPreset(formPreset.id);
    }
    prevYmyl.current = isYmyl;
    // applyPreset closes over form setters only — re-running on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYmyl, ctaMode, ctaPresets]);

  const hasPresets = ctaPresets.length > 0;

  return (
    <div className="space-y-5">
      {/* Header: what this controls */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <MousePointerClick className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Primary Action (CTA)</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The single action a reader takes for this client — shown on the article, the client
              page, and the clients listing. Buttons come from{" "}
              <strong>Settings → Dropdown Lists → CTA Buttons</strong>.
            </p>
          </div>
        </div>
      </div>

      {!hasPresets ? (
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
          <Ban className="h-3.5 w-3.5 shrink-0" />
          No buttons defined yet — add them in Settings → Dropdown Lists → CTA Buttons.
        </p>
      ) : (
        <FormSelect
          label="Button"
          name="ctaPreset"
          value={selected}
          onValueChange={applyPreset}
          hint={isYmyl ? "Suggested for YMYL clients: a booking form" : undefined}
        >
          <SelectItem value={NONE}>None — no button shown</SelectItem>
          {ctaPresets.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.labelAr} — {p.mode === "FORM" ? "booking form" : "external link"}
            </SelectItem>
          ))}
          {selected === ORPHAN && (
            <SelectItem value={ORPHAN}>
              {ctaLabel || "Unknown"} — button no longer in the list
            </SelectItem>
          )}
        </FormSelect>
      )}

      {/* Wording override — the button decides WHAT happens, this decides what it SAYS */}
      {ctaMode !== "NONE" && (
        <FormInput
          label="Button label (optional)"
          name="ctaLabel"
          value={overrideValue}
          onChange={(e) => applyLabelOverride(e.target.value)}
          placeholder={picked?.labelAr ?? "Text shown on the button"}
          maxLength={40}
          error={errors.ctaLabel?.message}
          hint={
            picked
              ? `Leave empty to use «${picked.labelAr}». Fill it in when this client wants different wording.`
              : "Text shown on the button."
          }
        />
      )}

      {/* Destination URL (LINK only) */}
      {ctaMode === "LINK" && (
        <FormInput
          label="Link URL"
          name="ctaUrl"
          required
          value={watch("ctaUrl") ?? ""}
          onChange={(e) =>
            setValue("ctaUrl", e.target.value, { shouldDirty: true, shouldValidate: true })
          }
          placeholder="https://store.example.com · https://wa.me/9665… · tel:+9665…"
          maxLength={500}
          error={errors.ctaUrl?.message}
          hint="Where the button sends the reader — opens in a new tab."
        />
      )}

      {/* What the visitor will actually see */}
      {ctaMode !== "NONE" && ctaLabel && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          {ctaMode === "LINK" ? (
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <MousePointerClick className="h-3.5 w-3.5 shrink-0" />
          )}
          Visitors will see <strong className="text-foreground">«{ctaLabel}»</strong>
          {ctaMode === "FORM" ? " opening the booking form." : " opening the link above."}
        </p>
      )}

      {ctaMode === "NONE" && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Ban className="h-3.5 w-3.5" /> No action button will appear for this client.
        </p>
      )}
    </div>
  );
}
