"use client";

import { useState, useEffect } from "react";
import Link from "@/components/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X, Info, Mail, Bell, HelpCircle, MessageCircleQuestion } from "lucide-react";
import { NavLink } from "@/components/navigation/nav-link";
import { navLinksConfig } from "@/components/navigation/nav-links-config";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden min-h-11 min-w-11"
        aria-label="Open menu"
        disabled
      >
        <Menu className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden min-h-11 min-w-11"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px] [&>button:last-child]:hidden">
        <SheetClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 z-50 h-8 w-8 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </SheetClose>
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="text-right">القائمة</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Company Section */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              مدونتي
            </h2>
            <nav className="flex flex-col gap-2" aria-label="روابط مدونتي">
              {navLinksConfig.company.map((link) => {
                const iconMap: Record<string, typeof Info> = {
                  "/about": Info,
                  "/contact": Mail,
                  "/subscribe": Bell,
                };
                const Icon = iconMap[link.href];
                return (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    icon={Icon}
                    label={link.label}
                    onClick={() => setOpen(false)}
                    className="w-full justify-start gap-3 h-11 px-2 rounded-md hover:bg-muted/50 transition-colors duration-200"
                  />
                );
              })}
            </nav>
          </section>

          <div className="border-t border-border" />

          {/* Support Section */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              الدعم
            </h2>
            <nav className="flex flex-col gap-2" aria-label="روابط الدعم">
              {navLinksConfig.support
                .filter((link) => link.href !== "/help/feedback")
                .map((link) => {
                  const iconMap: Record<string, typeof HelpCircle> = {
                    "/help": HelpCircle,
                    "/help/faq": MessageCircleQuestion,
                  };
                  const Icon = iconMap[link.href];
                  return (
                    <NavLink
                      key={link.href}
                      href={link.href}
                      icon={Icon}
                      label={link.label}
                      onClick={() => setOpen(false)}
                      className="w-full justify-start gap-3 h-11 px-2 rounded-md hover:bg-muted/50 transition-colors duration-200"
                    />
                  );
                })}
            </nav>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
