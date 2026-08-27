import type { SVGProps } from "react";

/**
 * The modonty SHARE mark — المشاركة.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="share"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: هيكل التوزيع الثلاثي، حيث تمثل العقدة اليسرى الماسة السماوية لتعبر عن مصدر المحتوى من مدونتي.
 *
 * Category: Social / Utility · Share post, social broadcast, copy link
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-share-body` · `--modonty-share-accent` (the diamond).
 */
export function ModontyShareMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M42 56L78 38M42 64L78 82" stroke="var(--modonty-share-body, currentColor)" strokeWidth="8" strokeLinecap="round"/>
      <circle cx="84" cy="34" r="12" stroke="var(--modonty-share-body, currentColor)" strokeWidth="8" fill="#FFFFFF"/>
      <circle cx="84" cy="86" r="12" stroke="var(--modonty-share-body, currentColor)" strokeWidth="8" fill="#FFFFFF"/>
      <rect x="27" y="53" width="14" height="14" rx="2" transform="rotate(45 34 60)" fill="var(--modonty-share-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
