"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ar } from "@/lib/ar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MailOpen, CheckCheck, Archive, Trash2, Send } from "lucide-react";
import { ContactMessageWithDetails } from "../helpers/support-queries-enhanced";
import { updateMessageStatus, deleteMessage, sendReply } from "../actions/support-actions";

interface MessagesListProps {
  messages: ContactMessageWithDetails[];
  clientId: string;
}

function statusLabel(status: string): string {
  const s = ar.support;
  if (status === "new") return s.new;
  if (status === "read") return s.read;
  if (status === "replied") return s.replied;
  if (status === "archived") return s.archived;
  return status;
}

function decodeReferrerUrl(url: string): string {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
}

export function MessagesList({ messages, clientId }: MessagesListProps) {
  const router = useRouter();
  const s = ar.support;
  const [filter, setFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyViaEmail, setReplyViaEmail] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);

  const filteredMessages =
    filter === "all"
      ? messages
      : messages.filter((m) => m.status === filter);

  const handleStatusUpdate = async (
    messageId: string,
    status: "new" | "read" | "replied" | "archived"
  ) => {
    setUpdating(messageId);
    const result = await updateMessageStatus(messageId, clientId, status);
    if (!result.success) {
      alert(result.error || s.updateFailed);
    }
    setUpdating(null);
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm(s.deleteConfirm)) return;

    setUpdating(messageId);
    const result = await deleteMessage(messageId, clientId);
    if (!result.success) {
      alert(result.error || s.deleteFailed);
    }
    setUpdating(null);
  };

  const handleSendReply = async () => {
    if (!selectedMsg) return;
    setSendingReply(true);
    const result = await sendReply(selectedMsg.id, clientId, replyBody, replyViaEmail);
    setSendingReply(false);
    if (result.success) {
      setReplyBody("");
      if (result.emailFailed) {
        alert(s.replySavedEmailFailed);
      } else {
        alert(s.replySuccess);
      }
      router.refresh();
    } else {
      alert(result.error ?? s.replyFailed);
    }
  };

  const selectedMsg = messages.find((m) => m.id === selectedMessage);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{s.messages}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {filteredMessages.length}
            </span>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              {s.all}
            </Button>
            <Button
              variant={filter === "new" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("new")}
            >
              {s.new}
            </Button>
            <Button
              variant={filter === "read" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("read")}
            >
              {s.read}
            </Button>
            <Button
              variant={filter === "replied" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("replied")}
            >
              {s.replied}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredMessages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {s.noMessagesFound}
              </p>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedMessage === message.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedMessage(message.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {message.status === "new" ? (
                        <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <MailOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {message.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {message.subject}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                        message.status === "new"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {statusLabel(message.status)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(message.createdAt).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{s.messageDetails}</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedMsg ? (
            <p className="text-center text-sm text-muted-foreground py-12">
              {s.selectToView}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.from}</p>
                    <p className="font-medium text-foreground">{selectedMsg.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedMsg.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{s.subject}</p>
                    <p className="font-medium text-foreground">
                      {selectedMsg.subject}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{s.received}</p>
                    <p className="text-sm text-foreground">
                      {new Date(selectedMsg.createdAt).toLocaleString("ar-SA")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleStatusUpdate(selectedMsg.id, "read")
                    }
                    disabled={updating === selectedMsg.id}
                    title={s.markRead}
                  >
                    <MailOpen className="h-3 w-3" />
                    <span className="ms-1.5 hidden sm:inline">{s.markRead}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleStatusUpdate(selectedMsg.id, "replied")
                    }
                    disabled={updating === selectedMsg.id}
                    title={s.markReplied}
                  >
                    <CheckCheck className="h-3 w-3" />
                    <span className="ms-1.5 hidden sm:inline">{s.markReplied}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleStatusUpdate(selectedMsg.id, "archived")
                    }
                    disabled={updating === selectedMsg.id}
                    title={s.markArchived}
                  >
                    <Archive className="h-3 w-3" />
                    <span className="ms-1.5 hidden sm:inline">{s.markArchived}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(selectedMsg.id)}
                    disabled={updating === selectedMsg.id}
                    title={s.delete}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="ms-1.5 hidden sm:inline">{s.delete}</span>
                  </Button>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">{s.message}</p>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {selectedMsg.message}
                  </p>
                </div>
              </div>

              {selectedMsg.replyBody && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-2">{s.yourReply}</p>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {selectedMsg.replyBody}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4 space-y-3">
                <Label className="text-sm font-medium">{s.reply}</Label>
                <Textarea
                  placeholder={s.message}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="reply-via-email"
                    checked={replyViaEmail}
                    onCheckedChange={(v) => setReplyViaEmail(v === true)}
                  />
                  <Label htmlFor="reply-via-email" className="text-sm font-normal cursor-pointer">
                    {s.replyViaEmail}
                  </Label>
                </div>
                <Button
                  onClick={handleSendReply}
                  disabled={sendingReply || !replyBody.trim()}
                  size="sm"
                >
                  <Send className="h-3 w-3 me-1.5" />
                  {sendingReply ? "…" : s.sendReply}
                </Button>
              </div>

              {selectedMsg.referrer && (
                <div>
                  <p className="text-sm text-muted-foreground">{s.referrer}</p>
                  <p className="text-xs text-muted-foreground break-all text-left" dir="ltr">
                    {decodeReferrerUrl(selectedMsg.referrer)}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
