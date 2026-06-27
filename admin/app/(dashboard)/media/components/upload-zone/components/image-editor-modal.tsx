"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import isPropValid from "@emotion/is-prop-valid";
import { StyleSheetManager } from "styled-components";
import { Loader2, Save } from "lucide-react";
import type { MediaType } from "@prisma/client";
// Type-only import — erased at build, so it does NOT pull the heavy editor
// into the bundle synchronously (the dynamic ssr:false load stays lazy).
import type {
  FilerobotImageEditorConfig,
  getCurrentImgDataFunction,
} from "react-filerobot-image-editor";

import { useToast } from "@/hooks/use-toast";
import { formatBytes } from "@modonty/database/lib/utils";
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
}: ImageEditorModalProps) {
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
  const handleSave = () => {
    const getImgData = getImgDataRef.current;
    if (!getImgData) return;
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
        description: `لازم القص يكون بنسبة ${spec.ratioLabel}.`,
        variant: "destructive",
      });
      hideLoadingSpinner();
      return;
    }
    if (!isResolutionValid(mediaType, w, h)) {
      toast({
        title: "Resolution too low",
        description: `الحد الأدنى ${spec.minWidth}×${spec.minHeight}px — الحالي ${w}×${h}px.`,
        variant: "destructive",
      });
      hideLoadingSpinner();
      return;
    }
    hideLoadingSpinner();
    // Parent clears editor state on save then unmounts this modal.
    onSave(dataURLtoFile(base64, `${baseName}.${outExt}`));
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[60] bg-background">
      {/* Our own Save button (Filerobot's is removed) → format/size are locked,
          no save dialog. Positioned over the editor's LTR top-bar (physical left). */}
      <div className="absolute left-4 top-2.5 z-10 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
        >
          <Save className="h-4 w-4" />
          Save WebP
        </button>
        {originalSize > 0 && (
          <span className="rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground shadow-sm">
            Original: {formatBytes(originalSize)}
          </span>
        )}
      </div>
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
          onClose={onClose}
        />
      </StyleSheetManager>
    </div>
  );
}
