"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { messages } from "@/lib/messages";
import { FormInput, FormField, FormSelect } from "@/components/admin/form-field";
import { SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link2, RefreshCw } from "lucide-react";
import { BusinessBriefSection } from "./business-brief-section";
import { SlugChangeDialog } from "../slug-change-dialog";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

interface BasicInfoSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  industries?: Array<{ id: string; name: string }>;
  isEditMode?: boolean;
  siteUrl?: string | null;
  clientId?: string;
}

export function BasicInfoSection({
  form,
  industries = [],
  isEditMode = false,
  siteUrl = null,
  clientId,
}: BasicInfoSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
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
            {isEditMode && (
              <div className="flex items-start gap-2 rounded-md bg-yellow-500/8 border border-yellow-500/20 px-3 py-2">
                <div className="flex-1" dir="rtl">
                  <span className="mt-0.5 text-yellow-500 shrink-0">⚠ </span>
                  <span className="text-[11px] text-yellow-600 dark:text-yellow-400 leading-relaxed">
                    <span className="font-semibold">الرابط مقفّل نهائياً.</span>{" "}
                    تم تحديده عند الإنشاء ولا يمكن تغييره — هو الرابط الرسمي لصفحة العميل على جوجل. تغيير الاسم <span className="font-semibold">لا يؤثر</span> على الرابط.
                  </span>
                </div>
                {clientId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-7 text-[11px] border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10 hover:text-yellow-600"
                    onClick={() => setDialogOpen(true)}
                  >
                    <RefreshCw className="h-3 w-3 me-1" />
                    Change
                  </Button>
                )}
              </div>
            )}
            {isEditMode && clientId && (
              <SlugChangeDialog
                clientId={clientId}
                currentSlug={slug ?? ""}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={(newName, newSlug) => {
                  form.setValue("name", newName, { shouldValidate: true });
                  form.setValue("slug", newSlug, { shouldValidate: true });
                }}
              />
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
          hint={messages.hints.client.phone}
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
          hint="Website — used in backlinks and SEO data"
        />
      </div>

      <BusinessBriefSection form={form} showHeader={false} />
    </div>
  );
}
