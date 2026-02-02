"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Mail,
  User,
  MessageSquare,
  Calendar,
  Eye,
  CheckCircle,
  Archive,
  Trash2,
  Copy,
  ExternalLink,
  Building2,
  Globe,
  Monitor,
  Link as LinkIcon,
} from "lucide-react";
import { StatusBadge } from "../../components/status-badge";
import {
  markAsRead,
  markAsReplied,
  updateContactMessageStatus,
  deleteContactMessage,
} from "../../actions/contact-messages-actions";
import { useToast } from "@/hooks/use-toast";
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

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  createdAt: Date;
  readAt: Date | null;
  repliedAt: Date | null;
  client: {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
  } | null;
}

interface ContactMessageViewProps {
  message: ContactMessage;
}

export function ContactMessageView({ message }: ContactMessageViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const handleMarkAsRead = async () => {
    if (message.status === "read") return;
    setLoading(true);
    try {
      const result = await markAsRead(message.id);
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
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReplied = async () => {
    setLoading(true);
    try {
      const result = await markAsReplied(message.id);
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
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    setLoading(true);
    try {
      const result = await updateContactMessageStatus(message.id, "archived");
      if (result.success) {
        toast({
          title: "Success",
          description: "Message archived",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to archive message",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteContactMessage(message.id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Message deleted",
        });
        router.push("/contact-messages");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete message",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{message.subject}</CardTitle>
                  <StatusBadge status={message.status as any} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Received {format(new Date(message.createdAt), "PPpp")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(message.email, "Email")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Email
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${message.email}?subject=Re: ${message.subject}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Reply
                  </a>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Name</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{message.name}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(message.name, "Name")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${message.email}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {message.email}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(message.email, "Email")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>Message</span>
              </div>
              <div className="rounded-md border p-4 bg-muted/50">
                <p className="whitespace-pre-wrap text-sm">{message.message}</p>
              </div>
            </div>

            {message.client && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>Associated Client</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/clients/${message.client.id}`}>
                      <Button variant="outline" size="sm">
                        {message.client.name}
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(message.createdAt), "PPpp")}
                    </p>
                  </div>
                </div>
                {message.readAt && (
                  <div className="flex items-start gap-3">
                    <Eye className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Read</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(message.readAt), "PPpp")}
                      </p>
                    </div>
                  </div>
                )}
                {message.repliedAt && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Replied</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(message.repliedAt), "PPpp")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(message.ipAddress || message.userAgent || message.referrer) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Metadata</h3>
                  <div className="grid gap-4 md:grid-cols-1">
                    {message.ipAddress && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Monitor className="h-3 w-3" />
                          <span>IP Address</span>
                        </div>
                        <p className="text-sm font-mono">{message.ipAddress}</p>
                      </div>
                    )}
                    {message.userAgent && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <span>User Agent</span>
                        </div>
                        <p className="text-sm font-mono text-xs break-all">{message.userAgent}</p>
                      </div>
                    )}
                    {message.referrer && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <LinkIcon className="h-3 w-3" />
                          <span>Referrer</span>
                        </div>
                        <a
                          href={message.referrer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {message.referrer}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {message.status === "new" && (
                <Button
                  variant="outline"
                  onClick={handleMarkAsRead}
                  disabled={loading}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Mark as Read
                </Button>
              )}
              {message.status !== "replied" && message.status !== "archived" && (
                <Button
                  variant="outline"
                  onClick={handleMarkAsReplied}
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Replied
                </Button>
              )}
              {message.status !== "archived" && (
                <Button
                  variant="outline"
                  onClick={handleArchive}
                  disabled={loading}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
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
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
