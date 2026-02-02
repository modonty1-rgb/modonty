"use client";

import { UseFormReturn } from "react-hook-form";
import { FormInput, FormNativeSelect } from "@/components/admin/form-field";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

interface ClassificationSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  clients?: Array<{ id: string; name: string; slug: string }>;
}

export function ClassificationSection({
  form,
  clients = [],
}: ClassificationSectionProps) {
  const { watch, setValue, formState: { errors } } = form;

  return (
      <div className="space-y-3">
      </div>
  );
}
