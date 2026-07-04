import { Suspense } from "react";
import { getAllSettings } from "../actions/settings-actions";
import { SettingsPageHeader } from "../_shared/page-header";
import { BrandAssetsForm } from "./components/brand-assets-form";

// Save triggers the settings cascade via after() — same budget as the Homepage form.
export const maxDuration = 800;

export default async function BrandAssetsSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div className="max-w-[1200px] mx-auto">
      <SettingsPageHeader
        title="Logo & Brand Assets"
        description="Brand description, site logo, mobile icon & alt text — the Organization identity in Google and the navbar logo on every page."
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading settings...</div>}>
        <BrandAssetsForm initialSettings={settings} />
      </Suspense>
    </div>
  );
}
