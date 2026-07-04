import { Suspense } from "react";
import { getAllSettings } from "../actions/settings-actions";
import { SettingsPageHeader } from "../_shared/page-header";
import { SocialLinksForm } from "./components/social-links-form";

// Save triggers the settings cascade via after() — same budget as the Homepage form.
export const maxDuration = 800;

export default async function SocialLinksSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div className="max-w-[1200px] mx-auto">
      <SettingsPageHeader
        title="Social Links"
        description="Social profile links shown in the footer + Organization sameAs, and X handles for share cards."
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading settings...</div>}>
        <SocialLinksForm initialSettings={settings} />
      </Suspense>
    </div>
  );
}
