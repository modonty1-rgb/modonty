"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useState, useEffect } from "react";

interface LogoProps {
  size?: "header" | "footer";
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
      mobile: { width: 120, height: 68 },
      desktop: { width: 160, height: 90 }
    },
    footer: {
      mobile: { width: 96, height: 54 },
      desktop: { width: 120, height: 68 }
    }
  };

  const { width, height } = useMobileLogo
    ? dimensions[size].mobile
    : dimensions[size].desktop;

  const desktopLogo = "https://res.cloudinary.com/dfegnpgwx/image/upload/v1768807772/modontyLogo_j3k01h.svg";
  const logoSrc = desktopLogo;

  const image = (
    <Image
      src={logoSrc}
      alt="مودونتي"
      width={width}
      height={height}
      priority={isHeader}
      quality={100}
      unoptimized={false}
      className={`h-auto object-contain ${className}`}
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
