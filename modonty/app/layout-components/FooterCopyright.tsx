import { BRAND_AR } from "@/lib/brand";

export function FooterCopyright({ year }: { year: number }) {
  return <>© {year} {BRAND_AR}</>;
}
