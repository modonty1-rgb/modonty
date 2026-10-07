import { m } from "framer-motion";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { MODONTY_LOGO_URL } from "../../helpers/story-constants";
import type { ManifestSection } from "../../helpers/manifest-types";

interface NowPlayingGlyphProps {
  section: ManifestSection | undefined;
  positionMap: Map<string, number>;
  shouldReduceMotion: boolean | null;
  isPlaying: boolean;
}

/** The big mark of the «يُعرض الآن» panel: the chapter's number, the two logos, the logo dot, or its emoji. */
export function NowPlayingGlyph({ section, positionMap, shouldReduceMotion, isPlaying }: NowPlayingGlyphProps) {
  if (!section) return "—";
  const pos = positionMap.get(section.id);
  if (pos !== undefined) {
    return (
      <m.span
        key={`pos-${section.id}`}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="inline-block"
      >
        {pos}
      </m.span>
    );
  }
  if (section.media === "vision-2030") {
    return (
      <m.span
        key="vision-modonty-pair"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center justify-center gap-3 md:gap-4 align-middle"
        style={{ fontSize: 0 }}
        aria-label="رؤية ٢٠٣٠ × مدوني"
      >
        <OptimizedImage
          media={asMedia("/vision-2030-logo.png")}
          alt="رؤية ٢٠٣٠"
          width={88}
          height={56}
          sizes="(max-width: 768px) 60px, (max-width: 1024px) 78px, 92px"
          className="object-contain w-[60px] md:w-[78px] lg:w-[92px] h-auto"
          unoptimized
        />
        <span
          aria-hidden
          className="text-foreground/40 font-light"
          style={{ fontSize: "0.42em" }}
        >
          ×
        </span>
        <OptimizedImage
          media={asMedia(MODONTY_LOGO_URL)}
          alt="مدوني"
          width={56}
          height={56}
          sizes="(max-width: 768px) 50px, (max-width: 1024px) 64px, 76px"
          className="object-contain w-[50px] md:w-[64px] lg:w-[76px] h-auto"
          unoptimized
        />
      </m.span>
    );
  }
  if (section.media === "logo-spotlight") {
    const animateProps = shouldReduceMotion
      ? { rotate: 45, opacity: 1 }
      : isPlaying
        ? {
            scale: [1, 1.05, 1],
            rotate: [45, 48, 45, 42, 45],
            opacity: 1,
          }
        : { rotate: 45, opacity: 1 };
    return (
      <m.span
        key="logo-dot"
        aria-label="نقطة الشعار"
        className="inline-block align-middle"
        initial={{ scale: 0.6, rotate: 45, opacity: 0 }}
        animate={animateProps}
        transition={
          shouldReduceMotion
            ? { duration: 0.3 }
            : isPlaying
              ? {
                  scale: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.4 },
                }
              : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
        }
        style={{
          width: "0.68em",
          height: "0.68em",
          background: "#00D8D8",
          boxShadow:
            "0 0 42px rgba(0,216,216,0.45), 0 8px 24px rgba(0,180,180,0.3), inset 0 -8px 18px rgba(0,0,0,0.12)",
        }}
      />
    );
  }
  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600">
      {section.chipEmoji ?? "★"}
    </span>
  );
}
