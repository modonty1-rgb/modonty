"use client";

import { UseFormReturn } from "react-hook-form";
import { messages } from "@/lib/messages";
import { FormTextarea, FormNativeSelect } from "@/components/admin/form-field";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";
import { AlertCircle, Info } from "lucide-react";

interface BusinessSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  industries?: Array<{ id: string; name: string }>;
  clients?: Array<{ id: string; name: string }>;
}

export function BusinessSection({
  form,
  clients = [],
}: BusinessSectionProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;
  const hasContentErrors = Boolean(errors.contentPriorities);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormNativeSelect
          label="Parent Organization"
          name="parentOrganizationId"
          value={watch("parentOrganizationId") || ""}
          onChange={(e) =>
            setValue("parentOrganizationId", e.target.value || null, { shouldValidate: true })
          }
          error={errors.parentOrganizationId?.message}
          hint={messages.hints.client.parentOrganization}
        >
          <option value="">None</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </FormNativeSelect>
      </div>

      {/* Strategy moved to client-managed intake — admin no longer edits target audience here */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div>
          <strong>Strategy is client-managed.</strong> Target audience, brand voice, forbidden keywords/claims,
          SEO goals, etc. are now edited by the client through the console intake form. View them on the
          client&apos;s detail page (read-only mirror via <code className="px-1 rounded bg-blue-100">client.intake</code>).
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 w-full mb-1">
          <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
            Content priorities
          </h3>
          {hasContentErrors && (
            <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
          )}
          <div className="h-px w-full bg-border ml-2" />
        </div>
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
          hint={messages.hints.client.keywords}
        />
      </div>
    </div>
  );
}
