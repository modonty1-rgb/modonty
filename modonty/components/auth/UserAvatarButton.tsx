"use client";

import type { Session } from "next-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type SessionUser = NonNullable<Session["user"]>;

interface UserAvatarButtonProps {
  user: SessionUser;
  disabled?: boolean;
}

export function UserAvatarButton({ user, disabled }: UserAvatarButtonProps) {
  return (
    <button
      className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary min-h-11 min-w-11"
      disabled={disabled}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.image || undefined} alt={user.name || ""} />
        <AvatarFallback>
          {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
    </button>
  );
}

