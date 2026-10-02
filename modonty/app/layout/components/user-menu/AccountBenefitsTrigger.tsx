"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { Button } from "@/components/ui/button";
import { ModontyLoginMark } from "@/components/icons/modonty-login-mark";

/**
 * The phone's account icon with its «المتعة هنا» hint — no menu code. Shown alone in the first
 * load and reused as the menu's trigger once the menu has loaded, so the swap is invisible.
 * forwardRef + spread so Radix's `asChild` trigger can attach its ref and handlers.
 */
export const AccountBenefitsTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button"> & { hint: boolean; isOpen: boolean }
>(function AccountBenefitsTrigger({ hint, isOpen, ...props }, ref) {
  return (
    // The hint stacks UNDER the icon, inside the same 44px button (Khalid, 22 Aug).
    // Beside the icon it made this one item 96px wide in a row of 44px icons, and a
    // row only reads as evenly spaced when every item is the same width. It stays
    // INSIDE the button — the old version was a bubble hanging below the navbar,
    // which landed on whatever the page had put there (Khalid, 21 Aug, screenshot of
    // it covering the «الشركاء» tab). The label is positioned, not laid out: the
    // button stays exactly 44px like every icon beside it, and the two words overhang
    // symmetrically into the column's own slack instead of widening the target.
    <Button
      ref={ref}
      variant="navigation"
      size="mobileIcon"
      aria-label="افتح مزايا الحساب"
      /* `w-14` while the hint shows (Khalid, 22 Aug evening): the label paints 47px
         inside a 44px button, so the two words sat wedged edge to edge. The row has
         the slack now that the middle column is one search box instead of three icons
         — 12px more here still leaves the box 210px. The target only grows. */
      className={
        hint && !isOpen
          ? "relative w-14 rounded-xl pb-3.5 [&_svg]:size-5 motion-safe:transition-transform motion-safe:active:scale-95"
          : "rounded-xl motion-safe:transition-transform motion-safe:active:scale-95"
      }
      {...props}
    >
      <ModontyLoginMark aria-hidden="true" />
      {hint && !isOpen && (
        <span className="pointer-events-none absolute inset-x-0 bottom-1 whitespace-nowrap text-center text-xs font-bold leading-none text-link-accent motion-safe:animate-pulse">
          المتعة هنا
        </span>
      )}
    </Button>
  );
});
