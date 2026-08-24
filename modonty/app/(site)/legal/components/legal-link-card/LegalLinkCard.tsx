import Link from "next/link";

import { IconChevronLeft } from "@/lib/icons";

interface LegalLinkCardProps {
  href: string;
  title: string;
  /** One line saying what the policy covers, so the visitor picks without opening all four. */
  description: string;
}

/** One row of the legal index: the page's name, what it covers, and a chevron pointing at it. */
export function LegalLinkCard({ href, title, description }: LegalLinkCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <IconChevronLeft className="h-4 w-4 text-muted-foreground ltr:rotate-180 shrink-0" aria-hidden />
    </Link>
  );
}
