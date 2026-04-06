"use client";

import { UseFormReturn } from "react-hook-form";
import { FormInput, FormTextarea, FormNativeSelect, FormSelect } from "@/components/admin/form-field";
import { SelectItem } from "@/components/ui/select";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";
import { AlertCircle } from "lucide-react";

interface BusinessSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  industries?: Array<{ id: string; name: string }>;
  clients?: Array<{ id: string; name: string }>;
}

export function BusinessSection({
  form,
  industries = [],
  clients = [],
}: BusinessSectionProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;
  const hasAudienceErrors = Boolean(errors.targetAudience || errors.contentPriorities);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Contact Type"
          name="contactType"
          value={watch("contactType") || undefined}
          onValueChange={(value) =>
            setValue("contactType", value ? (value as string) : null, { shouldValidate: true })
          }
          error={errors.contactType?.message}
          placeholder="Select contact type"
        >
          <SelectItem value="Customer Service">Customer Service</SelectItem>
          <SelectItem value="Sales">Sales</SelectItem>
          <SelectItem value="Technical Support">Technical Support</SelectItem>
        </FormSelect>

        <FormNativeSelect
          label="Parent Organization"
          name="parentOrganizationId"
          value={watch("parentOrganizationId") || ""}
          onChange={(e) =>
            setValue("parentOrganizationId", e.target.value || null, { shouldValidate: true })
          }
          error={errors.parentOrganizationId?.message}
        >
          <option value="">None</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </FormNativeSelect>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 w-full mb-1">
          <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
            Audience & content
          </h3>
          {hasAudienceErrors && (
            <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
          )}
          <div className="h-px w-full bg-border ml-2" />
        </div>
        <FormTextarea
          label="Target Audience"
          name="targetAudience"
          value={watch("targetAudience") || ""}
          onChange={(e) => setValue("targetAudience", e.target.value || null, { shouldValidate: true })}
          rows={3}
          error={errors.targetAudience?.message}
          placeholder="Describe the target audience for this client"
          hint="Helps writers customize content tone and topics — describes target audience (age, gender, interests) — used to guide writers"
        />
        <FormTextarea
          label="Content Priorities (comma-separated)"
          name="contentPriorities"
          value={Array.isArray(watch("contentPriorities")) ? watch("contentPriorities").join(", ") : ""}
          onChange={(e) => {
            const priorities = e.target.value.split(",").map((p) => p.trim()).filter(Boolean);
            setValue("contentPriorities", priorities, { shouldValidate: true });
          }}
          rows={2}
          error={errors.contentPriorities?.message}
          placeholder="keyword1, keyword2, keyword3"
          hint="Main topics/keywords to prioritize in articles — comma-separated — guides writers in choosing focus topics — different from SEO Keywords tab"
        />
      </div>
    </div>
  );
}
