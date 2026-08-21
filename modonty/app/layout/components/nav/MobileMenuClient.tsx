"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MobileMenuTrigger } from "@/app/layout/components/nav/MobileMenuTrigger";

const MobileMenu = dynamic(
  () => import("@/app/layout/components/nav/MobileMenu").then((m) => ({ default: m.MobileMenu })),
  { ssr: false }
);

const MOBILE_MENU_ID = "mobile-navigation-sheet";

export function MobileMenuClient() {
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
      />
      {mounted && (
        <MobileMenu
          open={menuOpen}
          onOpenChange={setMenuOpen}
          contentId={MOBILE_MENU_ID}
        />
      )}
    </>
  );
}
