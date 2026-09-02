"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, LogOut, Moon, Sun } from "lucide-react";
import { Breadcrumb } from "./breadcrumb";
import { NotificationsBell } from "./notifications-bell";
import { HeaderFeedbackButton } from "./header-feedback-button";
import { SyncLocalButton } from "./sync-local-button";
import { TasksMenu } from "./tasks-menu";
import pkg from "@/package.json";

export function Header({
  dbBadge,
  canSyncLocal = false,
}: {
  dbBadge?: React.ReactNode;
  canSyncLocal?: boolean;
}) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!session?.user) {
    return null;
  }

  const isDark = mounted && theme === "dark";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Breadcrumb />
        </div>

        <div className="flex items-center gap-2">
          {/* Task management lives here, not in the sidebar (Khalid, 2026-09-02) */}
          <TasksMenu />

          {/* Which database this instance is on — rendered on the server, never guessed */}
          {dbBadge}

          {/* Test-database only — sync local DB from PROD */}
          <SyncLocalButton enabled={canSyncLocal} />

          {/* Beta feedback note button */}
          <HeaderFeedbackButton />

          {/* Unified notifications bell */}
          <NotificationsBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full pe-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || undefined} alt={session.user.name || ""} />
                  <AvatarFallback>
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                {/* Hidden below `sm`: the phone header already carries the badges,
                    the bell and the theme toggle, and a name would push them off.
                    `max-w` + truncate so a long name cannot squeeze them either. */}
                <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
                  {session.user.name || session.user.email || "Admin"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session.user.name || "Admin"}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/guidelines" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Guidelines
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setTheme(isDark ? "light" : "dark");
                }}
              >
                {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {isDark ? "Light mode" : "Dark mode"}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/changelog" className="flex items-center justify-between gap-2">
                  <span>Version</span>
                  <span className="text-xs text-muted-foreground tabular-nums">v{pkg.version}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
