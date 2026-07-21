"use client";

import { useRef } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Crop, Check, Pencil } from "lucide-react";

import { getMediaSpec, requiresCrop, type MediaSpec } from "@/lib/media/media-specs";
import { formatBytes } from "@modonty/database/lib/utils";

import { useUploadZone } from "./hooks/use-upload-zone";
import { ClientSelector } from "./components/client-selector";
import { MediaTypeSelector } from "./components/media-type-selector";
import { FileDropZone } from "./components/file-drop-zone";
import { FilePreview } from "./components/file-preview";
import { UploadProgress } from "./components/upload-progress";
import { UploadSuccess } from "./components/upload-success";
import { ImageEditorModal } from "./components/image-editor-modal";
import type { UploadZoneProps } from "./types";

function StepHeader({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {n}
      </span>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold leading-tight">{title}</h2>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

/** Collapsed summary of a completed step, with an inline "Change" affordance. */
function SummaryChip({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 py-1 ps-3 pe-1.5">
      <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
      <span className="text-xs leading-none">
        <span className="text-muted-foreground">{label}</span>{" "}
        <span className="font-semibold">{value}</span>
      </span>
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Pencil className="h-3 w-3" />
        Change
      </button>
    </div>
  );
}

function SpecBanner({ spec }: { spec: MediaSpec }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
      <div className="flex items-center gap-1.5">
        <Crop className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{spec.label}</span>
      </div>
      <code className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
        {spec.width && spec.height ? `${spec.width}×${spec.height}` : "Free size"}
      </code>
      <Badge variant="outline" className="border-primary/40 text-[11px] text-primary">
        {spec.ratioLabel}
      </Badge>
      <span className="text-xs text-muted-foreground">{spec.formats}</span>
      {spec.note && (
        <span className="basis-full text-xs font-medium text-amber-600 dark:text-amber-400">
          ⚠️ {spec.note}
        </span>
      )}
    </div>
  );
}

export function UploadZone(props: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    clientId,
    setClientId,
    mediaType,
    clients,
    files,
    editorState,
    originalSize,
    isDragging,
    isLoadingClients,
    savingFileId,
    isUploading,
    isDisabled,
    handleMediaTypeChange,
    handleChangeClient,
    handleChangeRole,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    handleAddNew,
    handleSaveMedia,
    handleEditorSave,
    handleEditorClose,
  } = useUploadZone(props);

  const spec = mediaType ? getMediaSpec(mediaType) : null;
  const needsCrop = mediaType ? requiresCrop(mediaType) : false;
  const isSetupDone = !!clientId && !!mediaType;

  const isActive = (f: (typeof files)[number]) =>
    f.status !== "saved" &&
    savingFileId !== f.id &&
    (f.status === "pending" ||
      f.status === "success" ||
      (f.status === "error" &&
        !f.error?.includes("File type") &&
        !f.error?.includes("File size")));

  const activeFile = files.find(isActive) ?? null;
  const hasSaved = files.some((f) => f.status === "saved");

  const selectedClient = clients.find((c) => c.id === clientId);
  const clientLabel =
    clientId === "none"
      ? "General — all clients"
      : clientId === "modonty"
        ? "Modonty — Platform"
        : selectedClient?.name ?? "Client";

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Full-screen crop editor */}
      {editorState && mediaType && (
        <ImageEditorModal
          source={editorState.source}
          mediaType={mediaType}
          fileName={editorState.fileName}
          originalSize={originalSize}
          onSave={handleEditorSave}
          onClose={handleEditorClose}
        />
      )}

      {/* Summary rail — completed steps collapse here so the form stays minimal */}
      {(clientId || mediaType) && !hasSaved && (
        <div className="flex flex-wrap items-center gap-2">
          {clientId && (
            <SummaryChip
              label="Client"
              value={clientLabel}
              onChange={handleChangeClient}
              disabled={isUploading}
            />
          )}
          {mediaType && spec && (
            <SummaryChip
              label="Role"
              value={`${spec.label} · ${spec.width ? `${spec.width}×${spec.height}` : "Free"} · ${spec.ratioLabel}`}
              onChange={handleChangeRole}
              disabled={isUploading}
            />
          )}
        </div>
      )}

      {/* STEP 1 — Client (only until one is chosen) */}
      {!clientId && (
        <section className="space-y-3">
          <StepHeader n={1} title="Choose client" hint="Who this media belongs to" />
          <ClientSelector
            clients={clients}
            clientId={clientId}
            onClientChange={setClientId}
            isLoading={isLoadingClients}
          />
        </section>
      )}

      {/* STEP 2 — Role (revealed once a client is chosen, hidden once a role is picked) */}
      {clientId && !mediaType && (
        <section className="space-y-3">
          <StepHeader n={2} title="Pick image role" hint="Sets the required crop ratio, size & format" />
          <Card>
            <CardContent className="pt-6">
              <MediaTypeSelector value={mediaType} onChange={handleMediaTypeChange} disabled={isUploading} />
            </CardContent>
          </Card>
        </section>
      )}

      {/* STEP 3 — Upload & crop (the dominant area) */}
      {isSetupDone && !hasSaved && (
        <section className="space-y-3">
          <StepHeader
            n={3}
            title="Upload & crop"
            hint={
              needsCrop
                ? `Crop locked to ${spec?.ratioLabel} — no wrong sizes`
                : "Free size — drop any image"
            }
          />
          {spec && <SpecBanner spec={spec} />}

          {activeFile ? (
            // Single centered column — no SEO form to sit beside the preview anymore,
            // so preview → size → save → hint stack vertically (no empty second card).
            <Card className="mx-auto max-w-2xl">
              <CardContent className="space-y-4 pt-6">
                <FilePreview
                  file={activeFile.file}
                  previewUrl={activeFile.previewUrl}
                  onReplace={() => {
                    if (!isDisabled) fileInputRef.current?.click();
                  }}
                  onFileInput={handleFileInput}
                  isDisabled={isDisabled}
                  isDragging={isDragging}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  fileInputRef={fileInputRef}
                />
                {originalSize > 0 &&
                  (activeFile.file.type === "image/webp" ? (
                    <div className="flex flex-wrap items-center justify-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-xs">
                      <span className="text-muted-foreground">Original {formatBytes(originalSize)}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold">WebP {formatBytes(activeFile.file.size)}</span>
                      {activeFile.file.size < originalSize && (
                        <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                          −{Math.round((1 - activeFile.file.size / originalSize) * 100)}%
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-md bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
                      Size: {formatBytes(activeFile.file.size)}
                    </div>
                  ))}
                <Button
                  onClick={() => handleSaveMedia(activeFile)}
                  className="w-full gap-1.5"
                  disabled={
                    savingFileId === activeFile.id ||
                    activeFile.status === "uploading"
                  }
                >
                  <Save className="h-4 w-4" />
                  Save to Media Library
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  ارفع الصورة فقط — النص البديل والوصف يضيفهما الكاتب لاحقاً في قسم SEO Images
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="mx-auto max-w-2xl">
              <FileDropZone
                onFilesSelected={handleFileInput}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                isDisabled={isDisabled}
                isDragging={isDragging}
                specHint={
                  needsCrop
                    ? `Crop to ${spec?.ratioLabel}${spec?.width ? ` · ${spec.width}×${spec.height}` : ""}`
                    : "Free size"
                }
              />
            </div>
          )}
        </section>
      )}

      {/* Progress */}
      {files.length > 0 && savingFileId && files.some((f) => savingFileId === f.id) && (
        <UploadProgress file={files.find((f) => savingFileId === f.id)!} />
      )}

      {/* Success */}
      {hasSaved && <UploadSuccess onAddNew={handleAddNew} initialClientId={props.initialClientId} />}
    </div>
  );
}
