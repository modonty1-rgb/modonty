import { SeedForm } from "./components/seed-form";

export default function SettingsSeedPage() {
  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Database Seeder</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Configure and trigger realistic data seeding for development and QA</p>
      </div>
      <SeedForm />
    </div>
  );
}

