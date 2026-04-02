# PRD — Client Form Redesign
> Branch: `seo/phase-0-cleanup` | Scope: `admin/` only | No dead code
> Rule: One task at a time. Never touch files outside the task scope.

---

## Design Reference — Read Before Every Task

### Colors (CSS variables — never hardcode hex)
| Token | Value | Tailwind class |
|---|---|---|
| Primary | #3030ff | `text-primary` / `bg-primary` |
| Foreground | #0e065a | `text-foreground` / `bg-foreground` |
| Accent | #00d8d8 | `text-accent` / `bg-accent` |
| Border | #dbdbdb | `border-border` |
| Muted text | — | `text-muted-foreground` |
| Muted bg | — | `bg-muted` |

### Buttons
| Use | Variant / Class |
|---|---|
| Create Client | `variant="default"` (primary) |
| Update Client | `className="bg-blue-600 hover:bg-blue-700 text-white"` |
| Delete | `variant="outline" className="border-destructive text-destructive"` |
| Back | `variant="ghost"` |
| SEO Setup | `className="bg-accent text-foreground font-semibold"` |

### Badges
| Badge | Class |
|---|---|
| `auto` | `bg-green-100 text-green-700` |
| `locked` | `bg-yellow-100 text-yellow-800` |
| `Edit only` | `bg-blue-100 text-blue-700` |

### Notices
| Type | Class |
|---|---|
| Yellow (media/seo) | `bg-yellow-50 border border-yellow-200 text-yellow-800` |
| Blue (info) | `bg-blue-50 border border-blue-200 text-blue-800` |

### Spacing
| Token | Value |
|---|---|
| Navbar height | `57px` → `top-[57px]` |
| Main max-width | `max-w-[1128px]` |
| Form sidebar width | `w-48` |
| SEO sidebar width | `w-60` |
| Sidebar sticky top | `top-[calc(57px+57px+16px)]` |
| Container padding | `px-6 py-6` |

### Accordion
- Open item header → `bg-muted`
- GBP section → `border-l-2 border-[#4285f4]`
- Disabled section → normal accordion, but content shows notice

---

## PHASE 0 — Preparation

### TASK 0.1 — Verify Accordion component exists
**Action:**
```powershell
Test-Path "admin/components/ui/accordion.tsx"
```
If returns `False` → run:
```powershell
cd admin && pnpm dlx shadcn@latest add accordion
```
**Do NOT touch any other file.**
**Report:** exists / installed.

### TASK 0.2 — Update ClientFormData type
**Action:** Locate `ClientFormData` type (search in `packages/` and `admin/lib/types.ts`).
Add these fields if not already present:
```ts
ga4PropertyId?: string | null
ga4MeasurementId?: string | null
gbpProfileUrl?: string | null
gbpPlaceId?: string | null
gbpAccountId?: string | null
gbpLocationId?: string | null
gbpCategory?: string | null
priceRange?: string | null
openingHoursSpecification?: OpeningHoursDay[] | null
```

Add this type near `ClientFormData`:
```ts
export type OpeningHoursDay = {
  dayOfWeek: string   // "Saturday" | "Sunday" | ... | "Friday"
  opens: string       // "09:00"
  closes: string      // "17:00"
  closed: boolean
}
```

**Do NOT change any other type.**
**After:** `pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "error"`
**Report:** List fields added. Paste TSC result.

### TASK 0.3 — Clean watchedFields in client-form.tsx
**File:** `admin/app/(dashboard)/clients/components/client-form.tsx`
**Action:** Remove these keys from the `watchedFields` object AND from the `useMemo` deps array:
- `isicV4`
- `businessActivityCode`
- `taxID`
- `contentPriorities`

**Do NOT touch any other field or logic.**
**After:** `pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "client-form"`
**Report:** Confirm 4 fields removed from both places. Paste TSC result.

### TASK 0.4 — Update buildClientSeoData helper
**File:** `admin/app/(dashboard)/clients/helpers/build-client-seo-data.ts`
**Action:** Add new fields to the data mapping:
```ts
priceRange: watchedFields.priceRange ?? initialData?.priceRange ?? null,
openingHoursSpecification: watchedFields.openingHoursSpecification ?? initialData?.openingHoursSpecification ?? null,
gbpPlaceId: watchedFields.gbpPlaceId ?? initialData?.gbpPlaceId ?? null,
gbpProfileUrl: watchedFields.gbpProfileUrl ?? initialData?.gbpProfileUrl ?? null,
```
**Do NOT touch any other field.**
**After:** `pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "build-client"`
**Report:** Confirm fields added. Paste TSC result.

---



### TASK 1.1 — Prisma: Add new columns
**File:** `prisma/schema.prisma`
**Action:** Add these fields to the `Client` model only if they don't already exist:

```prisma
// Analytics
ga4PropertyId       String?
ga4MeasurementId    String?

// GBP
gbpProfileUrl       String?
gbpPlaceId          String?
gbpAccountId        String?
gbpLocationId       String?
gbpCategory         String?

// Business Details
priceRange                  String?
openingHoursSpecification   Json?

// Defaults (confirm present, add if missing)
knowsLanguage               String?  @default("ar")
addressCountry              String?  @default("SA")
addressNeighborhood         String?
```

**After:** Run `pnpm prisma migrate dev --name add-client-gbp-analytics`
**Report:** List every column added. List every column already present (skipped).

---

## PHASE 2 — Remove Dead Code

### TASK 2.1 — Delete unused files
**Delete these files completely:**
```
admin/app/(dashboard)/clients/components/test-data-button.tsx
admin/app/(dashboard)/clients/components/form-sections/security-section.tsx
```
**Report:** Confirm both files deleted.

### TASK 2.2 — Remove dead fields from seo-section.tsx
**File:** `admin/app/(dashboard)/clients/components/form-sections/seo-section.tsx`
**Action:** Remove these fields and their `form.watch()` calls:
- `isicV4`
- `businessActivityCode`
- `taxID`

**Do NOT touch any other field.**
**After:** `pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "seo-section"`
**Report:** List removed fields. Paste TSC result.

### TASK 2.3 — Remove dead fields from settings-section.tsx
**File:** `admin/app/(dashboard)/clients/components/form-sections/settings-section.tsx`
**Action:** Remove field `contentPriorities` and its `form.watch()` call.
**Do NOT touch any other field.**
**After:** `pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "settings-section"`
**Report:** Confirm removed. Paste TSC result.

---

## PHASE 3 — Update Existing Form Sections

### TASK 3.1 — basic-info-section.tsx: Add password + email hint
**File:** `admin/app/(dashboard)/clients/components/form-sections/basic-info-section.tsx`
**Action:** Add password field in the same row as email:
```
Email (label: "Email — اسم المستخدم") | Password
```
Password rules:
- Create mode: required, placeholder `••••••••`
- Edit mode: optional, placeholder `اتركه فارغاً للإبقاء`
- Use `isEditMode` prop already available

**Do NOT change slug, name, phone, website, businessBrief.**
**After:** `pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "basic-info"`
**Report:** Confirm changes. Paste TSC result.

### TASK 3.2 — basic-info-section.tsx: Slug UX
**File:** same file as 3.1
**Action:**
- Create mode: slug field `readonly`, badge `auto` (green bg `#dcfce7`, text `#15803d`)
- Edit mode: slug field `readonly`, badge `locked` (bg `#fef9c3`, text `#854d0e`)
- Edit mode only: show URL preview below slug → `{siteUrl}/clients/{slug}`
- Get `siteUrl` from `getAllSettings()` — pass as prop from parent if needed

**Do NOT change any other field.**
**After:** `pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "basic-info"`
**Report:** Confirm changes. Paste TSC result.

### TASK 3.3 — business-section.tsx: Add contactType + parentOrganizationId
**File:** `admin/app/(dashboard)/clients/components/form-sections/business-section.tsx`
**Action:** Add two fields:

| Field | DB Column | Type | Options |
|---|---|---|---|
| Contact Type | `contactType` | select | Customer Service / Sales / Technical Support |
| Parent Organization | `parentOrganizationId` | select | from `clients` prop (id + name) — nullable, first option "None" |

**Do NOT change existing fields.**
**After:** `pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "business-section"`
**Report:** Confirm fields added. Paste TSC result.

### TASK 3.4 — subscription-section.tsx: Auto articles from tier
**File:** `admin/app/(dashboard)/clients/components/form-sections/subscription-section.tsx`
**Action:**
- `articlesPerMonth` becomes `readonly` with small badge `من الباقة`
- On tier change → auto-set articlesPerMonth:
```ts
const tierMap = { BASIC: 8, PROFESSIONAL: 16, ENTERPRISE: 30 }
form.setValue('articlesPerMonth', tierMap[selectedTier])
```

**Do NOT change status, payment, dates.**
**After:** `pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "subscription"`
**Report:** Confirm change. Paste TSC result.

### TASK 3.5 — settings-section.tsx: Add GA4 fields
**File:** `admin/app/(dashboard)/clients/components/form-sections/settings-section.tsx`
**Action:** Add two fields after GTM ID:

| Field | DB Column | Placeholder |
|---|---|---|
| GA4 Property ID | `ga4PropertyId` | `123456789` |
| GA4 Measurement ID | `ga4MeasurementId` | `G-XXXXXXXXXX` |

**Do NOT change gtmId or metaRobots.**
**After:** `pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "settings-section"`
**Report:** Confirm fields added. Paste TSC result.

---

## PHASE 4 — Rewrite client-form.tsx

### TASK 4.1 — Remove old imports
**File:** `admin/app/(dashboard)/clients/components/client-form.tsx`
**Action:** Remove these imports only:
```ts
// DELETE:
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TestDataButton } from "./test-data-button"
import { SecuritySection } from "./form-sections/security-section"
```
**Add:**
```ts
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
```
**Do NOT change any other import or code.**
**After:** `pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "client-form"`
**Report:** Confirm. Paste TSC result.

### TASK 4.2 — Replace Tabs JSX with Accordion
**File:** same as 4.1
**Action:** Replace the entire `<Tabs>` block with:

```
Layout: flex gap-6
  Left (flex-1):
    Notice 1 (yellow, create mode only): "جميع ملفات الميديا تُدار من صفحة التعديل بعد حفظ العميل."
    Notice 2 (blue, create mode only):   "بيانات الـ SEO تُضاف بعد حفظ العميل — من زر Setup SEO."

    Accordion type="multiple" defaultValue={["client-info"]}
      Item "client-info" — title "Client Info"    → <BasicInfoSection />
      Item "company"     — title "Company Profile" → <BusinessSection />
      Item "subscription"— title "Subscription"   → <SubscriptionSection />
      Item "settings"    — title "Settings"        → <SettingsSection /> — Edit mode only

  Right (w-48, sticky top-[calc(57px+57px+16px)]):
    Card: "Required Fields"
      ○ Client Name
      ○ Email
      ○ Password
      ○ Business Brief
    Button: Create mode → green "Create Client" | Edit mode → blue "Update Client"
```

**Do NOT change form logic, useClientForm hook, handleSubmit, error display, or SEO Doctor.**
**After:** `pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "client-form"`
**Report:** Confirm. Paste TSC result.

### TASK 4.3 — Clean up new/page.tsx
**File:** `admin/app/(dashboard)/clients/new/page.tsx`
**Action:** Remove TestDataButton import and its prop from `<ClientForm />`.
**Do NOT change anything else.**
**After:** `pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "new"`
**Report:** Confirm. Paste TSC result.

---

## PHASE 5 — New SEO Page

### TASK 5.1 — Create client-seo-form.tsx
**File:** `admin/app/(dashboard)/clients/components/client-seo-form.tsx` ← NEW FILE

Props:
```ts
interface ClientSeoFormProps {
  initialData?: Partial<ClientWithRelations>
  clientId: string
  onSubmit: (data: ClientFormData) => Promise<FormSubmitResult>
}
```

Reuse hook: `useClientForm({ initialData, onSubmit, clientId })`

Left column accordion:

**Section 1 — Meta** (open by default)
Fields: `seoTitle` (required), `seoDescription` (required), `description`
Below fields: collapsible "Technical fields preview" showing read-only:
- og:title = seoTitle
- og:description = seoDescription
- og:url = siteUrl/clients/{slug}
- canonical = siteUrl/clients/{slug}
- twitter:title = seoTitle
- twitter:description = seoDescription

**Section 2 — Schema / JSON-LD** (collapsed)
Fields: `legalName`, `alternateName`, `commercialRegistrationNumber`, `vatID`, `twitterSite`, `twitterCard` (select: summary_large_image/summary), `sameAs`, `gbpProfileUrl`

**Section 3 — Google Business Profile** (collapsed, left border `#4285f4`)
- Top bar: "Not Connected" status + `<Button disabled>Connect GBP →</Button>`
- Fields: `gbpPlaceId`, `gbpAccountId`, `gbpLocationId`, `gbpCategory`
- Static feature list: NAP sync / Opening Hours sync / Reviews / Posts / Conflict alert

**Section 4 — Address** (collapsed)
Fields: `addressCity`, `addressNeighborhood`, `addressStreet`, `addressRegion`, `addressBuildingNumber`, `addressAdditionalNumber`, `addressPostalCode`, `addressCountry` (default SA), `addressLatitude`, `addressLongitude`

**Section 5 — Business Details** (collapsed)
Fields:
- `priceRange` select: $ / $$ / $$$ / $$$$
- `knowsLanguage` text (default: ar)
- `openingHoursSpecification` — 7-day UI (Sa/Su/Mo/Tu/We/Th/Fr), each day: checkbox + opens + closes

Opening hours data shape:
```ts
type OpeningHoursDay = {
  dayOfWeek: string   // "Saturday" .. "Friday"
  opens: string       // "09:00"
  closes: string      // "17:00"
  closed: boolean
}
```

**Section 6 — Media** (collapsed, Edit mode only)
Reuse `<MediaSocialSection />` as-is.

**Section 7 — SEO Analysis** (collapsed, read-only)
Reuse `<ClientSEOValidationSection />` as-is.

Right sidebar (w-60, sticky):
- Reuse `<SEODoctor />` with Meta + JSON-LD progress bars
- Reuse `<HoverCard />` for issues
- Save SEO button

**After:** `pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "client-seo-form"`
**Report:** Confirm file created. Paste TSC result.

### TASK 5.2 — Create /clients/[id]/seo/page.tsx
**File:** `admin/app/(dashboard)/clients/[id]/seo/page.tsx` ← NEW FILE

```tsx
// Server component
// 1. await params to get id
// 2. Fetch client = getClientById(id) → if !client redirect("/clients")
// 3. Fetch industries, clients for selects
// 4. Import updateClientSeo action (or reuse createClient action)
// 5. Render:
//    <div className="container mx-auto max-w-[1128px]">
//      <ClientFormHeaderWrapper title={`${client.name} — SEO Setup`}>
//        <ClientSeoForm initialData={client} clientId={id} onSubmit={updateClientSeo} />
//      </ClientFormHeaderWrapper>
//    </div>
```

**After:** `pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "seo/page"`
**Report:** Confirm file created. Paste TSC result.

---

## PHASE 6 — Update List + View Pages

### TASK 6.1 — Clients list: Add SEO column
**File:** clients list table component (find by reading `admin/app/(dashboard)/clients/page.tsx`)
**Action:** Add SEO score column:
```tsx
// score from existing cached data logic
score >= 80 → progress bar green
score >= 60 → progress bar yellow
score < 60  → progress bar red
score = 0 or null → show <Button variant="outline" size="sm" asChild><Link href={`/clients/${id}/seo`}>Setup SEO</Link></Button>
```
**Do NOT change other columns.**
**After:** TSC on the file only.
**Report:** Confirm. Paste TSC result.

### TASK 6.2 — Clients list: Add GBP + Analytics columns
**File:** same as 6.1
**Action:**

GBP column:
```tsx
client.gbpPlaceId
  ? <MapPin className="h-3 w-3 text-green-600" /> + "Connected"
  : <MapPinOff className="h-3 w-3 text-muted-foreground" /> + "—"
```

Analytics column:
```tsx
client.ga4PropertyId
  ? <BarChart2 className="h-3 w-3 text-green-600" /> + "Active"
  : "—"
```

**Icons from `@/lib/icons.ts` named exports only.**
**After:** TSC on the file only.
**Report:** Confirm. Paste TSC result.

### TASK 6.3 — Clients list: Update Actions column
**File:** same as 6.1
**Action:** Replace current actions with 3 icon buttons:
```tsx
// Edit
<Button variant="ghost" size="sm" asChild>
  <Link href={`/clients/${id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
</Button>
// SEO
<Button variant="ghost" size="sm" asChild>
  <Link href={`/clients/${id}/seo`}><Search className="h-3.5 w-3.5" /></Link>
</Button>
// View
<Button variant="ghost" size="sm" asChild>
  <Link href={`/clients/${id}`}><Eye className="h-3.5 w-3.5" /></Link>
</Button>
```
**Icons from `@/lib/icons.ts` only.**
**After:** TSC on the file only.
**Report:** Confirm. Paste TSC result.

### TASK 6.4 — View client page: Add SEO CTA
**File:** `admin/app/(dashboard)/clients/[id]/page.tsx`
**Action:** Add above existing cards, shown when seoScore < 80:
```tsx
{seoScore < 80 && (
  <div className="bg-foreground rounded-lg p-5 flex items-center gap-5 mb-6">
    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 border-destructive flex-shrink-0">
      <span className="text-destructive font-bold text-base">{seoScore}%</span>
      <span className="text-[9px] text-muted-foreground">SEO</span>
    </div>
    <div className="flex-1">
      <h3 className="text-white font-semibold text-sm">SEO غير مكتمل</h3>
      <p className="text-muted-foreground text-xs mt-0.5">أضف بيانات الـ SEO لتحسين ظهور العميل في نتائج البحث</p>
    </div>
    <Button asChild style={{ background: 'var(--accent)', color: 'var(--foreground)' }}>
      <Link href={`/clients/${id}/seo`}>Setup SEO ⚡</Link>
    </Button>
  </div>
)}
```
**seoScore** from existing cached score logic in this file.
**After:** TSC on this file only.
**Report:** Confirm. Paste TSC result.

---

## PHASE 7 — Final Verification

### TASK 7.1 — Full TSC
```powershell
cd admin && pnpm exec tsc --noEmit --skipLibCheck 2>&1 | Select-String "error"
```
**Report:** Paste full output. Zero errors required before proceeding.

### TASK 7.2 — Confirm deleted files are gone
```powershell
Test-Path "admin/app/(dashboard)/clients/components/test-data-button.tsx"
Test-Path "admin/app/(dashboard)/clients/components/form-sections/security-section.tsx"
```
Both must return `False`.
**Report:** Paste output.

### TASK 7.3 — Confirm no dead imports
Check these files have no unused imports:
- `client-form.tsx`
- `client-seo-form.tsx`
- `clients/[id]/seo/page.tsx`

**Report:** Confirm each file is clean.

---

## Key Rules — Read Before Every Task

| Rule | Detail |
|---|---|
| `siteUrl` | Always from `getAllSettings()` — never hardcoded, never env var |
| `slug` | Immutable after creation — `isEditMode` flag protects it |
| `canonicalUrl` | Auto from slug — never an editable field |
| `altText` | Auto from `name` — never in any form |
| `normalizeJsonLd()` | Forbidden — never call this function |
| SEO score | From cached data only — never raw DB fields |
| GBP Connect | Always `disabled` — API not approved yet |
| Git | No git operations by Cursor |
| Scope | One task = one file. Never touch other files |
