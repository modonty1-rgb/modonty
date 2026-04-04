"use client";

import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUploadZone } from "./hooks/use-upload-zone";
import { ClientSelector } from "./components/client-selector";
import { FileDropZone } from "./components/file-drop-zone";
import { FilePreview } from "./components/file-preview";
import { SEOForm } from "./components/seo-form";
import { UploadProgress } from "./components/upload-progress";
import { UploadSuccess } from "./components/upload-success";
import type { UploadZoneProps } from "./types";
import { Save, Info } from "lucide-react";

export function UploadZone(props: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    clientId,
    setClientId,
    clients,
    files,
    isDragging,
    isLoadingClients,
    savingFileId,
    seoForm,
    setSeoForm,
    isUploading,
    isDisabled,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    handleAddNew,
    handleSaveMedia,
  } = useUploadZone(props);

  const hasActiveFile = files.length > 0 && files.some(
    (f) =>
      f.status !== "saved" &&
      savingFileId !== f.id &&
      (f.status === "pending" ||
        f.status === "success" ||
        (f.status === "error" &&
          !f.error?.includes("File type") &&
          !f.error?.includes("File size")))
  );

  const activeFile = hasActiveFile
    ? files.find(
        (f) =>
          f.status !== "saved" &&
          savingFileId !== f.id &&
          (f.status === "pending" ||
            f.status === "success" ||
            (f.status === "error" &&
              !f.error?.includes("File type") &&
              !f.error?.includes("File size")))
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Client Selector */}
      <ClientSelector
        clients={clients}
        clientId={clientId}
        onClientChange={setClientId}
        isLoading={isLoadingClients}
      />

      {/* 3-Column Grid: Preview (left) | SEO Fields (center) | Actions (right) */}
      {activeFile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 — File Preview */}
          <Card>
            <CardContent className="pt-6">
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
            </CardContent>
          </Card>

          {/* Column 2 — SEO Information */}
          <Card>
            <CardContent className="pt-6">
              <SEOForm
                formData={seoForm}
                onChange={setSeoForm}
                isDisabled={isUploading && savingFileId === activeFile.id}
              />
            </CardContent>
          </Card>

          {/* Column 3 — Actions (sticky) */}
          <div className="space-y-4">
            <div className="lg:sticky lg:top-4 space-y-4">
              {/* Info Note */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-2">
                    <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Additional fields (Caption, Credit, License, Location) can be edited after saving from the media library.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6 space-y-3">
                  <Button
                    onClick={() => handleSaveMedia(activeFile)}
                    className="w-full gap-1.5"
                    disabled={
                      !seoForm.altText.trim() ||
                      savingFileId === activeFile.id ||
                      activeFile.status === "uploading"
                    }
                  >
                    <Save className="h-4 w-4" />
                    Save to Media Library
                  </Button>
                  {!seoForm.altText.trim() && savingFileId !== activeFile.id && (
                    <p className="text-xs text-muted-foreground text-center">
                      Alt text is required to save
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {files.length > 0 && savingFileId && files.some((f) => savingFileId === f.id) && (
        <UploadProgress file={files.find((f) => savingFileId === f.id)!} />
      )}

      {/* Success Message */}
      {files.length > 0 && files.some((f) => f.status === "saved") && (
        <UploadSuccess onAddNew={handleAddNew} initialClientId={props.initialClientId} />
      )}

      {/* Drop Zone — when no file selected */}
      {files.length === 0 && (
        <FileDropZone
          onFilesSelected={handleFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          isDisabled={isDisabled}
          isDragging={isDragging}
        />
      )}
    </div>
  );
}
