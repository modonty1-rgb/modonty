"use client";

import { UseFormReturn } from "react-hook-form";
import { messages } from "@/lib/messages";
import { FormInput, FormField, FormSelect } from "@/components/admin/form-field";
import { SelectItem } from "@/components/ui/select";
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
          hint={messages.hints.client.name}
          required
        />
        <FormField
          label="Slug"
          name="slug"
          error={errors.slug?.message}
          hint={messages.hints.client.slug}
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

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.03] p-4 space-y-4">
        <div dir="rtl">
          <p className="text-sm font-medium text-blue-400">بيانات دخول العميل</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            يتم إرسال هذه البيانات للعميل للدخول على لوحة التحكم الخاصة به وإدارة محتواه.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormInput
            name="email"
            type="email"
            label="Email — Username"
            value={email || ""}
            onChange={(e) => form.setValue("email", e.target.value, { shouldValidate: true })}
            error={errors.email?.message}
            required
          />
          <FormInput
            name="password"
            type="text"
            label="Password"
            value={password || ""}
            onChange={(e) => form.setValue("password", e.target.value, { shouldValidate: true })}
            error={errors.password?.message}
            placeholder={isEditMode ? "Leave empty to keep current" : "Enter password"}
            required={!isEditMode}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <FormInput
          name="phone"
          label="Phone"
          value={phone || ""}
          onChange={(e) => form.setValue("phone", e.target.value || null, { shouldValidate: true })}
          error={errors.phone?.message}
          placeholder="+966 11 123 4567"
          hint={messages.hints.client.email}
        />
        <FormSelect
          label="Contact Type"
          name="contactType"
          value={contactType || undefined}
          onValueChange={(value) => form.setValue("contactType", value ? (value as string) : null, { shouldValidate: true })}
          error={errors.contactType?.message}
          placeholder="Select type"
          hint={messages.hints.client.contactType}
        >
          <SelectItem value="customer service">Customer Service</SelectItem>
          <SelectItem value="sales">Sales</SelectItem>
          <SelectItem value="technical support">Technical Support</SelectItem>
          <SelectItem value="billing support">Billing Support</SelectItem>
          <SelectItem value="reservations">Reservations</SelectItem>
          <SelectItem value="emergency">Emergency</SelectItem>
        </FormSelect>
        <FormInput
          name="url"
          type="url"
          label="Website URL"
          value={url || ""}
          onChange={(e) => form.setValue("url", e.target.value || null, { shouldValidate: true })}
          error={errors.url?.message}
          placeholder="https://www.example.com"
          hint="يُستخدم في الروابط الخلفية وبيانات SEO"
        />
      </div>

      <BusinessBriefSection form={form} showHeader={false} />
    </div>
  );
}
