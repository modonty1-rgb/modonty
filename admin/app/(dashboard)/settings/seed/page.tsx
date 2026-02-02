import { PageHeader } from "@/components/shared/page-header";
import { SeedForm } from "./components/seed-form";

export default function SettingsSeedPage() {
  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader
        title="Database Seeder (Dev Only)"
        description="Configure and trigger realistic SEO article seeding for development and QA."
      />
      <SeedForm />
    </div>
  );
}

