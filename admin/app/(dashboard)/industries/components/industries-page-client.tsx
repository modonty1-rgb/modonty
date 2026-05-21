"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { IndustryTable } from "./industry-table";

interface Industry {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  _count: { clients: number };
  seoTitle?: string | null;
  seoDescription?: string | null;
  [key: string]: unknown;
}

interface IndustriesPageClientProps {
  industries: Industry[];
  missingSeoCount: number;
}

export function IndustriesPageClient({ industries, missingSeoCount }: IndustriesPageClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [batchLoading, setBatchLoading] = useState(false);

  const handleBatchGenerate = async () => {
    setBatchLoading(true);
    try {
      const { batchGenerateIndustrySeo } = await import("@/lib/seo/industry-seo-generator");
      const result = await batchGenerateIndustrySeo();
      toast({
        title: result.failed === 0 ? "✅ SEO generated" : "⚠️ SEO partially generated",
        description: `${result.successful} succeeded · ${result.failed} failed · ${result.total} total`,
        variant: result.failed === 0 ? "default" : "destructive",
      });
      router.refresh();
    } catch {
      toast({ title: "❌ Failed to generate SEO", variant: "destructive" });
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {missingSeoCount > 0 && (
        <div className="flex items-center justify-between px-3 py-2 border border-yellow-500/20 bg-yellow-500/[0.04] rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
            <span className="text-xs text-yellow-500">
              {missingSeoCount} {missingSeoCount === 1 ? "industry" : "industries"} missing SEO cache
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleBatchGenerate} disabled={batchLoading} className="h-7 text-xs text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10">
            {batchLoading ? "Generating…" : "Generate All"}
          </Button>
        </div>
      )}
      <IndustryTable industries={industries} />
    </div>
  );
}
