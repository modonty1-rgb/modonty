"use client";

import { useState } from "react";
import Link from "next/link";
import { UseFormReturn } from "react-hook-form";
import { Link2, RefreshCw, ArrowLeft } from "lucide-react";

import { FormInput, FormField, FormSelect } from "@/components/admin/form-field";
import { SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ORGANIZATION_TYPES,
  type OrganizationType,
  LEGAL_FORMS,
  type LegalForm,
} from "@modonty/shared/lib/constants/client-classification";

import { SlugChangeDialog } from "../slug-change-dialog";
import { PasswordField } from "./password-field";
import { YmylSection } from "../form-sections/ymyl-section";
import { ClientOption } from "../form-sections/client-option";
import { CtaSection } from "../form-sections/cta-section";
import { BusinessBriefSection } from "../form-sections/business-brief-section";
import { EditLeftPanel } from "./edit-left-panel";
import { ClientPreviewCard } from "./client-preview-card";
import { ClientOrderPanel, type ClientActiveOrder } from "./client-order-panel";
import { ConsoleDataCard } from "./console-data-card";
import { ThreeColumnWorkspace } from "@/components/admin/three-column-workspace";

import type { ClientFormSchemaType } from "../../helpers/client-form-schema";
import type { ClientWithRelations } from "@/lib/types";
import type { SeoCheck } from "@modonty/shared/lib/seo/client/types";

interface ClientEditWorkspaceProps {
  form: UseFormReturn<ClientFormSchemaType>;
  initialData?: Partial<ClientWithRelations>;
  industries: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string; slug: string }>;
  countries: Array<{ code: string; nameAr: string; nameEn: string }>;
  /** Active CTA buttons from Settings → Dropdown Lists — feeds the picker in CtaSection. */
  ctaPresets: Array<{ id: string; labelAr: string; mode: "FORM" | "LINK"; defaultUrl: string | null }>;
  /** Named subscription tiers — feeds the tier selector (subscription is client-owned). */
  clientId?: string;
  seoScore: number;
  seoChecks: SeoCheck[];
  currentLogoUrl: string | null;
  currentHeroUrl: string | null;
  onOpenLogo: () => void;
  onOpenHero: () => void;
}

/**
 * **خمسةُ أقسامٍ بترتيب التعبئة** (خالد ١٩ سبتمبر ٢٠٢٦: «وزّع العناصر… منطقيّة وسهلة
 * الوصول، وخلّيها كلّها صفحة واحدة في النصّ»).
 *
 * الترتيبُ يتبع ما يفعله الموظّف لا ما بُني أوّلاً: **مَن هو** ← **كيف نصله ونصنّفه**
 * ← **ما يراه الزائر** ← **ما يراه جوجل** ← **أين تُنشر مقالاتُه**. وقسمُ «التوثيق»
 * خرج إلى الرفّ الأيمن: تيلةُ صورةٍ واحدةٍ لا تستحقّ قسماً بعرض العمود، ومكانُها مع
 * بوّابة YMYL — كلاهما أوراقٌ رسميّةٌ تُفحص.
 */
const ZONES = [
  { id: "z-account", label: "Account & Access" },
  { id: "z-contact", label: "Classification" },
  { id: "z-cta", label: "Client Page & Contact" },
] as const;

/**
 * ترويسةُ القسم — عنوانٌ لا مقبضُ طيّ.
 *
 * كانت `AccordionTrigger`، وقبلها `<summary>`. وخالد (١٩ سبتمبر ٢٠٢٦): «يضايقني موضوع
 * الـcollapse، خلّيها كلّها صفحة واحدة في النصّ». والطيُّ كان علاجاً لطولِ الصفحة،
 * وقد عولج الطولُ بسببِه: ما لا يُكتب خرج إلى الرفّين، فبقي في الوسط ما يُملأ وحده.
 */
/**
 * **بطاقةُ shadcn جذراً للقسم** (خالد ١٩ سبتمبر ٢٠٢٦: «استخدم الـroot تبع shadcn،
 * واستفد من الـheader والـfooter والـbody عشان نضغط الصفحة قدر الإمكان»).
 *
 * -- الصندوقُ المزدوج سقط --
 * كان القسمُ ترويسةً عائمةً ثمّ `<div>` تحتها:
 * إطارٌ يبدأ **بعد** عنوانه، فيُقرأ العنوانُ بلا وعاءٍ والوعاءُ بلا عنوان. و`CardHeader`
 * يجعلهما جسماً واحداً بخطٍّ فاصلٍ بينهما.
 *
 * -- والحشوُ مضغوط --
 * افتراضُ shadcn `p-6` (٢٤px) و`text-2xl` للعنوان — مقاسُ بطاقةٍ تسويقيّة. وهنا
 * ١٢px وعنوانٌ ١٣px: أربعُ حوافَّ × ٢٤ = ٩٦px تنفق على فراغٍ في كلّ قسم، وخمسةُ أقسامٍ
 * تعني ٤٨٠px من صفحةٍ لا تُرى منها إلّا ٤٩٥.
 *
 * -- والتلميحُ سقط --
 * خالد (نفس اليوم): «الـhints اللي جنبها هذي أنا ما أحتاجها». والعنوانُ يكفي لمن يعمل
 * على الشاشة كلَّ يوم؛ الشرحُ للزائر لا للمقيم.
 */
function SectionCard({
  id,
  children,
  footer,
}: {
  id: string;
  children: React.ReactNode;
  /** `CardFooter` — لما يلي الحقولَ ولا يُملأ معها (الملفّات الاجتماعيّة · النشرة). */
  footer?: React.ReactNode;
}) {
  // الرقمُ والعنوانُ من `ZONES`: كانا يُكتبان مرّتين فاختلفت الخريطةُ عن الأقسام.
  const index = ZONES.findIndex((z) => z.id === id) + 1;
  const title = ZONES[index - 1]?.label ?? "";
  return (
    <Card id={id} className="scroll-mt-4">
      <CardHeader className="flex-row items-center gap-2 space-y-0 border-b px-3 py-2">
        <span className="grid size-5 shrink-0 place-items-center rounded bg-primary/10 text-[11px] font-bold tabular-nums text-primary">
          {index}
        </span>
        <CardTitle className="text-[13px] font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3">{children}</CardContent>
      {footer ? <CardFooter className="border-t p-3">{footer}</CardFooter> : null}
    </Card>
  );
}


export function ClientEditWorkspace({
  form,
  initialData,
  industries,
  clients,
  countries,
  ctaPresets,
  clientId,
  seoScore,
  seoChecks,
  currentLogoUrl,
  currentHeroUrl,
  onOpenLogo,
  onOpenHero,
}: ClientEditWorkspaceProps) {
  const { watch, setValue, formState: { errors } } = form;
  const [slugDialogOpen, setSlugDialogOpen] = useState(false);

  const name = watch("name");
  const slug = watch("slug");
  const email = watch("email");
  const password = watch("password");
  const industryId = watch("industryId");
  const organizationType = watch("organizationType");
  const addressCountry = watch("addressCountry");
  const legalForm = watch("legalForm");

  const countryName = addressCountry
    ? countries.find((c) => c.code === addressCountry)?.nameAr ?? addressCountry
    : null;

  /**
   * **الطلبُ الساري** — مصدرُ الباقة والمدّة والمبلغ، ويُقرأ في عمودِه.
   *
   * `Client.activeOrderId` معرّفٌ مجرَّدٌ بلا علاقةٍ في السكيما، فالخادمُ يجلبه
   * باستعلامٍ ثانٍ (`get-client-by-id.ts`) ويسلّمه هنا جاهزاً.
   */
  const activeOrder = (initialData as { activeOrder?: ClientActiveOrder | null } | undefined)?.activeOrder ?? null;

  return (
    /**
     * **ثلاثةُ أعمدة** (خالد ١٩ سبتمبر ٢٠٢٦: «سوّي لي component ثلاثة column هنا في
     * الصفحة هذي، لأنّه في عندنا شغل كثير نبغى نسوّيه»).
     *
     * كان عمودين: النموذجُ ورفٌّ واحدٌ يحشر التنقّلَ والباقةَ ورابطَ الطلب معاً. فخرج
     * الطلبُ إلى عمودِه — «البيانات المهمّة اللي تخصّه» (خالد) — وبقي التنقّلُ وحده
     * في رفٍّ نحيف. والمعاينةُ ترويسةٌ بعرض الصفحة كما هي منذ اليوم نفسِه.
     */
    <ThreeColumnWorkspace
      header={
      <ClientPreviewCard
        name={name || ""}
        logoUrl={currentLogoUrl}
        heroUrl={currentHeroUrl}
        // الأبعادُ المخزَّنة تقرّر ارتفاعَ الصندوق — نفسُ قاعدة مدونتي (`client-hero-v2.tsx:94`).
        heroWidth={(initialData as { heroImageMedia?: { width?: number | null } | null } | undefined)?.heroImageMedia?.width ?? null}
        heroHeight={(initialData as { heroImageMedia?: { height?: number | null } | null } | undefined)?.heroImageMedia?.height ?? null}
        industryName={(initialData?.industry as { name?: string } | null | undefined)?.name}
        countryName={countryName}
        isVerified={Boolean(watch("isVerified"))}
        articleCount={(initialData as { _count?: { articles?: number } } | undefined)?._count?.articles ?? 0}
        slug={slug ?? null}
        onChangeSlug={clientId ? () => setSlugDialogOpen(true) : undefined}
        onOpenLogo={onOpenLogo}
        onOpenHero={onOpenHero}
      />
      }
      left={
        // يُقرأ ولا يُملأ، ولاصقٌ لأنّ الموظّف يعدّل وعينُه عليه.
        <div className="space-y-3 lg:sticky lg:top-4">
          <ClientOrderPanel order={activeOrder} />
          {/* YMYL محلَّ بطاقة الكونسول (خالد ١٩ سبتمبر ٢٠٢٦): بوّابةُ نشرٍ تُقرَّر مرّةً،
              فمكانُها مع حقائق الصفقة التي لا تُملأ هنا. */}
          <YmylSection form={form} />
        </div>
      }
      center={
      <div className="min-w-0">
        <div className="space-y-4">
        {/* -- ZONE 1 · ACCOUNT & ACCESS ------------------------- */}
        <SectionCard id="z-account">
          {/**
            * **شريطان: الهويّة ثمّ الدخول — والظهورُ تحتهما.**
            *
            * خالد (١٩ سبتمبر ٢٠٢٦): «اديني UI/UX بيرفكت».
            *
            * كان الصفُّ الأوّل ثلاثةَ أعمدة — الاسمُ والبريدُ والسلَج — والبريدُ بينها
            * عرضُه ١٧٦px ونصُّه مقصوص (مقيسٌ حيّاً: `scrollWidth > clientWidth`). وكانت
            * كلمةُ المرور وحدها في شريطٍ يترك نصفَه فارغاً.
            *
            * والترتيبُ الآن يتبع القرابة لا المساحة: **الاسمُ يولّد السلَج** فيتجاوران،
            * و**البريدُ اسمُ الدخول وكلمتُه مفتاحُه** فيتجاوران. فصار شريطان من عمودين
            * بدل ثلاثةٍ ثمّ واحد — والحقولُ أوسع، والقرابةُ مقروءةٌ بالموضع.
            *
            * والسلَجُ يبقى في شريط الهويّة لأنّه اسمُه العامّ — لكنّه **عرضٌ مقفلٌ لا
            * حقلُ إدخال**، ولذلك عنوانُه يقول ذلك صراحةً.
            */}
          <div className="divide-y rounded-2xl border bg-card">
            {/* ① الاسم — والسلَجُ المشتقُّ منه صار رابطاً كاملاً تحت المعاينة. */}
            <div className="p-4">
              <FormInput
                name="name"
                label="Name"
                value={name || ""}
                onChange={(e) => setValue("name", e.target.value, { shouldValidate: true })}
                error={errors.name?.message}
                required
              />
            </div>

            {/**
              * ② الدخول — البريدُ اسمُ المستخدم وكلمتُه مفتاحُه.
              *
              * `password` يصل من الخادم مهشوشاً أو فارغاً، والحقلُ يبدأ فارغاً في
              * الحالتين: فارغٌ يعني «لا تغيّرها» لمن له كلمة، و«لا يستطيع الدخول» لمن
              * فُتح ملفُّه بالتفعيل بلا كلمة.
              *
              * سطرٌ لكلٍّ منهما دائماً: `sm:grid-cols-2` كان يقسم بعرض الشاشة لا بعرض البطاقة،
              * فمع السايدبار مفتوحاً (بطاقة ~٥٩٠px) ضاق حقلُ الكلمة إلى ~٨٥px بجانب «ولّد»
              * (خالد، ٢٤ سبتمبر ٢٠٢٦).
              */}
            <div className="grid grid-cols-1 gap-4 p-4">
              <FormInput
                name="email"
                type="email"
                label="Email — Username"
                value={email || ""}
                onChange={(e) => setValue("email", e.target.value, { shouldValidate: true })}
                error={errors.email?.message}
                required
              />
              <PasswordField
                value={password || ""}
                onChange={(pw, opts) =>
                  setValue("password", pw, { shouldValidate: true, shouldDirty: opts?.generated ? true : undefined })
                }
                error={errors.password?.message}
              />
            </div>

            {/**
              * ③ الظهورُ والصلاحيّة — بعنوانٍ يقول ما هي.
              *
              * كانت ثلاثَ خاناتٍ معلّقةً في شريطٍ بلا عنوان، فتُقرأ زينةً بجانب الحقول
              * وهي قرارات: واحدةٌ تضعه في سلايدر الشركاء، وأخرى تمنحه شارةَ توثيق،
              * وثالثةٌ تفتح تبويباً في كونسوله.
              */}
            <div className="space-y-2 p-4">
              <p className="text-xs font-medium text-muted-foreground">الظهور والصلاحيّة</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <ClientOption form={form} name="isFeatured" />
                <ClientOption form={form} name="isVerified" />
                <ClientOption form={form} name="showSchedule" />
              </div>
            </div>
          </div>

          {clientId && (
            <SlugChangeDialog
              clientId={clientId}
              currentSlug={slug ?? ""}
              open={slugDialogOpen}
              onOpenChange={setSlugDialogOpen}
              onSuccess={(newName, newSlug) => {
                setValue("name", newName, { shouldValidate: true });
                setValue("slug", newSlug, { shouldValidate: true });
              }}
            />
          )}
        </SectionCard>


        {/* -- ZONE 2 · CONTACT & CLASSIFICATION ------------------ */}
        <SectionCard id="z-contact">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Industry"
                name="industryId"
                value={industryId || undefined}
                onValueChange={(value) => setValue("industryId", value ? value : "", { shouldValidate: true })}
                error={errors.industryId?.message}
                placeholder="Select industry"
              >
                {industries.map((ind) => (
                  <SelectItem key={ind.id} value={ind.id}>
                    {ind.name}
                  </SelectItem>
                ))}
              </FormSelect>
              <FormSelect
                label="Organization Type"
                name="organizationType"
                value={organizationType || undefined}
                onValueChange={(value) =>
                  setValue("organizationType", value ? (value as OrganizationType) : null, { shouldValidate: true })
                }
                error={errors.organizationType?.message}
                placeholder="Select Organization Type"
              >
                {ORGANIZATION_TYPES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.value} — {o.ar}
                  </SelectItem>
                ))}
              </FormSelect>
              <FormSelect
                label="Legal Form"
                name="legalForm"
                value={legalForm || undefined}
                onValueChange={(value) =>
                  setValue("legalForm", value ? (value as LegalForm) : null, { shouldValidate: true })
                }
                error={errors.legalForm?.message}
                placeholder="Select Legal Form"
              >
                {LEGAL_FORMS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.value} — {o.ar}
                  </SelectItem>
                ))}
              </FormSelect>
              {/**
                * **`FormSelect` لا `FormNativeSelect`** (مقيسٌ حيّاً ١٩ سبتمبر ٢٠٢٦).
                *
                * كان الوحيدَ من الأربعة مبنيّاً على `<select>` الأصليّ: عرضُه ٥٩٤px بينما
                * إخوتُه ٢٨٩، وسهمُه وقائمتُه من المتصفّح لا من نظام التصميم. فصفٌّ واحدٌ
                * يحمل شكلين لنفس النوع — والعينُ تقرأ الاختلافَ معنىً لا سهواً.
                *
                * و`"none"` قيمةٌ صريحةٌ لا `""`: `SelectItem` من Radix يرفض القيمة الفارغة.
                */}
              <FormSelect
                label="Parent Organization"
                name="parentOrganizationId"
                value={watch("parentOrganizationId") || "none"}
                onValueChange={(value) =>
                  setValue("parentOrganizationId", value === "none" ? null : value, { shouldValidate: true })
                }
                error={errors.parentOrganizationId?.message}
                placeholder="None"
              >
                <SelectItem value="none">— بلا مؤسّسةٍ أمّ —</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </FormSelect>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          id="z-cta"
          footer={
            // نصُّ النشرة تذييلاً: يتلو زرَّ الإجراء على صفحة العميل ولا يُملأ معه.
            <BusinessBriefSection form={form} showHeader={false} isEditMode />
          }
        >
          {/* قرارُ عرضٍ عامّ: يضعه في سلايدر الشركاء على مدونتي — فمكانُه مع ما يراه الزائر. */}
          {/**
            * **قنواتُ الاتّصال خرجت إلى الكونسول** (خالد ١٩ سبتمبر ٢٠٢٦: «معلومات العميل
            * هو يعرفها أكثر عن نفسه، إحنا ما نعرفها، فهو اللي مفروض يدخلها»).
            *
            * الموقعُ والجوالُ ونوعُ التواصل والملفّاتُ الاجتماعيّة — أربعتُها بياناتُ شركته،
            * ننقلها عنه بالسماع فتتقادم عندنا وهو يعرفها. وكانت تُعرض له في
            * `console/.../profile-form.tsx` **صفوفَ قراءةٍ مقفلة**: يرى خطأَها ولا يملك
            * تصحيحَه فيراسلنا. والخادمُ هناك يكتبها أصلاً (`profile-actions.ts:88 · 95 ·
            * 97 · 117`) — فالناقصُ كان الحقلَ لا المسار.
            *
            * وحفظُه هناك يعيد توليدَ الميتا والـJSON-LD ويُبطل كاش مدونتي
            * (`updateProfile:213` → `regenerateClientSeo`) — مقيسٌ حيّاً ١٩ سبتمبر:
            * الـJSON-LD من صفرِ حرفٍ إلى ١٦٥٠ حرفاً، وفيه `telephone` و`sameAs`.
            *
            * ويبقى عندنا ما يحرّكه بين فئات مدونتي: الصناعةُ ونوعُ المنشأة والشكلُ القانونيّ.
            */}
          <div>
            <CtaSection form={form} ctaPresets={ctaPresets} />
          </div>

        </SectionCard>
        {/* -- ZONE 10 · CLIENT SITE & API ------------------------ */}
        </div>
      </div>
      }
      right={
      <EditLeftPanel>
        {/**
          * **جردُ ما أدخله العميلُ — بالعمود كلِّه** (خالد ١٩ سبتمبر ٢٠٢٦: «اللي من
          * الكونسول في العمود الثاني يكون كامل»).
          *
          * ثلاثةَ عشرَ سطراً لا تُقرأ في رفٍّ مزدحم. وهو الشيءُ الوحيدُ الذي يُقرأ نزولاً
          * سطراً سطراً — بقيّةُ الشاشة حقولٌ تُقصد، وهذا جردٌ يُمسح بالعين.
          */}
        {clientId && (
          <ConsoleDataCard
            clientId={clientId}
            documentsCount={(initialData as { _count?: { documents?: number } } | undefined)?._count?.documents ?? 0}
            legalName={(initialData as { legalName?: string | null } | undefined)?.legalName}
            commercialRegistrationNumber={(initialData as { commercialRegistrationNumber?: string | null } | undefined)?.commercialRegistrationNumber}
            vatID={(initialData as { vatID?: string | null } | undefined)?.vatID}
            foundingDate={(initialData as { foundingDate?: Date | null } | undefined)?.foundingDate}
            addressCity={(initialData as { addressCity?: string | null } | undefined)?.addressCity}
            addressRegion={(initialData as { addressRegion?: string | null } | undefined)?.addressRegion}
            addressStreet={(initialData as { addressStreet?: string | null } | undefined)?.addressStreet}
            description={(initialData as { description?: string | null } | undefined)?.description}
            phone={(initialData as { phone?: string | null } | undefined)?.phone}
            url={(initialData as { url?: string | null } | undefined)?.url}
            priceRange={(initialData as { priceRange?: string | null } | undefined)?.priceRange}
            gbpProfileUrl={(initialData as { gbpProfileUrl?: string | null } | undefined)?.gbpProfileUrl}
            sameAs={(initialData as { sameAs?: string[] | null } | undefined)?.sameAs}
            openingHoursSpecification={(initialData as { openingHoursSpecification?: unknown } | undefined)?.openingHoursSpecification}
          />
        )}
      </EditLeftPanel>
      }
    />
  );
}
