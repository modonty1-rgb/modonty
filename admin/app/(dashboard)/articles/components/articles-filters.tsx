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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, RefreshCw, Filter } from "lucide-react";
import { ArticleStatus } from "@prisma/client";
import { getStatusLabel } from "../helpers/status-utils";

interface ArticlesFiltersProps {
  clients: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; name: string }>;
}

export function ArticlesFilters({
  clients,
  categories,
  authors,
}: ArticlesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Local state for filter values
  const [localFilters, setLocalFilters] = useState({
    status: searchParams.get("status") || "",
    clientId: searchParams.get("clientId") || "",
    categoryId: searchParams.get("categoryId") || "",
    authorId: searchParams.get("authorId") || "",
    createdFrom: searchParams.get("createdFrom") || "",
    createdTo: searchParams.get("createdTo") || "",
    publishedFrom: searchParams.get("publishedFrom") || "",
    publishedTo: searchParams.get("publishedTo") || "",
  });

  // Sync local state when URL params change (e.g., from Clear All)
  useEffect(() => {
    setLocalFilters({
      status: searchParams.get("status") || "",
      clientId: searchParams.get("clientId") || "",
      categoryId: searchParams.get("categoryId") || "",
      authorId: searchParams.get("authorId") || "",
      createdFrom: searchParams.get("createdFrom") || "",
      createdTo: searchParams.get("createdTo") || "",
      publishedFrom: searchParams.get("publishedFrom") || "",
      publishedTo: searchParams.get("publishedTo") || "",
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

      if (localFilters.status) params.set("status", localFilters.status);
      if (localFilters.clientId) params.set("clientId", localFilters.clientId);
      if (localFilters.categoryId) params.set("categoryId", localFilters.categoryId);
      if (localFilters.authorId) params.set("authorId", localFilters.authorId);
      if (localFilters.createdFrom) params.set("createdFrom", localFilters.createdFrom);
      if (localFilters.createdTo) params.set("createdTo", localFilters.createdTo);
      if (localFilters.publishedFrom) params.set("publishedFrom", localFilters.publishedFrom);
      if (localFilters.publishedTo) params.set("publishedTo", localFilters.publishedTo);

      const queryString = params.toString();
      router.push(queryString ? `/articles?${queryString}` : "/articles");
      setIsOpen(false);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      setLocalFilters({
        status: "",
        clientId: "",
        categoryId: "",
        authorId: "",
        createdFrom: "",
        createdTo: "",
        publishedFrom: "",
        publishedTo: "",
      });
      router.push("/articles");
      setIsOpen(false);
    });
  };

  const hasActiveFilters =
    localFilters.status ||
    localFilters.clientId ||
    localFilters.categoryId ||
    localFilters.authorId ||
    localFilters.createdFrom ||
    localFilters.createdTo ||
    localFilters.publishedFrom ||
    localFilters.publishedTo;

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
      <PopoverContent className="w-[600px] p-4" align="start">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={localFilters.status || "all"}
                onValueChange={(value) => updateLocalFilter("status", value)}
                disabled={isPending}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.values(ArticleStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {getStatusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select
                value={localFilters.clientId || "all"}
                onValueChange={(value) => updateLocalFilter("clientId", value)}
                disabled={isPending}
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={localFilters.categoryId || "all"}
                onValueChange={(value) => updateLocalFilter("categoryId", value)}
                disabled={isPending}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Select
                value={localFilters.authorId || "all"}
                onValueChange={(value) => updateLocalFilter("authorId", value)}
                disabled={isPending}
              >
                <SelectTrigger id="author">
                  <SelectValue placeholder="All authors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All authors</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="space-y-2">
              <Label htmlFor="publishedFrom">Published From</Label>
              <Input
                id="publishedFrom"
                type="date"
                value={localFilters.publishedFrom}
                onChange={(e) => updateLocalFilter("publishedFrom", e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedTo">Published To</Label>
              <Input
                id="publishedTo"
                type="date"
                value={localFilters.publishedTo}
                onChange={(e) => updateLocalFilter("publishedTo", e.target.value)}
                disabled={isPending}
              />
            </div>
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
