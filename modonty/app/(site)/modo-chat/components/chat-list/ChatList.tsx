"use client";

import { CHARACTER_URL } from "@/constants";

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { IconAi, IconArticle } from "@/lib/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Composer } from "../composer/Composer";
import { PartnerCards, type SuggestedPartner } from "../partner-cards/PartnerCards";
import { TypingDots } from "../shared/TypingDots";
import { getScopeIcon } from "../../helpers/get-scope-icon";
import { cn } from "@/lib/utils";

/**
 * Silence budget, not a total budget. A stream still delivering tokens is healthy however long
 * it runs — measured live on 2026-08-18, a grounded answer took 45s and a flat total timeout
 * cut it off mid-sentence after the visitor had already read three paragraphs. The timer is
 * therefore reset on every chunk, and only a genuinely stalled upstream trips it.
 */
const STALL_TIMEOUT_MS = 25_000;

/** «شريك واحد» / «شريكان» / «٢١ شريك» — «1 شريك» is not something anyone says out loud. */
function formatPartnerCount(count: number): string {
  if (count === 1) return "شريك واحد جاهز";
  if (count === 2) return "شريكان جاهزان";
  return `${new Intl.NumberFormat("ar-SA").format(count)} شريك جاهز`;
}

const AskClientDialog = dynamic(
  () =>
    import("@/components/client/ask-client-dialog").then(
      (m) => ({ default: m.AskClientDialog })
    ),
  { ssr: false }
);

type WebSource = { title: string; link: string };
type Msg = {
  role: "user" | "assistant";
  content: string;
  /** Partners behind this answer, rendered as bookable cards under it. */
  partners?: SuggestedPartner[];
  source?: "web";
  sources?: WebSource[];
  noSources?: boolean;
  industrySuggestion?: IndustrySuggestion;
};

type Redirect = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  client: { name: string; slug: string };
};

type SuggestedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  client: { id: string; name: string; slug: string };
};

type IndustrySuggestion = {
  slug: string;
  name: string;
};

/** One saved turn as `/modo-chat/api/conversation` returns it. */
type ResumedTurn = {
  userQuery: string;
  assistantResponse: string;
  source?: "web" | "db" | null;
  webSources?: WebSource[] | null;
};

/** One offerable industry as `/modo-chat/api/industries` returns it. */
type Industry = {
  name: string;
  slug: string;
  description?: string | null;
  /** How many active partners stand behind it — the reason to pick this one. */
  partnerCount: number;
};

interface ArticleChatbotContentProps {
  initialInput?: string;
  articleSlug: string | null;
  userName?: string | null;
  userImage?: string | null;
  userEmail?: string | null;
  selectedIndustry: { slug: string; name: string } | null;
  onSelectedIndustryChange: (industry: { slug: string; name: string } | null) => void;
  /** A thread the visitor chose to reopen from the history tab. */
  resumeConversationId?: string | null;
  /** Set by «محادثة جديدة» — start empty instead of restoring the last thread. */
  startFresh?: boolean;
}

export function ChatList({
  initialInput = "",
  articleSlug,
  userName,
  userImage,
  userEmail,
  selectedIndustry,
  onSelectedIndustryChange,
  resumeConversationId = null,
  startFresh = false,
}: ArticleChatbotContentProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState(initialInput);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirects, setRedirects] = useState<Redirect[] | null>(null);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industriesLoading, setIndustriesLoading] = useState(false);
  const [suggestedArticle, setSuggestedArticle] = useState<SuggestedArticle | null>(null);
  const pendingQuestionRef = useRef<string | null>(null);
  const lastAttemptRef = useRef<{ text: string; industrySlug: string | null; artSlug: string | null } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  /** Minted by the server on the first turn; every later turn sends it back so they group. */
  const conversationIdRef = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // userName falls back to the email upstream — never greet someone with "أهلاً a@b.com".
  const displayName = userName?.includes("@")
    ? userName.split("@")[0]
    : (userName?.split(/\s+/)[0] ?? "بك");

  useEffect(() => {
    // Only follow the stream when the reader is already at the bottom. Scrolling up to
    // re-read used to yank them back on every streamed token, and `smooth` queued dozens
    // of overlapping animations per second. `nearest` keeps it inside the list.
    const list = endRef.current?.parentElement;
    const atBottom =
      !list || list.scrollHeight - list.scrollTop - list.clientHeight < 80;
    if (atBottom) endRef.current?.scrollIntoView({ behavior: "auto", block: "nearest" });
  }, [messages, redirects, suggestedArticle]);

  // Rebuild the last conversation after a reload. Only when the visitor arrived with no
  // article and no draft — those mean they came to start something specific, not to resume.
  useEffect(() => {
    if (startFresh) return;
    if (!resumeConversationId && (articleSlug || initialInput)) return;
    let cancelled = false;

    const url = resumeConversationId
      ? `/modo-chat/api/conversation?id=${encodeURIComponent(resumeConversationId)}`
      : "/modo-chat/api/conversation";
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.conversationId || !data.turns?.length) return;
        conversationIdRef.current = data.conversationId;

        const restored: Msg[] = [];
        for (const turn of data.turns as ResumedTurn[]) {
          restored.push({ role: "user", content: turn.userQuery });
          if (turn.assistantResponse) {
            restored.push({
              role: "assistant",
              content: turn.assistantResponse,
              ...(turn.source === "web" && { source: "web" as const }),
              ...(turn.webSources?.length && { sources: turn.webSources }),
            });
          }
        }
        if (restored.length) setMessages(restored);
      })
      .catch(() => {
        /* resuming is a convenience — failing to resume must never block a new conversation */
      });

    return () => {
      cancelled = true;
    };
  }, [articleSlug, initialInput, resumeConversationId, startFresh]);

  useEffect(() => {
    if (!articleSlug) {
      setIndustriesLoading(true);
      fetch("/modo-chat/api/industries")
        .then((res) => res.json())
        .then((data) => data.industries && setIndustries(data.industries))
        .catch(() => setIndustries([]))
        .finally(() => setIndustriesLoading(false));
    } else {
      setIndustries([]);
    }
  }, [articleSlug]);

  const doChat = useCallback(
    async (text: string, industrySlug: string | null, artSlug: string | null) => {
      // Remembered so «إعادة المحاولة» can re-send it — the composer was already cleared.
      lastAttemptRef.current = { text, industrySlug, artSlug };
      setError(null);
      setRedirects(null);
      setSuggestedArticle(null);
      setLoading(true);

      /**
       * `submit` calls this before its own `setMessages` has landed, so the question is NOT yet
       * in `messages` and must be appended. `confirmCategorySuggestion` calls it after the
       * question was already pushed — appending again sent the model two identical user turns.
       * Dropping a trailing duplicate covers both callers.
       */
      const prior = messages.filter((m) => m.content.trim().length > 0);
      const last = prior[prior.length - 1];
      const withoutDuplicate =
        last?.role === "user" && last.content === text ? prior.slice(0, -1) : prior;
      const history = [...withoutDuplicate, { role: "user" as const, content: text }];
      const isIndustry = !artSlug && !!industrySlug;
      const chatUrl = isIndustry ? "/modo-chat/api/chat" : `/modo-chat/api/article/${artSlug}`;
      const conversationId = conversationIdRef.current ?? undefined;
      const chatBody = isIndustry
        ? { messages: history, industrySlug, stream: true, conversationId }
        : { messages: history, stream: true, conversationId };

      // Without a deadline a hung upstream leaves the composer disabled and the dots
      // spinning forever, with reload as the only way out.
      const controller = new AbortController();
      abortRef.current = controller;
      let timeoutId = setTimeout(() => controller.abort(), STALL_TIMEOUT_MS);
      /** Called on every received chunk — progress means the upstream is alive. */
      const keepAlive = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => controller.abort(), STALL_TIMEOUT_MS);
      };

      try {
        const res = await fetch(chatUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chatBody),
          signal: controller.signal,
        });

        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || `HTTP ${res.status}`);
        }

        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          const d = await res.json();
          if (d.conversationId) conversationIdRef.current = d.conversationId;
          if (d.type === "outOfScope") {
            setMessages((p) => [...p, { role: "assistant", content: d.message ?? "سؤالك خارج نطاق هذا الموضوع." }]);
            return;
          }
          if (d.type === "redirect") {
            setRedirects(d.articles ?? []);
            return;
          }
          if (d.type === "noSources") {
            setMessages((p) => [...p, { role: "assistant", content: d.message ?? "لم أعثر على مصادر موثوقة كافية.", noSources: true }]);
            return;
          }
          if (d.text) {
            // The partners must ride with the message. Dropping them here turned the
            // partner-first fallback — «عندي شركاء يقدرون يخدمونك» — into a promise with
            // nothing under it, in exactly the case where we have no article but 21 partners.
            setMessages((p) => [
              ...p,
              {
                role: "assistant",
                content: d.text,
                ...(d.partners?.length && { partners: d.partners as SuggestedPartner[] }),
              },
            ]);
            if (d.suggestedArticle) setSuggestedArticle(d.suggestedArticle as SuggestedArticle);
          }
          return;
        }

        // Streaming
        const reader = res.body?.getReader();
        const dec = new TextDecoder();
        let buf = "";
        let assistantText = "";
        setMessages((p) => [...p, { role: "assistant", content: "" }]);

        if (reader) {
          let lastSource: "web" | undefined;
          let lastSources: WebSource[] | undefined;
          let lastSuggestedArticle: SuggestedArticle | undefined;
          let lastPartners: SuggestedPartner[] | undefined;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            keepAlive();
            buf += dec.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() ?? "";
            for (const line of lines) {
              try {
                const p = JSON.parse(line);
                if (p.type === "delta" && p.text) {
                  assistantText += p.text;
                  setMessages((prev) => {
                    const n = [...prev];
                    const last = n[n.length - 1];
                    if (last?.role === "assistant") n[n.length - 1] = { ...last, content: assistantText };
                    return n;
                  });
                }
                if (p.type === "done") {
                  if (p.conversationId) conversationIdRef.current = p.conversationId;
                  if (p.source === "web") lastSource = "web";
                  if (p.sources?.length) lastSources = p.sources;
                  if (p.suggestedArticle) lastSuggestedArticle = p.suggestedArticle as SuggestedArticle;
                  if (p.partners?.length) lastPartners = p.partners as SuggestedPartner[];
                }
                if (p.type === "error") setError(p.error ?? "حدث خطأ. حاول مرة أخرى.");
              } catch {}
            }
          }

          if (lastPartners?.length) {
            setMessages((prev) => {
              const n = [...prev];
              const last = n[n.length - 1];
              if (last?.role === "assistant") n[n.length - 1] = { ...last, partners: lastPartners };
              return n;
            });
          }
          if (lastSource) {
            setMessages((prev) => {
              const n = [...prev];
              const last = n[n.length - 1];
              if (last?.role === "assistant") n[n.length - 1] = { ...last, source: lastSource, sources: lastSources };
              return n;
            });
          }
          if (lastSuggestedArticle) setSuggestedArticle(lastSuggestedArticle);
        }
      } catch (err) {
        const aborted = err instanceof DOMException && err.name === "AbortError";
        setError(
          aborted
            ? "الرد تأخّر أكثر من اللازم. جرّب مرة ثانية."
            : err instanceof Error
              ? err.message
              : "صار خطأ. جرّب مرة ثانية."
        );
      } finally {
        clearTimeout(timeoutId);
        abortRef.current = null;
        // A stream that died before its first token leaves an empty assistant bubble
        // behind — drop it, or the transcript keeps a blank reply forever.
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.content === "" && !last.industrySuggestion) {
            return prev.slice(0, -1);
          }
          return prev;
        });
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [messages]
  );

  const submit = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    // No industry chosen and no article → guess the industry from the question first.
    if (!articleSlug && !selectedIndustry) {
      setMessages((p) => [...p, { role: "user", content: text }]);
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("/modo-chat/api/suggest-industry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });
        // Without this check an expired session (401) fell through to «لم أتمكّن من تحديد
        // الموضوع», so the visitor kept retrying against a dead session forever.
        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          throw new Error(
            res.status === 401
              ? "انتهت جلستك. سجّل دخولك من جديد وأكمل."
              : detail.error || `HTTP ${res.status}`
          );
        }
        const data = await res.json();
        if (data.suggestion) {
          pendingQuestionRef.current = text;
          setMessages((p) => [
            ...p,
            {
              role: "assistant",
              content: "",
              industrySuggestion: data.suggestion as IndustrySuggestion,
            },
          ]);
        } else {
          setMessages((p) => [
            ...p,
            { role: "assistant", content: "ما عرفت مجال سؤالك. اختر مجالاً من القائمة تحت." },
          ]);
        }
      } catch {
        setMessages((p) => [...p, { role: "assistant", content: "حدث خطأ. حاول مرة أخرى." }]);
      } finally {
        setLoading(false);
      }
      return;
    }

    setMessages((p) => [...p, { role: "user", content: text }]);
    await doChat(text, selectedIndustry?.slug ?? null, articleSlug);
  };

  const confirmIndustrySuggestion = async (suggestion: IndustrySuggestion) => {
    const pending = pendingQuestionRef.current;
    pendingQuestionRef.current = null;
    onSelectedIndustryChange({ slug: suggestion.slug, name: suggestion.name });
    // Retire the card: it stays in the transcript as a settled line instead of an offer whose
    // buttons still look live — a second click found nothing pending and did nothing visible,
    // while its sibling silently wiped the whole conversation.
    setMessages((prev) =>
      prev.map((m) =>
        m.industrySuggestion === suggestion
          ? { role: "assistant", content: `تمام — نتكلّم في ${suggestion.name}.` }
          : m
      )
    );
    if (pending) {
      await doChat(pending, suggestion.slug, null);
    }
  };

  const hasArticle = !!articleSlug;
  /** Nothing said yet — the composer sits in the middle of the screen, not at the bottom. */
  const isEmpty = messages.length === 0 && !redirects;

  const placeholder = hasArticle
    ? "اسأل عن هذا المقال..."
    : selectedIndustry
      ? `اسأل في ${selectedIndustry.name}...`
      : "اكتب سؤالك وأنا أعرف مجاله...";

  const resetIndustryButton = selectedIndustry ? (
    <button
      type="button"
      onClick={() => {
        onSelectedIndustryChange(null);
        setMessages([]);
        setSuggestedArticle(null);
      }}
      title="اختيار مجال آخر"
      aria-label="اختيار مجال آخر"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      ←
    </button>
  ) : null;

  const composer = (
    <Composer
      value={input}
      onValueChange={setInput}
      onSubmit={() => submit()}
      disabled={loading}
      placeholder={placeholder}
      startSlot={resetIndustryButton}
      textareaRef={inputRef}
      autoFocus
    />
  );

  const industryChips = industriesLoading ? (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-3 border-border">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 shrink-0 rounded-sm" />
            <Skeleton className="h-4 w-24" />
          </div>
        </Card>
      ))}
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {industries.slice(0, 6).map((ind) => {
        const Icon = getScopeIcon(ind.name);
        return (
          <button
            key={ind.slug}
            type="button"
            onClick={() => onSelectedIndustryChange({ slug: ind.slug, name: ind.name })}
            className="text-start"
          >
            <Card className="h-full p-3 border-border transition-all hover:border-primary/30 hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{ind.name}</p>
                  {/* The partner count is the reason to pick this one — an industry with
                      nobody behind it can never end in a booking. */}
                  <p className="mt-0.5 text-xs font-medium text-primary">
                    {formatPartnerCount(ind.partnerCount)}
                  </p>
                  {ind.description?.trim() && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {ind.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );

  if (isEmpty) {
    // justify-start + my-auto: a centred flex child that overflows makes its own top edge
    // unreachable, which on a 390px screen hid the greeting behind the scroll origin.
    return (
      <div dir="rtl" className="flex h-full flex-col justify-start overflow-y-auto overscroll-contain scrollbar-thin px-4 py-8">
        <div className="mx-auto my-auto w-full max-w-2xl animate-in fade-in duration-300">
          <div className="mb-6 flex flex-col items-center text-center">
            <Avatar className="mb-4 h-14 w-14 ring-2 ring-primary/10">
              <AvatarImage src={userImage ?? undefined} alt={userName ?? ""} />
              <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5">
                <IconAi className="h-7 w-7 text-primary" strokeWidth={1.5} />
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-foreground">أهلاً {displayName} ✨</h2>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {hasArticle
                ? "اسألني أي سؤال عن هذا المقال."
                : selectedIndustry
                  ? "اسأل في هذا المجال، وأدلّك على الشريك اللي يقدر يخدمك."
                  : "اكتب سؤالك وأنا أعرف مجاله، أو اختر مجالاً من تحت."}
            </p>
          </div>

          {composer}

          {!hasArticle && !selectedIndustry && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-medium text-muted-foreground">أو ابدأ من مجال:</p>
              {industryChips}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4 space-y-4" role="log" aria-live="polite">

        {/* Messages */}
        {messages.map((m, i) => (
          <div key={i} className={cn("max-w-[92%]", m.role === "user" ? "ms-auto" : "me-auto")}>
            {/* Industry guess bot message */}
            {m.role === "assistant" && m.industrySuggestion ? (
              <div className="flex gap-2 flex-row-reverse">
                <Avatar className="h-8 w-8 shrink-0 ring-1 ring-primary/10">
                  <AvatarImage src={CHARACTER_URL} alt="مدونتي الذكية" />
                  <AvatarFallback className="bg-primary/10">
                    <IconAi className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-3 min-w-0">
                  <p className="text-sm text-foreground font-medium">سؤالك يبدو في مجال:</p>
                  <div className="flex items-center gap-2 rounded-lg bg-background/80 border border-primary/20 px-3 py-2">
                    {(() => {
                      const Icon = getScopeIcon(m.industrySuggestion!.name);
                      return <Icon className="h-4 w-4 text-primary shrink-0" />;
                    })()}
                    <span className="text-sm font-semibold text-primary">{m.industrySuggestion.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">صح؟</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => confirmIndustrySuggestion(m.industrySuggestion!)}
                      disabled={loading}
                    >
                      ✓ إيه، كمّل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        // Only the pending question is dropped — wiping the whole transcript
                        // here destroyed work the visitor never asked to lose.
                        pendingQuestionRef.current = null;
                        onSelectedIndustryChange(null);
                        setMessages((prev) =>
                          prev.map((x) =>
                            x === m
                              ? { role: "assistant", content: "تمام — اختر مجالاً، أو اكتب سؤالك من جديد." }
                              : x
                          )
                        );
                      }}
                    >
                      اختر مجالاً آخر
                    </Button>
                  </div>
                </div>
              </div>
            ) : m.role === "assistant" && m.noSources ? (
              /* No trusted sources message */
              <div className="flex gap-2 flex-row-reverse">
                <Avatar className="h-8 w-8 shrink-0 ring-1 ring-primary/10">
                  <AvatarImage src={CHARACTER_URL} alt="مدونتي الذكية" />
                  <AvatarFallback className="bg-primary/10">
                    <IconAi className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/30 p-4 space-y-2">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">⚠️ لم أعثر على مصادر موثوقة</p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                    لم أجد مصادر موثوقة كافية للإجابة على هذا السؤال. جرّب إعادة صياغته أو اختر موضوعاً مختلفاً.
                  </p>
                </div>
              </div>
            ) : (
              /* Normal user / assistant message.
                 Modo answers as plain text on the page — a bubble around long prose hurts reading. */
              <div className={cn("flex gap-3", m.role === "assistant" && "flex-row-reverse")}>
                {m.role === "assistant" && (
                  <Avatar className="h-8 w-8 shrink-0 ring-1 ring-primary/10">
                    <AvatarImage src={CHARACTER_URL} alt="مدونتي الذكية" />
                    <AvatarFallback className="bg-primary/10">
                      <IconAi className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "whitespace-pre-wrap text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-lg bg-primary px-4 py-2.5 text-primary-foreground"
                      : "min-w-0 flex-1 pt-1 text-foreground"
                  )}
                >
                  {m.role === "assistant" && m.content === "" && loading ? <TypingDots /> : m.content}
                </div>
              </div>
            )}

            {/* Web sources */}
            {m.role === "assistant" && m.partners?.length ? (
              <div className="me-10">
                <PartnerCards partners={m.partners} />
              </div>
            ) : null}

            {m.role === "assistant" && m.source === "web" && (
              <div className="mt-1.5 me-10 space-y-1" dir="rtl">
                <p className="text-xs text-muted-foreground">المصدر: نتائج البحث على الويب</p>
                {m.sources && m.sources.length > 0 && (
                  <ul className="text-xs space-y-0.5">
                    {m.sources.slice(0, 3).map((s, si) => (
                      <li key={si}>
                        <Link href={s.link} target="_blank" rel="noopener noreferrer"
                          className="text-primary hover:underline truncate block max-w-full">
                          {s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading typing indicator */}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="me-auto flex max-w-[90%] flex-row-reverse gap-3" aria-live="polite">
            <Avatar className="h-8 w-8 shrink-0 ring-1 ring-primary/10">
              <AvatarImage src={CHARACTER_URL} alt="مدونتي الذكية" />
              <AvatarFallback className="bg-primary/10">
                <IconAi className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-3 pt-2">
              <TypingDots />
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-muted-foreground"
                onClick={() => abortRef.current?.abort()}
              >
                إيقاف
              </Button>
            </div>
          </div>
        )}

        {/* CHAT-1: Suggested article card after web-source answer */}
        {suggestedArticle && !loading && (
          <div className="me-auto max-w-[92%] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-background to-primary/5 p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <IconArticle className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">هل تريد قراءة أعمق؟</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                  {suggestedArticle.title}
                </p>
                {suggestedArticle.excerpt && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {suggestedArticle.excerpt}
                  </p>
                )}
                <p className="text-xs text-primary/70 mt-1">{suggestedArticle.client.name}</p>
              </div>
              <div className="flex gap-2 pt-1">
                <Link
                  href={`/articles/${suggestedArticle.slug}`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full text-xs h-8">
                    اقرأ المقال ←
                  </Button>
                </Link>
                <div className="flex-1">
                  <AskClientDialog
                    articleId={suggestedArticle.id}
                    clientId={suggestedArticle.client.id}
                    clientName={suggestedArticle.client.name}
                    articleTitle={suggestedArticle.title}
                    user={userEmail ? { name: userName ?? null, email: userEmail } : null}
                    embedInCard
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Redirect articles */}
        {redirects && redirects.length > 0 && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <p className="text-xs text-muted-foreground font-medium">وجدنا مقالات ذات صلة:</p>
            <div className="space-y-2">
              {redirects.map((a) => (
                <Link key={a.id} href={`/articles/${a.slug}`} className="block">
                  <Card className="p-3 border-border hover:shadow-md hover:border-primary/30 transition-all">
                    <p className="font-medium text-sm line-clamp-2">{a.title}</p>
                    {a.excerpt && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{a.excerpt}</p>}
                    <p className="text-xs text-primary/70 mt-1">{a.client.name}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
        {redirects?.length === 0 && (
          <p className="text-sm text-muted-foreground">لا توجد مقالات ذات صلة</p>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <p>{error}</p>
            <div className="mt-2 flex gap-2">
              {lastAttemptRef.current && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  onClick={() => {
                    const a = lastAttemptRef.current;
                    if (a) doChat(a.text, a.industrySlug, a.artSlug);
                  }}
                >
                  إعادة المحاولة
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setError(null)}>
                إخفاء
              </Button>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Actions bar when redirects */}
      {redirects && redirects.length > 0 && (
        <div className="shrink-0 px-4 pb-4">
          <div className="mx-auto flex w-full max-w-2xl gap-2">
            <Button variant="default" className="flex-1" onClick={() => setRedirects(null)}>
              اسأل سؤالاً آخر
            </Button>
            {selectedIndustry && (
              <Button variant="outline" className="flex-1" onClick={() => onSelectedIndustryChange(null)}>
                اختيار مجال آخر
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Composer — hidden only while article suggestions are on screen.
          An EMPTY redirect array is truthy, so testing `!redirects` alone stranded the
          visitor with no input and no button. */}
      {(!redirects || redirects.length === 0) && (
        <div className="shrink-0 px-4 pb-4">
          <div className="mx-auto w-full max-w-2xl">{composer}</div>
        </div>
      )}
    </div>
  );
}
