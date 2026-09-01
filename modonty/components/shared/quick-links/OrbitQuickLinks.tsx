"use client";

import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ModontyMark } from "@/components/icons/modonty-mark";
import { ModontyIndustriesMark } from "@/components/icons/modonty-industries-mark";
import { ModontyPartnerMark } from "@/components/icons/modonty-partner-mark";
import { ModontyReelsMark } from "@/components/icons/modonty-reels-mark";
import { ModontyArticlesMark } from "@/components/icons/modonty-articles-mark";
import { ModontyAudioMark } from "@/components/icons/modonty-audio-mark";
import { ModoCharacter } from "@modonty/shared/components/modo-character/ModoCharacter";

interface OrbitQuickLinksProps {
  siteName: string;
}

interface OrbitLink {
  href: string;
  label: string | null;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

interface OrbitLinkItemProps {
  link: OrbitLink;
  index: number;
  activeIndex: number;
  previousActiveIndex: number;
}

const ORBIT_SPACING = 54;

function ModoMark({ className }: SVGProps<SVGSVGElement>) {
  return (
    <span className={`relative block overflow-hidden rounded-full ${className ?? ""}`}>
      <span className="absolute -inset-0.5">
        <ModoCharacter sizes="32px" decorative />
      </span>
    </span>
  );
}

const ORBIT_LINKS = [
  { href: "/modonty", label: null, icon: ModontyMark },
  { href: "/articles", label: "المقالات", icon: ModontyArticlesMark },
  { href: "/industries", label: "المجالات", icon: ModontyIndustriesMark },
  { href: "/reels", label: "الطلّات", icon: ModontyReelsMark },
  { href: "/clients", label: "الشركاء", icon: ModontyPartnerMark },
  { href: "/audio", label: "اسمع", icon: ModontyAudioMark },
  { href: "/modo-chat", label: "مودو", icon: ModoMark },
] satisfies readonly OrbitLink[];

function getOrbitOffset(index: number, activeIndex: number): number {
  const distance = (index - activeIndex + ORBIT_LINKS.length) % ORBIT_LINKS.length;
  return (distance > ORBIT_LINKS.length / 2 ? distance - ORBIT_LINKS.length : distance) * ORBIT_SPACING;
}

function OrbitLinkItem({ link, index, activeIndex, previousActiveIndex }: OrbitLinkItemProps) {
  const isActive = index === activeIndex;
  const Icon = link.icon;
  const isModo = link.href === "/modo-chat";
  const isWrapping = Math.abs(getOrbitOffset(index, activeIndex) - getOrbitOffset(index, previousActiveIndex)) > ORBIT_SPACING * 2;
  const className = isActive
    ? "border-primary/80 bg-primary text-primary-foreground shadow-[0_0_28px_hsl(var(--primary)/0.55)]"
    : "border-border/80 bg-card/90 hover:border-primary/65";

  return (
    <div
      className={`absolute start-[calc(50%-2rem)] top-0 ${isWrapping ? "transition-opacity duration-150" : "transition-[opacity,transform] duration-300 ease-out"}`}
      style={{
        opacity: isWrapping ? 0 : isActive ? 1 : 0.78,
        transform: `translateX(${getOrbitOffset(index, activeIndex)}px) translateY(${isActive ? 0 : 8}px) scale(${isActive ? 1 : 0.84})`,
      }}
    >
      <Link href={link.href} aria-current={isActive ? "page" : undefined} aria-label={link.label ?? undefined} className={`flex rounded-full border text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive ? "size-16 flex-col" : "size-12"} items-center justify-center ${className}`}>
        <Icon className={isModo ? (isActive ? "size-8" : "size-9") : isActive ? "size-6" : "size-8"} aria-hidden />
        {isActive && <span className="mt-1 max-w-16 truncate px-1 text-[10px] font-semibold leading-none">{link.label}</span>}
      </Link>
    </div>
  );
}

export function OrbitQuickLinks({ siteName }: OrbitQuickLinksProps) {
  const pathname = usePathname();
  const section = pathname?.split("/")[1] ?? "";
  const links = ORBIT_LINKS.map((link) => ({
    ...link,
    label: link.label ?? siteName,
  }));
  const activeIndex = Math.max(0, links.findIndex(({ href }) => href.slice(1) === section));
  const [previousActiveIndex, setPreviousActiveIndex] = useState(activeIndex);

  useEffect(() => {
    setPreviousActiveIndex(activeIndex);
  }, [activeIndex]);

  return (
    <nav aria-label="أقسام الموقع" className="relative h-[68px] overflow-hidden">
      {links.map((link, index) => <OrbitLinkItem key={link.href} link={link} index={index} activeIndex={activeIndex} previousActiveIndex={previousActiveIndex} />)}
    </nav>
  );
}
