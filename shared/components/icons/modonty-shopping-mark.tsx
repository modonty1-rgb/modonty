import type { SVGProps } from "react";

/**
 * The modonty SHOPPING mark — التسوق / المتجر.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="shopping"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: حقيبة تسوق عصرية بمقبض قوسي متين وشارة مدونتي الماسية تبرز في واجهة الحقيبة كعلامة جودة.
 *
 * Category: E-Commerce · Cart, store checkout, products catalog
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-shopping-body` · `--modonty-shopping-accent` (the diamond).
 */
export function ModontyShoppingMark(props: SVGProps<SVGSVGElement>) {
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
      <path d="M44 42V34C44 25.2 51.2 18 60 18C68.8 18 76 25.2 76 34V42" stroke="var(--modonty-shopping-body, currentColor)" strokeWidth="8" strokeLinecap="round"/>
      <path d="M24 42H96L88 98C88 101.3 85.3 104 82 104H38C34.7 104 32 101.3 32 98L24 42Z" stroke="var(--modonty-shopping-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="53" y="63" width="14" height="14" rx="2" transform="rotate(45 60 70)" fill="var(--modonty-shopping-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
