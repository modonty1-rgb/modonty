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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, RefreshCw, Filter } from "lucide-react";

export function ContactMessagesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [localFilter, setLocalFilter] = useState({
    status: searchParams.get("status") || "",
  });

  useEffect(() => {
    setLocalFilter({
      status: searchParams.get("status") || "",
    });
  }, [searchParams]);

  const updateFilter = (key: string, value: string) => {
    setLocalFilter((prev) => ({
      ...prev,
      [key]: value === "all" ? "" : value,
    }));
  };

  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams();

      if (localFilter.status) params.set("status", localFilter.status);

      const queryString = params.toString();
      router.push(queryString ? `/contact-messages?${queryString}` : "/contact-messages");
      setIsOpen(false);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      setLocalFilter({
        status: "",
      });
      router.push("/contact-messages");
      setIsOpen(false);
    });
  };

  const hasActiveFilters = localFilter.status;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} disabled={isPending}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={localFilter.status || "all"}
              onValueChange={(value) => updateFilter("status", value)}
              disabled={isPending}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
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
      </PopoverContent>
    </Popover>
  );
}
