import { Suspense } from "react";
import { getAllSettings } from "../actions/settings-actions";
import { SettingsPageHeader } from "../_shared/page-header";
import { BusinessInfoForm } from "./components/business-info-form";

// Save triggers the settings cascade via after() — same budget as the Homepage form.
export const maxDuration = 800;

export default async function BusinessInfoSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div className="max-w-[1200px] mx-auto">
      <SettingsPageHeader
        title="Business Info"
        description="Your organization's factual details — contact, address & location. Used in Google's structured data (Knowledge Panel)."
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading settings...</div>}>
        <BusinessInfoForm initialSettings={settings} />
      </Suspense>
    </div>
  );
}
