import { Suspense } from "react";
import { getAllSettings } from "../actions/settings-actions";
import { SettingsPageHeader } from "../_shared/page-header";
import { JbrSeoForm } from "./components/jbr-seo-form";

export const maxDuration = 800;

export default async function JbrSeoSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div className="max-w-[1200px] mx-auto">
      <SettingsPageHeader
        title="JBR SEO — Sales Channel"
        description="Your B2B sales gateway — the promo panel pitching JBR SEO services to business owners. Shown on the clients page hero (CTA → jbrseo.com)."
        arabicDescription="قناة البيع (جبر SEO) — لوحة العرض التي تخاطب أصحاب الأعمال على صفحة العملاء، وزر الإجراء يوجّه إلى jbrseo.com."
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading settings...</div>}>
        <JbrSeoForm initialSettings={settings} />
      </Suspense>
    </div>
  );
}
