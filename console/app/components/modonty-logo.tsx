import Image from "next/image";
import { ar } from "@/lib/ar";

const DEFAULT_SRC =
  "https://res.cloudinary.com/dfegnpgwx/image/upload/v1768724691/final-01_fdnhom.svg";

interface ModontyLogoProps {
  alt?: string;
  className?: string;
  wrapperClassName?: string;
  sizes?: string;
}

export function ModontyLogo({
  alt = ar.logo.alt,
  className = "rounded-xl object-cover",
  wrapperClassName = "relative aspect-[3/1] w-full",
  sizes = "(max-width: 768px) 100vw, 50vw",
}: ModontyLogoProps) {
  return (
    <div className={wrapperClassName}>
      <Image
        src={DEFAULT_SRC}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
      />
    </div>
  );
}
