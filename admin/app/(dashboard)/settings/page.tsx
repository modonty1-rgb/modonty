import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsForm } from "./components/settings-form";

export default async function SettingsPage() {
  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader
        title="SEO Settings"
        description="Configure SEO field length limits across all forms. These settings apply to clients, articles, authors, tags, categories, and industries."
      />
      <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading settings...</div>}>
        <SettingsForm />
      </Suspense>
    </div>
  );
}
