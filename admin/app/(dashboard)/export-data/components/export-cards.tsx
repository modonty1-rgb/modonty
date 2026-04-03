"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  CheckCircle2,
  Mail,
  Newspaper,
  MessageSquare,
  Target,
  TrendingUp,
  Share2,
  Megaphone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportArticlesToCSV } from "../../articles/actions/export-actions";
import { exportClientsToCSV } from "../../clients/actions/export-actions";
import { exportCategoriesToCSV } from "../../categories/actions/export-actions";
import { exportTagsToCSV } from "../../tags/actions/export-actions";
import { exportIndustriesToCSV } from "../../industries/actions/export-actions";
import { exportAuthorsToCSV } from "../../authors/actions/export-actions";
import { exportAnalyticsToCSV } from "../actions/export-analytics";
import {
  exportSubscribersToCSV,
  exportNewsSubscribersToCSV,
  exportContactMessagesToCSV,
  exportConversionsToCSV,
  exportLeadScoringToCSV,
  exportSharesToCSV,
  exportCampaignsToCSV,
} from "../actions/export-extra";

type ExportId =
  | "articles" | "clients" | "categories" | "tags" | "industries" | "authors" | "analytics"
  | "subscribers" | "newsSubscribers" | "contactMessages" | "conversions" | "leads" | "shares" | "campaigns";

interface ExportConfig {
  id: ExportId;
  title: string;
  columns: string;
  icon: typeof FileText;
  countKey: keyof ExportCounts;
  group: string;
}

interface ExportCounts {
  articles: number;
  clients: number;
  categories: number;
  tags: number;
  industries: number;
  authors: number;
  analytics: number;
  subscribers: number;
  newsSubscribers: number;
  contactMessages: number;
  conversions: number;
  leads: number;
  shares: number;
  campaigns: number;
}

const exportConfigs: ExportConfig[] = [
  { id: "articles", title: "Articles", columns: "Title, Status, Client, Category, Author, Word Count, Reading Time, Featured, Views, Dates", icon: FileText, countKey: "articles", group: "Content" },
  { id: "categories", title: "Categories", columns: "Name, Parent Category, Article Count, Created Date", icon: FolderTree, countKey: "categories", group: "Content" },
  { id: "tags", title: "Tags", columns: "Name, Article Count, Created Date", icon: Tag, countKey: "tags", group: "Content" },
  { id: "authors", title: "Authors", columns: "Name, Job Title, Email, Bio, LinkedIn, Twitter, Expertise, Experience, Verified, Articles", icon: User, countKey: "authors", group: "Content" },
  { id: "industries", title: "Industries", columns: "Name, Client Count, Created Date", icon: Briefcase, countKey: "industries", group: "Content" },
  { id: "clients", title: "Clients", columns: "Name, Email, Phone, Website, Industry, Plan, Payment, Dates, Articles, City, CR, VAT", icon: Building2, countKey: "clients", group: "Clients & Audience" },
  { id: "subscribers", title: "Client Subscribers", columns: "Name, Email, Client, Subscribed Status, Dates, Consent", icon: Mail, countKey: "subscribers", group: "Clients & Audience" },
  { id: "newsSubscribers", title: "Newsletter Subscribers", columns: "Name, Email, Subscribed Status, Dates, Consent", icon: Newspaper, countKey: "newsSubscribers", group: "Clients & Audience" },
  { id: "contactMessages", title: "Contact Messages", columns: "Name, Email, Subject, Message, Status, Client, Reply, Date", icon: MessageSquare, countKey: "contactMessages", group: "Clients & Audience" },
  { id: "analytics", title: "Performance Report", columns: "Title, Client, Category, Author, Published, Views, Likes, Dislikes, Favorites, Shares, Comments", icon: BarChart3, countKey: "analytics", group: "Analytics & Marketing" },
  { id: "conversions", title: "Conversions", columns: "Type, Article, Client, Value, Currency, UTM Source, UTM Medium, UTM Campaign, Date", icon: Target, countKey: "conversions", group: "Analytics & Marketing" },
  { id: "leads", title: "Leads", columns: "Name, Email, Client, Score, Level, Qualified, Pages Viewed, Time Spent, Interactions, Conversions", icon: TrendingUp, countKey: "leads", group: "Analytics & Marketing" },
  { id: "shares", title: "Shares", columns: "Platform, Article, Client, Date", icon: Share2, countKey: "shares", group: "Analytics & Marketing" },
  { id: "campaigns", title: "Campaigns", columns: "Campaign, Type, Article, Client, UTM Source, Cost, Impressions, Clicks, Conversions, Date", icon: Megaphone, countKey: "campaigns", group: "Analytics & Marketing" },
];

const groups = ["Content", "Clients & Audience", "Analytics & Marketing"];

async function generateCsv(id: ExportId): Promise<string> {
  switch (id) {
    case "articles": return await exportArticlesToCSV();
    case "clients": return await exportClientsToCSV();
    case "categories": return await exportCategoriesToCSV();
    case "tags": return await exportTagsToCSV();
    case "industries": return await exportIndustriesToCSV();
    case "authors": return await exportAuthorsToCSV();
    case "analytics": return await exportAnalyticsToCSV();
    case "subscribers": return await exportSubscribersToCSV();
    case "newsSubscribers": return await exportNewsSubscribersToCSV();
    case "contactMessages": return await exportContactMessagesToCSV();
    case "conversions": return await exportConversionsToCSV();
    case "leads": return await exportLeadScoringToCSV();
    case "shares": return await exportSharesToCSV();
    case "campaigns": return await exportCampaignsToCSV();
  }
}

function downloadCsv(id: string, csv: string) {
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const csvBytes = new TextEncoder().encode(csv);
  const combined = new Uint8Array(bom.length + csvBytes.length);
  combined.set(bom, 0);
  combined.set(csvBytes, bom.length);

  const blob = new Blob([combined], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${id}-${new Date().toISOString().split("T")[0]}.csv`;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface ExportCardsProps {
  counts: ExportCounts;
}

export function ExportCards({ counts }: ExportCardsProps) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<ExportId | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [completed, setCompleted] = useState<Set<ExportId>>(new Set());

  const handleExport = async (config: ExportConfig) => {
    try {
      setLoadingId(config.id);
      const csv = await generateCsv(config.id);
      downloadCsv(config.id, csv);
      setCompleted((prev) => new Set(prev).add(config.id));
      toast({ title: "Downloaded", description: `${config.title} export is ready.` });
    } catch {
      toast({ title: "Export Failed", description: `Could not export ${config.title}. Please try again.`, variant: "destructive" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleExportAll = async () => {
    setLoadingAll(true);
    let successCount = 0;
    for (const config of exportConfigs) {
      try {
        setLoadingId(config.id);
        const csv = await generateCsv(config.id);
        downloadCsv(config.id, csv);
        setCompleted((prev) => new Set(prev).add(config.id));
        successCount++;
      } catch {
        // continue with next
      }
      setLoadingId(null);
    }
    setLoadingAll(false);
    toast({
      title: "All Done",
      description: `${successCount} of ${exportConfigs.length} files downloaded.`,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={handleExportAll} disabled={loadingAll || loadingId !== null}>
          {loadingAll ? (
            <><Loader2 className="h-4 w-4 me-2 animate-spin" /> Exporting All...</>
          ) : (
            <><Download className="h-4 w-4 me-2" /> Export All ({exportConfigs.length} files)</>
          )}
        </Button>
      </div>

      {groups.map((group) => {
        const groupConfigs = exportConfigs.filter((c) => c.group === group);
        return (
          <div key={group} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {group}
            </h2>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Data</TableHead>
                    <TableHead className="hidden md:table-cell">Columns Included</TableHead>
                    <TableHead className="w-[100px] text-center">Records</TableHead>
                    <TableHead className="w-[120px] text-end" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupConfigs.map((config) => {
                    const Icon = config.icon;
                    const isLoading = loadingId === config.id;
                    const isDone = completed.has(config.id);
                    const count = counts[config.countKey];

                    return (
                      <TableRow key={config.id} className={isDone ? "bg-green-500/5" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            ) : (
                              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <span className="font-medium">{config.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">{config.columns}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="text-xs font-normal">
                            {count}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExport(config)}
                            disabled={isLoading || loadingAll}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <><Download className="h-4 w-4 me-1.5" /> CSV</>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
