"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModontyLogoutMark } from "@/components/icons/modonty-logout-mark";
import { IconUser, IconSettings, IconEmail } from "@/lib/icons";
import { handleLogout } from "./handle-logout";
import { UserAvatarButton } from "./UserAvatarButton";
import type { SessionUser } from "./session-user";

interface UserMenuDropdownProps {
  user: SessionUser;
  /** Opened on arrival — it is loaded by the tap that should open it (see UserMenu). */
  defaultOpen?: boolean;
}

/** Loaded only through `UserMenu`, on demand — never imported directly (plan أ١, 3 Oct 2026). */
export function UserMenuDropdown({ user, defaultOpen = false }: UserMenuDropdownProps) {
  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>
        <UserAvatarButton user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name || "مستخدم"}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/users/notifications" className="flex items-center gap-2">
            <IconEmail className="h-4 w-4" />
            صندوق البريد
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/users/profile" className="flex items-center gap-2">
            <IconUser className="h-4 w-4" />
            الملف الشخصي
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/users/profile/settings" className="flex items-center gap-2">
            <IconSettings className="h-4 w-4" />
            الإعدادات
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleLogout()}
          className="text-destructive focus:text-destructive"
        >
          <ModontyLogoutMark className="mr-2 h-4 w-4" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

