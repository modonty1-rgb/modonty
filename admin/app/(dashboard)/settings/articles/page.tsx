import { Suspense } from "react";
import { getAllSettings } from "../actions/settings-actions";
import { SettingsPageHeader } from "../_shared/page-header";
import { ListingPageForm } from "../_shared/listing-page-form";

export const maxDuration = 800;

export default async function ArticlesSettingsPage() {
  const settings = await getAllSettings();
  return (
    <div className="max-w-[1200px] mx-auto">
      <SettingsPageHeader
        title="Articles Archive"
        description="SEO and metadata for the article archive (/articles) on modonty.com."
        arabicDescription="إعدادات صفحة كل المقالات — العنوان والوصف اللي يظهران في نتائج البحث، والبطاقة المخزَّنة اللي تقرأها مدونتي."
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>}>
        <ListingPageForm pageKey="articles" pageName="Articles" initialSettings={settings} />
      </Suspense>
    </div>
  );
}
