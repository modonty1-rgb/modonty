"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bug,
  Sparkles,
  Zap,
  MessageSquare,
  Send,
  Loader2,
  Clock,
  User,
  Globe,
  GitCommit,
  RefreshCw,
} from "lucide-react";
import { createAdminNote, replyToNote } from "./actions";

const TEAM_MEMBERS = [
  "Abu Omar",
  "Eng. Khalid",
  "Mohammed Shalaby",
  "Rawan",
  "Somaya",
  "Mustafa",
  "Ahmed",
];

type FilterType = "all" | "feature" | "fix" | "improve";

interface ChangelogItem {
  type: "fix" | "feature" | "improve";
  text: string;
}

interface Changelog {
  id: string;
  version: string;
  title: string;
  items: ChangelogItem[];
  createdAt: string;
}

interface NoteReply {
  id: string;
  author: string;
  message: string;
  createdAt: string;
}

interface AdminNote {
  id: string;
  author: string;
  type: string | null;
  app: string | null;
  whereExactly: string | null;
  message: string;
  steps: string | null;
  severity: string | null;
  benefit: string | null;
  page: string | null;
  replies: NoteReply[];
  createdAt: string;
}

function ItemIcon({ type }: { type: string }) {
  switch (type) {
    case "fix":     return <Bug      className="h-3.5 w-3.5 text-red-500" />;
    case "feature": return <Sparkles className="h-3.5 w-3.5 text-emerald-500" />;
    case "improve": return <Zap      className="h-3.5 w-3.5 text-amber-500" />;
    default:        return null;
  }
}

function ItemBadge({ type }: { type: string }) {
  switch (type) {
    case "fix":     return <Badge variant="secondary" className="text-[10px] bg-red-500/10 text-red-500 shrink-0">إصلاح</Badge>;
    case "feature": return <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500 shrink-0">جديد</Badge>;
    case "improve": return <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-500 shrink-0">تحسين</Badge>;
    default:        return null;
  }
}

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateFull(date: string) {
  const d = new Date(date);
  const formatted = d.toLocaleDateString("ar-SA", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const hour = d.getHours();
  if (hour >= 0  && hour < 5)  return `🌙 ${formatted}`;
  if (hour >= 5  && hour < 7)  return `🌅 ${formatted}`;
  if (hour >= 7  && hour < 12) return `☀️ ${formatted}`;
  if (hour >= 12 && hour < 17) return `🌤️ ${formatted}`;
  if (hour >= 17 && hour < 20) return `🌇 ${formatted}`;
  if (hour >= 20 && hour < 23) return `🌙 ${formatted}`;
  return `💤 ${formatted}`;
}

function StatsBar({ changelogs }: { changelogs: Changelog[] }) {
  const allItems = changelogs.flatMap((c) => c.items as ChangelogItem[]);
  const features  = allItems.filter((i) => i.type === "feature").length;
  const fixes     = allItems.filter((i) => i.type === "fix").length;
  const improves  = allItems.filter((i) => i.type === "improve").length;

  return (
    <div className="flex flex-wrap gap-3 mb-6 text-sm">
      <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg px-3 py-1.5">
        <GitCommit className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">{changelogs.length}</span>
        <span className="text-muted-foreground">إصدار</span>
      </div>
      <div className="flex items-center gap-1.5 bg-emerald-500/10 rounded-lg px-3 py-1.5">
        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
        <span className="font-medium text-emerald-600">{features}</span>
        <span className="text-muted-foreground">ميزة جديدة</span>
      </div>
      <div className="flex items-center gap-1.5 bg-red-500/10 rounded-lg px-3 py-1.5">
        <Bug className="h-3.5 w-3.5 text-red-500" />
        <span className="font-medium text-red-600">{fixes}</span>
        <span className="text-muted-foreground">إصلاح</span>
      </div>
      <div className="flex items-center gap-1.5 bg-amber-500/10 rounded-lg px-3 py-1.5">
        <Zap className="h-3.5 w-3.5 text-amber-500" />
        <span className="font-medium text-amber-600">{improves}</span>
        <span className="text-muted-foreground">تحسين</span>
      </div>
    </div>
  );
}

function FilterBar({ active, onChange }: { active: FilterType; onChange: (v: FilterType) => void }) {
  const filters: { value: FilterType; label: string }[] = [
    { value: "all",     label: "الكل" },
    { value: "feature", label: "✨ جديد" },
    { value: "fix",     label: "🔧 إصلاح" },
    { value: "improve", label: "⚡ تحسين" },
  ];
  return (
    <div className="flex gap-2 mb-5 flex-wrap">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            active === f.value
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

function ChangelogCard({ log, isCurrent, filter }: { log: Changelog; isCurrent: boolean; filter: FilterType }) {
  const visibleItems = filter === "all"
    ? (log.items as ChangelogItem[])
    : (log.items as ChangelogItem[]).filter((i) => i.type === filter);

  return (
    <div className={`border rounded-lg p-5 space-y-3 transition-colors ${
      isCurrent ? "border-primary/40 bg-primary/5" : ""
    }`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge className={`text-sm font-mono ${isCurrent ? "bg-primary" : ""}`}>
            v{log.version}
          </Badge>
          {isCurrent && (
            <Badge variant="outline" className="text-[10px] text-primary border-primary/40">
              الإصدار الحالي
            </Badge>
          )}
          <h3 className="font-semibold text-sm">{log.title}</h3>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{formatDate(log.createdAt)}</span>
      </div>
      <div className="space-y-1.5">
        {visibleItems.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="mt-0.5 shrink-0"><ItemIcon type={item.type} /></div>
            <ItemBadge type={item.type} />
            <span className="text-sm leading-relaxed">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoteCard({ note }: { note: AdminNote }) {
  const [replyOpen,   setReplyOpen]   = useState(false);
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyMsg,    setReplyMsg]    = useState("");
  const [sending,     setSending]     = useState(false);
  const router = useRouter();

  const handleReply = async () => {
    if (!replyAuthor || !replyMsg.trim()) return;
    setSending(true);
    await replyToNote({ noteId: note.id, author: replyAuthor, message: replyMsg.trim() });
    setSending(false);
    setReplyMsg("");
    setReplyOpen(false);
    router.refresh();
  };

  const appConfig = note.app === "modonty" ? { label: "🌐 Modonty", cls: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30" }
    : note.app === "console" ? { label: "👤 Console", cls: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30" }
    : note.app === "admin" ? { label: "🛠️ Admin", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" }
    : note.app === "general" ? { label: "💬 General", cls: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30" }
    : null;

  const typeConfig = note.type === "bug" ? { label: "🐛 Bug", cls: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30" }
    : note.type === "idea" ? { label: "💡 Idea", cls: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30" }
    : note.type === "other" ? { label: "💬 Other", cls: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30" }
    : null;

  const sevConfig = note.severity === "critical" ? { label: "🔴 Critical", cls: "text-red-600 dark:text-red-400" }
    : note.severity === "bug" ? { label: "🟡 Bug", cls: "text-amber-600 dark:text-amber-400" }
    : note.severity === "minor" ? { label: "🟢 Minor", cls: "text-emerald-600 dark:text-emerald-400" }
    : null;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold">{note.author}</p>
              {typeConfig && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeConfig.cls}`}>
                  {typeConfig.label}
                </span>
              )}
              {appConfig && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${appConfig.cls}`}>
                  {appConfig.label}
                </span>
              )}
              {sevConfig && (
                <span className={`text-[10px] font-bold ${sevConfig.cls}`}>
                  {sevConfig.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDateFull(note.createdAt)}
              {note.page && (
                <>
                  <Globe className="h-3 w-3" />
                  <span dir="ltr">{note.page}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {note.whereExactly && (
        <div className="bg-muted/40 rounded-md px-3 py-2 text-xs">
          <span className="font-semibold text-muted-foreground">📍 Where: </span>
          <span>{note.whereExactly}</span>
        </div>
      )}

      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
          {note.type === "bug" ? "What happened" : note.type === "idea" ? "The idea" : "Message"}
        </p>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.message}</p>
      </div>

      {note.steps && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-md p-3">
          <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">🔄 Steps to reproduce</p>
          <pre className="text-xs whitespace-pre-wrap font-mono">{note.steps}</pre>
        </div>
      )}

      {note.benefit && (
        <div className="bg-sky-500/5 border border-sky-500/20 rounded-md p-3">
          <p className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wide mb-1">✨ Why it would help</p>
          <p className="text-sm whitespace-pre-wrap">{note.benefit}</p>
        </div>
      )}

      {note.replies.length > 0 && (
        <div className="ps-6 border-s-2 border-muted space-y-3 mt-3">
          {note.replies.map((reply) => (
            <div key={reply.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{reply.author}</span>
                <span className="text-[10px] text-muted-foreground">{formatDateFull(reply.createdAt)}</span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reply.message}</p>
            </div>
          ))}
        </div>
      )}

      {replyOpen ? (
        <div className="space-y-2 pt-2 border-t">
          <Select value={replyAuthor} onValueChange={setReplyAuthor}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="اسمك" />
            </SelectTrigger>
            <SelectContent>
              {TEAM_MEMBERS.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={replyMsg}
            onChange={(e) => setReplyMsg(e.target.value)}
            placeholder="اكتب ردك..."
            rows={2}
            className="text-sm"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setReplyOpen(false)}>إلغاء</Button>
            <Button size="sm" onClick={handleReply} disabled={!replyAuthor || !replyMsg.trim() || sending}>
              {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              <span className="ms-1">رد</span>
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setReplyOpen(true)}>
          <MessageSquare className="h-3 w-3 me-1" />
          رد ({note.replies.length})
        </Button>
      )}
    </div>
  );
}

export function ChangelogClient({
  changelogs,
  notes,
}: {
  changelogs: Changelog[];
  notes: AdminNote[];
}) {
  const [filter,      setFilter]      = useState<FilterType>("all");
  const [noteAuthor,  setNoteAuthor]  = useState("");
  const [noteMessage, setNoteMessage] = useState("");
  const [sending,     setSending]     = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);
  const router = useRouter();

  const handleHardRefresh = async () => {
    setRefreshing(true);
    router.refresh();
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  const currentVersion = changelogs[0]?.version;

  const filtered = filter === "all"
    ? changelogs
    : changelogs.filter((c) =>
        (c.items as ChangelogItem[]).some((i) => i.type === filter)
      );

  const handleNewNote = async () => {
    if (!noteAuthor || !noteMessage.trim()) return;
    setSending(true);
    await createAdminNote({ author: noteAuthor, message: noteMessage.trim() });
    setSending(false);
    setNoteMessage("");
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h1 className="text-2xl font-semibold">سجل التحديثات والملاحظات</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleHardRefresh}
          disabled={refreshing}
          className="shrink-0 gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Hard Refresh
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">تاريخ كامل لكل إصدار — مرتّب من الأحدث للأقدم</p>

      <Tabs defaultValue="changelog" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="changelog" className="flex-1">
            التحديثات ({changelogs.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex-1">
            ملاحظات الفريق ({notes.length})
          </TabsTrigger>
        </TabsList>

        {/* Changelog Tab */}
        <TabsContent value="changelog" className="space-y-4">
          <StatsBar changelogs={changelogs} />
          <FilterBar active={filter} onChange={setFilter} />

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>لا توجد نتائج لهذا الفلتر</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((log) => (
                <ChangelogCard
                  key={log.id}
                  log={log}
                  isCurrent={log.version === currentVersion}
                  filter={filter}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <h3 className="text-sm font-semibold">ملاحظة جديدة</h3>
            <Select value={noteAuthor} onValueChange={setNoteAuthor}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="اسمك" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_MEMBERS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={noteMessage}
              onChange={(e) => setNoteMessage(e.target.value)}
              placeholder="اكتب ملاحظتك — مشكلة، اقتراح، سؤال..."
              rows={3}
            />
            <div className="flex justify-end">
              <Button onClick={handleNewNote} disabled={!noteAuthor || !noteMessage.trim() || sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="ms-1.5">إرسال</span>
              </Button>
            </div>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>لا توجد ملاحظات بعد — كن أول من يكتب!</p>
            </div>
          ) : (
            notes.map((note) => <NoteCard key={note.id} note={note} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
