"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarNavItem } from "./sidebar-nav";
import { cn } from "@/lib/utils";

import type { NavGroupConfig } from "./nav-config";

/** Same rule the nav item itself uses, so a group can never disagree with its own link. */
function isHrefActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarGroupsProps {
  groups: NavGroupConfig[];
  /** The 64px rail: no headings fit, so groups flatten into icons with plain rules. */
  isCollapsed?: boolean;
}

export function SidebarGroups({ groups, isCollapsed = false }: SidebarGroupsProps) {
  const pathname = usePathname();
  const activeKey = groups.find((g) => g.items.some((i) => isHrefActive(pathname, i.href)))?.key;

  // One open at a time (Khalid 2026-08-11). The open one starts as the group holding the
  // current page — landing on a screen whose own nav row is hidden reads as a broken menu.
  const [openKey, setOpenKey] = useState<string | null>(activeKey ?? groups[0]?.key ?? null);
  const [seenPathname, setSeenPathname] = useState(pathname);

  // Navigation is an outside event, not a render input: adjust during render rather than
  // in an effect, so the correct group is already open on the first paint of the new page.
  if (pathname !== seenPathname) {
    setSeenPathname(pathname);
    if (activeKey && activeKey !== openKey) setOpenKey(activeKey);
  }

  if (isCollapsed) {
    return (
      <div className="space-y-0.5">
        {groups.map((group, index) => (
          <div key={group.key} className="space-y-0.5">
            {index > 0 && (
              <div className="mx-auto my-2 w-8 border-t border-border" role="presentation" />
            )}
            {group.items.map((item) => (
              <SidebarNavItem key={item.href} {...item} isCollapsed />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {groups.map((group) => {
        const isOpen = openKey === group.key;
        return (
          <Collapsible
            key={group.key}
            open={isOpen}
            onOpenChange={(open) => setOpenKey(open ? group.key : null)}
          >
            <CollapsibleTrigger
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-start text-xs font-semibold transition-colors",
                "hover:bg-muted",
                isOpen ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span className="flex-1">{group.label}</span>
              {/* Down when open, pointing into the panel; sideways when closed — mirrored
                  for RTL so it never points off the start edge. */}
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  !isOpen && "-rotate-90 rtl:rotate-90"
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5 pt-0.5">
              {group.items.map((item) => (
                <SidebarNavItem key={item.href} {...item} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
