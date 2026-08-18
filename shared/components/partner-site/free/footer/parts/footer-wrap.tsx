import { cn } from "../../../../../lib/utils/index";

/** Every footer's container: ≤ 1128px, 24px sides, 48px top / 32px bottom. */
export function FooterWrap({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto max-w-[1128px] px-6 pb-8 pt-12", className)}>{children}</div>;
}
