"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Search,
  ExternalLink,
  FileText,
  Globe,
  Folder,
  Tag,
  User,
  Building,
  Briefcase,
  FileQuestion,
  Home,
} from "lucide-react";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import { fetchSitemapUrlsAction } from "../actions/sitemap-urls-action";

import type { ParsedSitemap, SitemapPathType } from "@/lib/gsc/parse-sitemap";

const TYPE_FILTERS: Array<{ key: "all" | SitemapPathType; label: string }> = [
  { key: "all", label: "All" },
  { key: "article", label: "Articles" },
  { key: "category", label: "Categories" },
  { key: "tag", label: "Tags" },
  { key: "author", label: "Authors" },
  { key: "client", label: "Clients" },
  { key: "industry", label: "Industries" },
  { key: "static", label: "Static" },
  { key: "homepage", label: "Home" },
  { key: "other", label: "Other" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sitemapUrl: string;
}

export function SitemapUrlsDialog({ open, onOpenChange, sitemapUrl }: Props) {
  const { toast } = useToast();
  const [data, setData] = useState<ParsedSitemap | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | SitemapPathType>("all");

  useEffect(() => {
    if (!open || !sitemapUrl) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetchSitemapUrlsAction(sitemapUrl);
      if (cancelled) return;
      if (res.ok && res.data) {
        setData(res.data);
      } else {
        toast({
          title: "Failed to load sitemap URLs",
          description: res.error,
          variant: "destructive",
        });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, sitemapUrl, toast]);

  const enriched = useMemo(() => {
    if (!data) return [];
    return data.entries.map((e) => ({
      ...e,
      type: classifyClient(e.loc),
    }));
  }, [data]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: enriched.length };
    for (const e of enriched) c[e.type] = (c[e.type] ?? 0) + 1;
    return c;
  }, [enriched]);

  const filtered = useMemo(() => {
    return enriched.filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        if (!e.loc.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [enriched, search, typeFilter]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-blue-500" />
            URLs in sitemap
            {data && (
              <Badge variant="secondary" className="ms-1">
                {data.count.toLocaleString("en-US")}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription dir="ltr" className="font-mono text-xs">
            {sitemapUrl}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-3 space-y-3 border-b">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter URLs by path…"
              className="w-full ps-9 pe-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {TYPE_FILTERS.map((f) => {
              const count = counts[f.key] ?? 0;
              if (f.key !== "all" && count === 0) return null;
              const active = typeFilter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setTypeFilter(f.key)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-colors ${
                    active
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  }`}
                >
                  {f.label}
                  <span className={`tabular-nums ${active ? "opacity-90" : "opacity-60"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-3">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin inline-block me-2" />
              Fetching sitemap…
            </div>
          ) : !data ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No data
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No URLs match your filters
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30 sticky top-0">
                  <tr>
                    <th className="text-start px-3 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider w-10">#</th>
                    <th className="text-start px-3 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Path</th>
                    <th className="text-start px-3 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Type</th>
                    <th className="text-start px-3 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Last modified</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((e, i) => {
                    const path = pathOf(e.loc);
                    const lastmodDate = e.lastmod ? new Date(e.lastmod) : null;
                    return (
                      <tr key={`${e.loc}-${i}`} className="hover:bg-muted/40">
                        <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">
                          {i + 1}
                        </td>
                        <td className="px-3 py-2 max-w-md">
                          <a
                            href={e.loc}
                            target="_blank"
                            rel="noopener noreferrer"
                            dir="ltr"
                            className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 max-w-full"
                            title={e.loc}
                          >
                            <span className="truncate">{path || "/"}</span>
                            <ExternalLink className="h-3 w-3 opacity-60 shrink-0" />
                          </a>
                        </td>
                        <td className="px-3 py-2">
                          <TypeBadge type={e.type} />
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {lastmodDate
                            ? format(lastmodDate, "MMM d, yyyy")
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t text-[10px] text-muted-foreground bg-muted/20">
          Showing <strong>{filtered.length}</strong> of{" "}
          <strong>{enriched.length}</strong> URLs
          {data && (
            <span className="ms-2">
              · fetched {format(new Date(data.fetchedAt), "HH:mm")}
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function classifyClient(url: string): SitemapPathType {
  try {
    const path = new URL(url).pathname;
    if (path === "/" || path === "") return "homepage";
    if (path.startsWith("/articles/")) return "article";
    if (path.startsWith("/categories/")) return "category";
    if (path.startsWith("/tags/")) return "tag";
    if (path.startsWith("/authors/")) return "author";
    if (path.startsWith("/clients/")) return "client";
    if (path.startsWith("/industries/")) return "industry";
    if (path === "/categories" || path === "/clients" || path === "/tags") return "static";
    if (
      path.startsWith("/legal") ||
      path.startsWith("/help") ||
      path === "/about" ||
      path === "/contact" ||
      path === "/terms" ||
      path === "/news"
    ) return "static";
    return "other";
  } catch {
    return "other";
  }
}

function TypeBadge({ type }: { type: SitemapPathType }) {
  const config: Record<SitemapPathType, { label: string; cls: string; icon: React.ReactNode }> = {
    article: {
      label: "Article",
      cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: <FileText className="h-3 w-3" />,
    },
    category: {
      label: "Category",
      cls: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
      icon: <Folder className="h-3 w-3" />,
    },
    tag: {
      label: "Tag",
      cls: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/20",
      icon: <Tag className="h-3 w-3" />,
    },
    author: {
      label: "Author",
      cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
      icon: <User className="h-3 w-3" />,
    },
    client: {
      label: "Client",
      cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
      icon: <Building className="h-3 w-3" />,
    },
    industry: {
      label: "Industry",
      cls: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      icon: <Briefcase className="h-3 w-3" />,
    },
    static: {
      label: "Static",
      cls: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20",
      icon: <Globe className="h-3 w-3" />,
    },
    homepage: {
      label: "Home",
      cls: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
      icon: <Home className="h-3 w-3" />,
    },
    other: {
      label: "Other",
      cls: "bg-muted text-muted-foreground border-border",
      icon: <FileQuestion className="h-3 w-3" />,
    },
  };
  const c = config[type];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${c.cls}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
}
