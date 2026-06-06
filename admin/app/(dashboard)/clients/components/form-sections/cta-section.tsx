"use client";

/**
 * Primary CTA section — ADMIN.
 *
 * Admin configures the single primary action shown for this client across
 * modonty.com (article dock + card, client page, clients listing):
 *   - NONE  → no button anywhere (default; no dead buttons)
 *   - FORM  → internal booking sheet («احجز الآن»)
 *   - LINK  → external destination («تسوّق الآن»: store / wa.me / tel:)
 *
 * YMYL clients usually want a booking FORM — when the admin flips YMYL on we
 * SUGGEST FORM (only if the mode is still unset). It's a suggestion, not a lock.
 */

import { useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { MousePointerClick, Ban } from "lucide-react";

import { FormSelect, FormInput } from "@/components/admin/form-field";
import { SelectItem } from "@/components/ui/select";

import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

interface CtaSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
}

// Default button text per mode — what visitors see when no override is set.
const DEFAULT_LABELS: Record<string, string> = {
  FORM: "احجز الآن",
  LINK: "تسوّق الآن",
};

export function CtaSection({ form }: CtaSectionProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const ctaMode = (watch("ctaMode") ?? "NONE") as "NONE" | "FORM" | "LINK";
  const isYmyl = watch("isYmyl") ?? false;

  // Fire the YMYL→FORM suggestion only on the OFF→ON transition (a user action),
  // never on mount — so an admin who deliberately left a YMYL client on NONE keeps it.
  const prevYmyl = useRef(isYmyl);
  useEffect(() => {
    if (!prevYmyl.current && isYmyl && ctaMode === "NONE") {
      setValue("ctaMode", "FORM" as ClientFormSchemaType["ctaMode"], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    prevYmyl.current = isYmyl;
  }, [isYmyl, ctaMode, setValue]);

  return (
    <div className="space-y-5">
      {/* Header: what this controls */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <MousePointerClick className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Primary Action (CTA)</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The single action a reader takes for this client — shown on the article, the client page, and the
              clients listing. Pick <strong>Booking form</strong> for services (doctor, lawyer, consultant) or{" "}
              <strong>External link</strong> for stores / WhatsApp. <strong>None</strong> hides the button everywhere.
            </p>
          </div>
        </div>
      </div>

      {/* Mode */}
      <FormSelect
        label="Action mode"
        name="ctaMode"
        value={ctaMode}
        onValueChange={(value) =>
          setValue("ctaMode", value as ClientFormSchemaType["ctaMode"], {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
        hint={isYmyl ? "Suggested for YMYL clients: Booking form" : undefined}
      >
        <SelectItem value="NONE">None — no button shown</SelectItem>
        <SelectItem value="FORM">Booking form — «احجز الآن»</SelectItem>
        <SelectItem value="LINK">External link — «تسوّق الآن»</SelectItem>
      </FormSelect>

      {/* Label override (FORM + LINK) */}
      {ctaMode !== "NONE" && (
        <FormInput
          label="Button label (optional)"
          name="ctaLabel"
          value={watch("ctaLabel") ?? ""}
          onChange={(e) => setValue("ctaLabel", e.target.value, { shouldDirty: true })}
          placeholder={`Default: ${DEFAULT_LABELS[ctaMode]}`}
          maxLength={40}
          error={errors.ctaLabel?.message}
          hint="Leave empty to use the default text above."
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
          hint="Where «تسوّق الآن» sends the reader — opens in a new tab."
        />
      )}

      {/* NONE state hint */}
      {ctaMode === "NONE" && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Ban className="h-3.5 w-3.5" /> No action button will appear for this client.
        </p>
      )}
    </div>
  );
}
