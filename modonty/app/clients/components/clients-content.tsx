'use client';

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ClientCard } from "./client-card";
import { ClientListItem } from "./client-list-item";
import { FilterPanel } from "./filter-panel";
import { ActiveFilters } from "./active-filters";
import { SortDropdown, sortClients, SortOption } from "./sort-dropdown";
import { ViewToggle, ViewMode } from "./view-toggle";
import { IndustryChips } from "./industry-chips";
import { EmptyState } from "./empty-state";
import { useClientSearch } from "../helpers/use-client-search";
import { useClientFilters } from "../helpers/use-client-filters";

interface ClientData {
  id: string;
  name: string;
  slug: string;
  legalName?: string;
  description?: string;
  industry?: { id: string; name: string; slug: string };
  url?: string;
  logo?: string;
  articleCount: number;
  viewsCount: number;
  subscribersCount: number;
  commentsCount: number;
  likesCount: number;
  dislikesCount: number;
  favoritesCount: number;
  subscriptionTier?: string;
  createdAt: Date;
  isVerified: boolean;
}

interface IndustryData {
  id: string;
  name: string;
  slug: string;
  clientCount: number;
}

interface ClientsContentProps {
  initialClients: ClientData[];
  industries: IndustryData[];
}

export function ClientsContent({ initialClients, industries }: ClientsContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  
  const { filtered: searchFiltered, query, setQuery } = useClientSearch(initialClients);
  
  const { filtered, filters, updateFilter, clearFilters, hasActiveFilters, activeFilterCount } = 
    useClientFilters(searchFiltered);
  
  const sortedClients = sortClients(filtered, sortBy);

  return (
    <>
      <IndustryChips
        industries={industries}
        selected={filters.industries}
        onSelect={(ids) => updateFilter('industries', ids)}
      />

      <div className="container mx-auto max-w-[1128px] px-4 py-8 flex-1">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {sortedClients.length} من {initialClients.length} شركة
            </p>
            {hasActiveFilters && (
              <Badge variant="secondary">
                {activeFilterCount} تصفية نشطة
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SortDropdown value={sortBy} onChange={setSortBy} />
            <ViewToggle value={viewMode} onChange={setViewMode} />
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <FilterPanel
                  industries={industries}
                  filters={filters}
                  onFilterChange={updateFilter}
                  onClear={clearFilters}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <ActiveFilters
          filters={filters}
          industries={industries}
          onRemove={(key, value) => {
            if (key === 'industries') {
              updateFilter('industries', filters.industries.filter(id => id !== value));
            } else {
              updateFilter(key, value);
            }
          }}
          onClearAll={clearFilters}
        />

        <div className="flex gap-6">
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              <FilterPanel
                industries={industries}
                filters={filters}
                onFilterChange={updateFilter}
                onClear={clearFilters}
              />
            </div>
          </aside>

          <div className="flex-1">
            {sortedClients.length === 0 ? (
              <EmptyState 
                title="لا توجد نتائج"
                description="جرب تعديل معايير البحث أو التصفية"
                action={
                  <Button onClick={clearFilters}>مسح التصفية</Button>
                }
              />
            ) : (
              <div className={
                viewMode === 'grid'
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {sortedClients.map(client => (
                  viewMode === 'grid' ? (
                    <ClientCard key={client.id} {...client} />
                  ) : (
                    <ClientListItem key={client.id} {...client} />
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
