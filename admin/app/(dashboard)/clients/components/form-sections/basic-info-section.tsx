"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormInput, FormNativeSelect, FormField, FormSelect } from "@/components/admin/form-field";
import { Link2, ChevronDown, AlertCircle, Asterisk } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { SocialProfilesInput } from "../social-profiles-input";
import { BusinessBriefSection } from "./business-brief-section";
import { AddressSection } from "./address-section";
import { LegalSection } from "./legal-section";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

interface BasicInfoSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  industries?: Array<{ id: string; name: string }>;
}

export function BasicInfoSection({ form, industries = [] }: BasicInfoSectionProps) {
  const { register, watch, formState: { errors } } = form;
  const slug = watch("slug");
  const name = watch("name");
  const email = watch("email");
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

  const hasIdentityErrors = Boolean(errors.name || errors.slug || errors.alternateName);
  const hasContactErrors = Boolean(
    errors.email || errors.url || errors.phone || errors.contactType || errors.sameAs
  );
  const hasBusinessBriefErrors = Boolean(errors.businessBrief || errors.slogan);
  const hasOfficialDetailsErrors = Boolean(
    errors.legalName ||
      errors.commercialRegistrationNumber ||
      errors.industryId ||
      errors.foundingDate ||
      errors.numberOfEmployees
  );
  const hasAddressErrors = Boolean(
    errors.addressStreet ||
      errors.addressCity ||
      errors.addressCountry ||
      errors.addressPostalCode ||
      errors.addressRegion ||
      errors.addressNeighborhood ||
      errors.addressBuildingNumber ||
      errors.addressAdditionalNumber ||
      errors.addressLatitude ||
      errors.addressLongitude
  );

  const requiredCounts = {
    identity: 2,
    contact: 1,
    businessBrief: 1,
    officialDetails: 0,
    address: 0,
  } as const;

  const [openSections, setOpenSections] = useState({
    identity: false,
    contact: false,
    businessBrief: false,
    officialDetails: false,
    address: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-8">
      {/* Identity */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => toggleSection("identity")}
          className="flex flex-col gap-1 mb-1 w-full text-left"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform ${
                  openSections.identity ? "rotate-0" : "-rotate-90"
                }`}
              />
              <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
                Identity
              </h3>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {hasIdentityErrors && (
                <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
              )}
              {requiredCounts.identity > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  <Asterisk className="h-3 w-3 mr-1" aria-hidden="true" />
                  {requiredCounts.identity}
                </span>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-border" />
        </button>
        {openSections.identity && (
          <>
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
                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center gap-2">
                  <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    {slug || "Auto-generated from name..."}
                  </span>
                </div>
              </FormField>
            </div>
            <FormInput
              name="alternateName"
              label="Alternate Name"
              value={alternateName || ""}
              onChange={(e) => form.setValue("alternateName", e.target.value || null, { shouldValidate: true })}
              error={errors.alternateName?.message}
              placeholder="e.g., الشركة الأكاديمية"
              hint="الأسماء البديلة للشركة (الاسم العربي، الاسم التجاري، إلخ) - يُستخدم في بيانات Schema.org المهيكلة لتحسين محركات البحث - يساعد في التعرف على الشركة بأسماء مختلفة"
            />
          </>
        )}
      </div>

      {/* Contact */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => toggleSection("contact")}
          className="flex flex-col gap-1 mb-1 w-full text-left"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform ${
                  openSections.contact ? "rotate-0" : "-rotate-90"
                }`}
              />
              <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
                Contact
              </h3>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {hasContactErrors && (
                <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
              )}
              {requiredCounts.contact > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  <Asterisk className="h-3 w-3 mr-1" aria-hidden="true" />
                  {requiredCounts.contact}
                </span>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-border" />
        </button>
        {openSections.contact && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                name="email"
                type="email"
                label="Email"
                value={email || ""}
                onChange={(e) => form.setValue("email", e.target.value, { shouldValidate: true })}
                error={errors.email?.message}
                hint="البريد الإلكتروني للعميل - يُستخدم لتسجيل الدخول والوصول إلى الحساب - مطلوب للتواصل وإدارة الحساب"
                required
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
                name="contactType"
                label="Contact Type"
                value={contactType || ""}
                onChange={(e) => form.setValue("contactType", e.target.value || null, { shouldValidate: true })}
                error={errors.contactType?.message}
                placeholder="e.g., customer service, technical support, sales"
                hint="نوع جهة الاتصال (مثل: خدمة العملاء، الدعم الفني، المبيعات) - يُستخدم في هيكل Schema.org ContactPoint لتحسين محركات البحث - يساعد محركات البحث في فهم كيفية التواصل مع الشركة"
              />
            </div>
            <SocialProfilesInput
              label="Social Profiles"
              value={sameAs || []}
              onChange={(urls) => form.setValue("sameAs", urls, { shouldValidate: true })}
              hint="أضف روابط وسائل التواصل الاجتماعي واحداً تلو الآخر - يُستخدم في بيانات Schema.org لتحسين محركات البحث والتحقق من العلامة التجارية - يساعد في ربط الشركة بحساباتها الرسمية على المنصات المختلفة"
            />
          </>
        )}
      </div>

      {/* Business Brief */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => toggleSection("businessBrief")}
          className="flex flex-col gap-1 mb-1 w-full text-left"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform ${
                  openSections.businessBrief ? "rotate-0" : "-rotate-90"
                }`}
              />
              <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
                Business Brief
              </h3>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {hasBusinessBriefErrors && (
                <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
              )}
              {requiredCounts.businessBrief > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  <Asterisk className="h-3 w-3 mr-1" aria-hidden="true" />
                  {requiredCounts.businessBrief}
                </span>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-border" />
        </button>
        {openSections.businessBrief && <BusinessBriefSection form={form} showHeader={false} />}
      </div>

      {/* Official Details */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => toggleSection("officialDetails")}
          className="flex flex-col gap-1 mb-1 w-full text-left"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform ${
                  openSections.officialDetails ? "rotate-0" : "-rotate-90"
                }`}
              />
              <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
                Official Details
              </h3>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {hasOfficialDetailsErrors && (
                <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
              )}
              {requiredCounts.officialDetails > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  <Asterisk className="h-3 w-3 mr-1" aria-hidden="true" />
                  {requiredCounts.officialDetails}
                </span>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-border" />
        </button>
        {openSections.officialDetails && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <FormInput
                name="legalName"
                label="Legal Name"
                value={legalName || ""}
                onChange={(e) => form.setValue("legalName", e.target.value || null, { shouldValidate: true })}
                error={errors.legalName?.message}
                placeholder="e.g., Acme Corporation LLC"
                hint="الاسم القانوني الرسمي المسجل للشركة - يختلف عن الاسم التجاري - يُستخدم في بيانات Schema.org المهيكلة لتحسين محركات البحث - مطلوب للامتثال القانوني"
              />
              <FormInput
                name="commercialRegistrationNumber"
                label="CR"
                value={commercialRegistrationNumber || ""}
                onChange={(e) => form.setValue("commercialRegistrationNumber", e.target.value || null, { shouldValidate: true })}
                error={errors.commercialRegistrationNumber?.message}
                placeholder="e.g., 1010123456"
                hint="رقم السجل التجاري (CR) - إلزامي لجميع الشركات في المملكة العربية السعودية - مطلوب لتسجيل الشركة وبيانات Schema.org - يختلف عن رقم الترخيص - يُستخدم كمعرف قانوني في جميع المعاملات الرسمية"
              />
              <FormNativeSelect
                label="Industry"
                name="industryId"
                value={industryId || ""}
                onChange={(e) => form.setValue("industryId", e.target.value || null, { shouldValidate: true })}
                error={errors.industryId?.message}
                placeholder="Select an industry"
                hint="تصنيف العميل حسب القطاع - يساعد في استهداف المحتوى بشكل أفضل - يُستخدم لتصنيف المقالات والمحتوى حسب الصناعة"
              >
                {industries.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </FormNativeSelect>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                name="foundingDate"
                type="date"
                label="Founding Date"
                value={foundingDate ? new Date(foundingDate!).toISOString().split("T")[0] : ""}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  form.setValue("foundingDate", date, { shouldValidate: true });
                }}
                error={errors.foundingDate?.message}
                hint="تاريخ تأسيس الشركة - يُستخدم في بيانات Schema.org المهيكلة لتحسين محركات البحث - يساعد في إظهار خبرة الشركة وقدمها في السوق"
              />
              <FormInput
                name="numberOfEmployees"
                label="Number of Employees"
                value={numberOfEmployees || ""}
                onChange={(e) => form.setValue("numberOfEmployees", e.target.value || null, { shouldValidate: true })}
                error={errors.numberOfEmployees?.message}
                placeholder="e.g., 50-100"
                hint="عدد الموظفين التقريبي - يُستخدم للتصنيف والسياق - يُضاف في بيانات Schema.org كقيمة كمية (QuantitativeValue) - يساعد في فهم حجم الشركة"
              />
            </div>
            <LegalSection form={form} />
          </>
        )}
      </div>

      {/* Address */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => toggleSection("address")}
          className="flex flex-col gap-1 mb-1 w-full text-left"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform ${
                  openSections.address ? "rotate-0" : "-rotate-90"
                }`}
              />
              <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
                Address
              </h3>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {hasAddressErrors && (
                <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
              )}
              {requiredCounts.address > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  <Asterisk className="h-3 w-3 mr-1" aria-hidden="true" />
                  {requiredCounts.address}
                </span>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-border" />
        </button>
        {openSections.address && <AddressSection form={form} />}
      </div>
    </div>
  );
}
