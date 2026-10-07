import { stripTashkeel } from "../../helpers/strip-tashkeel";
import type { ManifestSection } from "../../helpers/manifest-types";

interface OptionalSectionsListProps {
  sections: ManifestSection[];
  optionalSections: ManifestSection[];
  currentIdx: number;
  onSelect: (idx: number) => void;
}

/** The amber «اختياري» chapters above the categories in the chapter menu. */
export function OptionalSectionsList({ sections, optionalSections, currentIdx, onSelect }: OptionalSectionsListProps) {
  return (
    <div className="mb-4 pb-4 border-b border-border/40 flex flex-col gap-1.5">
      {optionalSections.map((opt) => {
        const idx = sections.findIndex((s) => s.id === opt.id);
        if (idx < 0) return null;
        const isActive = idx === currentIdx;
        const shortLabel = opt.label
          .split("—")[0]
          .replace(/^[٠١٢٣٤٥٦٧٨٩\d.\s]+/, "")
          .trim();
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(idx)}
            className={`text-start text-[13px] md:text-[14px] font-medium px-3 py-2.5 max-md:min-h-11 max-md:items-center rounded-xl transition-all duration-200 flex items-start gap-2.5 group ${
              isActive
                ? "bg-gradient-to-l from-amber-400/95 to-amber-500/90 text-amber-950 shadow-md shadow-amber-400/30 font-bold scale-[1.02]"
                : "bg-amber-400/10 hover:bg-amber-400/20 hover:translate-x-[-2px] text-foreground border border-amber-400/30 hover:border-amber-400/60"
            }`}
            title={`اختياري — ${stripTashkeel(shortLabel)}`}
          >
            {opt.chipEmoji && (
              <span className="text-[18px] leading-none shrink-0 mt-0.5 max-md:mt-0">
                {opt.chipEmoji}
              </span>
            )}
            <span className="leading-snug break-words">{stripTashkeel(shortLabel)}</span>
          </button>
        );
      })}
    </div>
  );
}
