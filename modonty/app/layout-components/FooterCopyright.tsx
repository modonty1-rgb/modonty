import { BRAND_AR } from "@/constants";

export function FooterCopyright({ year }: { year: number }) {
  return <>© {year} {BRAND_AR}</>;
}
