"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Building2, Image as ImageIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ContactMessagesBadge } from "./contact-messages-badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FileText, label: "Articles", href: "/articles" },
  { icon: Building2, label: "Clients", href: "/clients" },
  { icon: ImageIcon, label: "Media", href: "/media" },
  { icon: MessageSquare, label: "Contact Messages", href: "/contact-messages", showBadge: true },
];

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-4" aria-label="Main navigation">
      <Link href="/modonty/setting" className="flex items-center gap-2 shrink-0">
        <div className="h-8 w-8 rounded-md overflow-hidden flex items-center justify-center bg-background border border-border">
          <Image
            src="https://res.cloudinary.com/dfegnpgwx/image/upload/v1768807772/modontyIcon_svukux.svg"
            alt="Modonty"
            width={32}
            height={32}
            className="h-full w-full object-contain p-1"
          />
        </div>
        <span className="text-lg font-semibold text-foreground hidden lg:inline whitespace-nowrap">
          Modonty
        </span>
      </Link>
      <div className="h-6 w-px bg-border" />
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "flex items-center gap-2",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.showBadge && <ContactMessagesBadge />}
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </nav>
  );
}
