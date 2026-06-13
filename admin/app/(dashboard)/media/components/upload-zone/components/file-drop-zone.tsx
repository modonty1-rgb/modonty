"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";

interface FileDropZoneProps {
  onFilesSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDisabled: boolean;
  isDragging: boolean;
  /** Optional spec hint shown in the dropzone, e.g. "Crop to 6:1 · 2400×400". */
  specHint?: string;
}

export function FileDropZone({
  onFilesSelected,
  onDragOver,
  onDragLeave,
  onDrop,
  isDisabled,
  isDragging,
  specHint,
}: FileDropZoneProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            flex min-h-[300px] flex-col items-center justify-center
            ${isDragging && !isDisabled ? "border-primary bg-primary/5" : "border-border"}
            ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"}
          `}
        >
          <input
            type="file"
            id="file-upload"
            onChange={onFilesSelected}
            disabled={isDisabled}
            className="hidden"
            accept="image/*,video/*"
          />
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center gap-4 ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
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
                {isDragging ? "Drop file here" : "Drag and drop file here"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
              {specHint && (
                <p className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {specHint}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Supported: Images (JPG, PNG, GIF, WebP, SVG), Videos (MP4, WebM)
                <br />
                Max sizes: Images 10MB, Videos 100MB
              </p>
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
