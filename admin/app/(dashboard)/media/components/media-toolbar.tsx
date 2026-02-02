"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid3x3, List, Upload, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

interface MediaToolbarProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  selectedCount: number;
  onBulkDelete?: () => void;
  isDeleting?: boolean;
}

export function MediaToolbar({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  selectedCount,
  onBulkDelete,
  isDeleting = false,
}: MediaToolbarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        {/* View Toggle */}
        <div className="flex items-center gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="h-8 w-8 p-0"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Sort */}
        {mounted ? (
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="size-asc">Size (Smallest)</SelectItem>
              <SelectItem value="size-desc">Size (Largest)</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="w-[180px] h-10 rounded-md border border-input bg-background flex items-center justify-between px-3 py-2 text-sm">
            <span className="text-muted-foreground">Sort by</span>
          </div>
        )}

        {/* Selected Count */}
        {selectedCount > 0 && (
          <div className="text-sm text-muted-foreground">
            {selectedCount} selected
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Bulk Actions */}
        {selectedCount > 0 && onBulkDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete ({selectedCount})
              </>
            )}
          </Button>
        )}

        {/* Upload Button */}
        <Link href="/media/upload">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </Link>
      </div>
    </div>
  );
}
