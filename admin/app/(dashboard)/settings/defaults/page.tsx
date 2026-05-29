import { Suspense } from "react";
import { SettingsPageHeader } from "../_shared/page-header";
import { getPlatformDefaults } from "./actions/defaults-actions";
import { DefaultsForm } from "./components/defaults-form";

export const dynamic = "force-dynamic";

export default async function DefaultsSettingsPage() {
  const defaults = await getPlatformDefaults();
  return (
    <div className="max-w-[1200px] mx-auto">
      <SettingsPageHeader
        title="Default Images"
        description="System-wide fallback images. Shown automatically when a client or article has no image (or a broken one)."
        arabicDescription="الصور الافتراضية للنظام — تظهر تلقائياً لما العميل أو المقال ما عنده صورة (أو صورته مكسورة). تُدار من هنا فقط ولا تظهر في مكتبة الوسائط."
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>}>
        <DefaultsForm initial={defaults} />
      </Suspense>
    </div>
  );
}
