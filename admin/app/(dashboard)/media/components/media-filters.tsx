"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { MediaType } from "@prisma/client";

interface MediaFiltersProps {
  clients: Array<{ id: string; name: string }>;
  defaultClientId?: string;
}

export function MediaFilters({ clients, defaultClientId }: MediaFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clientId, setClientId] = useState(searchParams.get("clientId") || defaultClientId || "all");
  const [mimeType, setMimeType] = useState(searchParams.get("mimeType") || "all");
  const [mediaType, setMediaType] = useState(searchParams.get("type") || "all");
  const [used, setUsed] = useState(searchParams.get("used") || "all");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== "all") {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    router.push(`/media?${newParams.toString()}`);
  };

  const handleClientChange = (value: string) => {
    setClientId(value);
    updateURL({ clientId: value, page: "1" });
  };

  const handleMimeTypeChange = (value: string) => {
    setMimeType(value);
    updateURL({ mimeType: value, page: "1" });
  };

  const handleMediaTypeChange = (value: string) => {
    setMediaType(value);
    updateURL({ type: value, page: "1" });
  };

  const handleUsedChange = (value: string) => {
    setUsed(value);
    updateURL({ used: value, page: "1" });
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    updateURL({ dateFrom: value, page: "1" });
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    updateURL({ dateTo: value, page: "1" });
  };

  const clearFilters = () => {
    setClientId("all");
    setMimeType("all");
    setMediaType("all");
    setUsed("all");
    setDateFrom("");
    setDateTo("");
    router.push("/media");
  };

  const activeCount = [clientId !== "all", mimeType !== "all", mediaType !== "all", used !== "all", dateFrom !== "", dateTo !== ""].filter(Boolean).length;

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeCount > 0 && (
              <span className="flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {activeCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Filters</h4>
              {activeCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-muted-foreground px-2">
                  <X className="h-3 w-3 me-1" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Client */}
            <div className="space-y-1.5">
              <Label className="text-xs">Client</Label>
              <Select value={clientId} onValueChange={handleClientChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Type */}
            <div className="space-y-1.5">
              <Label className="text-xs">File Type</Label>
              <Select value={mimeType} onValueChange={handleMimeTypeChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All File Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All File Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Media Type */}
            <div className="space-y-1.5">
              <Label className="text-xs">Media Type</Label>
              <Select value={mediaType} onValueChange={handleMediaTypeChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Media Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Media Types</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="LOGO">Logo</SelectItem>
                  <SelectItem value="POST">Post</SelectItem>
                  <SelectItem value="OGIMAGE">OG Image</SelectItem>
                  <SelectItem value="TWITTER_IMAGE">Twitter Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Usage */}
            <div className="space-y-1.5">
              <Label className="text-xs">Usage</Label>
              <Select value={used} onValueChange={handleUsedChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="unused">Unused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  max={dateTo || undefined}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  min={dateFrom || undefined}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
