import Image from "next/image";
import Link from "next/link";
import { getOptimizedLogoUrl } from "@/lib/image-utils";

interface LogoNavProps {
  className?: string;
}

export function LogoNav({ className }: LogoNavProps) {
  const logoSrc = getOptimizedLogoUrl();

  return (
    <Link
      href="/"
      className="inline-block shrink-0"
      aria-label="مودونتي - الصفحة الرئيسية"
    >
      <Image
        src={logoSrc}
        alt="مودونتي"
        width={120}
        height={40}
        loading="eager"
        fetchPriority="high"
        sizes="120px"
        className={`object-contain h-9 w-[100px] md:h-10 md:w-[120px] ${className ?? ""}`}
      />
    </Link>
  );
}

