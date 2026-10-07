import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { stripTashkeel } from "../../helpers/strip-tashkeel";
import type { ManifestSection } from "../../helpers/manifest-types";

interface TranscriptDialogProps {
  section: ManifestSection;
}

/** «اقرأ النص» — the current chapter's full text in a dialog. Rendered only when the chapter has text. */
export function TranscriptDialog({ section }: TranscriptDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 max-md:min-h-11 max-md:px-4 rounded-full border border-border bg-background/40 hover:bg-muted/40 text-xs font-bold text-foreground/75 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          title="اقرأ النص الكامل للمقطع الحالي"
          aria-label="افتح نص المقطع الحالي"
        >
          <span aria-hidden>📄</span>
          <span>اقرأ النص</span>
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[85vh] flex flex-col p-0"
        dir="rtl"
      >
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-border shrink-0">
          <DialogTitle className="text-base md:text-lg font-extrabold text-foreground text-start">
            {section.label ? stripTashkeel(section.label) : "نص المقطع"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            النص الكامل للمقطع الحالي
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 scrollbar-thin">
          <p
            className="text-sm md:text-base leading-loose text-foreground/90 select-text"
            dir="rtl"
          >
            {section.text ? stripTashkeel(section.text) : ""}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
