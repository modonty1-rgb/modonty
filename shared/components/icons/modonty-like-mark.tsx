import type { SVGProps } from "react";

/**
 * The modonty LIKE / FAVORITE mark — الإعجاب.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="like"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: قلب انسيابي متماثل بانحناءات هندسية نقية، يتوسطه نبض الماسة السماوية المشعة.
 *
 * Category: Engagement / Social · Upvote, article appreciation, favorite posts
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-like-body` · `--modonty-like-accent` (the diamond).
 */
export function ModontyLikeMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M60 98C60 98 20 74 20 46C20 32 32 22 45 22C52 22 57 26 60 30C63 26 68 22 75 22C88 22 100 32 100 46C100 74 60 98 60 98Z" stroke="var(--modonty-like-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="53" y="45" width="14" height="14" rx="2" transform="rotate(45 60 52)" fill="var(--modonty-like-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
