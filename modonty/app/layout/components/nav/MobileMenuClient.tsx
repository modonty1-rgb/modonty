"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MobileMenuTrigger } from "@/app/layout/components/nav/MobileMenuTrigger";

const MobileMenu = dynamic(
  () => import("@/app/layout/components/nav/MobileMenu").then((m) => ({ default: m.MobileMenu })),
  { ssr: false }
);

const MOBILE_MENU_ID = "mobile-navigation-sheet";

export interface MobileMenuLabels {
  openMenu: string;
  closeMenu: string;
  menu: string;
  menuDescription: string;
  yourAccount: string;
  signUpFree: string;
  signIn: string;
}

export interface MobileMenuSections {
  browse: string;
  modonty: string;
  support: string;
}

export interface MobileMenuItems {
  search: string;
  articles: string;
  trending: string;
  categories: string;
  partners: string;
  reels: string;
  audio: string;
  saved: string;
}

/** Strings arrive from the server — see the article route for why a client tree takes props. */
export function MobileMenuClient({ labels, themeLabels, sections, items }: { labels: MobileMenuLabels; themeLabels: { toggle: string; light: string; dark: string; system: string }; sections: MobileMenuSections; items: MobileMenuItems }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleOpen = () => {
    setMounted(true);
    setMenuOpen(true);
  };

  return (
    <>
      <MobileMenuTrigger
        onClick={handleOpen}
        open={menuOpen}
        controls={mounted ? MOBILE_MENU_ID : undefined}
        label={labels.openMenu}
      />
      {mounted && (
        <MobileMenu
          open={menuOpen}
          onOpenChange={setMenuOpen}
          contentId={MOBILE_MENU_ID}
          labels={labels}
          themeLabels={themeLabels}
          sections={sections}
          items={items}
        />
      )}
    </>
  );
}
