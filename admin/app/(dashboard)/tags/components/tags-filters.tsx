"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { X, ChevronDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function TagsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [localFilters, setLocalFilters] = useState({
    hasArticles: searchParams.get("hasArticles") || "",
    createdFrom: searchParams.get("createdFrom") || "",
    createdTo: searchParams.get("createdTo") || "",
    minArticleCount: searchParams.get("minArticleCount") || "",
    maxArticleCount: searchParams.get("maxArticleCount") || "",
  });

  useEffect(() => {
    setLocalFilters({
      hasArticles: searchParams.get("hasArticles") || "",
      createdFrom: searchParams.get("createdFrom") || "",
      createdTo: searchParams.get("createdTo") || "",
      minArticleCount: searchParams.get("minArticleCount") || "",
      maxArticleCount: searchParams.get("maxArticleCount") || "",
    });
  }, [searchParams]);

  const updateLocalFilter = (key: string, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? "" : value,
    }));
  };

  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams();

      if (localFilters.hasArticles) params.set("hasArticles", localFilters.hasArticles);
      if (localFilters.createdFrom) params.set("createdFrom", localFilters.createdFrom);
      if (localFilters.createdTo) params.set("createdTo", localFilters.createdTo);
      if (localFilters.minArticleCount) params.set("minArticleCount", localFilters.minArticleCount);
      if (localFilters.maxArticleCount) params.set("maxArticleCount", localFilters.maxArticleCount);

      const queryString = params.toString();
      router.push(queryString ? `/tags?${queryString}` : "/tags");
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      setLocalFilters({
        hasArticles: "",
        createdFrom: "",
        createdTo: "",
        minArticleCount: "",
        maxArticleCount: "",
      });
      router.push("/tags");
    });
  };

  const hasActiveFilters =
    localFilters.hasArticles ||
    localFilters.createdFrom ||
    localFilters.createdTo ||
    localFilters.minArticleCount ||
    localFilters.maxArticleCount;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg bg-card">
      <div className="flex items-center justify-between p-4">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto font-semibold">
            <h3 className="text-sm">Filters</h3>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "transform rotate-180"
              )}
            />
          </Button>
        </CollapsibleTrigger>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} disabled={isPending}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <CollapsibleContent className="px-4 pb-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hasArticles">Has Articles</Label>
              <Select
                value={localFilters.hasArticles || "all"}
                onValueChange={(value) => updateLocalFilter("hasArticles", value)}
                disabled={isPending}
              >
                <SelectTrigger id="hasArticles">
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  <SelectItem value="yes">With articles</SelectItem>
                  <SelectItem value="no">Without articles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minArticleCount">Min Articles</Label>
              <Input
                id="minArticleCount"
                type="number"
                min="0"
                value={localFilters.minArticleCount}
                onChange={(e) => updateLocalFilter("minArticleCount", e.target.value)}
                disabled={isPending}
                placeholder="Minimum"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxArticleCount">Max Articles</Label>
              <Input
                id="maxArticleCount"
                type="number"
                min="0"
                value={localFilters.maxArticleCount}
                onChange={(e) => updateLocalFilter("maxArticleCount", e.target.value)}
                disabled={isPending}
                placeholder="Maximum"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="createdFrom">Created From</Label>
              <Input
                id="createdFrom"
                type="date"
                value={localFilters.createdFrom}
                onChange={(e) => updateLocalFilter("createdFrom", e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="createdTo">Created To</Label>
              <Input
                id="createdTo"
                type="date"
                value={localFilters.createdTo}
                onChange={(e) => updateLocalFilter("createdTo", e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              onClick={applyFilters}
              disabled={isPending}
              size="sm"
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply Filters"
              )}
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
