import { SettingsPageHeader } from "../_shared/page-header";
import { getTelegramAdminSettings } from "./actions/telegram-settings-actions";
import { TelegramSettingsForm } from "./components/telegram-settings-form";

export const dynamic = "force-dynamic";

export default async function TelegramSettingsPage() {
  const { mirrorAll } = await getTelegramAdminSettings();

  return (
    <div className="max-w-[1000px] mx-auto">
      <SettingsPageHeader
        title="Telegram"
        description="Admin activity feed and bot controls. Mirror client engagement events to the admin Telegram channel for live site monitoring. (More bot settings will live here later.)"
      />
      <TelegramSettingsForm initialMirrorAll={mirrorAll} />
    </div>
  );
}
