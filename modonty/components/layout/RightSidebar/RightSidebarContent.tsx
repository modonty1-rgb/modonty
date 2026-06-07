"use client";

import { useEffect, useState } from "react";
import { HeroSlider } from "./HeroSlider";
import { NewClientsCard } from "./NewClientsCard";
import type { ClientHeroSlide, SidebarClient } from "@/app/api/helpers/client-queries";

interface RightSidebarContentProps {
  clients: SidebarClient[];
  heroSlides: ClientHeroSlide[];
}

// Desktop-only mount. On mobile the same content lives in the bottom-bar «الشركاء»
// sheet, so we never render this (or its images) below lg — guarantees zero wasted
// image downloads on mobile, regardless of browser lazy-loading behavior in a
// display:none container.
export function RightSidebarContent({ clients, heroSlides }: RightSidebarContentProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!isDesktop) return null;

  return (
    <div className="flex flex-col gap-4">
      <HeroSlider slides={heroSlides} />
      <NewClientsCard clients={clients} />
    </div>
  );
}
