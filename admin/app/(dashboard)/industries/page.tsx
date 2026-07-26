import { getIndustries, IndustryFilters } from "./actions/industries-actions";
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
    hasClients: params.hasClients === "yes" ? true : params.hasClients === "no" ? false : undefined,
    createdFrom: params.createdFrom ? new Date(params.createdFrom) : undefined,
    createdTo: params.createdTo ? new Date(params.createdTo) : undefined,
    minClientCount: params.minClientCount ? parseInt(params.minClientCount) : undefined,
    maxClientCount: params.maxClientCount ? parseInt(params.maxClientCount) : undefined,
  };

  const industries = await getIndustries(filters);
  const missingSeo = industries.filter((i) => !i.jsonLdLastGenerated).length;

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold">Industries</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage all industries in the system</p>
        </div>
        <div className="flex items-center gap-2">
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
