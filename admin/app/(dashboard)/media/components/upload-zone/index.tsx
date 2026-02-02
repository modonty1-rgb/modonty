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

  return (
    <div className="space-y-6">
      {/* Client Selector */}
      <ClientSelector
        clients={clients}
        clientId={clientId}
        onClientChange={setClientId}
        isLoading={isLoadingClients}
      />

      {/* Preview/Drop Zone and SEO Form - Unified */}
      {files.length > 0 &&
        files.some(
          (f) =>
            f.status !== "saved" &&
            savingFileId !== f.id &&
            (f.status === "pending" ||
              f.status === "success" ||
              (f.status === "error" &&
                !f.error?.includes("File type") &&
                !f.error?.includes("File size")))
        ) && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold mb-2">SEO Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Please provide essential SEO metadata. Alt text is required for SEO and accessibility.
                  </p>
                </div>

                {files
                  .filter(
                    (f) =>
                      f.status !== "saved" &&
                      savingFileId !== f.id &&
                      (f.status === "pending" ||
                        f.status === "success" ||
                        (f.status === "error" &&
                          !f.error?.includes("File type") &&
                          !f.error?.includes("File size")))
                  )
                  .map((uploadFile) => {
                    return (
                      <div key={uploadFile.id} className="space-y-6">
                        {/* Preview/Drop Zone - Unified Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Preview/Drop Zone - Left Column */}
                          <FilePreview
                            file={uploadFile.file}
                            previewUrl={uploadFile.previewUrl}
                            onReplace={() => {
                              if (!isDisabled) {
                                fileInputRef.current?.click();
                              }
                            }}
                            onFileInput={handleFileInput}
                            isDisabled={isDisabled}
                            isDragging={isDragging}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            fileInputRef={fileInputRef}
                          />

                          {/* Essential SEO Fields - Right Column */}
                          <SEOForm
                            formData={seoForm}
                            onChange={setSeoForm}
                            isDisabled={isUploading && savingFileId === uploadFile.id}
                          />
                        </div>

                        {/* Note about additional fields */}
                        {uploadFile.status !== "saved" && (
                          <div className="rounded-lg bg-muted/50 border p-4">
                            <p className="text-sm text-muted-foreground">
                              <strong>Note:</strong> Additional fields (Caption, Credit, License, Creator, Location, etc.) can be edited later from the media library.
                            </p>
                          </div>
                        )}

                        {/* Save Button */}
                        <div className="pt-4 border-t">
                          <Button
                            onClick={() => handleSaveMedia(uploadFile)}
                            className="w-full"
                            disabled={
                              !seoForm.altText.trim() ||
                              savingFileId === uploadFile.id ||
                              uploadFile.status === "uploading"
                            }
                          >
                            Save to Media Library
                          </Button>
                          {!seoForm.altText.trim() && savingFileId !== uploadFile.id && (
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                              Alt text is required to save
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Progress Bar Card - Show when saving */}
      {files.length > 0 && savingFileId && files.some((f) => savingFileId === f.id) && (
        <UploadProgress file={files.find((f) => savingFileId === f.id)!} />
      )}

      {/* Success Message Card - Show when saved */}
      {files.length > 0 && files.some((f) => f.status === "saved") && (
        <UploadSuccess onAddNew={handleAddNew} initialClientId={props.initialClientId} />
      )}

      {/* Drop Zone - Show when no file selected */}
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
