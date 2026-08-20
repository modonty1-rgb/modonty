"use client";

import { useEffect, useState } from "react";

import {
  IconEye,
  IconEyeOff,
  IconTextSmaller,
  IconTextNormal,
  IconTextBigger,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

// The A-shrinking / A / A-growing marks — the control every word processor uses, so it carries
// its meaning without a label. It started as «ص · ع · ك» (initials of the size names): correct
// Arabic, unreadable as a control. Icons rather than a drawn letter, on Khalid's call (19 Aug).
const SIZES = [
  { key: "small", title: "خط صغير", Icon: IconTextSmaller },
  { key: "normal", title: "خط عادي", Icon: IconTextNormal },
  { key: "large", title: "خط كبير", Icon: IconTextBigger },
] as const;

type SizeKey = (typeof SIZES)[number]["key"];

const TEXT_SIZE_STORAGE_KEY = "modonty:article-text";

/**
 * Two controls the reader owns, in one card: how big the text is, and whether the article's
 * images are in the way right now.
 *
 * They persist differently on purpose (Khalid, 19 Aug). Text size is a standing preference —
 * someone who needs larger text needs it on every article, so it is stored. Hiding images is a
 * momentary «let me just read this» — so it lives for the visit only and comes back on a fresh
 * load. Storing it would mean a reader who once wanted quiet never sees a photo again.
 *
 * Neither is required to read the article. This is the extra that makes the page feel looked
 * after rather than merely delivered.
 */
interface ReadingToolsProps {
  /** Icons only, stacked, no card — for the empty margin beside the article on wide screens. */
  bare?: boolean;
}

export function ReadingTools({ bare = false }: ReadingToolsProps) {
  const [size, setSize] = useState<SizeKey>("normal");
  const [imagesHidden, setImagesHidden] = useState(false);

  // Reads the saved size and puts it on <html> itself — no injected script.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(TEXT_SIZE_STORAGE_KEY);
    } catch {
      // Private mode or storage disabled — the control still works for this visit.
    }
    if (stored === "small" || stored === "large") {
      setSize(stored);
      document.documentElement.dataset.articleText = stored;
    }
  }, []);

  const pickSize = (key: SizeKey) => {
    setSize(key);
    const root = document.documentElement;
    if (key === "normal") delete root.dataset.articleText;
    else root.dataset.articleText = key;
    try {
      if (key === "normal") localStorage.removeItem(TEXT_SIZE_STORAGE_KEY);
      else localStorage.setItem(TEXT_SIZE_STORAGE_KEY, key);
    } catch {
      // Storage refused — the size still applies, it just will not survive the next page.
    }
  };

  const toggleImages = () => {
    const next = !imagesHidden;
    setImagesHidden(next);

    const article = document.querySelector("article");
    if (!article) return;

    if (!next) {
      article.querySelectorAll<HTMLElement>("[data-img-hidden]").forEach((el) => {
        delete el.dataset.imgHidden;
      });
      return;
    }

    // Marking the <img> alone leaves a hole: images live inside `aspect-video` wrappers that
    // hold their height no matter what the child does. So climb from each image to the
    // outermost ancestor that still carries no text of its own — that ancestor IS the image
    // box — and mark that. A <figure> with a caption stops the climb at the caption's parent,
    // which is right: the words stay, the picture goes.
    const boxes = new Set<HTMLElement>();
    article.querySelectorAll("img").forEach((img) => {
      let box: HTMLElement = img;
      while (box.parentElement && box.parentElement !== article) {
        if (box.parentElement.textContent?.trim()) break;
        box = box.parentElement;
      }
      boxes.add(box);
    });
    boxes.forEach((el) => {
      el.dataset.imgHidden = "1";
    });
  };

  // `bare` is the margin placement: no card, no border, no tint — just the icons standing in
  // the empty gutter beside the article. The boxed version was tried there first and read as an
  // orphan island floating in 94px of nothing (Khalid, 19 Aug); stripping the box is what makes
  // the same control belong to the page instead of hovering over it.
  if (bare) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div
          role="radiogroup"
          aria-label="حجم خط المقال"
          className="flex flex-col items-center gap-1"
        >
          {SIZES.map((s) => (
            <button
              key={s.key}
              type="button"
              role="radio"
              aria-checked={size === s.key}
              title={s.title}
              onClick={() => pickSize(s.key)}
              className={cn(
                "grid size-9 place-items-center rounded-lg transition-colors",
                size === s.key
                  ? "bg-primary/15 text-link"
                  : "text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <s.Icon className="size-4" aria-hidden />
            </button>
          ))}
        </div>

        <span className="h-px w-6 bg-border" aria-hidden />

        <button
          type="button"
          role="switch"
          aria-checked={imagesHidden}
          onClick={toggleImages}
          title={imagesHidden ? "إظهار الصور" : "إخفاء الصور والقراءة نصّاً فقط"}
          className={cn(
            "grid size-9 place-items-center rounded-lg transition-colors",
            imagesHidden
              ? "bg-primary/15 text-link"
              : "text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground",
          )}
        >
          {imagesHidden ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
        </button>
      </div>
    );
  }

  return (
    /* One row, and a tinted edge rather than the same grey border every other card wears
       (Khalid, 19 Aug) — a control nobody notices is a control nobody uses, and this one was
       two stacked rows in a card that read as more content. */
    <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 px-2.5 py-1.5">
      <div
        role="radiogroup"
        aria-label="حجم خط المقال"
        className="flex items-center gap-0.5 rounded-lg bg-background/70 p-0.5"
      >
        {SIZES.map((s) => (
          <button
            key={s.key}
            type="button"
            role="radio"
            aria-checked={size === s.key}
            title={s.title}
            onClick={() => pickSize(s.key)}
            className={cn(
              "grid size-7 place-items-center rounded-md transition-colors",
              size === s.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <s.Icon className="size-4" aria-hidden />
          </button>
        ))}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={imagesHidden}
        onClick={toggleImages}
        title={imagesHidden ? "إظهار الصور" : "إخفاء الصور والقراءة نصّاً فقط"}
        className={cn(
          "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition-colors",
          imagesHidden
            ? "bg-primary text-primary-foreground"
            : "bg-background/70 text-muted-foreground hover:text-foreground",
        )}
      >
        {imagesHidden ? <IconEyeOff className="size-3.5" /> : <IconEye className="size-3.5" />}
        {imagesHidden ? "بلا صور" : "الصور"}
      </button>
    </div>
  );
}
