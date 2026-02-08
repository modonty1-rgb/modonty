"use client";

import { useState, useEffect } from "react";
import Link from "@/components/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { History, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

type WebSource = { title: string; link: string };

type HistoryItem = {
  id: string;
  userQuery: string;
  assistantResponse: string;
  scopeType: string;
  scopeLabel: string | null;
  articleSlug: string | null;
  categorySlug: string | null;
  outcome: string;
  source?: string | null;
  webSources?: WebSource[] | null;
  createdAt: string;
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const time = date.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  let label: string;
  if (diffDays === 0) label = "اليوم";
  else if (diffDays === 1) label = "أمس";
  else if (diffDays >= 2 && diffDays < 7) label = `قبل ${diffDays} أيام`;
  else if (diffDays >= 7 && diffDays < 30) label = `قبل ${Math.floor(diffDays / 7)} أسابيع`;
  else label = date.toLocaleDateString("ar-EG");
  return `${label} ${time}`;
}

export function ChatHistoryList() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/chatbot/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.messages) {
          setItems(data.messages);
        } else {
          setError(data.error ?? "حدث خطأ");
        }
      })
      .catch(() => setError("حدث خطأ"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div dir="rtl" className="flex flex-col h-full overflow-hidden">
        <p className="text-sm font-medium text-foreground px-4 pt-4 pb-2 shrink-0">سجل المحادثات</p>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="overflow-hidden border-border p-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full max-w-[85%]" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-3 w-16 shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div dir="rtl" className="flex flex-col h-full items-center justify-center p-8 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div dir="rtl" className="flex flex-col h-full items-center justify-center p-8 text-center">
        <History className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-1">لا توجد محادثات سابقة</p>
        <p className="text-xs text-muted-foreground">ابدأ محادثة جديدة من تبويب جديد</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="flex flex-col h-full overflow-hidden">
      <p className="text-sm font-medium text-foreground px-4 pt-4 pb-2 shrink-0">سجل المحادثات</p>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
        {items.map((item) => {
          const scopeLabel = item.scopeLabel ?? (item.scopeType === "article" ? "مقال" : "موضوع");
          const isExpanded = expandedId === item.id;
          const href =
            item.articleSlug ? `/articles/${encodeURIComponent(item.articleSlug)}` : item.categorySlug ? `/categories/${encodeURIComponent(item.categorySlug)}` : null;

          return (
            <Card key={item.id} className="overflow-hidden border-border">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full text-right p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      {item.scopeType === "article" ? "مقال:" : "موضوع:"}{" "}
                      {href ? (
                        <Link
                          href={href}
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {scopeLabel}
                        </Link>
                      ) : (
                        scopeLabel
                      )}
                    </p>
                    <p className="text-sm text-foreground line-clamp-2">{item.userQuery}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatRelativeDate(item.createdAt)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-border px-3 py-3 space-y-3 bg-muted/30">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">سؤالك</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{item.userQuery}</p>
                  </div>
                  {item.assistantResponse ? (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">الإجابة</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{item.assistantResponse}</p>
                      {item.source === "web" && item.webSources && item.webSources.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-muted-foreground">المصدر: نتائج البحث على الويب</p>
                          <ul className="text-xs space-y-0.5">
                            {item.webSources.slice(0, 5).map((s, i) => (
                              <li key={i}>
                                <a
                                  href={s.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline truncate block max-w-full"
                                >
                                  {s.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    item.outcome === "redirect" && (
                      <p className="text-xs text-muted-foreground">تم اقتراح مقالات ذات صلة</p>
                    )
                  )}
                  {href && (
                    <Link
                      href={href}
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {item.articleSlug ? "فتح المقال" : "فتح الموضوع"}
                    </Link>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
