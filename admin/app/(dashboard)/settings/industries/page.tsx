import { Suspense } from "react";
import { getAllSettings } from "../actions/settings-actions";
import { SettingsPageHeader } from "../_shared/page-header";
import { ListingPageForm } from "../_shared/listing-page-form";

export const maxDuration = 800;

export default async function IndustriesSettingsPage() {
  const settings = await getAllSettings();
  return (
    <div className="max-w-[1200px] mx-auto">
      <SettingsPageHeader
        title="Industries Page"
        description="SEO and metadata for the industries listing page on modonty.com."
        arabicDescription="إعدادات صفحة القطاعات — الـ SEO والوصف اللي يظهر في نتائج البحث."
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>}>
        <ListingPageForm pageKey="industries" pageName="Industries" initialSettings={settings} />
      </Suspense>
    </div>
  );
}
