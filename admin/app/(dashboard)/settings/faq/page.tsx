import { Suspense } from "react";
import { getAllSettings } from "../actions/settings-actions";
import { SettingsPageHeader } from "../components/page-header";
import { ListingPageForm } from "../components/listing-page-form";

export const maxDuration = 800;

export default async function FaqSettingsPage() {
  const settings = await getAllSettings();
  return (
    <div className="max-w-[1200px] mx-auto">
      <SettingsPageHeader
        title="FAQ Page"
        description="SEO and metadata for the FAQ page on modonty.com."
        arabicDescription="إعدادات صفحة الأسئلة الشائعة — العنوان والوصف اللي يظهران في نتائج البحث."
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>}>
        <ListingPageForm pageKey="faq" pageName="FAQ" initialSettings={settings} />
      </Suspense>
    </div>
  );
}
