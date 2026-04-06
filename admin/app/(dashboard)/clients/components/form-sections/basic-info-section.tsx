"use client";

import { UseFormReturn } from "react-hook-form";
import { FormInput, FormField } from "@/components/admin/form-field";
import { Link2 } from "lucide-react";
import { BusinessBriefSection } from "./business-brief-section";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

interface BasicInfoSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  industries?: Array<{ id: string; name: string }>;
  isEditMode?: boolean;
  siteUrl?: string | null;
}

export function BasicInfoSection({
  form,
  industries = [],
  isEditMode = false,
  siteUrl = null,
}: BasicInfoSectionProps) {
  const { watch, formState: { errors } } = form;
  const slug = watch("slug");
  const name = watch("name");
  const email = watch("email");
  const password = watch("password");
  const legalName = watch("legalName");
  const foundingDate = watch("foundingDate");
  const industryId = watch("industryId");
  const url = watch("url");
  const phone = watch("phone");
  const contactType = watch("contactType");
  const sameAs = watch("sameAs");
  const numberOfEmployees = watch("numberOfEmployees");
  const commercialRegistrationNumber = watch("commercialRegistrationNumber");
  const organizationType = watch("organizationType");
  const alternateName = watch("alternateName");

  void (
    errors &&
    legalName &&
    foundingDate &&
    industryId &&
    contactType &&
    sameAs &&
    numberOfEmployees &&
    commercialRegistrationNumber &&
    organizationType &&
    alternateName
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput
          name="name"
          label="Name"
          value={name || ""}
          onChange={(e) => form.setValue("name", e.target.value, { shouldValidate: true })}
          error={errors.name?.message}
          hint="Client name used in articles and blog — appears in all published content for this client"
          required
        />
        <FormField
          label="Slug"
          name="slug"
          error={errors.slug?.message}
          hint="URL-friendly identifier — auto-generated from name — optimized for SEO — used in article and page URLs"
        >
          <div className="space-y-2">
            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center gap-2">
              <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate font-mono text-xs text-muted-foreground">
                {slug || "Auto-generated from name..."}
              </span>
              <span
                className={`ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isEditMode ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-700"
                }`}
              >
                {isEditMode ? "locked" : "auto"}
              </span>
            </div>
            {isEditMode && siteUrl && slug && (
              <div className="text-xs text-muted-foreground">
                {siteUrl}/clients/{slug}
              </div>
            )}
          </div>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput
          name="email"
          type="email"
          label="Email — Username"
          value={email || ""}
          onChange={(e) => form.setValue("email", e.target.value, { shouldValidate: true })}
          error={errors.email?.message}
          hint="Client email (username) — used for login and account access — required for communication and account management"
          required
        />
        <FormInput
          name="password"
          type="password"
          label="Password"
          value={password || ""}
          onChange={(e) => form.setValue("password", e.target.value, { shouldValidate: true })}
          error={errors.password?.message}
          placeholder={isEditMode ? "Leave empty to keep current" : "••••••••"}
          required={!isEditMode}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput
          name="phone"
          label="Phone"
          value={phone || ""}
          onChange={(e) => form.setValue("phone", e.target.value || null, { shouldValidate: true })}
          error={errors.phone?.message}
          placeholder="+966 11 123 4567"
          hint="Phone number for contact — used for business inquiries — added to Schema.org ContactPoint for SEO"
        />
        <FormInput
          name="url"
          type="url"
          label="Website URL"
          value={url || ""}
          onChange={(e) => form.setValue("url", e.target.value || null, { shouldValidate: true })}
          error={errors.url?.message}
          placeholder="https://www.example.com"
          hint="Main website URL — used for backlinks and Schema.org structured data — helps with SEO"
        />
      </div>

      <BusinessBriefSection form={form} showHeader={false} />
    </div>
  );
}
