import { Suspense } from "react";
import { getAllSettings } from "../actions/settings-actions";
import { SettingsPageHeader } from "../_shared/page-header";
import { HomepageBannerForm } from "./components/homepage-banner-form";

// Save triggers the settings cascade via after() — same budget as the Homepage form.
export const maxDuration = 800;

export default async function HomepageBannerSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div className="max-w-[1200px] mx-auto">
      <SettingsPageHeader
        title="Homepage Banner"
        description="The welcome banner at the top of modonty.com's homepage — future home for landing & hero options."
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading settings...</div>}>
        <HomepageBannerForm initialSettings={settings} />
      </Suspense>
    </div>
  );
}
