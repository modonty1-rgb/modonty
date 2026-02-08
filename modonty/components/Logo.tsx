"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useState, useEffect } from "react";
import { getOptimizedLogoUrl } from "@/lib/image-utils";

interface LogoProps {
  size?: "header" | "footer" | "sidebar";
  showLink?: boolean;
  className?: string;
  forceMobile?: boolean;
}

export function Logo({ size = "header", showLink = true, className = "", forceMobile = false }: LogoProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (forceMobile) {
      setIsMobile(true);
      return;
    }
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [forceMobile]);

  const isHeader = size === "header";
  const useMobileLogo = forceMobile || isMobile;

  // Logo dimensions with increased width and auto height
  const dimensions = {
    header: {
      mobile: { width: 120, height: 44 },
      desktop: { width: 150, height: 52 }
    },
    footer: {
      mobile: { width: 96, height: 54 },
      desktop: { width: 120, height: 68 }
    },
    sidebar: {
      mobile: { width: 110, height: 62 },
      desktop: { width: 110, height: 62 }
    }
  };

  const dims = dimensions[size as keyof typeof dimensions] ?? dimensions.footer;
  const { width, height } = useMobileLogo ? dims.mobile : dims.desktop;

  const logoSrc = getOptimizedLogoUrl();

  const image = (
    <Image
      src={logoSrc}
      alt="مودونتي"
      width={width}
      height={height}
      priority={isHeader}
      quality={90}
      className={`object-contain ${className}`}
    />
  );

  return showLink ? (
    <Link href="/" className="inline-block">
      {image}
    </Link>
  ) : (
    image
  );
}
