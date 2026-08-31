import Link from "next/link";
import { IconChevronLeft } from "@/lib/icons";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  /** «كل …» link to the section's own page. */
  more?: { href: string; label: string };
}

/** Eyebrow · title · optional «more» link — the same rhythm on every home block. */
export function SectionHeading({ eyebrow, title, more }: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--primary-ink,var(--primary)))]">
          <span className="h-0.5 w-6 rounded-full bg-accent" aria-hidden />
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-tight text-foreground md:text-[28px]">{title}</h2>
      </div>
      {more ? (
        <Link href={more.href} className="flex shrink-0 items-center gap-1 text-sm text-[hsl(var(--primary-ink,var(--primary)))] hover:underline underline-offset-4">
          {more.label}
          <IconChevronLeft className="h-4 w-4 rtl:rotate-0" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
