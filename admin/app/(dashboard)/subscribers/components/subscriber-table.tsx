"use client";

import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { updateSubscriberStatus } from "../actions/subscribers-actions";
import { useRouter } from "next/navigation";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed: boolean;
  subscribedAt: Date;
  client: { name: string } | null;
}

interface SubscriberTableProps {
  subscribers: Subscriber[];
}

export function SubscriberTable({ subscribers }: SubscriberTableProps) {
  const router = useRouter();

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await updateSubscriberStatus(id, !currentStatus);
    if (result.success) {
      router.refresh();
    }
  };

  return (
    <DataTable
      data={subscribers}
      columns={[
        {
          key: "email",
          header: "Email",
        },
        {
          key: "name",
          header: "Name",
          render: (subscriber) => subscriber.name || "-",
        },
        {
          key: "client",
          header: "Client",
          render: (subscriber) => subscriber.client?.name || "-",
        },
        {
          key: "subscribed",
          header: "Status",
          render: (subscriber) => (
            <Badge variant={subscriber.subscribed ? "default" : "secondary"}>
              {subscriber.subscribed ? "Subscribed" : "Unsubscribed"}
            </Badge>
          ),
        },
        {
          key: "subscribedAt",
          header: "Subscribed",
          render: (subscriber) => format(new Date(subscriber.subscribedAt), "MMM d, yyyy"),
        },
        {
          key: "actions",
          header: "Actions",
          render: (subscriber) => (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(subscriber.id, subscriber.subscribed);
              }}
            >
              {subscriber.subscribed ? "Unsubscribe" : "Subscribe"}
            </Button>
          ),
        },
      ]}
      searchKey="email"
    />
  );
}
