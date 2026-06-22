"use client";

import { Button } from "@/components/ui/button";
import Link from "@/components/link";

// Logged-out header CTA: subscribing is the primary action (→ register),
// with a quieter "دخول" for returning users (→ login). Shown in both the
// desktop and mobile top bars via <UserMenu />.
export function LoginButton() {
  return (
    <div className="flex items-center gap-1.5">
      <Link
        href="/users/login"
        className="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
      >
        دخول
      </Link>
      <Button asChild size="sm" className="h-9 px-2.5 text-xs font-semibold sm:px-3.5 sm:text-sm">
        <Link href="/users/register">
          <span className="sm:hidden">اشترك</span>
          <span className="hidden sm:inline">اشترك مجاناً</span>
        </Link>
      </Button>
    </div>
  );
}
