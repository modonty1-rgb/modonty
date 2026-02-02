import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface RecentSubscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed: boolean;
  subscribedAt: Date;
  createdAt: Date;
  client: { name: string } | null;
}

interface RecentSubscribersProps {
  subscribers: RecentSubscriber[];
}

export function RecentSubscribers({ subscribers }: RecentSubscribersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Subscribers</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Latest 10 subscribers sorted by creation date
        </p>
      </CardHeader>
      <CardContent>
        {subscribers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subscribers yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>{subscriber.name || "-"}</TableCell>
                  <TableCell>{subscriber.client?.name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={subscriber.subscribed ? "default" : "secondary"}>
                      {subscriber.subscribed ? "Active" : "Unsubscribed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(subscriber.subscribedAt), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
