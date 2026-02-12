"use client";

import type { Session } from "next-auth";
import { useSession } from "@/components/providers/SessionContext";
import { useEffect, useState } from "react";
import { LoginButton } from "@/components/auth/LoginButton";
import { UserAvatarButton } from "@/components/auth/UserAvatarButton";
import { UserMenuDropdown } from "@/components/auth/UserMenuDropdown";

type SessionUser = NonNullable<Session["user"]>;

export function UserMenu() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = session?.user as SessionUser | undefined;

  if (!user) {
    return <LoginButton />;
  }

  if (!mounted) {
    return <UserAvatarButton user={user} disabled />;
  }

  return <UserMenuDropdown user={user} />;
}
