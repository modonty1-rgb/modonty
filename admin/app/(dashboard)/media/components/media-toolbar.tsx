"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { List, Upload, Search, X, LayoutGrid, Grid2x2 } from "lucide-react";
import Link from "next/link";

interface MediaToolbarProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  gridSize: "compact" | "standard";
  onGridSizeChange: (size: "compact" | "standard") => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
}

export function MediaToolbar({
  viewMode,
  onViewModeChange,
  gridSize,
  onGridSizeChange,
  sortBy,
  onSortChange,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
}: MediaToolbarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSearchSubmit(); }}
          placeholder="Search by filename, alt text, or title..."
          className="ps-9 h-9 text-sm"
        />
        {searchValue && (
          <button
            type="button"
            onClick={onSearchClear}
            className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-0.5 border rounded-md p-0.5">
        <Button
          variant={viewMode === "grid" && gridSize === "standard" ? "default" : "ghost"}
          size="sm"
          onClick={() => { onViewModeChange("grid"); onGridSizeChange("standard"); }}
          className="h-8 w-8 p-0"
          title="Standard Grid"
        >
          <Grid2x2 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "grid" && gridSize === "compact" ? "default" : "ghost"}
          size="sm"
          onClick={() => { onViewModeChange("grid"); onGridSizeChange("compact"); }}
          className="h-8 w-8 p-0"
          title="Compact Grid"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("list")}
          className="h-8 w-8 p-0"
          title="List View"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Sort */}
      {mounted ? (
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px] h-9">
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
        <div className="w-[140px] h-9 rounded-md border border-input bg-background flex items-center px-3 text-sm">
          <span className="text-muted-foreground">Sort by</span>
        </div>
      )}

      {/* Upload Button */}
      <Link href="/media/upload">
        <Button size="sm" className="h-9 gap-1.5">
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </Link>
    </div>
  );
}
