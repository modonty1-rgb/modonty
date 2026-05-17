import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { ClientCommentForm } from "./client-comment-form";
import type { ClientCommentItem } from "../helpers/client-comments";

interface Props {
  clientSlug: string;
  clientName: string;
  comments: ClientCommentItem[];
}

function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function initials(name: string | null | undefined): string {
  return (name || "م")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ClientCommentsSection({ clientSlug, clientName, comments }: Props) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
          آراء حول {clientName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Form (Client Component — interactivity only) */}
        <ClientCommentForm clientSlug={clientSlug} />

        {/* List — rendered server-side, indexable in raw HTML */}
        {comments.length === 0 ? (
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
