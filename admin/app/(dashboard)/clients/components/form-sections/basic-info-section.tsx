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
          hint="اسم العميل المستخدم في المقالات والمدونة الرسمية - يظهر في جميع المحتوى المنشور لهذا العميل"
          required
        />
        <FormField
          label="Slug"
          name="slug"
          error={errors.slug?.message}
          hint="معرف صديق للروابط (URL) - يتم توليده تلقائياً من الاسم - محسّن لمحركات البحث (SEO) - يُستخدم في روابط المقالات والصفحات"
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
          label="Email — اسم المستخدم"
          value={email || ""}
          onChange={(e) => form.setValue("email", e.target.value, { shouldValidate: true })}
          error={errors.email?.message}
          hint="البريد الإلكتروني للعميل (اسم المستخدم) - يُستخدم لتسجيل الدخول والوصول إلى الحساب - مطلوب للتواصل وإدارة الحساب"
          required
        />
        <FormInput
          name="password"
          type="password"
          label="Password"
          value={password || ""}
          onChange={(e) => form.setValue("password", e.target.value, { shouldValidate: true })}
          error={errors.password?.message}
          placeholder={isEditMode ? "اتركه فارغاً للإبقاء" : "••••••••"}
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
          hint="رقم الهاتف للتواصل - يُستخدم للاستفسارات التجارية - يُضاف في بيانات Schema.org ContactPoint لتحسين محركات البحث"
        />
        <FormInput
          name="url"
          type="url"
          label="Website URL"
          value={url || ""}
          onChange={(e) => form.setValue("url", e.target.value || null, { shouldValidate: true })}
          error={errors.url?.message}
          placeholder="https://www.example.com"
          hint="رابط الموقع الإلكتروني الرئيسي للعميل - يُستخدم في الروابط الخلفية (backlinks) وبيانات Schema.org المهيكلة - يساعد في تحسين محركات البحث"
        />
      </div>

      <BusinessBriefSection form={form} showHeader={false} />
    </div>
  );
}
