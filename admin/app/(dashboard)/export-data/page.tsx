"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Building2,
  FolderTree,
  Tag,
  Briefcase,
  User,
  BarChart3,
  Download,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportArticlesToCSV } from "../articles/actions/export-actions";
import { exportClientsToCSV } from "../clients/actions/export-actions";
import { exportCategoriesToCSV } from "../categories/actions/export-actions";
import { exportTagsToCSV } from "../tags/actions/export-actions";
import { exportIndustriesToCSV } from "../industries/actions/export-actions";
import { exportAuthorsToCSV } from "../authors/actions/export-actions";
import { getAnalyticsData, getViewsTrendData } from "../analytics/actions/analytics-actions";

type ExportResourceId =
  | "articles"
  | "clients"
  | "categories"
  | "tags"
  | "industries"
  | "authors"
  | "analytics";

interface ExportConfig {
  id: ExportResourceId;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const exportConfigs: ExportConfig[] = [
  {
    id: "articles",
    title: "Articles Export",
    description: "All articles with SEO fields, status, scheduling, and client relations.",
    icon: FileText,
  },
  {
    id: "clients",
    title: "Clients Export",
    description: "All clients with subscription, contact, and article totals.",
    icon: Building2,
  },
  {
    id: "categories",
    title: "Categories Export",
    description: "All categories with hierarchy, SEO configuration, and usage counts.",
    icon: FolderTree,
  },
  {
    id: "tags",
    title: "Tags Export",
    description: "All tags with usage statistics and related content counts.",
    icon: Tag,
  },
  {
    id: "industries",
    title: "Industries Export",
    description: "All industries with client counts and SEO-related metadata.",
    icon: Briefcase,
  },
  {
    id: "authors",
    title: "Authors Export",
    description: "All authors with E-E-A-T profile details and article counts.",
    icon: User,
  },
  {
    id: "analytics",
    title: "Analytics Export",
    description: "Top articles and key traffic metrics for performance reporting.",
    icon: BarChart3,
  },
];

async function generateCsvForResource(id: ExportResourceId): Promise<string> {
  switch (id) {
    case "articles":
      return await exportArticlesToCSV();
    case "clients":
      return await exportClientsToCSV();
    case "categories":
      return await exportCategoriesToCSV();
    case "tags":
      return await exportTagsToCSV();
    case "industries":
      return await exportIndustriesToCSV();
    case "authors":
      return await exportAuthorsToCSV();
    case "analytics": {
      const [analytics] = await Promise.all([
        getAnalyticsData({}),
        getViewsTrendData({}),
      ]);

      const headers = ["Title", "Client", "Views"];
      const rows = analytics.topArticles.map((article) => [
        article.title,
        article.client,
        article.views.toString(),
      ]);

      const csvLines = [headers.join(","), ...rows.map((row) => row.join(","))];
      return csvLines.join("\n");
    }
  }
}

function downloadCsv(id: ExportResourceId, csv: string) {
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const encoder = new TextEncoder();
  const csvBytes = encoder.encode(csv);

  const combinedArray = new Uint8Array(bom.length + csvBytes.length);
  combinedArray.set(bom, 0);
  combinedArray.set(csvBytes, bom.length);

  const blob = new Blob([combinedArray], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${id}-export-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function ExportDataPage() {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<ExportResourceId | null>(null);

  const handleExport = async (config: ExportConfig) => {
    try {
      setLoadingId(config.id);
      const csv = await generateCsvForResource(config.id);
      downloadCsv(config.id, csv);
      toast({
        title: "Success",
        description: `${config.title} completed successfully.`,
      });
    } catch (error) {
      console.error("Export failed", error);
      toast({
        title: "Error",
        description: `Failed to export ${config.title}.`,
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="container mx-auto max-w-[1128px] space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Export Data</h1>
        <p className="text-muted-foreground">
          Central hub to export structured CSV datasets for reporting, analytics, and backups.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exportConfigs.map((config) => {
          const Icon = config.icon;
          const isLoading = loadingId === config.id;

          return (
            <Card key={config.id} className="h-full">
              <CardContent className="pt-6 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{config.title}</h3>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(config)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

