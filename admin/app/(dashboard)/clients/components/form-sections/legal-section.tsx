"use client";

import { UseFormReturn } from "react-hook-form";
import { messages } from "@/lib/messages";
import { FormInput, FormSelect } from "@/components/admin/form-field";
import { SelectItem } from "@/components/ui/select";
import { LEGAL_FORMS, type LegalForm } from "@modonty/database/lib/constants/client-classification";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

interface LegalSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
}

export function LegalSection({ form }: LegalSectionProps) {
  const { watch, setValue, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormSelect
          label="Legal Form"
          name="legalForm"
          value={watch("legalForm") || undefined}
          onValueChange={(value) => setValue("legalForm", value ? (value as LegalForm) : null, { shouldValidate: true })}
          error={errors.legalForm?.message}
          hint={messages.hints.client.legalForm}
          placeholder="Select Legal Form"
        >
          {LEGAL_FORMS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.value} — {o.ar}
            </SelectItem>
          ))}
        </FormSelect>
        <FormInput
          name="vatID"
          label="VAT ID (ZATCA)"
          value={watch("vatID") || ""}
          onChange={(e) => {
            const value = e.target.value || null;
            setValue("vatID", value, { shouldValidate: true });
            setValue("taxID", value, { shouldValidate: false });
          }}
          error={errors.vatID?.message}
          placeholder="e.g., 300012345600003"
          hint={messages.hints.client.taxId}
        />
      </div>
    </div>
  );
}
