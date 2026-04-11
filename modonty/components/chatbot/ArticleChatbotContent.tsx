"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { IconSend, IconAi, IconArticle } from "@/lib/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { getOptimizedCharacterUrl, getOptimizedThumbnailUrl } from "@/lib/image-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "@/components/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { TypingDots } from "@/components/chatbot/TypingDots";
import { getCategoryIcon } from "@/app/categories/helpers/category-utils";
import { cn } from "@/lib/utils";

const AskClientDialog = dynamic(
  () =>
    import("@/app/articles/[slug]/components/ask-client-dialog").then(
      (m) => ({ default: m.AskClientDialog })
    ),
  { ssr: false }
);

type WebSource = { title: string; link: string };
type Msg = {
  role: "user" | "assistant";
  content: string;
  source?: "web";
  sources?: WebSource[];
  noSources?: boolean;
  categorySuggestion?: CategorySuggestion;
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

type CategorySuggestion = {
  slug: string;
  name: string;
  socialImage?: string | null;
  socialImageAlt?: string | null;
};

type Topic = {
  categoryName: string;
  categorySlug: string;
  suggestedQuestion: string;
  description?: string | null;
  socialImage?: string | null;
  socialImageAlt?: string | null;
};

interface ArticleChatbotContentProps {
  articleSlug: string | null;
  userName?: string | null;
  userImage?: string | null;
  userEmail?: string | null;
  selectedCategory: { slug: string; name: string } | null;
  onSelectedCategoryChange: (cat: { slug: string; name: string } | null) => void;
}

export function ArticleChatbotContent({
  articleSlug,
  userName,
  userImage,
  userEmail,
  selectedCategory,
  onSelectedCategoryChange,
}: ArticleChatbotContentProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirects, setRedirects] = useState<Redirect[] | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [suggestedArticle, setSuggestedArticle] = useState<SuggestedArticle | null>(null);
  const pendingQuestionRef = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCategoryScope = !articleSlug && !!selectedCategory;
  const displayName = userName?.split(/\s+/)[0] ?? "هناك";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, redirects, suggestedArticle]);

  useEffect(() => {
    if (!articleSlug) {
      setTopicsLoading(true);
      fetch("/api/chatbot/topics")
        .then((res) => res.json())
        .then((data) => data.topics && setTopics(data.topics))
        .catch(() => setTopics([]))
        .finally(() => setTopicsLoading(false));
    } else {
      setTopics([]);
    }
  }, [articleSlug]);

  const doChat = useCallback(
    async (text: string, catSlug: string | null, artSlug: string | null) => {
      setError(null);
      setRedirects(null);
      setSuggestedArticle(null);
      setLoading(true);

      const history = [...messages.filter((m) => m.content.trim().length > 0), { role: "user" as const, content: text }];
      const isCategory = !artSlug && !!catSlug;
      const chatUrl = isCategory ? "/api/chatbot/chat" : `/api/articles/${artSlug}/chat`;
      const chatBody = isCategory
        ? { messages: history, categorySlug: catSlug, stream: true }
        : { messages: history, stream: true };

      try {
        const res = await fetch(chatUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chatBody),
        });

        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || `HTTP ${res.status}`);
        }

        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          const d = await res.json();
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
            setMessages((p) => [...p, { role: "assistant", content: d.text }]);
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

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
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
                  if (p.source === "web") lastSource = "web";
                  if (p.sources?.length) lastSources = p.sources;
                  if (p.suggestedArticle) lastSuggestedArticle = p.suggestedArticle as SuggestedArticle;
                }
                if (p.type === "error") setError(p.error ?? "حدث خطأ. حاول مرة أخرى.");
              } catch {}
            }
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
        setError(err instanceof Error ? err.message : "حدث خطأ. حاول مرة أخرى.");
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [messages]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    // CHAT-2: No category + no article → auto-detect category first
    if (!articleSlug && !selectedCategory) {
      setMessages((p) => [...p, { role: "user", content: text }]);
      setLoading(true);
      try {
        const res = await fetch("/api/chatbot/suggest-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });
        const data = await res.json();
        if (data.suggestion) {
          pendingQuestionRef.current = text;
          setMessages((p) => [
            ...p,
            {
              role: "assistant",
              content: "",
              categorySuggestion: data.suggestion as CategorySuggestion,
            },
          ]);
        } else {
          setMessages((p) => [
            ...p,
            { role: "assistant", content: "لم أتمكن من تحديد الموضوع. اختر موضوعاً من القائمة أدناه." },
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
    await doChat(text, selectedCategory?.slug ?? null, articleSlug);
  };

  const confirmCategorySuggestion = async (suggestion: CategorySuggestion) => {
    const pending = pendingQuestionRef.current;
    pendingQuestionRef.current = null;
    onSelectedCategoryChange({ slug: suggestion.slug, name: suggestion.name });
    if (pending) {
      await doChat(pending, suggestion.slug, null);
    }
  };

  const hasArticle = !!articleSlug;
  const showWelcome = messages.length === 0 && !redirects && (hasArticle || selectedCategory);

  return (
    <div dir="rtl" className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">

        {/* Welcome */}
        {showWelcome && (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center animate-in fade-in duration-300">
            <Avatar className="h-14 w-14 mb-5 ring-2 ring-primary/10">
              <AvatarImage src={userImage ?? undefined} alt={userName ?? ""} />
              <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5">
                <IconAi className="h-7 w-7 text-primary" strokeWidth={1.5} />
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-medium text-foreground mb-1">أهلاً بك يا {displayName} ✨</h3>
            <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
              {hasArticle
                ? "يسعدني مساعدتك. اسألني أي سؤال عن هذا المقال"
                : "اسأل سؤالاً ضمن نطاق الموضوع. إن لم نجد إجابة في مقالاتنا، نبحث على الويب."}
            </p>
          </div>
        )}

        {/* Category picker (no article, no category selected) */}
        {!hasArticle && !selectedCategory && messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              أهلاً بك يا {displayName} ✨ — اكتب سؤالك مباشرةً وسأحدد الموضوع تلقائياً، أو اختر من القائمة:
            </p>
            {topicsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="p-3 border-border">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-full max-w-[90%]" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {topics.map((t) => {
                  const thumbUrl = getOptimizedThumbnailUrl(t.socialImage ?? null, 72);
                  const brief = t.description?.trim() || t.suggestedQuestion;
                  const Icon = getCategoryIcon(t.categoryName);
                  return (
                    <button
                      key={t.categorySlug}
                      type="button"
                      onClick={() => onSelectedCategoryChange({ slug: t.categorySlug, name: t.categoryName })}
                      className="w-full text-right"
                    >
                      <Card className="p-3 border-border hover:shadow-md hover:border-primary/30 transition-all group">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-muted">
                            {thumbUrl ? (
                              <Image src={thumbUrl} alt={t.socialImageAlt ?? t.categoryName} width={36} height={36} sizes="36px" className="h-full w-full object-cover" />
                            ) : (
                              <Icon className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm text-foreground">{t.categoryName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{brief}</p>
                          </div>
                        </div>
                      </Card>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {messages.map((m, i) => (
          <div key={i} className={cn("max-w-[92%]", m.role === "user" ? "ms-auto" : "me-auto")}>
            {/* Category suggestion bot message */}
            {m.role === "assistant" && m.categorySuggestion ? (
              <div className="flex gap-2 flex-row-reverse">
                <Avatar className="h-8 w-8 shrink-0 ring-1 ring-primary/10">
                  <AvatarImage src={getOptimizedCharacterUrl(64)} alt="مدونتي الذكية" />
                  <AvatarFallback className="bg-primary/10">
                    <IconAi className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-3 min-w-0">
                  <p className="text-sm text-foreground font-medium">يبدو أن سؤالك في موضوع:</p>
                  <div className="flex items-center gap-2 rounded-lg bg-background/80 border border-primary/20 px-3 py-2">
                    {m.categorySuggestion.socialImage ? (
                      <Image
                        src={getOptimizedThumbnailUrl(m.categorySuggestion.socialImage, 40) ?? ""}
                        alt={m.categorySuggestion.socialImageAlt ?? m.categorySuggestion.name}
                        width={24}
                        height={24}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      (() => {
                        const Icon = getCategoryIcon(m.categorySuggestion.name);
                        return <Icon className="h-4 w-4 text-primary shrink-0" />;
                      })()
                    )}
                    <span className="text-sm font-semibold text-primary">{m.categorySuggestion.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">هل هذا صحيح؟</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => confirmCategorySuggestion(m.categorySuggestion!)}
                      disabled={loading}
                    >
                      ✓ نعم، ابدأ المحادثة
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        pendingQuestionRef.current = null;
                        setMessages([]);
                      }}
                    >
                      اختر موضوعاً آخر
                    </Button>
                  </div>
                </div>
              </div>
            ) : m.role === "assistant" && m.noSources ? (
              /* No trusted sources message */
              <div className="flex gap-2 flex-row-reverse">
                <Avatar className="h-8 w-8 shrink-0 ring-1 ring-primary/10">
                  <AvatarImage src={getOptimizedCharacterUrl(64)} alt="مدونتي الذكية" />
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
              /* Normal user / assistant message */
              <div className={cn("flex gap-2", m.role === "assistant" && "flex-row-reverse")}>
                {m.role === "assistant" && (
                  <Avatar className="h-8 w-8 shrink-0 ring-1 ring-primary/10">
                    <AvatarImage src={getOptimizedCharacterUrl(64)} alt="مدونتي الذكية" />
                    <AvatarFallback className="bg-primary/10">
                      <IconAi className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-2xl p-3 text-sm whitespace-pre-wrap leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tl-sm"
                      : "bg-muted rounded-tr-sm"
                  )}
                >
                  {m.role === "assistant" && m.content === "" && loading ? <TypingDots /> : m.content}
                </div>
              </div>
            )}

            {/* Web sources */}
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
          <div className="me-auto max-w-[90%] flex gap-2 flex-row-reverse" aria-live="polite">
            <Avatar className="h-8 w-8 shrink-0 ring-1 ring-primary/10">
              <AvatarImage src={getOptimizedCharacterUrl(64)} alt="مدونتي الذكية" />
              <AvatarFallback className="bg-primary/10">
                <IconAi className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="rounded-2xl bg-muted p-4 inline-flex">
              <TypingDots />
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
          <div className="rounded-xl p-3 bg-destructive/10 text-destructive text-sm border border-destructive/20">
            {error}
            <Button variant="link" size="sm" className="mt-1 p-0 h-auto text-destructive" onClick={() => setError(null)}>
              إعادة المحاولة
            </Button>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Actions bar when redirects */}
      {redirects && redirects.length > 0 && (
        <div className="shrink-0 border-t p-4 space-y-2">
          <Button variant="secondary" size="sm" className="w-full" onClick={() => setRedirects(null)}>
            اسأل سؤالاً آخر
          </Button>
          {selectedCategory && (
            <Button variant="ghost" size="sm" className="w-full" onClick={() => onSelectedCategoryChange(null)}>
              اختيار موضوع آخر
            </Button>
          )}
        </div>
      )}

      {/* Input — always visible (CHAT-2: even before category selected) */}
      {!redirects && (
        <form onSubmit={submit} className="flex shrink-0 gap-2 border-t p-4">
          {selectedCategory && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => {
                onSelectedCategoryChange(null);
                setMessages([]);
                setSuggestedArticle(null);
              }}
              title="اختيار موضوع آخر"
              aria-label="اختيار موضوع آخر"
            >
              ←
            </Button>
          )}
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              hasArticle
                ? "اسأل عن هذا المقال..."
                : selectedCategory
                ? `اسأل عن مقالات ${selectedCategory.name}...`
                : "اسأل سؤالك، وسأحدد الموضوع تلقائياً..."
            }
            disabled={loading}
            className="flex-1"
            aria-label="رسالة المحادثة"
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            aria-label="إرسال"
          >
            <IconSend className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
