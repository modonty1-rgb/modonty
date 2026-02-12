"use client";

import dynamic from "next/dynamic";
import { useSession } from "@/components/providers/SessionContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { SettingsTabs } from "./components/settings-tabs";
import { CreatePasswordPrompt } from "./components/create-password-prompt";

const ProfileSettings = dynamic(
  () => import("./components/profile-settings").then((m) => ({ default: m.ProfileSettings })),
  { ssr: false }
);
const SecuritySettings = dynamic(
  () => import("./components/security-settings").then((m) => ({ default: m.SecuritySettings })),
  { ssr: false }
);
const PrivacySettings = dynamic(
  () => import("./components/privacy-settings").then((m) => ({ default: m.PrivacySettings })),
  { ssr: false }
);
const NotificationsSettings = dynamic(
  () => import("./components/notifications-settings").then((m) => ({ default: m.NotificationsSettings })),
  { ssr: false }
);
const PreferencesSettings = dynamic(
  () => import("./components/preferences-settings").then((m) => ({ default: m.PreferencesSettings })),
  { ssr: false }
);
const AccountSettings = dynamic(
  () => import("./components/account-settings").then((m) => ({ default: m.AccountSettings })),
  { ssr: false }
);

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const section = searchParams.get("section") || "profile";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/users/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  const hasPassword = (session.user as any).hasPassword;
  const showPasswordPrompt = hasPassword === false;

  const renderSection = () => {
    switch (section) {
      case "profile":
        return <ProfileSettings />;
      case "security":
        return <SecuritySettings />;
      case "privacy":
        return <PrivacySettings />;
      case "notifications":
        return <NotificationsSettings />;
      case "preferences":
        return <PreferencesSettings />;
      case "account":
        return <AccountSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الملف الشخصي", href: "/users/profile" },
          { label: "الإعدادات" },
        ]}
      />
      <div className="container mx-auto max-w-[1128px] px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">الإعدادات</CardTitle>
            {!showPasswordPrompt && (
              <div className="pt-4">
                <SettingsTabs />
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {showPasswordPrompt ? (
              <CreatePasswordPrompt />
            ) : (
              renderSection()
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
