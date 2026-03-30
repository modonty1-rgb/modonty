import { FolderTree, FileText, AlertCircle } from "lucide-react";

interface CategoriesStatsProps {
  stats: {
    total: number;
    withArticles: number;
    withoutArticles: number;
    createdThisMonth: number;
    averageSEO: number;
  };
  missingSeoCount?: number;
}

export function CategoriesStats({ stats, missingSeoCount }: CategoriesStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-center gap-4 p-4 bg-card border rounded-lg">
        <div className="p-2 bg-primary/10 rounded-md">
          <FolderTree className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total Categories</p>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-card border rounded-lg">
        <div className="p-2 bg-green-500/10 rounded-md">
          <FileText className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{stats.withArticles}</p>
          <p className="text-sm text-muted-foreground">Have Articles</p>
        </div>
      </div>

      <div className={`flex items-center gap-4 p-4 border rounded-lg ${
        (missingSeoCount ?? 0) > 0 ? "bg-yellow-50 border-yellow-200" : "bg-card"
      }`}>
        <div className={`p-2 rounded-md ${
          (missingSeoCount ?? 0) > 0 ? "bg-yellow-100" : "bg-muted"
        }`}>
          <AlertCircle className={`h-5 w-5 ${
            (missingSeoCount ?? 0) > 0 ? "text-yellow-600" : "text-muted-foreground"
          }`} />
        </div>
        <div>
          <p className={`text-2xl font-semibold ${(missingSeoCount ?? 0) > 0 ? "text-yellow-800" : ""}`}>
            {missingSeoCount ?? 0}
          </p>
          <p className={`text-sm ${(missingSeoCount ?? 0) > 0 ? "text-yellow-700" : "text-muted-foreground"}`}>
            Missing SEO Cache
          </p>
        </div>
      </div>
    </div>
  );
}
