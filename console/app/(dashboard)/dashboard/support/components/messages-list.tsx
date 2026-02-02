"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MailOpen, CheckCheck, Archive, Trash2 } from "lucide-react";
import { ContactMessageWithDetails } from "../helpers/support-queries-enhanced";
import { updateMessageStatus, deleteMessage } from "../actions/support-actions";

interface MessagesListProps {
  messages: ContactMessageWithDetails[];
  clientId: string;
}

export function MessagesList({ messages, clientId }: MessagesListProps) {
  const [filter, setFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

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
      alert(result.error || "Failed to update message");
    }
    setUpdating(null);
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    setUpdating(messageId);
    const result = await deleteMessage(messageId, clientId);
    if (!result.success) {
      alert(result.error || "Failed to delete message");
    }
    setUpdating(null);
  };

  const selectedMsg = messages.find((m) => m.id === selectedMessage);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Messages</CardTitle>
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
              All
            </Button>
            <Button
              variant={filter === "new" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("new")}
            >
              New
            </Button>
            <Button
              variant={filter === "read" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("read")}
            >
              Read
            </Button>
            <Button
              variant={filter === "replied" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("replied")}
            >
              Replied
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredMessages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No messages found
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
                      {message.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Message Details</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedMsg ? (
            <p className="text-center text-sm text-muted-foreground py-12">
              Select a message to view details
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="font-medium text-foreground">{selectedMsg.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedMsg.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subject</p>
                    <p className="font-medium text-foreground">
                      {selectedMsg.subject}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Received</p>
                    <p className="text-sm text-foreground">
                      {new Date(selectedMsg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleStatusUpdate(selectedMsg.id, "read")
                    }
                    disabled={updating === selectedMsg.id}
                  >
                    <MailOpen className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleStatusUpdate(selectedMsg.id, "replied")
                    }
                    disabled={updating === selectedMsg.id}
                  >
                    <CheckCheck className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleStatusUpdate(selectedMsg.id, "archived")
                    }
                    disabled={updating === selectedMsg.id}
                  >
                    <Archive className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(selectedMsg.id)}
                    disabled={updating === selectedMsg.id}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">Message</p>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {selectedMsg.message}
                  </p>
                </div>
              </div>

              {selectedMsg.referrer && (
                <div>
                  <p className="text-sm text-muted-foreground">Referrer</p>
                  <p className="text-xs text-muted-foreground break-all">
                    {selectedMsg.referrer}
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
