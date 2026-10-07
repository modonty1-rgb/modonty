import { m } from "framer-motion";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";

interface VisionMenuButtonProps {
  onClick: () => void;
}

/** The green pill at the top of the chapter menu — plays the رؤية ٢٠٣٠ chapter. */
export function VisionMenuButton({ onClick }: VisionMenuButtonProps) {
  return (
    <m.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="flex w-full items-center justify-center gap-2 px-3 py-2 max-md:min-h-11 rounded-full bg-gradient-to-l from-emerald-700/25 via-emerald-600/20 to-amber-500/20 hover:from-emerald-700/40 hover:via-emerald-600/35 hover:to-amber-500/35 border border-emerald-600/40 hover:border-emerald-500/70 shadow-sm shadow-emerald-700/15 hover:shadow-emerald-600/30 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      aria-label="اسمع: نساهم في رؤية المملكة ٢٠٣٠"
      title="اضغط للاستماع: مدونتي ٢٠٣٠ — لبنة في الرؤية"
    >
      <OptimizedImage
        media={asMedia("/vision-2030-logo.png")}
        alt=""
        width={26}
        height={18}
        sizes="26px"
        className="object-contain"
        unoptimized
      />
      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tracking-[0.1em]">
        نساهم في رؤية المملكة ٢٠٣٠
      </span>
      <span
        aria-hidden
        className="text-emerald-600 dark:text-emerald-400 text-sm group-hover:translate-x-0.5 transition-transform"
      >
        ▸
      </span>
    </m.button>
  );
}
