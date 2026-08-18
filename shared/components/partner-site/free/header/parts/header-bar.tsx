import { cn } from "../../../../../lib/utils/index";

/** The 64px bar every header shares: container ≤ 1128px, 24px side padding, space-between. */
export function HeaderBar({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto flex h-16 max-w-[1128px] items-center justify-between gap-8 px-6", className)}>{children}</div>;
}
