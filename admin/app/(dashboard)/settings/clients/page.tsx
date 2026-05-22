import { Suspense } from "react";
import { getAllSettings } from "../actions/settings-actions";
import { SettingsPageHeader } from "../_shared/page-header";
import { ClientsForm } from "./components/clients-form";

export const maxDuration = 800;

export default async function ClientsSettingsPage() {
  const settings = await getAllSettings();
  return (
    <div className="max-w-[1200px] mx-auto">
      <SettingsPageHeader
        title="Clients Page"
        description="SEO + Hero B2B panel shown at the top of the clients listing on modonty.com."
        arabicDescription="إعدادات صفحة العملاء — الـ SEO + بانر Hero B2B اللي يظهر للزائرين أصحاب الأعمال."
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>}>
        <ClientsForm initialSettings={settings} />
      </Suspense>
    </div>
  );
}
