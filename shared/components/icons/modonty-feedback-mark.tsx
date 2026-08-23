import type { SVGProps } from "react";

/**
 * The modonty FEEDBACK mark — الملاحظات والآراء.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="feedback"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: لوحة تقييم وملاحظات مستندة تتصدرها شارة الرضا الماسية مع أسطر تدوين مرنة.
 *
 * Category: Engagement / Support · Feedback form, user reviews, survey submission
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-feedback-body` · `--modonty-feedback-accent` (the diamond).
 */
export function ModontyFeedbackMark(props: SVGProps<SVGSVGElement>) {
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
      <rect x="26" y="22" width="68" height="76" rx="12" stroke="var(--modonty-feedback-body, currentColor)" strokeWidth="8"/>
      <rect x="53" y="37" width="14" height="14" rx="2" transform="rotate(45 60 44)" fill="var(--modonty-feedback-accent, hsl(var(--accent)))"/>
      <path d="M42 66H78M42 78H66" stroke="var(--modonty-feedback-body, currentColor)" strokeWidth="6" strokeLinecap="round"/>
    </svg>
  );
}
