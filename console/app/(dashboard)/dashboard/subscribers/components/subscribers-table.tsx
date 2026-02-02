"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserX, UserCheck, Trash2, Download, Shield } from "lucide-react";
import { SubscriberWithDetails } from "../helpers/subscriber-queries";
import {
  unsubscribeUser,
  resubscribeUser,
  deleteSubscriber,
  exportSubscribers,
} from "../actions/subscriber-actions";

interface SubscribersTableProps {
  subscribers: SubscriberWithDetails[];
  clientId: string;
}

export function SubscribersTable({
  subscribers,
  clientId,
}: SubscribersTableProps) {
  const [filter, setFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const filteredSubscribers =
    filter === "all"
      ? subscribers
      : filter === "active"
      ? subscribers.filter((s) => s.subscribed)
      : subscribers.filter((s) => !s.subscribed);

  const handleUnsubscribe = async (subscriberId: string) => {
    setUpdating(subscriberId);
    const result = await unsubscribeUser(subscriberId, clientId);
    if (!result.success) {
      alert(result.error || "Failed to unsubscribe");
    }
    setUpdating(null);
  };

  const handleResubscribe = async (subscriberId: string) => {
    setUpdating(subscriberId);
    const result = await resubscribeUser(subscriberId, clientId);
    if (!result.success) {
      alert(result.error || "Failed to resubscribe");
    }
    setUpdating(null);
  };

  const handleDelete = async (subscriberId: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;

    setUpdating(subscriberId);
    const result = await deleteSubscriber(subscriberId, clientId);
    if (!result.success) {
      alert(result.error || "Failed to delete");
    }
    setUpdating(null);
  };

  const handleExport = async () => {
    setExporting(true);
    const result = await exportSubscribers(clientId);
    if (result.success && result.data) {
      const blob = new Blob([result.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert(result.error || "Export failed");
    }
    setExporting(false);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Subscribers List</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredSubscribers.length} subscribers
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleExport} disabled={exporting}>
              <Download className="h-3 w-3 mr-2" />
              Export CSV
            </Button>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={filter === "unsubscribed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unsubscribed")}
            >
              Unsubscribed
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredSubscribers.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No subscribers found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-foreground">
                    Email
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">
                    Name
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">
                    Consent
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">
                    Subscribed At
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-3 px-2 text-foreground">
                      {subscriber.email}
                    </td>
                    <td className="py-3 px-2 text-foreground">
                      {subscriber.name || "-"}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          subscriber.subscribed
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {subscriber.subscribed ? "Active" : "Unsubscribed"}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {subscriber.consentGiven ? (
                        <Shield className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No consent
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex gap-1 justify-end">
                        {subscriber.subscribed ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUnsubscribe(subscriber.id)}
                            disabled={updating === subscriber.id}
                          >
                            <UserX className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleResubscribe(subscriber.id)}
                            disabled={updating === subscriber.id}
                          >
                            <UserCheck className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(subscriber.id)}
                          disabled={updating === subscriber.id}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
