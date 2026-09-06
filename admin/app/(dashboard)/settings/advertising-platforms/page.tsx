import { SettingsPageHeader } from "../_shared/page-header";

import { AdvertisingPlatformsForm } from "./advertising-platforms-form";
import { getAdvertisingPlatformAccounts, getAdvertisingPlatformCredentialStatus, getAdvertisingPlatformCredentialsForAdmin } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "منصات الإعلان" };

export default async function AdvertisingPlatformsSettingsPage() {
  const [accounts, credentialsReady, credentials] = await Promise.all([
    getAdvertisingPlatformAccounts(),
    getAdvertisingPlatformCredentialStatus(),
    getAdvertisingPlatformCredentialsForAdmin(),
  ]);

  return (
    <div className="mx-auto max-w-[1000px]">
      <SettingsPageHeader
        title="منصات الإعلان"
        description="حسابات مدونتي وجبر SEO الإعلانية."
      />
      <AdvertisingPlatformsForm initial={accounts} credentialsReady={credentialsReady} initialCredentials={credentials} />
    </div>
  );
}
