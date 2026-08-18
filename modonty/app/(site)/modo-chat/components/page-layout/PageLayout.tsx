"use client";
import { ModoCharacter } from "@modonty/shared/components/modo-character/ModoCharacter";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/components/providers/SessionContext";
import { IconMessage, IconHistory, IconAdd } from "@/lib/icons";
import { getScopeIcon } from "../../helpers/get-scope-icon";
import { cn } from "@/lib/utils";


const ChatList = dynamic(
  () => import("../chat-list/ChatList").then((m) => ({ default: m.ChatList })),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div> }
);

const HistoryList = dynamic(
  () => import("../history-list/HistoryList").then((m) => ({ default: m.HistoryList })),
  { ssr: false }
);

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
  selectedIndustry,
}: {
  articleSlug: string | null;
  selectedIndustry: { slug: string; name: string } | null;
}) {
  if (articleSlug) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="truncate">اسأل عن هذا المقال</span>
        {BETA_BADGE}
      </span>
    );
  }
  if (selectedIndustry) {
    const Icon = getScopeIcon(selectedIndustry.name);
    return (
      <span className="inline-flex items-center gap-2 flex-wrap min-w-0" dir="rtl">
        <span
          className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary shadow-sm"
          role="status"
        >
          <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="truncate">{selectedIndustry.name}</span>
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

export function PageLayout() {
  const searchParams = useSearchParams();
  const draft = searchParams.get("q") ?? "";
  const articleSlug = searchParams.get("article");
  const [tab, setTab] = useState<TabMode>("chat");
  const [historyOpened, setHistoryOpened] = useState(false);
  /** Set when a history row asks to reopen a thread; ChatList rehydrates from it. */
  const [resumeConversationId, setResumeConversationId] = useState<string | null>(null);
  /**
   * Bumped by «محادثة جديدة» to remount the chat with empty state. A returning visitor is
   * restored into their last thread on load, and before this there was no way out of it —
   * the industry chips, which only render on an empty chat, became unreachable forever.
   */
  const [chatSession, setChatSession] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState<{ slug: string; name: string } | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (articleSlug) setSelectedIndustry(null);
  }, [articleSlug]);

  return (
    // A fixed pane, not min-height: the message list must own the scrollbar, or the whole page
    // scrolls and the composer drifts away from the bottom. The `data-fullscreen-pane` attribute
    // is what makes globals.css size the layout and hide the site footer — see the rule there.
    <div
      dir="rtl"
      data-fullscreen-pane
      className="flex h-full flex-col overflow-hidden"
    >
      <header
        className="shrink-0 border-b border-border bg-background"
        aria-label="رأس المحادثة"
      >
        <div className="mx-auto flex min-h-[56px] w-full max-w-3xl flex-row items-center gap-3 px-4 py-3">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-border/50 shadow-sm">
            <ModoCharacter sizes="32px" decorative />
          </div>
          <h1 className="flex-1 min-w-0 text-base font-semibold text-foreground">
            <ChatHeading articleSlug={articleSlug} selectedIndustry={selectedIndustry} />
          </h1>
          {session?.user && (
            <button
              type="button"
              onClick={() => {
                setTab("chat");
                setResumeConversationId(null);
                setSelectedIndustry(null);
                setChatSession((n) => n + 1);
              }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <IconAdd className="h-3.5 w-3.5" aria-hidden />
              محادثة جديدة
            </button>
          )}
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
              onClick={() => { setTab("history"); setHistoryOpened(true); }}
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
        ) : (
          /* The chat renders for EVERYONE now. An anonymous visitor gets three questions before
             the wall — Khalid (2026-08-18): Modo is an acquisition channel, and a sign-in gate
             in front of it meant every ad click bought a bounce. The server owns the count;
             this component only shows what is left. */
          <>
            <div className={cn("h-full", tab === "history" && "hidden")}>
              <ChatList
                key={chatSession}
                startFresh={chatSession > 0}
                initialInput={draft}
                articleSlug={articleSlug}
                userName={session?.user?.name ?? session?.user?.email ?? undefined}
                userImage={session?.user?.image ?? undefined}
                userEmail={session?.user?.email ?? undefined}
                isSignedIn={Boolean(session?.user)}
                selectedIndustry={selectedIndustry}
                onSelectedIndustryChange={setSelectedIndustry}
                resumeConversationId={resumeConversationId}
              />
            </div>
            {/* Loaded on first open only — but never unmounted afterwards, so switching back
                and forth costs nothing and the chat above keeps its state. */}
            {historyOpened && (
              <div className={cn("h-full", tab === "chat" && "hidden")}>
                <HistoryList
                  onResume={(id) => {
                    setResumeConversationId(id);
                    setTab("chat");
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
