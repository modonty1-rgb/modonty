"use client";
import { CHARACTER_URL } from "@/constants";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/components/providers/SessionContext";
import { signIn } from "next-auth/react";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { IconAi, IconLogin, IconMessage, IconHistory } from "@/lib/icons";
import { getCategoryIcon } from "@/app/categories/helpers/category-utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ChatConversation = dynamic(
  () => import("./chat-conversation").then((m) => ({ default: m.ChatConversation })),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div> }
);

const ChatHistoryList = dynamic(
  () => import("./chat-history-list").then((m) => ({ default: m.ChatHistoryList })),
  { ssr: false }
);

function ChatLoginPrompt() {
  return (
    <div dir="rtl" className="flex flex-col h-full items-center justify-center p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <IconAi className="h-8 w-8 text-primary" strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
        مودو شات بانتظارك
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          تجريبي
        </span>
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">
        سجّل دخولك للاستفادة من محادثات ذكية حول مقالاتك المفضلة
      </p>
      <Button onClick={() => signIn()} className="gap-2" size="lg">
        <IconLogin className="h-4 w-4" />
        تسجيل الدخول
      </Button>
    </div>
  );
}

const BETA_BADGE = (
  <span
    role="status"
    aria-label="تجريبي"
    className="shrink-0 rounded px-2 py-0.5 text-[10px] font-medium text-primary bg-primary/10"
  >
    تجريبي
  </span>
);

function ChatHeading({
  articleSlug,
  selectedCategory,
}: {
  articleSlug: string | null;
  selectedCategory: { slug: string; name: string } | null;
}) {
  if (articleSlug) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="truncate">اسأل عن هذا المقال</span>
        {BETA_BADGE}
      </span>
    );
  }
  if (selectedCategory) {
    const Icon = getCategoryIcon(selectedCategory.name);
    return (
      <span className="inline-flex items-center gap-2 flex-wrap min-w-0" dir="rtl">
        <span
          className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary shadow-sm"
          role="status"
        >
          <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="truncate">اسأل عن مقالات {selectedCategory.name}</span>
        </span>
        {BETA_BADGE}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <span>مودو شات</span>
      {BETA_BADGE}
    </span>
  );
}

type TabMode = "chat" | "history";

export function ModoChatClient() {
  const searchParams = useSearchParams();
  const draft = searchParams.get("q") ?? "";
  const articleSlug = searchParams.get("article");
  const [tab, setTab] = useState<TabMode>("chat");
  const [selectedCategory, setSelectedCategory] = useState<{ slug: string; name: string } | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (articleSlug) setSelectedCategory(null);
  }, [articleSlug]);

  return (
    <div dir="rtl" className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <header
        className="shrink-0 border-b border-border bg-background"
        aria-label="رأس المحادثة"
      >
        <div className="mx-auto flex min-h-[56px] w-full max-w-3xl flex-row items-center gap-3 px-4 py-3">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-border/50 shadow-sm">
            <OptimizedImage
              media={asMedia(CHARACTER_URL)}
              alt="مودو شات"
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <h1 className="flex-1 min-w-0 text-base font-semibold text-foreground">
            <ChatHeading articleSlug={articleSlug} selectedCategory={selectedCategory} />
          </h1>
        </div>
        {session?.user && (
          <nav
            role="tablist"
            aria-label="تنقل المحادثة"
            className="mx-auto flex w-full max-w-3xl border-t border-border/60"
          >
            <button
              role="tab"
              aria-selected={tab === "chat"}
              aria-controls="chat-panel"
              id="tab-chat"
              type="button"
              onClick={() => setTab("chat")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                tab === "chat"
                  ? "border-b-2 border-primary text-primary bg-muted/30"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
              )}
            >
              <IconMessage className="h-4 w-4 shrink-0" aria-hidden />
              جديد
            </button>
            <button
              role="tab"
              aria-selected={tab === "history"}
              aria-controls="chat-panel"
              id="tab-history"
              type="button"
              onClick={() => setTab("history")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                tab === "history"
                  ? "border-b-2 border-primary text-primary bg-muted/30"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
              )}
            >
              <IconHistory className="h-4 w-4 shrink-0" aria-hidden />
              سجل
            </button>
          </nav>
        )}
      </header>
      <div
        id="chat-panel"
        {...(session?.user && {
          role: "tabpanel",
          "aria-labelledby": tab === "chat" ? "tab-chat" : "tab-history",
        })}
        className="mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-hidden"
      >
        {status === "loading" ? (
          <div className="flex h-full items-center justify-center p-8">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          </div>
        ) : session?.user ? (
          tab === "history" ? (
            <ChatHistoryList />
          ) : (
            <ChatConversation
              initialInput={draft}
              articleSlug={articleSlug}
              userName={session.user.name ?? session.user.email ?? undefined}
              userImage={session.user.image ?? undefined}
              userEmail={session.user.email ?? undefined}
              selectedCategory={selectedCategory}
              onSelectedCategoryChange={setSelectedCategory}
            />
          )
        ) : (
          <ChatLoginPrompt />
        )}
      </div>
    </div>
  );
}
