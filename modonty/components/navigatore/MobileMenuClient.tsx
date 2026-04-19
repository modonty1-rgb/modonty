"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MobileMenuTrigger } from "@/components/navigatore/MobileMenuTrigger";

const MobileMenu = dynamic(
  () => import("@/components/navigatore/MobileMenu").then((m) => ({ default: m.MobileMenu })),
  { ssr: false }
);

export function MobileMenuClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleOpen = () => {
    setMounted(true);
    setMenuOpen(true);
  };

  return (
    <>
      <MobileMenuTrigger onClick={handleOpen} />
      {mounted && <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />}
    </>
  );
}
