import { Suspense } from "react";
import { getAllSettings } from "../actions/settings-actions";
import { SettingsPageHeader } from "../_shared/page-header";
import { ListingPageForm } from "../_shared/listing-page-form";

export const maxDuration = 800;

export default async function TagsSettingsPage() {
  const settings = await getAllSettings();
  return (
    <div className="max-w-[1200px] mx-auto">
      <SettingsPageHeader
        title="Tags Page"
        description="SEO and metadata for the tags listing page on modonty.com."
        arabicDescription="إعدادات صفحة الوسوم — الـ SEO والوصف اللي يظهر في نتائج البحث."
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>}>
        <ListingPageForm pageKey="tags" pageName="Tags" initialSettings={settings} />
      </Suspense>
    </div>
  );
}
