"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileAccountBenefitsMenu } from "@/app/layout/components/user-menu/MobileAccountBenefitsMenu";

// Logged-out header CTA: subscribing is the primary action (→ register), with
// "دخول" for returning users (→ login). Shown in both the desktop and mobile
// top bars via <UserMenu />.
//
// The two read as ONE pair: same height, same radius, same type size. Only the
// FILL separates them. Previously «دخول» was bare muted text beside a solid
// block — not a hierarchy but a jump, and the muted grey barely cleared contrast
// (Khalid 2026-07-24: «من منطقة الـ UI جداً سيئة»). An outline button carries the
// secondary weight without disappearing.
export function LoginButton({ hint = true }: { hint?: boolean } = {}) {
  // Phones: only «دخول», as an icon sitting beside the burger — same ghost treatment,
  // same 44px box, same 20px glyph, so the two read as one control group. Subscribing
  // is NOT repeated here; the feed banner already asks a few pixels below, and the
  // burger carries both actions in full (Khalid 2026-07-24).
  //
  // Desktop: the pair, with only the fill separating primary from secondary.
  return (
    <>
      <MobileAccountBenefitsMenu hint={hint} />

      <div className="hidden items-center sm:flex">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-9 rounded-lg px-3.5 text-sm font-medium"
        >
          <Link href="/users/login">دخول</Link>
        </Button>
        <Button asChild size="sm" className="hidden">
          <Link href="/users/register">سجّل مجاناً</Link>
        </Button>
      </div>
    </>
  );
}
