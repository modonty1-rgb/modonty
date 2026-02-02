"use client";

import { UseFormReturn } from "react-hook-form";
import { FormTextarea, FormSelect } from "@/components/admin/form-field";
import { MaterialInput } from "@/components/shared/material-input";
import { SelectItem } from "@/components/ui/select";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

interface AdditionalSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
}

export function AdditionalSection({ form }: AdditionalSectionProps) {
  const { watch, setValue, formState: { errors } } = form;

  return (
    <div className="space-y-3">
    </div>
  );
}
