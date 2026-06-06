import { Suspense } from "react";
import { SettingsPageHeader } from "../_shared/page-header";
import { getDisclaimerSettings } from "./actions/disclaimer-actions";
import { DisclaimerForm } from "./components/disclaimer-form";

export const dynamic = "force-dynamic";

export default async function DisclaimerSettingsPage() {
  const settings = await getDisclaimerSettings();

  return (
    <div className="max-w-[1000px] mx-auto">
      <SettingsPageHeader
        title="Content Disclaimer"
        description="The content-responsibility acknowledgement clients must accept before saving sensitive data (licenses, documents, media). Editing the text bumps the version and re-prompts every client."
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>}>
        <DisclaimerForm initial={settings} />
      </Suspense>
    </div>
  );
}
