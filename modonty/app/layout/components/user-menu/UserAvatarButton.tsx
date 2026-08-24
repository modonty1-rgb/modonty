"use client";

import { forwardRef } from "react";
import type { Session } from "next-auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type SessionUser = NonNullable<Session["user"]>;

interface UserAvatarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  user: SessionUser;
  disabled?: boolean;
}

export const UserAvatarButton = forwardRef<HTMLButtonElement, UserAvatarButtonProps>(
  ({ user, disabled, className, ...props }, ref) => (
    <Button
      ref={ref}
      type="button"
      variant="navigation"
      size="mobileIcon"
      className={cn("rounded-full p-1.5 disabled:opacity-100 md:p-1", className)}
      disabled={disabled}
      aria-label={user.name || "ملف المستخدم"}
      {...props}
    >
      <Avatar className="size-8">
        <AvatarImage
          src={user.image || undefined}
          alt={user.name || ""}
          className="object-cover"
        />
        <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
          {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
    </Button>
  )
);
UserAvatarButton.displayName = "UserAvatarButton";
