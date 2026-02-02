"use client";

import { Upload } from "lucide-react";

interface FilePreviewProps {
  file: File;
  previewUrl?: string;
  onReplace: () => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled: boolean;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function FilePreview({
  file,
  previewUrl,
  onReplace,
  onFileInput,
  isDisabled,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  fileInputRef,
}: FilePreviewProps) {
  const isImage = file.type.startsWith("image/");

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Preview</label>
      <div
        onDragOver={!isDisabled ? onDragOver : undefined}
        onDragLeave={!isDisabled ? onDragLeave : undefined}
        onDrop={!isDisabled ? onDrop : undefined}
        onClick={() => {
          if (!isDisabled) {
            onReplace();
          }
        }}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors min-h-[300px] flex flex-col items-center justify-center
          ${isDragging && !isDisabled ? "border-primary bg-primary/5" : "border-border"}
          ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="file-upload-preview"
          onChange={onFileInput}
          disabled={isDisabled}
          className="hidden"
          accept="image/*,video/*"
        />
        {isImage && previewUrl ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Selected image"
              className="max-w-full h-auto max-h-80 mx-auto rounded"
            />
            {!isDisabled && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity bg-background/90 px-4 py-2 rounded-md border">
                  <p className="text-sm font-medium">Click to replace</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className={`
                rounded-full p-4
                ${isDragging ? "bg-primary/10" : "bg-muted"}
              `}
            >
              <Upload className={`h-8 w-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="space-y-2">
              <p className="text-base font-medium">
                {isDragging ? "Drop file here" : "Click or drag to upload"}
              </p>
              <p className="text-xs text-muted-foreground">
                Supported: Images (JPG, PNG, GIF, WebP, SVG), Videos (MP4, WebM)
                <br />
                Max sizes: Images 10MB, Videos 100MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
