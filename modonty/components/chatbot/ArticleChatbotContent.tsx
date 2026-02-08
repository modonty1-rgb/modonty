"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { getOptimizedCharacterUrl, getOptimizedThumbnailUrl } from "@/lib/image-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "@/components/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { TypingDots } from "@/components/chatbot/TypingDots";
import { cn } from "@/lib/utils";

type WebSource = { title: string; link: string };
type Msg = { role: "user" | "assistant"; content: string; source?: "web"; sources?: WebSource[] };

type Redirect = { id: string; title: string; slug: string; excerpt: string | null; client: { name: string; slug: string } };
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
  selectedCategory: { slug: string; name: string } | null;
  onSelectedCategoryChange: (cat: { slug: string; name: string } | null) => void;
}

export function ArticleChatbotContent({
  articleSlug,
  userName,
  userImage,
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
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scopeSlug = articleSlug ?? selectedCategory?.slug ?? null;
  const isCategoryScope = !articleSlug && !!selectedCategory;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || !scopeSlug) return;

    setInput("");
    setError(null);
    setRedirects(null);
    setMessages((p) => [...p, { role: "user", content: text }]);
    setLoading(true);

    const history = [...messages, { role: "user" as const, content: text }];
    const chatUrl = isCategoryScope
      ? "/api/chatbot/chat"
      : `/api/articles/${scopeSlug}/chat`;
    const chatBody = isCategoryScope
      ? { messages: history, categorySlug: scopeSlug, stream: true }
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
          setMessages((p) => [...p, { role: "assistant", content: d.message ?? "سؤالك خارج نطاق هذا الموضوع. يمكنك اختيار موضوع آخر." }]);
          return;
        }
        if (d.type === "redirect") {
          setRedirects(d.articles ?? []);
          return;
        }
        if (d.text) setMessages((p) => [...p, { role: "assistant", content: d.text }]);
        return;
      }

      const reader = res.body?.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let assistantText = "";
      setMessages((p) => [...p, { role: "assistant", content: "" }]);

      if (reader) {
        let lastMessageSource: "web" | undefined;
        let lastMessageSources: WebSource[] | undefined;
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
                if (p.source === "web") lastMessageSource = "web";
                if (p.sources?.length) lastMessageSources = p.sources;
              }
              if (p.type === "error") setError(p.error ?? "حدث خطأ. حاول مرة أخرى.");
            } catch {}
          }
        }
        if (lastMessageSource) {
          setMessages((prev) => {
            const n = [...prev];
            const last = n[n.length - 1];
            if (last?.role === "assistant")
              n[n.length - 1] = { ...last, source: lastMessageSource, sources: lastMessageSources };
            return n;
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const hasArticle = !!articleSlug;
  const canChat = hasArticle || selectedCategory;
  const displayName = userName?.split(/\s+/)[0] ?? "هناك";
  const showWelcome = messages.length === 0 && !redirects && canChat;

  return (
    <div dir="rtl" className="flex h-full flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
        {showWelcome && (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center animate-in fade-in duration-300">
            <Avatar className="h-14 w-14 mb-5 ring-2 ring-primary/10">
              <AvatarImage src={userImage ?? undefined} alt={userName ?? ""} />
              <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5">
                <Sparkles className="h-7 w-7 text-primary" strokeWidth={1.5} />
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-medium text-foreground mb-1">
              أهلاً بك يا {displayName} ✨
            </h3>
            <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
              {hasArticle
                ? "يسعدني مساعدتك. اسألني أي سؤال عن هذا المقال"
                : "اسأل سؤالاً ضمن نطاق الموضوع أولاً. إن لم نجد إجابة في مقالاتنا، نبحث على الويب."}
            </p>
          </div>
        )}
        {!hasArticle && !selectedCategory && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              أهلاً بك يا {displayName} ✨ اختر موضوعاً للبحث ضمن مقالاته. إن لم نجد إجابة، نبحث خارج النطاق
            </p>
            {topicsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
                              <Image
                                src={thumbUrl}
                                alt={t.socialImageAlt ?? t.categoryName}
                                width={36}
                                height={36}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Sparkles className="h-4 w-4 text-primary" />
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
        {messages.map((m, i) => (
          <div key={i} className={cn("max-w-[90%]", m.role === "user" ? "ms-auto" : "me-auto")}>
            <div className={cn("flex gap-2", m.role === "assistant" && "flex-row-reverse")}>
              {m.role === "assistant" && (
                <Avatar className="h-8 w-8 shrink-0 ring-1 ring-primary/10">
                  <AvatarImage src={getOptimizedCharacterUrl(64)} alt="مدونتي الذكية" />
                  <AvatarFallback className="bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "rounded-lg p-3 text-sm whitespace-pre-wrap",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                {m.role === "assistant" && m.content === "" && loading ? (
                  <TypingDots />
                ) : (
                  m.content
                )}
              </div>
            </div>
            {m.role === "assistant" && m.source === "web" && (
              <div className="mt-1.5 me-2 space-y-1" dir="rtl">
                <p className="text-xs text-muted-foreground">المصدر: نتائج البحث على الويب</p>
                {m.sources && m.sources.length > 0 && (
                  <ul className="text-xs space-y-0.5">
                    {m.sources.slice(0, 5).map((s, i) => (
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
                )}
              </div>
            )}
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="me-auto max-w-[90%] flex gap-2 flex-row-reverse" aria-live="polite">
            <Avatar className="h-8 w-8 shrink-0 ring-1 ring-primary/10">
              <AvatarImage src={getOptimizedCharacterUrl(64)} alt="مدونتي الذكية" />
              <AvatarFallback className="bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="rounded-lg bg-muted p-4 inline-flex">
              <TypingDots />
            </div>
          </div>
        )}
        {redirects && redirects.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">اختر مقالاً وابدأ المحادثة هناك</p>
            <div className="space-y-2">
              {redirects.map((a) => (
                <Link key={a.id} href={`/articles/${a.slug}`} className="block">
                  <Card className="p-3 border-border hover:shadow-md transition-shadow">
                    <p className="font-medium text-sm line-clamp-2">{a.title}</p>
                    {a.excerpt && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{a.excerpt}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{a.client.name}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
        {redirects?.length === 0 && <p className="text-sm text-muted-foreground">لا توجد مقالات ذات صلة</p>}
        {error && (
          <div className="rounded-lg p-3 bg-destructive/10 text-destructive text-sm">
            {error}
            <Button variant="link" size="sm" className="mt-2 p-0 h-auto" onClick={() => setError(null)}>
              إعادة المحاولة
            </Button>
          </div>
        )}
        <div ref={endRef} />
      </div>
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
      {canChat && !redirects && (
        <form onSubmit={submit} className="flex shrink-0 gap-2 border-t p-4">
          {selectedCategory && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={() => {
                onSelectedCategoryChange(null);
                setMessages([]);
              }}
              title="اختيار موضوع آخر"
            >
              ←
            </Button>
          )}
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasArticle ? "اسأل عن هذا المقال..." : `اسأل عن مقالات ${selectedCategory?.name ?? ""}`}
            disabled={loading}
            className="flex-1"
            aria-label="رسالة المحادثة"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="إرسال">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
