import Link from "next/link";
import {
  HelpCircle,
  Mail,
  ChevronLeft,
  Building2,
  Inbox as InboxIcon,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  getClientsWithPendingFAQs,
  getNewContactMessages,
} from "./actions/inbox-actions";

export default async function InboxPage() {
  const [clientsWithFAQs, messages] = await Promise.all([
    getClientsWithPendingFAQs(),
    getNewContactMessages(),
  ]);

  const totalFaqs = clientsWithFAQs.reduce((sum, c) => sum + c.pendingCount, 0);
  const totalArticles = clientsWithFAQs.reduce((sum, c) => sum + c.articleCount, 0);

  return (
    <div className="px-6 py-6 max-w-[1280px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
          <InboxIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Inbox</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pending FAQs grouped by client · new contact messages
          </p>
        </div>
      </div>

      {/* ── Pending FAQs grouped by client ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">FAQs awaiting reply</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {totalFaqs} questions · {totalArticles} articles · {clientsWithFAQs.length} clients
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {clientsWithFAQs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              All caught up — no pending FAQs.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-start px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Client</th>
                    <th className="text-start px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Pending</th>
                    <th className="text-start px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Articles</th>
                    <th className="text-start px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Last submitted</th>
                    <th className="px-4 py-3 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {clientsWithFAQs.map((row) => (
                    <tr key={row.clientId} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/inbox/${row.clientId}`} className="block">
                          <div className="flex items-start gap-2">
                            <Building2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <div className="font-medium hover:text-primary line-clamp-1">
                                {row.clientName}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {row.clientEmail}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">
                          {row.pendingCount}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          {row.articleCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDistanceToNow(row.lastSubmittedAt, { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/inbox/${row.clientId}`}
                          className="inline-flex items-center text-muted-foreground hover:text-primary"
                          aria-label="Open client inbox"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── New Contact Messages ── */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base">New contact messages</CardTitle>
            <Badge variant="secondary" className="text-xs">{messages.length}</Badge>
          </div>
          <Link
            href="/contact-messages?status=new"
            className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-0.5"
          >
            All messages <ChevronLeft className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Inbox is clear — no new messages.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-start px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">From</th>
                    <th className="text-start px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Subject</th>
                    <th className="text-start px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Client</th>
                    <th className="text-start px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Received</th>
                    <th className="px-4 py-3 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {messages.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/contact-messages/${m.id}`} className="block">
                          <div className="font-medium hover:text-primary">{m.name}</div>
                          <div className="text-xs text-muted-foreground">{m.email}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 line-clamp-1 max-w-md">{m.subject}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {m.client?.name ?? <span className="italic text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDistanceToNow(m.createdAt, { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/contact-messages/${m.id}`}
                          className="inline-flex items-center text-muted-foreground hover:text-primary"
                          aria-label="Open message"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
