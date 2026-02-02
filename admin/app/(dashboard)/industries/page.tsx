import { getIndustries, getIndustriesStats, IndustryFilters } from "./actions/industries-actions";
import { IndustriesStats } from "./components/industries-stats";
import { IndustriesFilters } from "./components/industries-filters";
import { IndustriesPageClient } from "./components/industries-page-client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function IndustriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    hasClients?: string;
    createdFrom?: string;
    createdTo?: string;
    minClientCount?: string;
    maxClientCount?: string;
  }>;
}) {
  const params = await searchParams;
  const filters: IndustryFilters = {
    hasClients:
      params.hasClients === "yes"
        ? true
        : params.hasClients === "no"
          ? false
          : undefined,
    createdFrom: params.createdFrom ? new Date(params.createdFrom) : undefined,
    createdTo: params.createdTo ? new Date(params.createdTo) : undefined,
    minClientCount: params.minClientCount ? parseInt(params.minClientCount) : undefined,
    maxClientCount: params.maxClientCount ? parseInt(params.maxClientCount) : undefined,
  };

  const [industries, stats] = await Promise.all([getIndustries(filters), getIndustriesStats()]);

  const getDescription = () => {
    if (filters.hasClients === true) return "Viewing industries with clients";
    if (filters.hasClients === false) return "Viewing industries without clients";
    if (filters.createdFrom || filters.createdTo) return "Viewing industries by date range";
    if (filters.minClientCount !== undefined || filters.maxClientCount !== undefined)
      return "Viewing industries by client count";
    return "Manage all industries in the system";
  };

  return (
    <div className="container mx-auto max-w-[1128px] space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Industries</h1>
          <p className="text-muted-foreground mt-1">{getDescription()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/industries/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Industry
            </Button>
          </Link>
        </div>
      </div>
      <IndustriesStats stats={stats} />
      <IndustriesFilters />
      <IndustriesPageClient industries={industries} />
    </div>
  );
}
