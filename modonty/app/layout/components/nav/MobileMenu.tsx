"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/components/providers/SessionContext";
import { Button } from "@/components/ui/button";
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
  IconTrending,
  IconSearch,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { navLinksConfig } from "@/app/layout/helpers/nav-links-config";

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

  // The menu had no account section at all, so on a phone a returning reader had no
  // way to sign in anywhere on screen. Mounted-guard because the page is cached and
  // the session only resolves on the client (same pattern as UserMenu/FeedTopBanner).
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLoggedOut = mounted && !session?.user;

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

          {/* Account — first, because signing in is what a returning reader opened this for */}
          {isLoggedOut && (
            <>
              <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold text-muted-foreground/70 tracking-wide">
                حسابك
              </p>
              <div className="flex flex-col gap-2 px-3 pb-1">
                <Button asChild className="h-11 w-full rounded-xl text-sm font-semibold">
                  <Link href="/users/register" onClick={close}>
                    سجّل مجاناً
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 w-full rounded-xl text-sm font-medium"
                >
                  <Link href="/users/login" onClick={close}>
                    دخول
                  </Link>
                </Button>
              </div>
              <div className="my-2 mx-3 border-t border-border/40" />
            </>
          )}

          {/* Browse Section */}
          <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold text-muted-foreground/70 tracking-wide">
            تصفح
          </p>
          <SheetLink
            href="/search"
            icon={IconSearch}
            label="بحث"
            isActive={pathname === "/search" || pathname.startsWith("/search/")}
            onClick={close}
          />
          <SheetLink
            href="/trending"
            icon={IconTrending}
            label="الرائجة"
            isActive={pathname === "/trending" || pathname.startsWith("/trending/")}
            onClick={close}
          />
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
            مدونتي
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
