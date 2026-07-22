"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataTable } from "@/components/admin/data-table";
import { messages } from "@/lib/messages";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, Trash2, Mail, Archive, CheckCircle, Reply, Send, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  markAsRead,
  markAsReplied,
  updateContactMessageStatus,
  deleteContactMessage,
  sendContactReply,
} from "../actions/contact-messages-actions";
import { useToast } from "@/hooks/use-toast";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  createdAt: Date;
  readAt?: Date | null;
  repliedAt?: Date | null;
  client: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface ContactMessagesTableProps {
  messages: ContactMessage[];
}

export function ContactMessagesTable({ messages: contactMessages }: ContactMessagesTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendReply = async () => {
    if (!replyTarget) return;
    const body = replyText.trim();
    if (!body) return;
    setSending(true);
    try {
      const result = await sendContactReply(replyTarget.id, body, true);
      if (result.success) {
        toast({
          title: result.emailFailed ? "Reply saved — email failed" : "Reply sent",
          description: result.emailFailed
            ? "Saved and marked replied, but the email didn't go out."
            : `Emailed to ${replyTarget.email} and marked as replied.`,
          variant: result.emailFailed ? "destructive" : "success",
        });
        setReplyTarget(null);
        setReplyText("");
        router.refresh();
      } else {
        toast({
          title: messages.error.operation_failed,
          description: result.error || "Couldn't send the reply",
          variant: "destructive",
        });
      }
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoading(id);
    try {
      const result = await updateContactMessageStatus(id, newStatus);
      if (result.success) {
        toast({
          title: messages.success.updated,
          description: messages.descriptions.message_status_updated,
          variant: "success",
        });
        router.refresh();
      } else {
        toast({
          title: messages.error.operation_failed,
          description: result.error || "تعذّر تحديث الحالة",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "فشلت العملية",
        description: messages.descriptions.unexpected_error,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setLoading(id);
    try {
      const result = await markAsRead(id);
      if (result.success) {
        toast({
          title: messages.success.read,
          description: messages.descriptions.message_status_updated,
          variant: "success",
        });
        router.refresh();
      } else {
        toast({
          title: messages.error.operation_failed,
          description: result.error || "تعذّر تعليم الرسالة كمقروءة",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "فشلت العملية",
        description: messages.descriptions.unexpected_error,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleMarkAsReplied = async (id: string) => {
    setLoading(id);
    try {
      const result = await markAsReplied(id);
      if (result.success) {
        toast({
          title: messages.success.replied,
          description: messages.descriptions.message_replied,
          variant: "success",
        });
        router.refresh();
      } else {
        toast({
          title: messages.error.operation_failed,
          description: result.error || "تعذّر تعليم الرسالة كمُجاب عليها",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "فشلت العملية",
        description: messages.descriptions.unexpected_error,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;

    setLoading(messageToDelete);
    try {
      const result = await deleteContactMessage(messageToDelete);
      if (result.success) {
        toast({
          title: messages.success.deleted,
          description: messages.descriptions.message_deleted,
          variant: "success",
        });
        router.refresh();
      } else {
        toast({
          title: messages.error.operation_failed,
          description: result.error || "تعذّر حذف الرسالة",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "فشلت العملية",
        description: messages.descriptions.unexpected_error,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setMessageToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <DataTable
          data={contactMessages}
          columns={[
            {
              key: "name",
              header: "Name",
              render: (message) => (
                <Link
                  href={`/contact-messages/${message.id}`}
                  className="font-medium hover:text-primary hover:underline"
                >
                  {message.name}
                </Link>
              ),
            },
            {
              key: "email",
              header: "Email",
              render: (message) => (
                <a
                  href={`mailto:${message.email}`}
                  className="text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {message.email}
                </a>
              ),
            },
            {
              key: "subject",
              header: "Subject",
              render: (message) => (
                <span className="max-w-xs truncate block" title={message.subject}>
                  {message.subject}
                </span>
              ),
            },
            {
              key: "client",
              header: "Client",
              render: (message) => message.client?.name || "-",
            },
            {
              key: "status",
              header: "Status",
              render: (message) => <StatusBadge status={message.status as any} />,
            },
            {
              key: "createdAt",
              header: "Created",
              render: (message) => format(new Date(message.createdAt), "MMM d, yyyy HH:mm"),
            },
            {
              key: "actions",
              header: "Actions",
              render: (message) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplyTarget(message);
                      setReplyText("");
                    }}
                    disabled={loading === message.id}
                  >
                    <Reply className="h-4 w-4 me-1.5" />
                    Reply
                  </Button>
                  <Link href={`/contact-messages/${message.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {message.status === "new" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(message.id);
                      }}
                      disabled={loading === message.id}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                  {message.status !== "replied" && message.status !== "archived" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsReplied(message.id);
                      }}
                      disabled={loading === message.id}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {message.status !== "archived" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(message.id, "archived");
                      }}
                      disabled={loading === message.id}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(message.id);
                    }}
                    disabled={loading === message.id}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ),
            },
          ]}
          onRowClick={(message) => {
            router.push(`/contact-messages/${message.id}`);
          }}
          pageSize={20}
        />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!replyTarget}
        onOpenChange={(open) => {
          if (!open) {
            setReplyTarget(null);
            setReplyText("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {replyTarget?.name}</DialogTitle>
            <DialogDescription>
              Sends an email to {replyTarget?.email} · Re: {replyTarget?.subject}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply…"
            rows={6}
            disabled={sending}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReplyTarget(null);
                setReplyText("");
              }}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button onClick={handleSendReply} disabled={sending || !replyText.trim()}>
              {sending ? <Loader2 className="h-4 w-4 me-2 animate-spin" /> : <Send className="h-4 w-4 me-2" />}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
