import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

/** Arabic-Indic digits, so a number reads in the same script as the words beside it. */
const AR_NUM = new Intl.NumberFormat(SITE_LOCALE);

interface FactProps {
  /** A number gets localised; a ready string (e.g. «١٠٠٪») is printed as-is. */
  value: number | string;
  label: string;
}

/**
 * One number over its unit — the tile both rail cards are built from.
 *
 * Shared so `AboutCard` and `TrustCard` cannot drift: the whole point of ABOUTCARD was to
 * replace four promises with three checkable facts, and two copies of that tile would be
 * two chances to slide back. The number is the loud part; the unit only names it.
 */
export function Fact({ value, label }: FactProps) {
  return (
    <div className="rounded-lg bg-foreground/[0.03] px-1 py-1.5 text-center">
      <span className="block text-base font-extrabold leading-none tabular-nums text-foreground">
        {typeof value === "number" ? AR_NUM.format(value) : value}
      </span>
      <span className="mt-0.5 block text-[10px] leading-tight text-muted-foreground">{label}</span>
    </div>
  );
}
