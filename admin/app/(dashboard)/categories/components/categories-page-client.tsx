"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, FolderTree, FileText, FolderOpen, AlertTriangle, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CategoryTable } from "./category-table";

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  parent: { name: string } | null;
  _count: { articles: number; children: number };
  seoScore: number;
  jsonLdLastGenerated?: Date | null;
  [key: string]: unknown;
}

interface CategoriesPageClientProps {
  categories: Category[];
  missingSeoCount: number;
}

// KPI cards double as filters (entity-standard #4): ONE definition drives both the count
// on the card and the rows the table shows, so a card can never lie about its number.
type KpiKey = "all" | "withArticles" | "empty" | "failing";

const KPIS: {
  key: KpiKey;
  label: string;
  icon: LucideIcon;
  tone: string;
  ring: string;
  test: (c: Category) => boolean;
}[] = [
  { key: "all", label: "Total", icon: FolderTree, tone: "bg-muted text-foreground", ring: "ring-foreground/40", test: () => true },
  { key: "withArticles", label: "With articles", icon: FileText, tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500", test: (c) => c._count.articles > 0 },
  { key: "empty", label: "Empty", icon: FolderOpen, tone: "bg-slate-500/15 text-slate-600 dark:text-slate-400", ring: "ring-slate-500", test: (c) => c._count.articles === 0 },
  { key: "failing", label: "SEO < 100", icon: AlertTriangle, tone: "bg-red-500/15 text-red-600 dark:text-red-400", ring: "ring-red-500", test: (c) => c.seoScore < 100 },
];

export function CategoriesPageClient({ categories, missingSeoCount }: CategoriesPageClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [batchLoading, setBatchLoading] = useState(false);
  const [active, setActive] = useState<KpiKey>("all");

  const counts = useMemo(
    () => Object.fromEntries(KPIS.map((k) => [k.key, categories.filter(k.test).length])) as Record<KpiKey, number>,
    [categories],
  );

  const visible = useMemo(() => {
    const kpi = KPIS.find((k) => k.key === active) ?? KPIS[0];
    return categories.filter(kpi.test);
  }, [categories, active]);

  const handleBatchGenerate = async () => {
    setBatchLoading(true);
    try {
      const { batchGenerateCategorySeo } = await import("@/lib/seo/category-seo-generator");
      const result = await batchGenerateCategorySeo();
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
      {/* KPI cards — each is a filter */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {KPIS.map((k) => {
          const isActive = active === k.key;
          return (
            <div
              key={k.key}
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-card px-2.5 py-2 transition-all",
                isActive && `ring-2 ${k.ring} border-transparent`,
              )}
            >
              <button
                type="button"
                onClick={() => setActive(isActive && k.key !== "all" ? "all" : k.key)}
                aria-pressed={isActive}
                title={`${k.label} — filter`}
                className="flex min-w-0 flex-1 items-center gap-2 text-start transition-transform active:scale-[0.98]"
              >
                <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded", k.tone)}>
                  <k.icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-base font-bold tabular-nums leading-none">{counts[k.key]}</span>
                <span className="truncate text-[11px] leading-tight text-muted-foreground">{k.label}</span>
              </button>
            </div>
          );
        })}
      </div>

      {missingSeoCount > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-yellow-500/20 bg-yellow-500/[0.04] px-3 py-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
            <span className="text-xs text-yellow-500">
              {missingSeoCount} {missingSeoCount === 1 ? "category" : "categories"} missing SEO cache
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBatchGenerate}
            disabled={batchLoading}
            className="h-7 text-xs text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
          >
            {batchLoading ? "Generating…" : "Generate All"}
          </Button>
        </div>
      )}

      <CategoryTable categories={visible} />
    </div>
  );
}
