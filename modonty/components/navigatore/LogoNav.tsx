import Image from "next/image";
import Link from "next/link";
import { getOptimizedLogoUrl } from "@/lib/image-utils";

interface LogoNavProps {
  className?: string;
}

export function LogoNav({ className }: LogoNavProps) {
  const logoSrc = getOptimizedLogoUrl();

  return (
    <Link href="/" className="inline-block">
      <Image
        src={logoSrc}
        alt="مودونتي"
        width={150}
        height={52}
        priority
        className={`object-contain h-7 w-auto md:h-[52px] ${className ?? ""}`}
        style={{ height: "auto" }}
      />
    </Link>
  );
}

