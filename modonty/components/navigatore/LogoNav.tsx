import Image from "next/image";
import Link from "next/link";
import { getOptimizedLogoUrl } from "@/lib/image-utils";

interface LogoNavProps {
  className?: string;
}

export function LogoNav({ className }: LogoNavProps) {
  const logoSrc = getOptimizedLogoUrl();

  return (
    <Link href="/" className="inline-block shrink-0">
      <Image
        src={logoSrc}
        alt="مودونتي"
        width={120}
        height={40}
        priority
        className={`object-contain h-10 w-[120px] min-h-10 min-w-[120px] ${className ?? ""}`}
      />
    </Link>
  );
}

