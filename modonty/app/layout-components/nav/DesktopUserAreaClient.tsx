"use client";

import { UserMenu } from "@/app/layout-components/user-menu/UserMenu";

export function DesktopUserAreaClient() {
  return (
    <div className="flex items-center justify-end">
      <UserMenu />
    </div>
  );
}
