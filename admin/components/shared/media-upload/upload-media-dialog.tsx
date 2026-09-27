"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MediaType } from "@prisma/client";
import { ImagePlus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MEDIA_SPECS, getMediaSpec, requiresCrop } from "@/lib/media/media-specs";
import { uploadImageToBunny } from "@/lib/media/upload-image-to-bunny";
import { createMedia } from "@/lib/media/create-media";
import { findAltClash } from "@/lib/media/find-alt-clash";
import { altToFileBase } from "@modonty/shared/lib/seo/media/alt-to-filename";
import { ImageEditorModal } from "./image-editor-modal";

/** What the window was opened for: one client and one role, both known before it opens. */
export interface UploadTarget {
  clientId: string;
  clientName: string;
  role: MediaType;
  /** What the window says it is for, when that is not the client (an article title). */
  contextLabel?: string;
  /** The record the file will be linked to, when it is not the client (an article id). */
  refId?: string;
  /** The file this upload replaces (a filled slot) — it goes after linking, so its alt is free. */
  replacesId?: string;
}

interface UploadMediaDialogProps {
  target: UploadTarget | null;
  onOpenChange: (open: boolean) => void;
  /**
   * Links the saved file to where it belongs (the client's logo field, its cover…). Passed in
   * by the page, because only the page knows its owner's actions — this window is shared.
   * `note` is added to the success message (e.g. «Previous image removed»).
   */
  link?: (mediaId: string, target: UploadTarget) => Promise<{ linked: boolean; note?: string }>;
}

/**
 * pick → (crop | preview) → saving. The alt text is written in the second step, WITH the image
 * on screen — you describe what you see (Khalid, 27 Sep 2026: «الالت… بعد الصورة»). Free-ratio
 * roles used to save the moment a file was picked, so their alt had to be typed blind first.
 */
type Step = "pick" | "crop" | "preview" | "saving";

/**
 * The largest crop a fixed-ratio role can take from this file, in the file's own pixels — or
 * null when the browser cannot read it. Checked when the file is picked: the editor scales every
 * export up to the role's size, so a 200×200 logo left it as a blurry 500×500 and no guard
 * after the crop could tell (measured 27 Sep 2026 — it saved twice).
 */
async function largestCrop(file: File, ratio: number): Promise<{ w: number; h: number; srcW: number; srcH: number } | null> {
  try {
    const bmp = await createImageBitmap(file);
    const srcW = bmp.width, srcH = bmp.height;
    bmp.close();
    const w = Math.min(srcW, Math.floor(srcH * ratio));
    return { w, h: Math.floor(w / ratio), srcW, srcH };
  } catch {
    return null;
  }
}

/**
 * The alt text the window starts with — the reader-facing name of what the image shows, in
 * Arabic because it lands on modonty's pages. An article image starts from the article title.
 */
function defaultAlt(t: UploadTarget): string {
  if (t.refId) return t.contextLabel ?? "";
  if (t.role === "LOGO") return `شعار ${t.clientName}`;
  if (t.role === "HERO" || t.role === "HERO_MOBILE") return `غلاف ${t.clientName}`;
  if (t.role === "CLIENT_MINI") return t.clientName;
  // Any other image is described from what it shows — the window now puts the field beside the
  // picture, and a prefilled owner name («مدونتي») describes none of them.
  return "";
}

/**
 * Upload in place (Khalid, 26 Sep 2026): the old path left the page three times and asked for
 * two saves. Here: pick → crop inside this window → ONE save that uploads, records and links,
 * then the window closes and the page refreshes under it. Same crop tool and the same three
 * server steps as the upload page — no second pipeline.
 */
export function UploadMediaDialog({ target, onOpenChange, link }: UploadMediaDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("pick");
  const [source, setSource] = useState<{ url: string; name: string; size: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [alt, setAlt] = useState("");
  const [pending, setPending] = useState<File | null>(null);
  const [clash, setClash] = useState<{ filename: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const spec = target ? getMediaSpec(target.role) : null;
  // An article's featured image needs alt text — the same rule the article editor enforces
  // (article-validation.ts), so the shortcut from Articles › Media cannot skip it.
  const altRequired = !!target?.refId;
  const altMissing = altRequired && !alt.trim();

  // A second file of this client with the same alt: SEO Images refuses that on save, and the
  // name derives from the alt — so it is caught here, while typing (the save re-checks).
  useEffect(() => {
    setClash(null);
    const text = alt.trim();
    if (!target || !text) return;
    let live = true;
    const t = setTimeout(() => {
      findAltClash({ clientId: target.clientId, altText: text, ignoreId: target.replacesId })
        .then((c) => { if (live) setClash(c); })
        .catch(() => {});
    }, 350);
    return () => { live = false; clearTimeout(t); };
  }, [alt, target]);

  // Fresh window every time it opens; free the object URL when it closes.
  useEffect(() => {
    if (target) { setStep("pick"); setAlt(defaultAlt(target)); setPending(null); }
    return () => setSource((s) => { if (s) URL.revokeObjectURL(s.url); return null; });
  }, [target]);

  const close = () => { if (step !== "saving") onOpenChange(false); };

  const save = useCallback(async (file: File) => {
    if (!target) return;
    if (altMissing) {
      toast({ title: "Alt text is required", description: "Describe the image before saving.", variant: "destructive" });
      return;
    }
    const back: Step = source ? (requiresCrop(target.role) ? "crop" : "preview") : "pick";
    setStep("saving");
    try {
      const dup = alt.trim()
        ? await findAltClash({ clientId: target.clientId, altText: alt.trim(), ignoreId: target.replacesId })
        : null;
      if (dup) {
        setClash(dup);
        setStep(back);
        toast({ title: "Alt text already used", description: `«${dup.filename}» has the same description — say what is different in this one.`, variant: "destructive" });
        return;
      }
      // The file is named from its alt text at upload, the same derivation SEO Images runs on
      // save (Khalid, 27 Sep 2026: «اسم الملف بيتعمل من الالت تكست… مره واحده»). Named right
      // the first time, SEO Images finds it already matches and never renames it — no second
      // move on Bunny, no URL change later. No usable alt → the picked file's own name.
      const base = altToFileBase(alt);
      const filename = base ? base + (file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? ".webp") : file.name;
      const fd = new FormData();
      fd.append("file", file);
      fd.append("filename", filename);
      fd.append("type", target.role);
      fd.append("scope", "CLIENT");
      fd.append("clientId", target.clientId);
      const up = await uploadImageToBunny(fd);
      if (!up.success || !up.url) throw new Error(up.error || "Upload to storage failed");

      const rec = await createMedia({
        filename,
        url: up.url,
        bunnyUrl: up.url,
        blurDataURL: up.blurDataURL ?? null,
        mimeType: file.type,
        clientId: target.clientId,
        scope: "CLIENT",
        type: target.role,
        fileSize: file.size,
        width: up.width || 0,
        height: up.height || 0,
        encodingFormat: file.type || undefined,
        altText: alt.trim(),
        credit: "مدونتي",
        license: "All Rights Reserved",
      });
      if (!rec.success || !rec.media) throw new Error(rec.error || "Saving the file failed");

      const result = link ? await link(rec.media.id, target) : { linked: false };
      const label = MEDIA_SPECS[target.role].label;
      toast({
        title: result.linked ? `${label} saved for ${target.contextLabel ?? target.clientName}` : "Saved to the library",
        description: result.linked
          ? ["Uploaded and linked.", result.note].filter(Boolean).join(" ")
          : [`${filename} is in ${target.clientName}'s files.`, result.note].filter(Boolean).join(" "),
        variant: "success",
      });
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      setStep(back);
      toast({ title: "Upload failed", description: e instanceof Error ? e.message : "Try again.", variant: "destructive" });
    }
  }, [target, link, toast, onOpenChange, router, source, alt, altMissing]);

  const takeFile = async (file: File | undefined) => {
    if (!file || !target) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Not an image", description: "Choose a PNG, JPG or WebP file.", variant: "destructive" });
      return;
    }
    const role = MEDIA_SPECS[target.role];
    if (role.ratio !== null) {
      const fit = await largestCrop(file, role.ratio);
      if (fit && (fit.w < role.minWidth || fit.h < role.minHeight)) {
        toast({
          title: "Image too small",
          // English like the rest of the admin: Arabic inside the LTR toast scrambled the numbers.
          description: `It is ${fit.srcW}×${fit.srcH}px, so the largest ${role.ratioLabel} crop is ${fit.w}×${fit.h}px. ${role.label} needs at least ${role.minWidth}×${role.minHeight}px — choose a larger image.`,
          variant: "destructive",
        });
        return;
      }
    }
    setSource({ url: URL.createObjectURL(file), name: file.name, size: file.size });
    if (requiresCrop(target.role)) {
      setStep("crop");
    } else {
      setPending(file);
      setStep("preview");
    }
  };

  const withCrop = !!target && requiresCrop(target.role);
  const cropping = !!source && withCrop && (step === "crop" || step === "saving");
  const previewing = !!source && !withCrop && (step === "preview" || step === "saving");
  const blocked = altMissing || !!clash;

  return (
    <Dialog open={!!target} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent
        className={cn("gap-0 p-0 overflow-hidden", cropping ? "max-w-[min(960px,95vw)]" : "max-w-lg")}
        onInteractOutside={(e) => { if (step !== "pick") e.preventDefault(); }}
      >
        <DialogHeader className="border-b px-5 py-3 text-start">
          <DialogTitle className="text-base">
            {spec?.label} · {target?.contextLabel ?? target?.clientName}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {spec?.width ? `${spec.width}×${spec.height} · ${spec.ratioLabel} · ${spec.formats}` : spec?.formats}
          </DialogDescription>
        </DialogHeader>

        {step !== "pick" && (
        <>
        <div className="space-y-1 border-b px-5 py-2.5">
        <div className="flex items-center gap-3">
          <Label htmlFor="upload-alt" className="shrink-0 text-xs">
            Alt text{altRequired ? <span className="text-destructive"> *</span> : null}
          </Label>
          <Input
            id="upload-alt"
            dir="auto"
            autoFocus
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            disabled={step === "saving"}
            aria-required={altRequired}
            aria-invalid={altMissing || !!clash}
            aria-describedby={clash ? "upload-alt-clash" : undefined}
            placeholder="Describe what the image shows — read by Google and screen readers"
            className="h-8 text-sm"
          />
        </div>
        {/* One block with the field: the file name it produces, or why it cannot be used. */}
        {clash ? (
          <p id="upload-alt-clash" role="alert" className="text-[11px] font-medium text-destructive" dir="auto">
            Already used by «{clash.filename}» — describe what is different in this image.
          </p>
        ) : altToFileBase(alt) ? (
          <p className="truncate text-[11px] text-muted-foreground" dir="auto" title={altToFileBase(alt) ?? undefined}>
            {/* No font-mono: a monospace face breaks Arabic letter joining (مد ونـتي). */}
            File name: <span className="font-medium text-foreground/80">{altToFileBase(alt)}</span>
          </p>
        ) : null}
        </div>
        </>
        )}

        {step === "pick" && (
          <div className="p-5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); void takeFile(e.dataTransfer.files?.[0]); }}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40",
              )}
            >
              <ImagePlus className="h-8 w-8 text-muted-foreground" aria-hidden />
              <span className="text-sm font-medium">Drop the image here, or click to choose</span>
              <span className="text-xs text-muted-foreground">PNG · JPG · WebP</span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => { void takeFile(e.target.files?.[0]); e.target.value = ""; }}
            />
          </div>
        )}

        {cropping && source && target && (
          // Sized to the screen, not a fixed 620px: header + alt block ≈ 11rem, so the window
          // never runs past the bottom edge (it did — 622px in a 619px view, 27 Sep 2026).
          <div className="h-[min(600px,calc(100dvh-11rem))]">
            <ImageEditorModal
              variant="inline"
              source={source.url}
              mediaType={target.role}
              fileName={source.name.replace(/\.[^.]+$/, "") + ".webp"}
              originalSize={source.size}
              saveLabel="Save"
              busy={step === "saving"}
              onSave={(file) => void save(file)}
              onClose={close}
            />
          </div>
        )}

        {previewing && source && pending && (
          <div className="space-y-3 p-5">
            <div className="flex max-h-[55vh] min-h-40 items-center justify-center overflow-hidden rounded-md bg-muted/40">
              {/* eslint-disable-next-line @next/next/no-img-element -- a local object URL, before upload */}
              <img src={source.url} alt="" className="max-h-[55vh] w-auto object-contain" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={step === "saving"}
                onClick={() => { URL.revokeObjectURL(source.url); setSource(null); setPending(null); setStep("pick"); }}
              >
                Choose another
              </Button>
              <Button type="button" size="sm" disabled={step === "saving" || blocked} onClick={() => void save(pending)}>
                {step === "saving" ? <><Loader2 className="me-1.5 h-4 w-4 animate-spin" />Saving…</> : "Save"}
              </Button>
            </div>
          </div>
        )}

        {step === "saving" && !source && (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Saving…
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
