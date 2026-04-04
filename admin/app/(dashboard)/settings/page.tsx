import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsFormV2 } from "./components/settings-form-v2";
import { SeedDevButton } from "./components/seed-dev-button";

export default async function SettingsPage() {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="container mx-auto max-w-[1128px]">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Settings"
          description="Configure your site once — your team handles the rest."
        />
        {isDev && <SeedDevButton />}
      </div>
      <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading settings...</div>}>
        <SettingsFormV2 />
      </Suspense>
    </div>
  );
}
