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
          onValueChange={(value) => setValue("legalForm", value ? (value as "LLC" | "JSC" | "Sole Proprietorship" | "Partnership" | "Limited Partnership" | "Simplified Joint Stock Company" | "One-Person Company") : null, { shouldValidate: true })}
          error={errors.legalForm?.message}
          hint={messages.hints.client.legalForm}
          placeholder="Select Legal Form"
        >
          <SelectItem value="LLC">شركة ذات مسؤولية محدودة (LLC)</SelectItem>
          <SelectItem value="JSC">شركة مساهمة (JSC)</SelectItem>
          <SelectItem value="Sole Proprietorship">مؤسسة فردية</SelectItem>
          <SelectItem value="Partnership">شركة تضامن</SelectItem>
          <SelectItem value="Limited Partnership">شركة توصية بسيطة</SelectItem>
          <SelectItem value="Simplified Joint Stock Company">شركة مساهمة مبسطة</SelectItem>
          <SelectItem value="One-Person Company">شركة الشخص الواحد</SelectItem>
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
