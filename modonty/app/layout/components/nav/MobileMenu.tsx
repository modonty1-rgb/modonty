"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/components/providers/SessionContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
  IconClients,
  IconCompass,
  IconSaved,
  IconChevronLeft,
  IconTrending,
  IconSearch,
  IconArticleList,
} from "@/lib/icons";
import { ModontyReelsMark } from "@/components/icons/modonty-reels-mark";
import { ModontyAudioMark } from "@/components/icons/modonty-audio-mark";
import { cn } from "@/lib/utils";
import { navLinksConfig } from "@/app/layout/helpers/nav-links-config";
import { ThemeToggle } from "@/app/layout/components/nav/ThemeToggle";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;
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
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 h-12 px-3 rounded-xl text-sm font-medium transition-all duration-200",
        isActive
          ? "text-link bg-primary/10"
          : "text-foreground hover:text-link hover:bg-primary/5 active:bg-primary/10 active:scale-[0.98]"
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            isActive ? "text-link" : "text-muted-foreground"
          )}
        />
      )}
      <span className="flex-1">{label}</span>
      <IconChevronLeft className="h-4 w-4 text-muted-foreground/50 shrink-0" />
    </Link>
  );
}

export function MobileMenu({ open, onOpenChange, contentId, labels, themeLabels, sections, items }: MobileMenuProps & { labels: import("./MobileMenuClient").MobileMenuLabels; themeLabels: { toggle: string; light: string; dark: string; system: string };
  sections: import("./MobileMenuClient").MobileMenuSections;
  items: import("./MobileMenuClient").MobileMenuItems }) {
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
      <SheetContent id={contentId} side="right" className="w-[300px] sm:w-[320px] p-0 [&>button:last-child]:hidden">

        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-border/60">
          <SheetClose asChild>
            <Button
              type="button"
              variant="navigation"
              size="mobileIcon"
              className="rounded-xl"
              aria-label={labels.closeMenu}
            >
              <IconClose aria-hidden />
            </Button>
          </SheetClose>
          <SheetTitle className="text-base font-bold">{labels.menu}</SheetTitle>
          <SheetDescription className="sr-only">
            {labels.menuDescription}
          </SheetDescription>
          <ThemeToggle labels={themeLabels} />
        </SheetHeader>

        <div className="overflow-y-auto py-3 px-3 space-y-0.5">

          {/* Account — first, because signing in is what a returning reader opened this for */}
          {isLoggedOut && (
            <>
              <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold text-muted-foreground/70 tracking-wide">
                {labels.yourAccount}
              </p>
              <div className="flex flex-col gap-2 px-3 pb-1">
                <Button asChild className="h-11 w-full rounded-xl text-sm font-semibold">
                  <Link href="/users/register" onClick={close}>
                    {labels.signUpFree}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 w-full rounded-xl text-sm font-medium"
                >
                  <Link href="/users/login" onClick={close}>
                    {labels.signIn}
                  </Link>
                </Button>
              </div>
              <div className="my-2 mx-3 border-t border-border/40" />
            </>
          )}

          {/* Browse Section */}
          <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold text-muted-foreground/70 tracking-wide">
            {sections.browse}
          </p>
          <SheetLink
            href="/search"
            icon={IconSearch}
            label={items.search}
            isActive={pathname === "/search" || pathname.startsWith("/search/")}
            onClick={close}
          />
          <SheetLink
            href="/trending"
            icon={IconTrending}
            label={items.trending}
            isActive={pathname === "/trending" || pathname.startsWith("/trending/")}
            onClick={close}
          />
          {/* The archive itself. It sat in the desktop bar and in nothing a phone could open —
              the same gap the two media sections had. Placed before the taxonomies because it is
              the content; categories and partners are ways INTO it. */}
          <SheetLink
            href="/articles"
            icon={IconArticleList}
            label={items.articles}
            isActive={pathname === "/articles"}
            onClick={close}
          />
          <SheetLink
            href="/categories"
            icon={IconCompass}
            label={items.categories}
            isActive={pathname === "/categories" || pathname.startsWith("/categories/")}
            onClick={close}
          />
          <SheetLink
            href="/clients"
            icon={IconClients}
            label={items.partners}
            isActive={pathname === "/clients" || pathname.startsWith("/clients/")}
            onClick={close}
          />
          {/* الطلّات · استمع — the two media sections. They were on the desktop bar and in
              nothing a phone could reach: the sheet is the whole navigation on a phone, so
              two of the site's seven sections had no entry point at all. Kept in the desktop
              bar's order (partners → reels → audio) so the two surfaces read the same. */}
          <SheetLink
            href="/reels"
            icon={ModontyReelsMark}
            label={items.reels}
            isActive={pathname === "/reels" || pathname.startsWith("/reels/")}
            onClick={close}
          />
          <SheetLink
            href="/audio"
            icon={ModontyAudioMark}
            label={items.audio}
            isActive={pathname === "/audio" || pathname.startsWith("/audio/")}
            onClick={close}
          />
          <SheetLink
            href="/users/profile/favorites"
            icon={IconSaved}
            label={items.saved}
            isActive={pathname === "/users/profile/favorites"}
            onClick={close}
          />

          <div className="my-2 mx-3 border-t border-border/40" />

          {/* Company Section */}
          <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-muted-foreground/70 tracking-wide">
            {sections.modonty}
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
            {sections.support}
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
