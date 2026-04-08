import { Suspense } from "react";
import { SettingsFormV2 } from "./components/settings-form-v2";
import { SeedDevButton } from "./components/seed-dev-button";

export default async function SettingsPage() {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Configure your site once — your team handles the rest</p>
          <p className="text-xs text-muted-foreground/70 mt-2 max-w-2xl leading-relaxed">
            من هنا تتحكم في إعدادات موقع مدونتي كاملاً. كل تبويب يخص صفحة معينة تظهر للزوار على الإنترنت — مثلاً: صفحة <span className="text-foreground/70">مدونتي</span> هي الصفحة الرئيسية التي يراها الزائر أول ما يفتح الموقع، وصفحة <span className="text-foreground/70">العملاء</span> هي الصفحة التي تجمع كل عملاء مدونتي، وصفحة <span className="text-foreground/70">المقالات</span> هي الصفحة التي تجمع كل المقالات المنشورة. لكل صفحة عنوان ووصف يظهران في نتائج محركات البحث <span className="text-blue-400/70">(جوجل، بينج، ياهو)</span>.
          </p>
        </div>
        {isDev && <SeedDevButton />}
      </div>
      <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading settings...</div>}>
        <SettingsFormV2 />
      </Suspense>
    </div>
  );
}
