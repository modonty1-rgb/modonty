"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconClose } from "@/lib/icons";

interface MobileFloatingActionPopoverProps {
  ariaLabel: string;
  triggerLabel: string;
  triggerVisual: ReactNode;
  contentVisual: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  actionIcon?: ReactNode;
}

interface FloatingContentProps extends Omit<MobileFloatingActionPopoverProps, "ariaLabel" | "triggerLabel" | "triggerVisual"> {
  onClose: () => void;
}

function FloatingContent({ contentVisual, title, description, actionLabel, actionHref, actionIcon, onClose }: FloatingContentProps) {
  return (
    <DropdownMenuContent side="top" align="center" sideOffset={12} collisionPadding={12} className="z-[70] w-[min(19rem,calc(100vw-1.5rem))] overflow-visible rounded-2xl border-accent/60 bg-popover p-4 shadow-[0_22px_55px_-20px_hsl(var(--primary)/0.7)]">
      <span className="absolute inset-x-0 -bottom-2 mx-auto h-2 w-4 bg-accent/60 [clip-path:polygon(0_0,100%_0,50%_100%)]" aria-hidden="true" />
      <DropdownMenuItem asChild className="absolute end-1 top-1 size-11 justify-center rounded-xl p-0 focus:bg-accent/10">
        <button type="button" onClick={onClose} aria-label="إغلاق النافذة">
          <IconClose className="size-4 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenuItem>
      <div className="flex items-center gap-2.5 pe-9">
        {contentVisual}
        <h2 className="text-base font-bold text-foreground">{title}</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      <DropdownMenuItem asChild className="mt-3 p-0 focus:bg-transparent">
        <Link href={actionHref} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          {actionIcon}
          {actionLabel}
        </Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

export function MobileFloatingActionPopover(props: MobileFloatingActionPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <DropdownMenu dir="rtl" open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button aria-label={props.ariaLabel} variant="ghost" className="absolute inset-x-0 bottom-[calc(1.875rem+env(safe-area-inset-bottom))] z-50 mx-auto h-12 w-14 flex-col gap-0.5 rounded-b-lg rounded-t-xl border-0 bg-background px-1 py-1 text-foreground shadow-none hover:bg-background hover:text-foreground focus-visible:ring-accent data-[state=open]:z-[71]">
            <span className="pointer-events-none absolute inset-0 rounded-t-xl border-x border-t border-accent/35 bg-background" aria-hidden="true" />
            <span className="relative z-10 flex shrink-0 items-center justify-center">{props.triggerVisual}</span>
            <span className="relative z-10 text-[8px] font-bold leading-none text-accent">{props.triggerLabel}</span>
          </Button>
        </DropdownMenuTrigger>
        <FloatingContent {...props} onClose={() => setIsOpen(false)} />
      </DropdownMenu>
    </div>
  );
}
