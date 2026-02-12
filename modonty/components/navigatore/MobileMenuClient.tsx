"use client";

import { useState } from "react";
import { MobileMenu } from "@/components/navigatore/MobileMenu";
import { MobileMenuTrigger } from "@/components/navigatore/MobileMenuTrigger";

export function MobileMenuClient() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <MobileMenuTrigger onClick={() => setMenuOpen(true)} />
      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}


