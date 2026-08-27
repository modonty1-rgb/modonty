import type { SVGProps } from "react";

/**
 * The modonty COMMENT / DISCUSSION mark — التعليقات / النقاش.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="comment"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: فقاعة حوار هندسية واضحة بزاوية سفلية رشيقة، تتوسطها ثلاث نقاط ماسية متتابعة تمثل صوت المستخدم.
 *
 * Category: Engagement / Social · Post feedback, comments section, thread reply
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-comment-body` · `--modonty-comment-accent` (the diamond).
 */
export function ModontyCommentMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M24 58C24 38.1 40.1 22 60 22C79.9 22 96 38.1 96 58C96 77.9 79.9 94 60 94C53.2 94 46.8 92.1 41.3 88.8L22 94L27.5 76.2C25.3 70.8 24 64.6 24 58Z" stroke="var(--modonty-comment-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="39" y="51" width="14" height="14" rx="2" transform="rotate(45 46 58)" fill="var(--modonty-comment-body, currentColor)"/>
      <rect x="53" y="51" width="14" height="14" rx="2" transform="rotate(45 60 58)" fill="var(--modonty-comment-accent, hsl(var(--accent)))"/>
      <rect x="67" y="51" width="14" height="14" rx="2" transform="rotate(45 74 58)" fill="var(--modonty-comment-body, currentColor)"/>
    </svg>
  );
}
