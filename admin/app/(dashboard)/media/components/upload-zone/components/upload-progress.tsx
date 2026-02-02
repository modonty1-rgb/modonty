"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import type { UploadFile } from "../types";

interface UploadProgressProps {
  file: UploadFile;
}

export function UploadProgress({ file }: UploadProgressProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-sm font-medium">Saving to media library...</p>
          </div>
          <Progress value={file.progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {file.progress}% complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
