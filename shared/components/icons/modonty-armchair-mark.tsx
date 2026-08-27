import type { SVGProps } from "react";

/** Brand armchair mark for the long-reading filter. */
export function ModontyArmchairMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="1em" height="1em" aria-hidden="true" {...props}>
      <path d="M92 52V38C92 30 86 25 78 25H42C34 25 28 30 28 38V52" stroke="var(--modonty-armchair-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 80C20 87 25 92 32 92H88C95 92 100 87 100 80V62C100 55 94 51 88 51C82 51 78 55 78 62V68C78 70 77 71 75 71H45C43 71 42 70 42 68V62C42 55 38 51 32 51C26 51 20 55 20 62V80Z" stroke="var(--modonty-armchair-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 92V101M88 92V101" stroke="var(--modonty-armchair-body, currentColor)" strokeWidth="8" strokeLinecap="round" />
      <rect x="53" y="61" width="14" height="14" rx="2" transform="rotate(45 60 68)" fill="var(--modonty-armchair-accent, hsl(var(--accent)))" />
    </svg>
  );
}
