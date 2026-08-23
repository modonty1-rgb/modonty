import type { SVGProps } from "react";

/**
 * The modonty PROFESSIONALS mark — المحترفون / الخبراء.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="professionals"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: قبعة تميز وتخرج احترافية ذات زوايا متوازنة، مرصعة بالماسة السماوية كرمز للمهارة والاعتمادية.
 *
 * Category: Identity / Trust · Expert badge, verified author, professional network
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-professionals-body` · `--modonty-professionals-accent` (the diamond).
 */
export function ModontyProfessionalsMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M18 48L60 28L102 48L60 68L18 48Z" stroke="var(--modonty-professionals-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M36 58V78C36 86 46.7 94 60 94C73.3 94 84 86 84 78V58" stroke="var(--modonty-professionals-body, currentColor)" strokeWidth="8" strokeLinecap="round"/>
      <path d="M96 52V76" stroke="var(--modonty-professionals-body, currentColor)" strokeWidth="6" strokeLinecap="round"/>
      <rect x="53" y="41" width="14" height="14" rx="2" transform="rotate(45 60 48)" fill="var(--modonty-professionals-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
