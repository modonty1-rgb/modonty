import { Suspense } from "react";
import { getAllSettings } from "../actions/settings-actions";
import { SettingsPageHeader } from "../_shared/page-header";
import { ModontyForm } from "./components/modonty-form";

export const maxDuration = 800;

export default async function ModontySettingsPage() {
  const settings = await getAllSettings();

  return (
    <div className="max-w-[1200px] mx-auto">
      <SettingsPageHeader
        title="Modonty Homepage"
        description="The first page visitors see on modonty.com — site identity, SEO, banner, contact, address, and social profiles."
        arabicDescription="إعدادات الصفحة الرئيسية لـ modonty.com — هوية الموقع، الـ SEO، البانر، التواصل، والروابط الاجتماعية."
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading settings...</div>}>
        <ModontyForm initialSettings={settings} />
      </Suspense>
    </div>
  );
}
