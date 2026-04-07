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
  message: string;
  page: string | null;
  replies: NoteReply[];
  createdAt: string;
}

function ItemIcon({ type }: { type: string }) {
  switch (type) {
    case "fix":
      return <Bug className="h-3.5 w-3.5 text-red-500" />;
    case "feature":
      return <Sparkles className="h-3.5 w-3.5 text-emerald-500" />;
    case "improve":
      return <Zap className="h-3.5 w-3.5 text-amber-500" />;
    default:
      return null;
  }
}

function ItemBadge({ type }: { type: string }) {
  switch (type) {
    case "fix":
      return <Badge variant="secondary" className="text-[10px] bg-red-500/10 text-red-500">إصلاح</Badge>;
    case "feature":
      return <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500">جديد</Badge>;
    case "improve":
      return <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-500">تحسين</Badge>;
    default:
      return null;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NoteCard({ note }: { note: AdminNote }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const handleReply = async () => {
    if (!replyAuthor || !replyMessage.trim()) return;
    setSending(true);
    await replyToNote({ noteId: note.id, author: replyAuthor, message: replyMessage.trim() });
    setSending(false);
    setReplyMessage("");
    setReplyOpen(false);
    router.refresh();
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{note.author}</p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDate(note.createdAt)}
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

      <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.message}</p>

      {/* Replies */}
      {note.replies.length > 0 && (
        <div className="ps-6 border-s-2 border-muted space-y-3 mt-3">
          {note.replies.map((reply) => (
            <div key={reply.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{reply.author}</span>
                <span className="text-[10px] text-muted-foreground">{formatDate(reply.createdAt)}</span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reply.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply form */}
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
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="اكتب ردك..."
            rows={2}
            className="text-sm"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setReplyOpen(false)}>إلغاء</Button>
            <Button size="sm" onClick={handleReply} disabled={!replyAuthor || !replyMessage.trim() || sending}>
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
  const [noteAuthor, setNoteAuthor] = useState("");
  const [noteMessage, setNoteMessage] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();

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
      <h1 className="text-2xl font-semibold mb-6">سجل التحديثات والملاحظات</h1>

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
        <TabsContent value="changelog" className="space-y-6">
          {changelogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>لا توجد تحديثات بعد</p>
            </div>
          ) : (
            changelogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="text-sm font-mono">v{log.version}</Badge>
                    <h3 className="font-semibold">{log.title}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                </div>
                <div className="space-y-2">
                  {(log.items as ChangelogItem[]).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <ItemIcon type={item.type} />
                      <ItemBadge type={item.type} />
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          {/* New note form */}
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

          {/* Notes list */}
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
