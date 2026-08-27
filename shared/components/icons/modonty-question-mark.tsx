import type { SVGProps } from "react";

/**
 * The modonty QUESTION / FAQ mark — الأسئلة الشائعة / الاستفسارات.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="question"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: دائرة احتواء مركزية يعلوها قوس علامة الاستفهام، ونقطة الارتكاز هي ماسة مدونتي كرمز للإجابة الموثوقة.
 *
 * Category: Help / Support · FAQ section, help center, inquiry form
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-question-body` · `--modonty-question-accent` (the diamond).
 */
export function ModontyQuestionMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <circle cx="60" cy="60" r="42" stroke="var(--modonty-question-body, currentColor)" strokeWidth="8"/>
      <path d="M48 44C48 36.5 53.5 32 60 32C66.5 32 72 36.5 72 43C72 50 63 54 60 62" stroke="var(--modonty-question-body, currentColor)" strokeWidth="8" strokeLinecap="round"/>
      <rect x="53" y="73" width="14" height="14" rx="2" transform="rotate(45 60 80)" fill="var(--modonty-question-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
