"use client";

import { forwardRef } from "react";
import type { Session } from "next-auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type SessionUser = NonNullable<Session["user"]>;

interface UserAvatarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  user: SessionUser;
  disabled?: boolean;
}

export const UserAvatarButton = forwardRef<HTMLButtonElement, UserAvatarButtonProps>(
  ({ user, disabled, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex items-center gap-2 rounded-full focus:outline-none min-h-11 min-w-11",
        className
      )}
      disabled={disabled}
      {...props}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={user.image || undefined}
          alt={user.name || ""}
          className="object-cover"
        />
        <AvatarFallback>
          {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
    </button>
  )
);
UserAvatarButton.displayName = "UserAvatarButton";

