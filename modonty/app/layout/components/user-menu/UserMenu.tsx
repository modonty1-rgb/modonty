"use client";

import type { Session } from "next-auth";
import { useSession } from "@/components/providers/SessionContext";
import { useEffect, useState } from "react";
import { LoginButton } from "@/app/layout/components/user-menu/LoginButton";
import { UserAvatarButton } from "@/app/layout/components/user-menu/UserAvatarButton";
import { UserMenuDropdown } from "@/app/layout/components/user-menu/UserMenuDropdown";

type SessionUser = NonNullable<Session["user"]>;

export function UserMenu({ hint = true }: { hint?: boolean } = {}) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

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

  return <UserMenuDropdown user={user} />;
}
