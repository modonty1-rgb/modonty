import { m } from "framer-motion";

interface FounderOfferButtonProps {
  onClick: () => void;
  offerAria: string;
  offerHook: string | null;
}

/** FOOTER CTA of the chapter menu — Founder Offer hook + سكشن «خطوتك الأولى». */
export function FounderOfferButton({ onClick, offerAria, offerHook }: FounderOfferButtonProps) {
  return (
    <div className="px-3 md:px-4 py-3 border-t border-border/40 bg-gradient-to-b from-muted/30 to-card/80 shrink-0">
      <m.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative w-full flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 transition-all shadow-md shadow-amber-500/30 hover:shadow-amber-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 focus-visible:ring-offset-card overflow-hidden"
        aria-label={offerAria}
      >
        {/* shine sweep on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-l from-transparent via-white/40 to-transparent"
        />
        {/* HOOK STRIP */}
        <span className="relative flex items-center gap-1.5 text-xs font-bold tracking-wide text-amber-950/85">
          <span aria-hidden>🎁</span>
          <span>عرض المؤسسين</span>
          {offerHook && (
            <>
              <span aria-hidden className="opacity-60">·</span>
              <span className="font-extrabold">{offerHook}</span>
            </>
          )}
        </span>
        {/* MAIN LINE */}
        <span className="relative flex items-center gap-1.5 text-[13px] font-extrabold">
          <span aria-hidden>🚀</span>
          <span>خطوتك الأولى مع البنيان</span>
        </span>
      </m.button>
    </div>
  );
}
