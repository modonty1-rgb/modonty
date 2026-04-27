"use client";

import { useState } from "react";
import { ar } from "@/lib/ar";
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
  const s = ar.subscribers;
  const [filter, setFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const filteredSubscribers =
    filter === "all"
      ? subscribers
      : filter === "active"
      ? subscribers.filter((sub) => sub.subscribed)
      : subscribers.filter((sub) => !sub.subscribed);

  const handleUnsubscribe = async (subscriberId: string) => {
    setUpdating(subscriberId);
    const result = await unsubscribeUser(subscriberId, clientId);
    if (!result.success) {
      alert(result.error || s.unsubscribeFailed);
    }
    setUpdating(null);
  };

  const handleResubscribe = async (subscriberId: string) => {
    setUpdating(subscriberId);
    const result = await resubscribeUser(subscriberId, clientId);
    if (!result.success) {
      alert(result.error || s.resubscribeFailed);
    }
    setUpdating(null);
  };

  const handleDelete = async (subscriberId: string) => {
    if (!confirm(s.deleteSubscriberConfirm)) return;

    setUpdating(subscriberId);
    const result = await deleteSubscriber(subscriberId, clientId);
    if (!result.success) {
      alert(result.error || s.deleteFailed);
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
      alert(result.error || s.exportFailed);
    }
    setExporting(false);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">{s.subscribersList}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredSubscribers.length} {s.subscribersCount}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleExport} disabled={exporting}>
              <Download className="h-3.5 w-3.5 me-2" />
              {s.exportCsv}
            </Button>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              {s.all}
            </Button>
            <Button
              variant={filter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("active")}
            >
              {s.active}
            </Button>
            <Button
              variant={filter === "unsubscribed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unsubscribed")}
            >
              {s.unsubscribed}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredSubscribers.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {s.noSubscribers}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-start py-3 px-2 font-medium text-foreground">
                    {s.email}
                  </th>
                  <th className="text-start py-3 px-2 font-medium text-foreground">
                    {s.name}
                  </th>
                  <th className="text-start py-3 px-2 font-medium text-foreground">
                    {s.status}
                  </th>
                  <th className="text-start py-3 px-2 font-medium text-foreground">
                    {s.consent}
                  </th>
                  <th className="text-start py-3 px-2 font-medium text-foreground">
                    {s.subscribedAt}
                  </th>
                  <th className="text-end py-3 px-2 font-medium text-foreground">
                    {s.actions}
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
                      {subscriber.name || "—"}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          subscriber.subscribed
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {subscriber.subscribed ? s.active : s.unsubscribed}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {subscriber.consentGiven ? (
                        <Shield className="h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {s.noConsent}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {new Date(subscriber.subscribedAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="py-3 px-2 text-end">
                      <div className="flex gap-2 justify-end">
                        {subscriber.subscribed ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleUnsubscribe(subscriber.id)}
                            disabled={updating === subscriber.id}
                            aria-label={s.unsubscribed}
                            title={s.unsubscribed}
                            className="h-10 w-10"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleResubscribe(subscriber.id)}
                            disabled={updating === subscriber.id}
                            aria-label={s.active}
                            title={s.active}
                            className="h-10 w-10"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(subscriber.id)}
                          disabled={updating === subscriber.id}
                          aria-label={s.actions}
                          title={s.actions}
                          className="h-10 w-10"
                        >
                          <Trash2 className="h-4 w-4" />
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
