"use client";

import { Button } from "@/components/ui/button";
import Link from "@/components/link";
import { IconLogin } from "@/lib/icons";

// Logged-out header CTA: subscribing is the primary action (→ register), with
// "دخول" for returning users (→ login). Shown in both the desktop and mobile
// top bars via <UserMenu />.
//
// The two read as ONE pair: same height, same radius, same type size. Only the
// FILL separates them. Previously «دخول» was bare muted text beside a solid
// block — not a hierarchy but a jump, and the muted grey barely cleared contrast
// (Khalid 2026-07-24: «من منطقة الـ UI جداً سيئة»). An outline button carries the
// secondary weight without disappearing.
export function LoginButton() {
  // Phones: only «دخول», as an icon sitting beside the burger — same ghost treatment,
  // same 44px box, same 20px glyph, so the two read as one control group. Subscribing
  // is NOT repeated here; the feed banner already asks a few pixels below, and the
  // burger carries both actions in full (Khalid 2026-07-24).
  //
  // Desktop: the pair, with only the fill separating primary from secondary.
  return (
    <>
      <Button
        asChild
        variant="ghost"
        size="icon"
        aria-label="دخول"
        className="min-h-11 min-w-11 rounded-xl [&_svg]:size-5 sm:hidden"
      >
        <Link href="/users/login">
          <IconLogin aria-hidden="true" />
        </Link>
      </Button>

      <div className="hidden items-center gap-2 sm:flex">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-9 rounded-lg px-3.5 text-sm font-medium"
        >
          <Link href="/users/login">دخول</Link>
        </Button>
        <Button asChild size="sm" className="h-9 rounded-lg px-3.5 text-sm font-semibold shadow-sm">
          <Link href="/users/register">اشترك مجاناً</Link>
        </Button>
      </div>
    </>
  );
}
