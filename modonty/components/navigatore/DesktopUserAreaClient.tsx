"use client";

import { UserMenu } from "@/components/auth/UserMenu";

export function DesktopUserAreaClient() {
  return (
    <div className="flex items-center justify-end">
      <UserMenu />
    </div>
  );
}
