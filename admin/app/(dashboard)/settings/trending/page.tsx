import { Suspense } from "react";
import { getAllSettings } from "../actions/settings-actions";
import { SettingsPageHeader } from "../components/page-header";
import { ListingPageForm } from "../components/listing-page-form";

export const maxDuration = 800;

export default async function TrendingSettingsPage() {
  const settings = await getAllSettings();
  return (
    <div className="max-w-[1200px] mx-auto">
      <SettingsPageHeader
        title="Trending Page"
        description="SEO and metadata for the trending articles page on modonty.com."
        arabicDescription="إعدادات صفحة الأكثر رواجاً — الـ SEO والوصف اللي يظهر في نتائج البحث."
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>}>
        <ListingPageForm pageKey="trending" pageName="Trending" initialSettings={settings} />
      </Suspense>
    </div>
  );
}
