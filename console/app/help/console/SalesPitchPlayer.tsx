"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { SalesPitchOverlay } from "./SalesPitchOverlay";

interface Props {
  /** elevenlabs = play pre-generated MP3; browser-tts = live Web Speech API */
  mode: "elevenlabs" | "browser-tts";
  manifestUrl: string;
  /** required when mode === "elevenlabs" — base path where MP3 files live */
  audioBase?: string;
  /** Optional button label override */
  label?: string;
}

/**
 * Sticky-bar button — opens a full overlay with karaoke transcript + voice controls.
 * Supports two playback modes:
 *  - "elevenlabs": plays pre-generated MP3 files (production quality, fixed voice)
 *  - "browser-tts": uses the browser's Web Speech API (free, for script iteration)
 */
export function SalesPitchPlayer({
  mode,
  manifestUrl,
  audioBase,
  label = "اسمع الشرح",
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs md:text-sm px-3 py-2 rounded-full shadow-sm transition-colors"
        aria-label={label}
      >
        <Volume2 className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
      </button>
      <SalesPitchOverlay
        open={open}
        onClose={() => setOpen(false)}
        mode={mode}
        manifestUrl={manifestUrl}
        audioBase={audioBase}
      />
    </>
  );
}
