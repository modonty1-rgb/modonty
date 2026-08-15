"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconCheck, IconClose, IconLogin } from "@/lib/icons";

const accountBenefits = [
  "عروض وخصومات من العملاء",
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
        <Link href="/users/register" className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          أنشئ حسابًا
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="justify-center p-0 focus:bg-transparent">
        <Link href="/users/login" className="inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:underline">
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

export function MobileAccountBenefitsMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative sm:hidden">
      <DropdownMenu dir="rtl" open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="افتح مزايا الحساب"
            className="relative min-h-11 min-w-11 overflow-visible rounded-xl text-accent hover:bg-transparent hover:text-accent [&_svg]:size-5"
          >
            <IconLogin aria-hidden="true" />
            {!isOpen && (
              <span className="absolute start-1/2 top-[calc(100%+3px)] z-[60] translate-x-1/2 whitespace-nowrap rounded-lg border border-primary/45 bg-card px-2.5 py-1 text-[11px] font-bold text-accent shadow-lg">
                <span className="absolute -top-1 start-1/2 size-2 translate-x-1/2 rotate-45 border-s border-t border-primary/45 bg-card" aria-hidden="true" />
                مزاياك هنا
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <AccountBenefitsContent onClose={() => setIsOpen(false)} />
      </DropdownMenu>
    </div>
  );
}
