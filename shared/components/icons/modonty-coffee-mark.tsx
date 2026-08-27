import type { SVGProps } from "react";

/** Brand coffee mark for the medium reading-time filter. */
export function ModontyCoffeeMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="1em" height="1em" aria-hidden="true" {...props}>
      <path d="M36 24V36M60 24V36M84 24V36" stroke="var(--modonty-coffee-body, currentColor)" strokeWidth="8" strokeLinecap="round" />
      <path d="M28 46H82C87 46 91 50 91 55V79C91 91 81 100 69 100H45C33 100 23 91 23 79V51C23 48 25 46 28 46Z" stroke="var(--modonty-coffee-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M91 55H98C106 55 108 62 108 69C108 76 103 82 96 82H91" stroke="var(--modonty-coffee-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="53" y="65" width="14" height="14" rx="2" transform="rotate(45 60 72)" fill="var(--modonty-coffee-accent, hsl(var(--accent)))" />
    </svg>
  );
}
