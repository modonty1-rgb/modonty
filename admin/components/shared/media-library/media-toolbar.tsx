"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { List, Upload, Search, X, LayoutGrid, Grid2x2, FolderTree } from "lucide-react";
import Link from "next/link";

interface MediaToolbarProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  gridSize: "compact" | "standard";
  onGridSizeChange: (size: "compact" | "standard") => void;
  groupByClient: boolean;
  onGroupByClientChange: (value: boolean) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
  uploadHref?: string;
  /** Page-specific controls placed after the search (Clients › Media: client + usage). */
  extra?: ReactNode;
  showGroup?: boolean;
  /** Replaces the Upload link — Clients › Media opens its upload window instead of navigating. */
  uploadSlot?: ReactNode;
}

export function MediaToolbar({
  viewMode,
  onViewModeChange,
  gridSize,
  onGridSizeChange,
  groupByClient,
  onGroupByClientChange,
  sortBy,
  onSortChange,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  uploadHref = "/media/upload",
  extra,
  showGroup = true,
  uploadSlot,
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
          placeholder="ابحث باسم الملف أو النص البديل أو العنوان…"
          className="ps-9 h-9 text-sm"
        />
        {searchValue && (
          <button
            type="button"
            onClick={onSearchClear}
            aria-label="امسح البحث"
            className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {extra}

      {/* View Toggle */}
      <div className="flex items-center gap-0.5 border rounded-md p-0.5">
        <Button
          variant={viewMode === "grid" && gridSize === "standard" ? "default" : "ghost"}
          size="sm"
          onClick={() => { onViewModeChange("grid"); onGridSizeChange("standard"); }}
          className="h-8 w-8 p-0"
          title="شبكة عادية"
        >
          <Grid2x2 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "grid" && gridSize === "compact" ? "default" : "ghost"}
          size="sm"
          onClick={() => { onViewModeChange("grid"); onGridSizeChange("compact"); }}
          className="h-8 w-8 p-0"
          title="شبكة مضغوطة"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("list")}
          className="h-8 w-8 p-0"
          title="قائمة"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Group by client toggle */}
      {showGroup && (
      <Button
        variant={groupByClient ? "default" : "outline"}
        size="sm"
        onClick={() => onGroupByClientChange(!groupByClient)}
        className="h-9 gap-1.5"
        title="جمّع حسب العميل"
      >
        <FolderTree className="h-4 w-4" />
        <span className="hidden sm:inline">تجميع</span>
      </Button>
      )}

      {/* Sort */}
      {mounted ? (
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="الترتيب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">الأحدث أولاً</SelectItem>
            <SelectItem value="oldest">الأقدم أولاً</SelectItem>
            <SelectItem value="name-asc">الاسم (أ–ي)</SelectItem>
            <SelectItem value="name-desc">الاسم (ي–أ)</SelectItem>
            <SelectItem value="size-asc">الحجم (الأصغر)</SelectItem>
            <SelectItem value="size-desc">الحجم (الأكبر)</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="w-[140px] h-9 rounded-md border border-input bg-background flex items-center px-3 text-sm">
          <span className="text-muted-foreground">الترتيب</span>
        </div>
      )}

      {/* Upload Button */}
      {uploadSlot ?? (
      <Link href={uploadHref}>
        <Button size="sm" className="h-9 gap-1.5">
          <Upload className="h-4 w-4" />
          ارفع
        </Button>
      </Link>
      )}
    </div>
  );
}
