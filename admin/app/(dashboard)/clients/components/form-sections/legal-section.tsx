"use client";

import { UseFormReturn } from "react-hook-form";
import { messages } from "@/lib/messages";
import { FormInput, FormSelect } from "@/components/admin/form-field";
import { SelectItem } from "@/components/ui/select";
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
          onValueChange={(value) => setValue("legalForm", value ? (value as "LLC" | "JSC" | "Sole Proprietorship" | "Partnership" | "Limited Partnership" | "Simplified Joint Stock Company") : null, { shouldValidate: true })}
          error={errors.legalForm?.message}
          hint={messages.hints.client.legalForm}
          placeholder="Select Legal Form"
        >
          <SelectItem value="LLC">LLC (Limited Liability Company)</SelectItem>
          <SelectItem value="JSC">JSC (Joint Stock Company)</SelectItem>
          <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
          <SelectItem value="Partnership">Partnership</SelectItem>
          <SelectItem value="Limited Partnership">Limited Partnership</SelectItem>
          <SelectItem value="Simplified Joint Stock Company">Simplified Joint Stock Company</SelectItem>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput
          name="licenseNumber"
          label="License Number"
          value={watch("licenseNumber") || ""}
          onChange={(e) => setValue("licenseNumber", e.target.value || null, { shouldValidate: true })}
          error={errors.licenseNumber?.message}
          placeholder="e.g., HC-2024-001234"
          hint={messages.hints.client.tradeLicense}
        />
        <FormInput
          name="licenseAuthority"
          label="License Authority"
          value={watch("licenseAuthority") || ""}
          onChange={(e) => setValue("licenseAuthority", e.target.value || null, { shouldValidate: true })}
          error={errors.licenseAuthority?.message}
          placeholder="e.g., Ministry of Health"
          hint="Licensing authority — required if license number is entered"
        />
      </div>
    </div>
  );
}
