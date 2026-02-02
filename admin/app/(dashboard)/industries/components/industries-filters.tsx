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

export function IndustriesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [localFilters, setLocalFilters] = useState({
    hasClients: searchParams.get("hasClients") || "",
    createdFrom: searchParams.get("createdFrom") || "",
    createdTo: searchParams.get("createdTo") || "",
    minClientCount: searchParams.get("minClientCount") || "",
    maxClientCount: searchParams.get("maxClientCount") || "",
  });

  useEffect(() => {
    setLocalFilters({
      hasClients: searchParams.get("hasClients") || "",
      createdFrom: searchParams.get("createdFrom") || "",
      createdTo: searchParams.get("createdTo") || "",
      minClientCount: searchParams.get("minClientCount") || "",
      maxClientCount: searchParams.get("maxClientCount") || "",
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

      if (localFilters.hasClients) params.set("hasClients", localFilters.hasClients);
      if (localFilters.createdFrom) params.set("createdFrom", localFilters.createdFrom);
      if (localFilters.createdTo) params.set("createdTo", localFilters.createdTo);
      if (localFilters.minClientCount) params.set("minClientCount", localFilters.minClientCount);
      if (localFilters.maxClientCount) params.set("maxClientCount", localFilters.maxClientCount);

      const queryString = params.toString();
      router.push(queryString ? `/industries?${queryString}` : "/industries");
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      setLocalFilters({
        hasClients: "",
        createdFrom: "",
        createdTo: "",
        minClientCount: "",
        maxClientCount: "",
      });
      router.push("/industries");
    });
  };

  const hasActiveFilters =
    localFilters.hasClients ||
    localFilters.createdFrom ||
    localFilters.createdTo ||
    localFilters.minClientCount ||
    localFilters.maxClientCount;

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
              <Label htmlFor="hasClients">Has Clients</Label>
              <Select
                value={localFilters.hasClients || "all"}
                onValueChange={(value) => updateLocalFilter("hasClients", value)}
                disabled={isPending}
              >
                <SelectTrigger id="hasClients">
                  <SelectValue placeholder="All industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All industries</SelectItem>
                  <SelectItem value="yes">With clients</SelectItem>
                  <SelectItem value="no">Without clients</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minClientCount">Min Clients</Label>
              <Input
                id="minClientCount"
                type="number"
                min="0"
                value={localFilters.minClientCount}
                onChange={(e) => updateLocalFilter("minClientCount", e.target.value)}
                disabled={isPending}
                placeholder="Minimum"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxClientCount">Max Clients</Label>
              <Input
                id="maxClientCount"
                type="number"
                min="0"
                value={localFilters.maxClientCount}
                onChange={(e) => updateLocalFilter("maxClientCount", e.target.value)}
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
