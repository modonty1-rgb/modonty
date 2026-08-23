import type { SVGProps } from "react";

/**
 * The modonty GALLERY / IMAGES mark — معرض الصور.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="gallery"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: إطار صورة بانورامي يحتوي تضاريس جبلية انسيابية، وشمس المعرض تتجسد كماسة سماوية مشعة.
 *
 * Category: Media · Photo albums, image galleries, media assets
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-gallery-body` · `--modonty-gallery-accent` (the diamond).
 */
export function ModontyGalleryMark(props: SVGProps<SVGSVGElement>) {
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
      <rect x="22" y="22" width="76" height="76" rx="14" stroke="var(--modonty-gallery-body, currentColor)" strokeWidth="8"/>
      <path d="M26 84L48 58L66 76L82 60L94 74" stroke="var(--modonty-gallery-body, currentColor)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="67" y="37" width="14" height="14" rx="2" transform="rotate(45 74 44)" fill="var(--modonty-gallery-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
