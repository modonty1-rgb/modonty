import { IconScrollTop } from "@/lib/icons";
import { buttonVariants } from "@/components/ui/button";

// Scroll-driven CSS, so this ships no JavaScript. It replaced three client components:
// a gate that waited for the first scroll, then lazily loaded a progress bar and a
// back-to-top button, each with its own scroll listener.
//
// MDN (animation-timeline/scroll): "JavaScript is not required. The scroll() function
// is purely CSS-based." Support is 85.43% — Chrome/Edge 115+, Safari 26+, Firefox 156+.
// Browsers without it never see either piece; both are decoration, and the anchor still
// works because it is a real link.
const TIMELINE = "[animation-timeline:scroll(root_block)]";

// Pixels, not a percentage. `animation-range` accepts <length-percentage>, and this page
// grows as the infinite scroll loads — a percentage threshold would drift under the
// visitor's feet, appearing then vanishing while they stand still.
const REVEAL_AFTER = "[animation-range:800px_900px]";

const NO_SUPPORT = "supports-[not_(animation-timeline:scroll())]";

export function ScrollButtons() {
  return (
    <>
      <div className={`fixed inset-x-0 top-14 z-40 h-1 bg-muted ${NO_SUPPORT}:hidden motion-reduce:hidden`}>
        <div className={`h-full origin-right bg-accent animate-scroll-fill ${TIMELINE}`} />
      </div>

      {/* A real <a>, not next/link: the router treats an unchanged hash as "no
          navigation" and swallows the click, so the second press did nothing. The
          browser re-scrolls to the fragment on every activation. Target is the layout's
          existing #main-content, the same id the skip link uses. */}
      <a
        href="#main-content"
        aria-label="ارجع لفوق"
        className={buttonVariants({
          size: "icon",
          // No `motion-reduce` variant: the reveal is a fade, not motion. And never
          // `animate-none` in a fallback — with no animation nothing sets opacity 0, so
          // the button sat on screen from the first pixel.
          className: `fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] start-4 z-40 h-12 w-12 rounded-full shadow-lg animate-scroll-reveal md:bottom-8 ${TIMELINE} ${REVEAL_AFTER} ${NO_SUPPORT}:hidden`,
        })}
      >
        <IconScrollTop className="h-5 w-5" />
      </a>
    </>
  );
}
