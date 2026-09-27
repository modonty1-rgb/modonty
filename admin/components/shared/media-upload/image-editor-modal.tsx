"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import isPropValid from "@emotion/is-prop-valid";
import { StyleSheetManager } from "styled-components";
import { AlertTriangle, Loader2, Save } from "lucide-react";
import type { MediaType } from "@prisma/client";
// Type-only import — erased at build, so it does NOT pull the heavy editor
// into the bundle synchronously (the dynamic ssr:false load stays lazy).
import type {
  FilerobotImageEditorConfig,
  getCurrentImgDataFunction,
} from "react-filerobot-image-editor";

import { useToast } from "@/hooks/use-toast";
import { formatBytes } from "@modonty/shared/lib/utils";
import { getMediaSpec, isRatioValid, isResolutionValid } from "@/lib/media/media-specs";

// Filerobot is canvas/DOM-heavy and touches window → client-only, no SSR.
const FilerobotImageEditor = dynamic<FilerobotImageEditorConfig>(
  () => import("react-filerobot-image-editor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

interface ImageEditorModalProps {
  /** Object URL (or remote URL) of the image being edited. */
  source: string;
  mediaType: MediaType;
  fileName: string;
  /** Size (bytes) of the originally-picked file — shown so the designer sees the before. */
  originalSize?: number;
  /** Called with the cropped WebP once it passes spec validation. The DB
   *  width/height come from Cloudinary's upload response, so they aren't passed here. */
  onSave: (file: File) => void;
  onClose: () => void;
  /**
   * `fullscreen` (default) covers the viewport — the upload page and the edit page.
   * `inline` fills its parent — the upload window, so the crop happens without leaving the page.
   */
  variant?: "fullscreen" | "inline";
  /** The one button's label. Inline it does crop + upload + link, so it reads «Save». */
  saveLabel?: string;
  /** Parent is uploading the result — the button shows it and stops double clicks. */
  busy?: boolean;
}

/** "222 40% 14%" (a shadcn HSL token) → "#151e33". Filerobot's palette takes colour strings. */
function hslTokenToHex(token: string): string | null {
  const m = token.trim().match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!m) return null;
  const h = Number(m[1]) / 360, s = Number(m[2]) / 100, l = Number(m[3]) / 100;
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * The editor in the admin's own colours, light or dark — read from the live CSS tokens, so it
 * follows the theme instead of opening as a white sheet over a dark admin (26 Sep 2026).
 */
function useAdminEditorTheme(): FilerobotImageEditorConfig["theme"] {
  return useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const css = getComputedStyle(document.documentElement);
    const tok = (name: string) => hslTokenToHex(css.getPropertyValue(name));
    const card = tok("--card"), bg = tok("--background"), primary = tok("--primary");
    const border = tok("--border"), fg = tok("--foreground"), muted = tok("--muted"), mutedFg = tok("--muted-foreground");
    if (!card || !bg || !primary) return undefined;
    return {
      palette: {
        "bg-primary": card,
        "bg-secondary": bg,
        "bg-primary-active": muted ?? card,
        "accent-primary": primary,
        "accent-primary-active": primary,
        "icons-primary": fg ?? "#ffffff",
        "icons-secondary": mutedFg ?? "#999999",
        "borders-primary": border ?? card,
        "borders-secondary": border ?? card,
        "borders-strong": mutedFg ?? card,
        "light-shadow": "rgba(0,0,0,0.25)",
        "txt-primary": fg ?? "#ffffff",
        "txt-secondary": mutedFg ?? "#999999",
      },
      typography: { fontFamily: css.getPropertyValue("font-family") || "inherit" },
    };
  }, []);
}

/** base64 data URL → File (for re-upload to Cloudinary). */
function dataURLtoFile(dataurl: string, filename: string): File {
  const [meta, b64] = dataurl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(b64);
  let i = binary.length;
  const bytes = new Uint8Array(i);
  while (i--) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

/** Compression quality (0–1) for the lossy WebP encode Filerobot applies on save. */
const WEBP_QUALITY = 0.85;

export function ImageEditorModal({
  source,
  mediaType,
  fileName,
  originalSize = 0,
  onSave,
  onClose,
  variant = "fullscreen",
  saveLabel = "Save WebP",
  busy = false,
}: ImageEditorModalProps) {
  const theme = useAdminEditorTheme();
  const { toast } = useToast();
  const spec = getMediaSpec(mediaType);
  const baseName = fileName.replace(/\.[^.]+$/, "");
  // Always WebP — smaller, supports transparency (logos keep their alpha).
  const outExt = "webp" as const;

  // Fixed-ratio roles → lock the ratio + hide presets (designer can't change it).
  // Free roles (GENERAL / GALLERY) → open crop with no forced ratio.
  const cropConfig: FilerobotImageEditorConfig["Crop"] =
    spec.ratio === null
      ? { autoResize: false }
      : {
          ratio: spec.ratio,
          noPresets: true,
          autoResize: false,
          ratioTitleKey: spec.ratioLabel,
          ...(spec.width ? { minWidth: Math.min(320, spec.width) } : {}),
        };

  // Crop-only editor. No Resize (size is spec-locked), no Finetune/Filters
  // (brand-spec assets must not be colour-altered at upload). The goal here is
  // foolproof control, not enhancement — re-add a tab per role if ever needed.
  const tabsIds: FilerobotImageEditorConfig["tabsIds"] = ["Adjust"];

  const previewPixelRatio =
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  // Filerobot has no config to remove individual Adjust tools, so hide
  // Rotate / Flip X / Flip Y by their exact label (they're useless for our
  // fixed-spec assets and would only confuse the designer). Scoped to this
  // editor + re-applied on every re-render via a MutationObserver.
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const HIDE = new Set(["Rotate", "Flip X", "Flip Y"]);
    const apply = () => {
      root
        .querySelectorAll<HTMLElement>('[data-testid="FIE-carousel-item"]')
        .forEach((el) => {
          if (HIDE.has((el.textContent || "").trim())) el.style.display = "none";
        });
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // styled-components v6 dropped automatic prop filtering, so Filerobot's internal
  // components leak non-standard props (active, noMargin, etc.) to the DOM and
  // React 19 warns. Re-enable filtering for DOM tags only (React components untouched).
  const forwardProp = (propName: string, el: unknown) =>
    typeof el === "string" ? isPropValid(propName) : true;

  // Pin the editor's output AND the on-screen px indicator to the role's exact
  // size via a locked Resize — so a logo always reads + saves 500×500, regardless
  // of the source image's resolution. Free roles keep their natural size.
  const loadableDesignState: FilerobotImageEditorConfig["loadableDesignState"] =
    spec.width && spec.height
      ? { resize: { width: spec.width, height: spec.height, manualChangeDisabled: true } }
      : undefined;

  // Custom save — bypasses Filerobot's "Save as" dialog entirely (removeSaveButton)
  // so the FORMAT IS LOCKED: every asset is exported as a compressed WebP, the
  // designer can never pick PNG/JPEG. We pull the current image data on demand.
  const getImgDataRef = useRef<getCurrentImgDataFunction | undefined>(undefined);

  // The crop in SOURCE pixels, live. Filerobot keeps the crop in on-screen pixels and its own
  // «crop area is lower than the applied resize» popup compares those with the output size —
  // so it fired by screen size, not by quality, in a colour the dark theme hid (Khalid,
  // 27 Sep 2026). Its popup is hidden below; this is the measure that replaces it.
  const [cropPx, setCropPx] = useState<{ w: number; h: number } | null>(null);
  const onModify = useCallback((state: unknown) => {
    const st = state as {
      adjustments?: { crop?: { width?: number; height?: number } };
      shownImageDimensions?: { width?: number; height?: number };
      originalSource?: { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number };
    };
    const crop = st.adjustments?.crop;
    const shown = st.shownImageDimensions;
    const natW = st.originalSource?.naturalWidth || st.originalSource?.width;
    const natH = st.originalSource?.naturalHeight || st.originalSource?.height;
    if (!crop?.width || !crop.height || !shown?.width || !shown.height || !natW || !natH) return;
    const w = Math.round((crop.width * natW) / shown.width);
    const h = Math.round((crop.height * natH) / shown.height);
    setCropPx((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
  }, []);
  const belowTarget = !!(cropPx && spec.width && spec.height && (cropPx.w < spec.width || cropPx.h < spec.height));
  const belowMin = !!(cropPx && (cropPx.w < spec.minWidth || cropPx.h < spec.minHeight));
  const handleSave = () => {
    if (busy) return;
    const getImgData = getImgDataRef.current;
    if (!getImgData) return;
    if (belowMin && cropPx) {
      toast({
        title: "Crop too small",
        description: `The crop is ${cropPx.w}×${cropPx.h}px of the original — ${spec.label} needs at least ${spec.minWidth}×${spec.minHeight}px. Widen the crop.`,
        variant: "destructive",
      });
      return;
    }


    const { imageData, hideLoadingSpinner } = getImgData(
      { name: baseName, extension: outExt, quality: WEBP_QUALITY },
      1,
      true
    );
    const base64 = imageData.imageBase64;
    const w = imageData.width || 0;
    const h = imageData.height || 0;
    if (!base64) {
      hideLoadingSpinner();
      return;
    }
    if (!isRatioValid(mediaType, w, h)) {
      toast({
        title: "Wrong ratio",
        description: `The crop must be ${spec.ratioLabel}.`,
        variant: "destructive",
      });
      hideLoadingSpinner();
      return;
    }
    if (!isResolutionValid(mediaType, w, h)) {
      toast({
        title: "Resolution too low",
        description: `At least ${spec.minWidth}×${spec.minHeight}px — this one is ${w}×${h}px.`,
        variant: "destructive",
      });
      hideLoadingSpinner();
      return;
    }
    hideLoadingSpinner();
    // Parent clears editor state on save then unmounts this modal.
    onSave(dataURLtoFile(base64, `${baseName}.${outExt}`));
  };

  // Inline (the upload window) is crop-only, so the editor's extras are noise there (Khalid,
  // 27 Sep 2026: «الموديل كبير… اللي ما له داعي يشيله»): a tools bar holding the one Crop tool
  // that is already on, compare-with-original, undo/redo (Reset stays), and the size chip.
  // Hidden by Filerobot's own data-testid hooks — it has no config for any of them.
  const inlineTrim =
    variant === "inline"
      ? "[&_[data-testid=FIE-tools-bar-wrapper]]:hidden [&_[data-testid=FIE-compare-button]]:hidden [&_[data-testid=FIE-undo-button]]:hidden [&_[data-testid=FIE-redo-button]]:hidden"
      : "";

  return (
    <div ref={containerRef} className={cn(variant === "inline" ? "relative h-full w-full bg-background" : "fixed inset-0 z-[60] bg-background", inlineTrim)}>
      {/* Our own Save button (Filerobot's is removed) → format/size are locked,
          no save dialog. Positioned over the editor's LTR top-bar (physical left). */}
      <div className="absolute left-4 top-2.5 z-10 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {busy ? "Saving…" : saveLabel}
        </button>
        {originalSize > 0 && variant !== "inline" && (
          <span className="rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground shadow-sm">
            Original: {formatBytes(originalSize)}
          </span>
        )}
      </div>
      {/* Filerobot's own crop-size popup — replaced by the notice below (see cropPx). */}
      <style>{`[data-testid="FIE-feedback-popup"]{display:none!important}`}</style>
      {belowTarget && cropPx && spec.width && spec.height ? (
        <div
          role="status"
          className={cn(
            "absolute bottom-3 left-1/2 z-10 flex max-w-[90%] -translate-x-1/2 items-start gap-2 rounded-md border px-3 py-2 text-xs font-medium shadow-md",
            belowMin
              ? "border-destructive bg-destructive text-destructive-foreground"
              : "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
          )}
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            Crop is {cropPx.w}×{cropPx.h}px of the original
            {belowMin
              ? ` — below the ${spec.minWidth}×${spec.minHeight}px minimum. Widen the crop to save.`
              : ` — it will be enlarged to ${spec.width}×${spec.height} and look softer. Widen the crop for a sharper image.`}
          </span>
        </div>
      ) : null}
      <StyleSheetManager shouldForwardProp={forwardProp}>
        <FilerobotImageEditor
          source={source}
          Crop={cropConfig}
          tabsIds={tabsIds}
          defaultTabId="Adjust"
          defaultToolId="Crop"
          defaultSavedImageName={baseName}
          savingPixelRatio={1}
          previewPixelRatio={previewPixelRatio}
          loadableDesignState={loadableDesignState}
          removeSaveButton
          getCurrentImgDataFnRef={getImgDataRef}
          onModify={onModify}
          theme={theme}
          // Inline, the window already has its close button — a second one inside was noise.
          {...(variant === "inline" ? {} : { onClose })}
        />
      </StyleSheetManager>
    </div>
  );
}
