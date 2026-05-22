import { Suspense } from "react";
import { getAllSettings } from "../actions/settings-actions";
import { SettingsPageHeader } from "../_shared/page-header";
import { SystemForm } from "./components/system-form";
import { SeedDevButton } from "./components/seed-dev-button";

export const maxDuration = 800;

export default async function SystemSettingsPage() {
  const settings = await getAllSettings();
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between gap-3 mb-0">
        <div className="flex-1">
          <SettingsPageHeader
            title="System"
            description="Read-only technical defaults derived from industry standards. Press Apply Defaults to sync to your database."
            arabicDescription="القيم الافتراضية التقنية. للقراءة فقط — اضغط Apply Defaults للمزامنة مع قاعدة البيانات."
          />
        </div>
        {isDev && (
          <div className="shrink-0 mt-9">
            <SeedDevButton />
          </div>
        )}
      </div>
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>}>
        <SystemForm initialSettings={settings} />
      </Suspense>
    </div>
  );
}
