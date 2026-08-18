"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { PARTNER_SITE_PALETTE } from "@modonty/shared/lib/partner-site";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { saveMySite } from "../actions/save-my-site";
import type { MySiteData } from "../helpers/get-my-site-data";
import { TemplateRadioPicker } from "./template-radio-picker";
import { SiteAddressSettings } from "./site-address-settings";
import { HEADER_TEMPLATES, type HeaderData, type HeaderTemplateKey } from "@modonty/shared/components/partner-site/free/header";
import { FOOTER_TEMPLATES, type FooterData, type FooterTemplateKey } from "@modonty/shared/components/partner-site/free/footer";

interface MySiteEditorProps {
  initial: MySiteData;
}

/** One settings row: label + short help on the start side, the control on the end side. */
function SettingRow({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {help && <p className="mt-0.5 text-xs text-muted-foreground">{help}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** One group of rows with a heading, the way OS settings screens read. */
function SettingsGroup({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="mb-2 text-base font-semibold text-foreground">{title}</h2>
      <div className="divide-y rounded-lg border bg-card px-4">{children}</div>
    </section>
  );
}

/**
 * «إعدادات الموقع» — only what lives on the site's LAYOUT and shows on every page:
 * colour · header · footer · general. Section content belongs to «محتوى الموقع».
 * Colour and template persist today; the header/footer switches are UI-first (Khalid,
 * 2026-08-17: «نشتغل على الواجهة أوّل، بعدها الربط») and are wired in the next step.
 */
export function MySiteEditor({ initial }: MySiteEditorProps) {
  const { chrome } = initial;
  const [primaryColor, setPrimaryColor] = useState<string | null>(initial.primaryColor);
  const [headerTemplate, setHeaderTemplate] = useState<HeaderTemplateKey>(initial.headerTemplate);
  const [footerTemplate, setFooterTemplate] = useState<FooterTemplateKey>(initial.footerTemplate);
  const [subdomain, setSubdomain] = useState<string>(initial.subdomain ?? "");
  const [pending, startTransition] = useTransition();

  const isDirty =
    primaryColor !== initial.primaryColor ||
    headerTemplate !== initial.headerTemplate ||
    footerTemplate !== initial.footerTemplate ||
    subdomain !== (initial.subdomain ?? "");

  // Preview links are inert (`#`): the partner looks, he does not navigate away.
  const links = initial.pages.map((label, i) => ({ href: `#page-${i}`, label }));
  const headerData: HeaderData = {
    name: chrome.name,
    tagline: chrome.tagline,
    logoUrl: chrome.logoUrl,
    phone: chrome.phone,
    email: chrome.email,
    links,
    primaryColor,
  };
  const footerData: FooterData = {
    name: chrome.name,
    tagline: chrome.tagline,
    logoUrl: chrome.logoUrl,
    description: chrome.description,
    phone: chrome.phone,
    email: chrome.email,
    address: chrome.address,
    services: chrome.services.map((label, i) => ({ href: `#service-${i}`, label })),
    pages: links,
    socialLinks: chrome.socialLinks,
    registrationNumber: chrome.registrationNumber,
    year: new Intl.DateTimeFormat("ar-SA", { year: "numeric" }).format(new Date()),
    primaryColor,
  };

  function handleSave() {
    startTransition(async () => {
      const res = await saveMySite({ headerTemplate, footerTemplate, primaryColor, subdomain });
      if (res.success) toast.success("تم — التغيير ظاهر على موقعك");
      else toast.error(res.error);
    });
  }

  return (
    <div className="space-y-8">
      {/* ── العنوان ────────────────────────────────────── */}
      <section id="address" className="scroll-mt-20">
        <SiteAddressSettings slug={initial.slug} subdomain={initial.subdomain} onSubdomainChange={setSubdomain} />
      </section>

      {/* ── اللون ─────────────────────────────────────── */}
      <SettingsGroup id="color" title="لون الموقع">
        <SettingRow label="اللون الأساسي" help="يظهر في الأزرار والعناوين والروابط. كل الألوان مقروءة.">
          {/* 28px swatches inside 44px hit targets (WCAG 2.5.5 / design-system §7); press feedback on
              pointer-down via :active, honouring reduced motion. */}
          <div role="radiogroup" aria-label="اللون الأساسي" className="flex flex-wrap items-center justify-end gap-1">
            <button
              type="button"
              role="radio"
              aria-checked={primaryColor === null}
              onClick={() => setPrimaryColor(null)}
              className="group flex min-h-11 items-center px-1 focus-visible:outline-none"
            >
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-[background-color,box-shadow] motion-safe:group-active:scale-[0.97]",
                  "group-focus-visible:ring-2 group-focus-visible:ring-ring",
                  primaryColor === null ? "border-primary bg-primary/5 font-medium" : "group-hover:bg-muted/40",
                )}
              >
                لون مدونتي
              </span>
            </button>
            {PARTNER_SITE_PALETTE.map((c) => {
              const selected = primaryColor === c.hex;
              return (
                <button
                  key={c.hex}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={c.label}
                  title={c.label}
                  onClick={() => setPrimaryColor(c.hex)}
                  className="group grid h-11 w-11 place-items-center focus-visible:outline-none"
                >
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-full ring-offset-2 ring-offset-background",
                      "transition-[box-shadow,transform] motion-safe:group-active:scale-90",
                      "group-focus-visible:ring-2 group-focus-visible:ring-ring",
                      selected && "ring-2 ring-foreground",
                    )}
                    style={{ backgroundColor: c.hex }}
                  >
                    {selected && <Check className="h-3.5 w-3.5 text-white" />}
                  </span>
                </button>
              );
            })}
          </div>
        </SettingRow>
      </SettingsGroup>

      {/* ── الهيدر ────────────────────────────────────── */}
      <section id="header" className="scroll-mt-20">
        <h2 className="mb-1 text-base font-semibold text-foreground">الهيدر</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          خمسة أشكال لشريط التنقّل — كلها بشعارك وصفحاتك ولونك. اختر واحداً.
        </p>
        <TemplateRadioPicker
          label="قالب الهيدر"
          idPrefix="header-template"
          options={HEADER_TEMPLATES}
          value={headerTemplate}
          onChange={setHeaderTemplate}
          renderPreview={(key) => {
            const T = HEADER_TEMPLATES.find((t) => t.key === key)!;
            return <T.Component data={headerData} preview />;
          }}
        />
      </section>

      {/* ── الفوتر ────────────────────────────────────── */}
      <section id="footer" className="scroll-mt-20">
        <h2 className="mb-1 text-base font-semibold text-foreground">الفوتر</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          خمسة أشكال لذيل الموقع — كلها بشعارك وخدماتك وصفحاتك وتواصلك. اختر واحداً.
        </p>
        <TemplateRadioPicker
          label="قالب الفوتر"
          idPrefix="footer-template"
          options={FOOTER_TEMPLATES}
          value={footerTemplate}
          onChange={setFooterTemplate}
          renderPreview={(key) => {
            const T = FOOTER_TEMPLATES.find((t) => t.key === key)!;
            return <T.Component data={footerData} preview />;
          }}
        />
      </section>

      {/* ── حفظ ────────────────────────────────────────── */}
      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        <p className="text-xs text-muted-foreground">{isDirty ? "فيه تغييرات ما انحفظت." : "كل شيء محفوظ."}</p>
        <Button onClick={handleSave} disabled={!isDirty || pending}>
          {pending ? "جارٍ الحفظ…" : "حفظ ونشر"}
        </Button>
      </div>
    </div>
  );
}
