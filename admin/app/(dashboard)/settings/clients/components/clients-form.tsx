"use client";

import { Input } from "@/components/ui/input";
import { ListingPageForm } from "../../_shared/listing-page-form";
import { Field } from "../../_shared/field";
import { Section } from "../../_shared/section";
import type { AllSettings } from "../../actions/settings-actions";

export function ClientsForm({ initialSettings }: { initialSettings: AllSettings }) {
  return (
    <ListingPageForm
      pageKey="clients"
      pageName="Clients"
      initialSettings={initialSettings}
      renderBeforeSeo={({ settings, set }) => (
        <Section
          title="Hero B2B Panel"
          description="The B2B promotion panel shown at the top of the clients page — targets business owners and decision-makers."
        >
          <div className="grid grid-cols-1 gap-4">
            <Field label="Label" hint="Small tagline above the headline (e.g. 'For business owners').">
              <Input
                value={settings.b2bLabel ?? ""}
                onChange={(e) => set("b2bLabel", e.target.value)}
                placeholder="لأصحاب الأعمال والشركات"
              />
            </Field>
            <Field label="Headline" hint="The main attention-grabbing line.">
              <Input
                value={settings.b2bHeadline ?? ""}
                onChange={(e) => set("b2bHeadline", e.target.value)}
                placeholder="عملاؤك يبحثون عنك على جوجل"
              />
            </Field>
            <Field label="Bullet 1">
              <Input
                value={settings.b2bBullet1 ?? ""}
                onChange={(e) => set("b2bBullet1", e.target.value)}
                placeholder="ظهور مضمون على جوجل بمحتوى يُقنع..."
              />
            </Field>
            <Field label="Bullet 2">
              <Input
                value={settings.b2bBullet2 ?? ""}
                onChange={(e) => set("b2bBullet2", e.target.value)}
                placeholder="عملاء جاهزون للشراء — بلا ميزانية..."
              />
            </Field>
            <Field label="Bullet 3">
              <Input
                value={settings.b2bBullet3 ?? ""}
                onChange={(e) => set("b2bBullet3", e.target.value)}
                placeholder="نتائج تقيسها: زيارات، مشاهدات..."
              />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="CTA Text" hint="Text shown on the call-to-action button.">
                <Input
                  value={settings.b2bCtaText ?? ""}
                  onChange={(e) => set("b2bCtaText", e.target.value)}
                  placeholder="عملاء بلا إعلانات"
                />
              </Field>
              <Field label="CTA URL" hint="Where the CTA button leads (full URL).">
                <Input
                  value={settings.b2bCtaUrl ?? ""}
                  onChange={(e) => set("b2bCtaUrl", e.target.value)}
                  placeholder="https://www.jbrseo.com"
                />
              </Field>
            </div>
          </div>
        </Section>
      )}
    />
  );
}
