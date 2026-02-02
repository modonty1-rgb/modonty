"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, Trash2, Mail, Archive, CheckCircle } from "lucide-react";
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
  markAsRead,
  markAsReplied,
  updateContactMessageStatus,
  deleteContactMessage,
} from "../actions/contact-messages-actions";
import { useToast } from "@/hooks/use-toast";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
  client: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface ContactMessagesTableProps {
  messages: ContactMessage[];
}

export function ContactMessagesTable({ messages }: ContactMessagesTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoading(id);
    try {
      const result = await updateContactMessageStatus(id, newStatus);
      if (result.success) {
        toast({
          title: "Success",
          description: "Message status updated",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
          title: "Success",
          description: "Message marked as read",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to mark as read",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
          title: "Success",
          description: "Message marked as replied",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to mark as replied",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
          title: "Success",
          description: "Message deleted",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete message",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
          data={messages}
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
    </>
  );
}
