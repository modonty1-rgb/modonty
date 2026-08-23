"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModontyLoginMark } from "@/components/icons/modonty-login-mark";
import { IconCheck, IconClose } from "@/lib/icons";

const accountBenefits = [
  "عروض وخصومات من الشركاء",
  "هدايا وفرص حجز مميزة",
  "احفظ المحتوى وتابع اهتماماتك",
] as const;

function AccountBenefitsList() {
  return (
    <ul className="space-y-2.5">
      {accountBenefits.map((benefit) => (
        <li key={benefit} className="flex items-center gap-2 text-sm text-foreground/85">
          <IconCheck className="size-4 shrink-0 text-accent" aria-hidden="true" />
          <span>{benefit}</span>
        </li>
      ))}
    </ul>
  );
}

function AccountBenefitsActions() {
  return (
    <>
      <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
        <Link href="/users/register" className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary motion-safe:transition-transform motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          أنشئ حسابًا
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="justify-center p-0 focus:bg-transparent">
        <Link href="/users/login" className="inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold text-link motion-safe:transition-transform motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:underline">
          لدي حساب
        </Link>
      </DropdownMenuItem>
    </>
  );
}

interface AccountBenefitsContentProps {
  onClose: () => void;
}

function AccountBenefitsContent({ onClose }: AccountBenefitsContentProps) {
  return (
    <DropdownMenuContent side="bottom" align="center" sideOffset={14} collisionPadding={12} className="z-[70] w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border-primary/35 bg-popover p-4 shadow-[0_20px_50px_-18px_hsl(var(--primary)/0.55)]">
      {/* Zero-size arrow, never painted: it only gives Radix an anchor so the card scales
          out of the icon that opened it. Without it the origin was the card's own middle
          ("160px 137px"), ~100px away from the trigger. */}
      <DropdownMenuArrow width={0} height={0} aria-hidden="true" />
      <div className="space-y-3 text-start">
        <DropdownMenuItem asChild className="absolute end-1 top-1 size-11 justify-center rounded-xl p-0 focus:bg-accent/10">
          <button type="button" onClick={onClose} aria-label="إغلاق مزايا الحساب">
            <IconClose className="size-4 text-muted-foreground" aria-hidden="true" />
          </button>
        </DropdownMenuItem>
        <h2 className="pe-9 text-base font-bold leading-6 text-foreground">تجربة مدونتي أفضل بحسابك</h2>
        <AccountBenefitsList />
        <AccountBenefitsActions />
      </div>
    </DropdownMenuContent>
  );
}

/** `hint` — the «مزاياك هنا» bubble under the icon. Off inside the thin partner-site platform bar, where it spilled over the partner's own header. */
export function MobileAccountBenefitsMenu({ hint = true }: { hint?: boolean } = {}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative sm:hidden">
      <DropdownMenu dir="rtl" open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          {/* The hint stacks UNDER the icon, inside the same 44px button (Khalid, 22 Aug).
              Beside the icon it made this one item 96px wide in a row of 44px icons, and a
              row only reads as evenly spaced when every item is the same width. It stays
              INSIDE the button — the old version was a bubble hanging below the navbar,
              which landed on whatever the page had put there (Khalid, 21 Aug, screenshot of
              it covering the «الشركاء» tab). The label is positioned, not laid out: the
              button stays exactly 44px like every icon beside it, and the two words overhang
              symmetrically into the column's own slack instead of widening the target. */}
          <Button
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
          >
            <ModontyLoginMark aria-hidden="true" />
            {hint && !isOpen && (
              <span className="pointer-events-none absolute inset-x-0 bottom-1 whitespace-nowrap text-center text-[10px] font-bold leading-none text-link-accent motion-safe:animate-pulse">
                المتعة هنا
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <AccountBenefitsContent onClose={() => setIsOpen(false)} />
      </DropdownMenu>
    </div>
  );
}
