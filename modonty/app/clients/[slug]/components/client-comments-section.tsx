"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/providers/SessionContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Loader2, Send } from "lucide-react";

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null } | null;
  _count: { replies: number; likes: number; dislikes: number };
}

interface Props {
  clientSlug: string;
  clientName: string;
}

function fmtDate(d: string): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(d));
}

function initials(name: string | null | undefined): string {
  return (name || "م")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ClientCommentsSection({ clientSlug, clientName }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/clients/${encodeURIComponent(clientSlug)}/comments`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) setComments(d.data.comments);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clientSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!session?.user) {
      router.push("/users/login");
      return;
    }
    const trimmed = content.trim();
    if (trimmed.length < 3) {
      setError("التعليق قصير جداً (3 أحرف على الأقل)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/clients/${encodeURIComponent(clientSlug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = await res.json();
      if (data?.success) {
        setSuccess("تم إرسال تعليقك. سيظهر بعد الموافقة من الشركة.");
        setContent("");
      } else {
        setError(data?.error ?? "فشل الإرسال. حاول مرة أخرى.");
      }
    } catch {
      setError("فشل الإرسال. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
          آراء حول {clientName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-muted/20 p-4">
          {status === "authenticated" ? (
            <p className="text-xs text-muted-foreground">
              تعلق بصفتك: <span className="font-medium text-foreground">{session?.user?.name ?? session?.user?.email}</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              يجب{" "}
              <button
                type="button"
                onClick={() => router.push("/users/login")}
                className="text-primary underline"
              >
                تسجيل الدخول
              </button>{" "}
              لإضافة تعليق.
            </p>
          )}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="شارك رأيك في هذه الشركة..."
            rows={3}
            disabled={submitting}
            maxLength={2000}
            className="resize-none"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          {success && <p className="text-xs text-emerald-600">{success}</p>}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={submitting || content.trim().length < 3}
              className="gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              إرسال التعليق
            </Button>
          </div>
        </form>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            لا توجد تعليقات بعد. كن أول من يضع رأيه.
          </p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3 rounded-lg border bg-card px-3 py-3">
                <Avatar className="h-9 w-9 shrink-0">
                  {c.author?.image ? (
                    <AvatarImage src={c.author.image} alt={c.author.name ?? "زائر"} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {initials(c.author?.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {c.author?.name || "زائر"}
                    </p>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {fmtDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    {c.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
