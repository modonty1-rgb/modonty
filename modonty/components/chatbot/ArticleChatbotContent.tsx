"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "@/components/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };
type Redirect = { id: string; title: string; slug: string; excerpt: string | null; client: { name: string; slug: string } };
type Topic = { categoryName: string; categorySlug: string; suggestedQuestion: string };

interface ArticleChatbotContentProps {
  articleSlug: string | null;
  userName?: string | null;
}

export function ArticleChatbotContent({ articleSlug, userName }: ArticleChatbotContentProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirects, setRedirects] = useState<Redirect[] | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ slug: string; name: string } | null>(null);
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
      setSelectedCategory(null);
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
              if (p.type === "error") setError(p.error ?? "حدث خطأ. حاول مرة أخرى.");
            } catch {}
          }
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 mb-5">
              <Sparkles className="h-7 w-7 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              أهلاً بك يا {displayName} ✨
            </h3>
            <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed">
              {hasArticle
                ? "يسعدني مساعدتك. اسألني أي سؤال عن هذا المقال"
                : `اسألني عن مقالات ${selectedCategory?.name ?? ""} وسأجيبك بكل سرور`}
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
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {topics.map((t) => (
                  <button
                    key={t.categorySlug}
                    type="button"
                    onClick={() => setSelectedCategory({ slug: t.categorySlug, name: t.categoryName })}
                    className="w-full text-right"
                  >
                    <Card className="p-3 border-border hover:shadow-md hover:border-primary/30 transition-all group">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-foreground">{t.categoryName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.suggestedQuestion}</p>
                        </div>
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "rounded-lg p-3 max-w-[90%] text-sm whitespace-pre-wrap",
              m.role === "user" ? "ms-auto bg-primary text-primary-foreground" : "me-auto bg-muted"
            )}
          >
            {m.content}
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="me-auto rounded-lg p-3 bg-muted max-w-[90%]">
            <Skeleton className="h-4 w-32" />
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
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setSelectedCategory(null)}>
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
                setSelectedCategory(null);
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
