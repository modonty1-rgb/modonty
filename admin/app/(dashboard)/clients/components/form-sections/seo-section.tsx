"use client";

import { UseFormReturn } from "react-hook-form";
import { FormInput, FormTextarea, FormSelect, FormNativeSelect } from "@/components/admin/form-field";
import { SelectItem } from "@/components/ui/select";
import { CharacterCounter } from "@/components/shared/character-counter";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";
import type { ClientWithRelations } from "@/lib/types";
import { getSEOSettings, type SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { useState, useEffect } from "react";
import { ChevronDown, AlertCircle, AlertTriangle } from "lucide-react";

interface SEOSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  initialData?: Partial<ClientWithRelations>;
  clients?: Array<{ id: string; name: string; slug: string }>;
}

export function SEOSection({
  form,
  initialData,
  clients = [],
}: SEOSectionProps) {
  const { watch, setValue, formState: { errors } } = form;
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [openSections, setOpenSections] = useState({
    metaBasics: false,
    schemaContent: false,
    organization: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  const seoTitleHint = seoSettings 
    ? `عنوان SEO الذي يظهر في نتائج محركات البحث - الطول الأمثل بين ${seoSettings.seoTitleMin} و ${seoSettings.seoTitleMax} حرف - يجب أن يكون جذاباً ويصف المحتوى بدقة - يُستخدم في علامة title و Open Graph`
    : "عنوان SEO الذي يظهر في نتائج محركات البحث - الطول الأمثل بين 30 و 60 حرف - يجب أن يكون جذاباً ويصف المحتوى بدقة - يُستخدم في علامة title و Open Graph";
  
  const seoDescriptionHint = seoSettings
    ? `الوصف الذي يظهر في نتائج محركات البحث تحت العنوان - الطول الأمثل بين ${seoSettings.seoDescriptionMin} و ${seoSettings.seoDescriptionMax} حرف - يجب أن يكون جذاباً ويشجع المستخدمين على النقر - يُستخدم في علامة meta description`
    : "الوصف الذي يظهر في نتائج محركات البحث تحت العنوان - الطول الأمثل بين 120 و 160 حرف - يجب أن يكون جذاباً ويشجع المستخدمين على النقر - يُستخدم في علامة meta description";

  const twitterTitleHint = seoSettings
    ? `عنوان Twitter/X المخصص للمشاركات الاجتماعية - الطول الأقصى: ${seoSettings.twitterTitleMax} حرف - يُستخدم في Twitter Cards لتحسين مشاركات وسائل التواصل الاجتماعي - يُستخدم فقط إذا كان مختلفاً عن SEO Title`
    : "عنوان Twitter/X المخصص للمشاركات الاجتماعية - الطول الأقصى: 70 حرف - يُستخدم في Twitter Cards لتحسين مشاركات وسائل التواصل الاجتماعي - يُستخدم فقط إذا كان مختلفاً عن SEO Title";

  const twitterDescriptionHint = seoSettings
    ? `وصف Twitter/X المخصص للمشاركات الاجتماعية - الطول الأقصى: ${seoSettings.twitterDescriptionMax} حرف - يُستخدم في Twitter Cards لتحسين مشاركات وسائل التواصل الاجتماعي - يُستخدم فقط إذا كان مختلفاً عن SEO Description`
    : "وصف Twitter/X المخصص للمشاركات الاجتماعية - الطول الأقصى: 200 حرف - يُستخدم في Twitter Cards لتحسين مشاركات وسائل التواصل الاجتماعي - يُستخدم فقط إذا كان مختلفاً عن SEO Description";

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getSEOSettings();
        setSeoSettings(settings);
      } catch (error) {
        console.error("Failed to load SEO settings:", error);
      }
    }
    loadSettings();
  }, []);

  const seoTitleValue = (watch("seoTitle") || "") as string;
  const seoDescriptionValue = (watch("seoDescription") || "") as string;
  const canonicalUrlValue = (watch("canonicalUrl") || "") as string;
  const descriptionValue = (watch("description") || "") as string;
  const keywordsValue = watch("keywords");
  const knowsLanguageValue = watch("knowsLanguage");
  const organizationTypeValue = watch("organizationType");
  const businessActivityCodeValue = watch("businessActivityCode");
  const isicV4Value = watch("isicV4");

  const hasMetaBasicsErrors = Boolean(
    errors.seoTitle ||
      errors.seoDescription ||
      errors.canonicalUrl ||
      errors.metaRobots ||
      errors.twitterCard ||
      errors.twitterTitle ||
      errors.twitterDescription ||
      errors.twitterSite ||
      errors.gtmId,
  );
  const hasSchemaContentErrors = Boolean(
    errors.description || errors.keywords || errors.knowsLanguage
  );
  const hasOrganizationErrors = Boolean(
    errors.parentOrganizationId ||
      errors.businessActivityCode ||
      errors.isicV4 ||
      errors.organizationType
  );

  const seoTitleLength = seoTitleValue.trim().length;
  const seoDescriptionLength = seoDescriptionValue.trim().length;

  const seoTitleMin = seoSettings?.seoTitleMin ?? 30;
  const seoTitleMax = seoSettings?.seoTitleMax ?? 60;
  const seoDescriptionMin = seoSettings?.seoDescriptionMin ?? 120;
  const seoDescriptionMax = seoSettings?.seoDescriptionMax ?? 160;

  const warningCounts = {
    metaBasics:
      // SEO title: warn when empty OR outside recommended range
      (seoTitleLength === 0
        ? 1
        : seoTitleLength < seoTitleMin || seoTitleLength > seoTitleMax
        ? 1
        : 0) +
      // SEO description: warn when empty OR outside recommended range
      (seoDescriptionLength === 0
        ? 1
        : seoDescriptionLength < seoDescriptionMin || seoDescriptionLength > seoDescriptionMax
        ? 1
        : 0) +
      // Canonical URL: warn when missing
      (canonicalUrlValue.trim() ? 0 : 1),
    schemaContent:
      (descriptionValue.trim().length >= 100 ? 0 : 1) +
      (Array.isArray(keywordsValue) && keywordsValue.length ? 0 : 1) +
      (Array.isArray(knowsLanguageValue) && knowsLanguageValue.length ? 0 : 1),
    organization:
      (organizationTypeValue ? 0 : 1) +
      (businessActivityCodeValue || isicV4Value ? 0 : 1),
  } as const;

  return (
    <div className="space-y-6">
      {/* Meta basics */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => toggleSection("metaBasics")}
          className="flex flex-col gap-1 mb-1 w-full text-left"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform ${
                  openSections.metaBasics ? "rotate-0" : "-rotate-90"
                }`}
              />
              <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
                Meta basics
              </h3>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {hasMetaBasicsErrors && (
                <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
              )}
              {warningCounts.metaBasics > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/40">
                  <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
                  {warningCounts.metaBasics}
                </span>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-border" />
        </button>

        {openSections.metaBasics && (
          <div className="space-y-3">
            <div>
              <FormInput
                label="SEO Title"
                name="seoTitle"
                value={watch("seoTitle") || ""}
                onChange={(e) => setValue("seoTitle", e.target.value || null, { shouldValidate: true })}
                error={errors.seoTitle?.message}
                placeholder="e.g., Best Services in Saudi Arabia | Company Name"
                hint={seoTitleHint}
              />
              {seoSettings && (
                <div className="mt-1">
                  <CharacterCounter
                    current={(watch("seoTitle") || "").length}
                    min={seoSettings.seoTitleMin}
                    max={seoSettings.seoTitleMax}
                    restrict={seoSettings.seoTitleRestrict}
                    className="ml-1"
                    belowMinHint="الطول أقل من الموصى به. بحسب Google Search Central، العناوين بين 50–60 حرفاً تظهر كاملة في نتائج البحث."
                    aboveMaxHint="يتجاوز الطول الموصى به. Google تقص العناوين عادةً بعد ~60 حرفاً في نتائج البحث."
                  />
                </div>
              )}
            </div>
            <div>
              <FormTextarea
                label="SEO Description"
                name="seoDescription"
                value={watch("seoDescription") || ""}
                onChange={(e) => setValue("seoDescription", e.target.value || null, { shouldValidate: true })}
                rows={3}
                error={errors.seoDescription?.message}
                placeholder="e.g., Leading provider of professional services in Saudi Arabia. Trusted by thousands of clients..."
                hint={seoDescriptionHint}
              />
              {seoSettings && (
                <div className="mt-1">
                  <CharacterCounter
                    current={(watch("seoDescription") || "").length}
                    min={seoSettings.seoDescriptionMin}
                    max={seoSettings.seoDescriptionMax}
                    restrict={seoSettings.seoDescriptionRestrict}
                    className="ml-1"
                    belowMinHint="الوصف قصير. الطول المثالي 120–158 حرف لظهور كامل في نتائج البحث (Google Search Central)."
                    aboveMaxHint="يتجاوز الطول الموصى به. يُفضّل 120–158 حرف لتجنّب القص في النتائج."
                  />
                </div>
              )}
            </div>
            <FormInput
              label="Canonical URL"
              name="canonicalUrl"
              type="url"
              value={watch("canonicalUrl") || ""}
              onChange={(e) => setValue("canonicalUrl", e.target.value || null, { shouldValidate: true })}
              error={errors.canonicalUrl?.message}
              placeholder="https://example.com/page"
              hint="رابط Canonical يمنع مشاكل المحتوى المكرر - يُستخدم عندما يكون هناك محتوى متشابه في عناوين URL مختلفة - يساعد محركات البحث في تحديد الصفحة الأصلية - يُستخدم في علامة canonical link"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Meta Robots"
                name="metaRobots"
                value={watch("metaRobots") || undefined}
                onValueChange={(value) =>
                  setValue(
                    "metaRobots",
                    value
                      ? (value as "index, follow" | "noindex, follow" | "index, nofollow" | "noindex, nofollow")
                      : null,
                    { shouldValidate: true }
                  )
                }
                error={errors.metaRobots?.message}
                hint="يتحكم في كيفية فهرسة محركات البحث لصفحات هذا العميل - index, follow: السماح بالفهرسة ومتابعة الروابط (افتراضي) - noindex, follow: عدم الفهرسة ولكن متابعة الروابط - index, nofollow: الفهرسة ولكن عدم متابعة الروابط - noindex, nofollow: عدم الفهرسة أو متابعة الروابط"
                placeholder="Select robots directive"
              >
                <SelectItem value="index, follow">index, follow (Default - Allow indexing)</SelectItem>
                <SelectItem value="noindex, follow">noindex, follow (Don't index, but follow links)</SelectItem>
                <SelectItem value="index, nofollow">index, nofollow (Index, but don't follow links)</SelectItem>
                <SelectItem value="noindex, nofollow">noindex, nofollow (Don't index or follow)</SelectItem>
              </FormSelect>
              <FormSelect
                label="Twitter Card Type"
                name="twitterCard"
                value={watch("twitterCard") || "auto"}
                onValueChange={(value) => setValue("twitterCard", value === "auto" ? null : (value as "summary" | "summary_large_image"), { shouldValidate: true })}
                error={errors.twitterCard?.message}
                hint="نوع البطاقة المستخدمة في مشاركات Twitter/X - يحدد كيفية عرض المحتوى عند المشاركة على Twitter/X - يُستخدم لتحسين ظهور المحتوى في منصة Twitter/X"
              >
                <SelectItem value="auto">Auto-generate from OG tags</SelectItem>
                <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
              </FormSelect>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormInput
                  label="Twitter Title"
                  name="twitterTitle"
                  value={watch("twitterTitle") || ""}
                  onChange={(e) =>
                    setValue("twitterTitle", e.target.value || null, { shouldValidate: true })
                  }
                  error={errors.twitterTitle?.message}
                  hint={twitterTitleHint}
                />
                {seoSettings && (
                  <div className="mt-1">
                    <CharacterCounter
                      current={(watch("twitterTitle") || "").length}
                      max={seoSettings.twitterTitleMax}
                      restrict={seoSettings.twitterTitleRestrict}
                      className="ml-1"
                      aboveMaxHint="يتجاوز حد Twitter Cards (70 حرف). قد يُقص في المشاركات (X Developer Docs)."
                    />
                  </div>
                )}
              </div>
              <FormInput
                label="Twitter Site"
                name="twitterSite"
                value={watch("twitterSite") || ""}
                onChange={(e) =>
                  setValue("twitterSite", e.target.value || null, { shouldValidate: true })
                }
                error={errors.twitterSite?.message}
                placeholder="@username"
                hint="اسم المستخدم على Twitter/X (مثل: @company) - يُستخدم للاعتماد والربط بالحساب الرسمي - يساعد في ربط المحتوى بالحساب الرسمي للشركة على Twitter/X"
              />
            </div>
            <div>
              <FormTextarea
                label="Twitter Description"
                name="twitterDescription"
                value={watch("twitterDescription") || ""}
                onChange={(e) =>
                  setValue("twitterDescription", e.target.value || null, { shouldValidate: true })
                }
                rows={2}
                error={errors.twitterDescription?.message}
                hint={twitterDescriptionHint}
              />
              {seoSettings && (
                <div className="mt-1">
                  <CharacterCounter
                    current={(watch("twitterDescription") || "").length}
                    max={seoSettings.twitterDescriptionMax}
                    restrict={seoSettings.twitterDescriptionRestrict}
                    className="ml-1"
                    aboveMaxHint="يتجاوز حد Twitter Cards (200 حرف). قد يُقص في المشاركات (X Developer Docs)."
                  />
                </div>
              )}
            </div>
            <FormInput
              label="Google Tag Manager ID (Optional)"
              name="gtmId"
              value={watch("gtmId") || ""}
              onChange={(e) => setValue("gtmId", e.target.value || null, { shouldValidate: true })}
              error={errors.gtmId?.message}
              placeholder="GTM-XXXXXXX"
              hint="مطلوب فقط إذا أراد العميل حاوية Google Tag Manager منفصلة خاصة به - اتركه فارغاً للتتبع التلقائي عبر الحاوية الرئيسية - معظم العملاء لا يحتاجون هذا - جميع مقالات العميل يتم تتبعها تلقائياً عبر الحاوية الرئيسية مع معرف العميل الفريد"
            />
          </div>
        )}
      </div>

      {/* Schema content */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => toggleSection("schemaContent")}
          className="flex flex-col gap-1 mb-1 w-full text-left"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform ${
                  openSections.schemaContent ? "rotate-0" : "-rotate-90"
                }`}
              />
              <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
                Schema content
              </h3>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {hasSchemaContentErrors && (
                <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
              )}
              {warningCounts.schemaContent > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/40">
                  <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
                  {warningCounts.schemaContent}
                </span>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-border" />
        </button>

        {openSections.schemaContent && (
          <div className="space-y-3">
            <div>
              <FormTextarea
                label="Organization Description"
                name="description"
                value={watch("description") || ""}
                onChange={(e) => setValue("description", e.target.value || null, { shouldValidate: true })}
                rows={3}
                error={errors.description?.message}
                placeholder="Describe your organization's mission, values, and key achievements..."
                hint="وصف المنظمة في بيانات Schema.org المهيكلة - منفصل عن وصف SEO - يُستخدم في JSON-LD structured data - يصف مهمة المنظمة وقيمها وإنجازاتها الرئيسية - الحد الأدنى 100 حرف، والقيمة المثالية تقريباً 300 حرف لتحقيق أفضل نتائج SEO (Optimal: 300 characters for best SEO)"
              />
              <div className="mt-1">
                <CharacterCounter
                  current={(watch("description") || "").length}
                  min={100}
                  max={500}
                  className="ml-1"
                  belowMinHint="يُفضّل 100 حرف على الأقل لوصف كافٍ في Schema.org structured data."
                  aboveMaxHint="يُفضّل وصف مختصر (حتى 500 حرف) لوضوح أفضل في Schema.org. الوصف الكامل يُترك لصفحة «من نحن»."
                />
              </div>
            </div>
            <FormTextarea
              label="Keywords"
              name="keywords"
              value={
                Array.isArray(watch("keywords"))
                  ? watch("keywords").join(", ")
                  : ((typeof watch("keywords") === "string" ? watch("keywords") : "") as string)
              }
              onChange={(e) => {
                const keywords = e.target.value
                  .split(",")
                  .map((k) => k.trim())
                  .filter(Boolean);
                setValue("keywords", keywords, { shouldValidate: true });
              }}
              rows={2}
              error={errors.keywords?.message}
              placeholder="e.g., technology, innovation, consulting, digital transformation"
              hint="الكلمات المفتاحية لتصنيف Schema.org - مفصولة بفواصل - تُستخدم في البيانات المهيكلة لتحسين محركات البحث - تساعد في تصنيف الشركة حسب النشاط والقطاع (مثل: تكنولوجيا، استشارات، تحول رقمي)"
            />
            <FormTextarea
              label="Knows Language"
              name="knowsLanguage"
              value={
                Array.isArray(watch("knowsLanguage"))
                  ? watch("knowsLanguage").join(", ")
                  : ((typeof watch("knowsLanguage") === "string" ? watch("knowsLanguage") : "") as string)
              }
              onChange={(e) => {
                const languages = e.target.value
                  .split(",")
                  .map((l) => l.trim())
                  .filter(Boolean);
                setValue("knowsLanguage", languages, { shouldValidate: true });
              }}
              rows={2}
              error={errors.knowsLanguage?.message}
              placeholder="e.g., Arabic, English"
              hint="اللغات المدعومة في Schema.org ContactPoint (مثل: العربية، الإنجليزية) - تُستخدم في البيانات المهيكلة لتحسين محركات البحث - تساعد محركات البحث في فهم اللغات التي يمكن التواصل بها مع الشركة"
            />
          </div>
        )}
      </div>

      {/* Organization & hierarchy */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => toggleSection("organization")}
          className="flex flex-col gap-1 mb-1 w-full text-left"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform ${
                  openSections.organization ? "rotate-0" : "-rotate-90"
                }`}
              />
              <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
                Organization & hierarchy
              </h3>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {hasOrganizationErrors && (
                <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
              )}
              {warningCounts.organization > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/40">
                  <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
                  {warningCounts.organization}
                </span>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-border" />
        </button>

        {openSections.organization && (
          <div className="space-y-4">
            <div>
              <FormNativeSelect
                label="Parent Organization"
                name="parentOrganizationId"
                value={watch("parentOrganizationId") || ""}
                onChange={(e) => setValue("parentOrganizationId", e.target.value || null, { shouldValidate: true })}
                error={errors.parentOrganizationId?.message}
                placeholder="Select parent organization (optional)"
                hint="ربط هذا العميل بشركة أو منظمة أم - يُستخدم في علاقات Schema.org الهرمية - يُستخدم فقط إذا كان هذا العميل فرعاً أو قسمًا من منظمة أخرى - يساعد في فهم هيكل الشركة"
              >
                <option value="">None (Independent Organization)</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </FormNativeSelect>
              <p className="text-xs text-muted-foreground mt-2">
                المنظمة الأم تُستخدم في بيانات Schema.org المهيكلة لإنشاء التسلسل الهرمي التنظيمي. قم بتعيين هذا فقط إذا
                كان هذا العميل فرعاً أو قسمًا من منظمة أخرى.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Business Activity Code"
                name="businessActivityCode"
                value={watch("businessActivityCode") || ""}
                onChange={(e) => setValue("businessActivityCode", e.target.value || null, { shouldValidate: true })}
                error={errors.businessActivityCode?.message}
                placeholder="e.g., 62010"
                hint="رمز تصنيف النشاط التجاري المحلي - يُستخدم لتصنيف SEO والتحقق - يساعد في تصنيف الشركة حسب النشاط التجاري المحلي - يُستخدم مع رمز ISIC V4 للتصنيف الشامل"
              />
              <FormInput
                label="ISIC V4 Code"
                name="isicV4"
                value={watch("isicV4") || ""}
                onChange={(e) => setValue("isicV4", e.target.value || null, { shouldValidate: true })}
                error={errors.isicV4?.message}
                placeholder="e.g., 0111"
                hint="التصنيف الصناعي الدولي الموحد (الإصدار الرابع) - يُستخدم لتصنيف SEO وبيانات Schema.org - تصنيف دولي موحد يساعد في تصنيف الشركة عالمياً - يُستخدم مع رمز النشاط التجاري المحلي للتصنيف الشامل"
              />
            </div>
            <FormSelect
              label="Organization Type"
              name="organizationType"
              value={watch("organizationType") || undefined}
              onValueChange={(value) =>
                setValue(
                  "organizationType",
                  value
                    ? (value as
                        | "Organization"
                        | "Corporation"
                        | "LocalBusiness"
                        | "NonProfit"
                        | "EducationalOrganization"
                        | "GovernmentOrganization"
                        | "SportsOrganization"
                        | "NGO")
                    : null,
                  { shouldValidate: true }
                )
              }
              error={errors.organizationType?.message}
              hint="لـ SEO/Schema.org: يصنف نوع المنظمة لمحركات البحث (Organization, Corporation, LocalBusiness, NonProfit, إلخ) - يختلف عن الشكل القانوني (Legal Form) - يُستخدم في بيانات Schema.org @type لتحسين محركات البحث - يساعد محركات البحث في فهم نوع الكيان"
              placeholder="Select Organization Type"
            >
              <SelectItem value="Organization">Organization</SelectItem>
              <SelectItem value="Corporation">Corporation</SelectItem>
              <SelectItem value="LocalBusiness">LocalBusiness</SelectItem>
              <SelectItem value="NonProfit">NonProfit</SelectItem>
              <SelectItem value="EducationalOrganization">EducationalOrganization</SelectItem>
              <SelectItem value="GovernmentOrganization">GovernmentOrganization</SelectItem>
              <SelectItem value="SportsOrganization">SportsOrganization</SelectItem>
              <SelectItem value="NGO">NGO</SelectItem>
            </FormSelect>
          </div>
        )}
      </div>
    </div>
  );
}
