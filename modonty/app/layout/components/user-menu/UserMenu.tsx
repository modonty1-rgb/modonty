"use client";

import type { Session } from "next-auth";
import { useSession } from "@/components/providers/SessionContext";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LoginButton } from "@/app/layout/components/user-menu/LoginButton";
import { UserAvatarButton } from "@/app/layout/components/user-menu/UserAvatarButton";

// The account menu (Radix DropdownMenu) loads on the first tap, not with every page (plan أ١,
// 3 Oct 2026 — it was part of ~50KB gzip of menu code in every first load). Pointing at or
// focusing the avatar warms the chunk; the placeholder while it lands holds the same 44px box.
const loadDropdown = () => import("@/app/layout/components/user-menu/UserMenuDropdown");
const UserMenuDropdown = dynamic(() => loadDropdown().then((m) => ({ default: m.UserMenuDropdown })), {
  ssr: false,
  loading: () => <span className="inline-block size-11" aria-hidden />,
});

type SessionUser = NonNullable<Session["user"]>;

export function UserMenu({ hint = true }: { hint?: boolean } = {}) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = session?.user as SessionUser | undefined;

  if (!user) {
    return <LoginButton hint={hint} />;
  }

  if (!mounted) {
    return <UserAvatarButton user={user} disabled />;
  }

  if (open) return <UserMenuDropdown user={user} defaultOpen />;

  return (
    <UserAvatarButton
      user={user}
      aria-haspopup="menu"
      onPointerEnter={() => void loadDropdown()}
      onFocus={() => void loadDropdown()}
      onClick={() => setOpen(true)}
    />
  );
}
