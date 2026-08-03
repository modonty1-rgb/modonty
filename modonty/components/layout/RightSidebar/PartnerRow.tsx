import type { ReactNode } from "react";

interface PartnerRowProps {
  children: ReactNode;
}

// Server component (was a tiny 'use client' boundary): it only added an active-partner
// highlight via useSearchParams, which forced client JS to hydrate on mobile inside the
// hidden desktop sidebar. Dropped the highlight (minor, desktop-only wayfinding cue) so the
// whole partners sidebar is now 100% server — zero client JS on the mobile initial load.
export function PartnerRow({ children }: PartnerRowProps) {
  return (
    <div className="group flex items-start gap-1 rounded transition-colors hover:bg-muted/50">
      {children}
    </div>
  );
}
