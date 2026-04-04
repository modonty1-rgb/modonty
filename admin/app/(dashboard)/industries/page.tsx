import { getIndustries, getIndustriesStats, IndustryFilters } from "./actions/industries-actions";
import { IndustriesPageClient } from "./components/industries-page-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Users } from "lucide-react";
import Link from "next/link";
import { RevalidateAllSEOButton } from "./components/revalidate-all-seo-button";

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
    hasClients: params.hasClients === "yes" ? true : params.hasClients === "no" ? false : undefined,
    createdFrom: params.createdFrom ? new Date(params.createdFrom) : undefined,
    createdTo: params.createdTo ? new Date(params.createdTo) : undefined,
    minClientCount: params.minClientCount ? parseInt(params.minClientCount) : undefined,
    maxClientCount: params.maxClientCount ? parseInt(params.maxClientCount) : undefined,
  };

  const [industries, stats] = await Promise.all([getIndustries(filters), getIndustriesStats()]);
  const missingSeo = industries.filter((i: any) => !i.jsonLdLastGenerated).length;

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold">Industries</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage all industries in the system</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <Building2 className="h-3 w-3 text-primary" />
              {stats.total} total
            </Badge>
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <Users className="h-3 w-3 text-emerald-500" />
              {stats.withClients} with clients
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RevalidateAllSEOButton />
          <Link href="/industries/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Industry
            </Button>
          </Link>
        </div>
      </div>
      <IndustriesPageClient industries={industries} missingSeoCount={missingSeo} />
    </div>
  );
}
