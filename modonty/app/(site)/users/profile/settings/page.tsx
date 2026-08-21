"use client";

import dynamic from "next/dynamic";
import { useSession } from "@/components/providers/SessionContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { TwoColumnLayout } from "@modonty/shared/components/column-layout/TwoColumnLayout";
import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { SettingsNav, SETTINGS_SECTIONS } from "./components/settings-nav";
import { CreatePasswordPrompt } from "./components/create-password-prompt";

const ProfileSettings = dynamic(
  () => import("./components/profile-settings").then((m) => ({ default: m.ProfileSettings })),
  { ssr: false }
);
const SecuritySettings = dynamic(
  () => import("./components/security-settings").then((m) => ({ default: m.SecuritySettings })),
  { ssr: false }
);
const AccountSettings = dynamic(
  () => import("./components/account-settings").then((m) => ({ default: m.AccountSettings })),
  { ssr: false }
);

const SECTION_BODIES: Record<(typeof SETTINGS_SECTIONS)[number]["id"], React.ComponentType> = {
  profile: ProfileSettings,
  security: SecuritySettings,
  account: AccountSettings,
};

/**
 * All five sections stacked on the shared two-column shell (Khalid 2026-08-20: «كل حاجة
 * تكون قدامنا») — the reader scrolls instead of switching tabs, and the rail is an anchor
 * nav that follows. Old `?section=` links keep working: they scroll to their section.
 */
export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/users/login");
    }
  }, [status, router]);

  // Backwards compatibility for the tab-era URLs (?section=security) — same offset the
  // anchors get from scroll-mt below. The sections mount lazily (dynamic, ssr:false), so a
  // single lookup on mount finds nothing (measured live: page stayed at the top) — retry
  // briefly until the target exists.
  useEffect(() => {
    if (!section) return;
    // Re-assert for ~2s, not once: a single early scroll gets undone (measured live) —
    // the router's scroll reset lands after it, and each lazy section that mounts above
    // the target shifts its position. Re-scrolling until the layout settles wins both.
    let ticks = 0;
    const timer = setInterval(() => {
      document.getElementById(section)?.scrollIntoView();
      ticks += 1;
      if (ticks >= 8) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [section]);

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  const hasPassword = (session.user as any).hasPassword;
  const showPasswordPrompt = hasPassword === false;

  const header = (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الملف الشخصي", href: "/users/profile" },
          { label: "الإعدادات" },
        ]}
      />
      {/* عنوان مرئي لا sr-only: بدونه يهبط الداخل على «الملف الشخصي» بلا سياق للصفحة. */}
      <h1 className="mt-4 text-2xl font-bold">الإعدادات</h1>
      <p className="mt-1 text-sm text-muted-foreground">بياناتك وأمان حسابك — كلها في صفحة واحدة</p>
    </>
  );

  if (showPasswordPrompt) {
    return (
      <>
        {header}
        <div className="container mx-auto max-w-[1128px] px-4 py-8">
          <CreatePasswordPrompt />
        </div>
      </>
    );
  }

  return (
    <TwoColumnLayout
      header={header}
      main={
        <div className="space-y-6">
          {SETTINGS_SECTIONS.map(({ id, label }) => {
            const Body = SECTION_BODIES[id];
            return (
              <section key={id} id={id} aria-label={label} className="scroll-mt-20">
                <Body />
              </section>
            );
          })}
        </div>
      }
      rail={
        <StickyRail label="أقسام الإعدادات" className="hidden w-[300px] shrink-0 lg:block">
          <SettingsNav />
        </StickyRail>
      }
    />
  );
}
