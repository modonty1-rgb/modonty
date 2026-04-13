"use client";

import { usePathname } from "next/navigation";
import Link from "@/components/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import type { ComponentType } from "react";
import {
  IconClose,
  IconInfo,
  IconEmail,
  IconNotifications,
  IconHelpCircle,
  IconFaqQuestion,
  IconCategories,
  IconSaved,
  IconChevronLeft,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { navLinksConfig } from "@/components/navigatore/nav-links-config";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SheetLinkProps {
  href: string;
  icon?: ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

function SheetLink({ href, icon: Icon, label, isActive, onClick }: SheetLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 h-12 px-3 rounded-xl text-sm font-medium transition-all duration-200",
        isActive
          ? "text-primary bg-primary/10"
          : "text-foreground hover:text-primary hover:bg-primary/5 active:bg-primary/10 active:scale-[0.98]"
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        />
      )}
      <span className="flex-1">{label}</span>
      <IconChevronLeft className="h-4 w-4 text-muted-foreground/50 shrink-0" />
    </Link>
  );
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const pathname = usePathname();
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] sm:w-[320px] p-0 [&>button:last-child]:hidden">

        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-border/60">
          <SheetClose asChild>
            <button
              className="flex items-center justify-center h-11 w-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition-all duration-200"
              aria-label="إغلاق القائمة"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </SheetClose>
          <SheetTitle className="text-base font-bold">القائمة</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto py-3 px-3 space-y-0.5">

          {/* Browse Section */}
          <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold text-muted-foreground/70 tracking-wide">
            تصفح
          </p>
          <SheetLink
            href="/categories"
            icon={IconCategories}
            label="الفئات"
            isActive={pathname === "/categories" || pathname.startsWith("/categories/")}
            onClick={close}
          />
          <SheetLink
            href="/users/profile/favorites"
            icon={IconSaved}
            label="المحفوظات"
            isActive={pathname === "/users/profile/favorites"}
            onClick={close}
          />

          <div className="my-2 mx-3 border-t border-border/40" />

          {/* Company Section */}
          <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-muted-foreground/70 tracking-wide">
            مودونتي
          </p>
          {navLinksConfig.company.map((link) => {
            const iconMap: Record<string, ComponentType<{ className?: string }>> = {
              "/about": IconInfo,
              "/contact": IconEmail,
              "/subscribe": IconNotifications,
            };
            return (
              <SheetLink
                key={link.href}
                href={link.href}
                icon={iconMap[link.href]}
                label={link.label}
                isActive={pathname === link.href}
                onClick={close}
              />
            );
          })}

          <div className="my-2 mx-3 border-t border-border/40" />

          {/* Support Section */}
          <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-muted-foreground/70 tracking-wide">
            الدعم
          </p>
          {navLinksConfig.support
            .filter((link) => link.href !== "/help/feedback")
            .map((link) => {
              const iconMap: Record<string, ComponentType<{ className?: string }>> = {
                "/help": IconHelpCircle,
                "/help/faq": IconFaqQuestion,
              };
              return (
                <SheetLink
                  key={link.href}
                  href={link.href}
                  icon={iconMap[link.href]}
                  label={link.label}
                  isActive={pathname === link.href || pathname.startsWith(link.href + "/")}
                  onClick={close}
                />
              );
            })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
