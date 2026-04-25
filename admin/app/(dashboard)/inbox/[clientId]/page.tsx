import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Building2,
  Mail,
  Phone,
  ExternalLink,
  HelpCircle,
  FileText,
  Pencil,
  Calendar,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getClientInboxDetail } from "../actions/inbox-actions";

interface PageProps {
  params: Promise<{ clientId: string }>;
}

const SOURCE_LABEL: Record<string, string> = {
  manual: "Manual",
  user: "Reader submission",
  chatbot: "Chatbot",
};

const SOURCE_BADGE: Record<string, string> = {
  manual: "bg-slate-500/15 text-slate-500 border-slate-500/20",
  user: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  chatbot: "bg-violet-500/15 text-violet-500 border-violet-500/20",
};

export default async function InboxClientPage({ params }: PageProps) {
  const { clientId } = await params;
  const data = await getClientInboxDetail(clientId);

  if (!data) notFound();

  const { client, articles } = data;
  const totalPending = articles.reduce((sum, a) => sum + a.faqs.length, 0);

  return (
    <div className="px-6 py-6 max-w-[1280px] mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/inbox" className="hover:text-foreground">Inbox</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground line-clamp-1">{client.name}</span>
      </nav>

      {/* Client header — full contact info */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl leading-snug">{client.name}</CardTitle>
              {client.legalName && client.legalName !== client.name && (
                <p className="text-xs text-muted-foreground mt-0.5">{client.legalName}</p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {totalPending} pending FAQs
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {articles.length} article{articles.length === 1 ? "" : "s"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-[11px] text-muted-foreground font-bold mb-2 uppercase tracking-wider">
            Contact this client
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`mailto:${client.email}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-card hover:bg-muted text-sm transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-blue-500" />
              <span>{client.email}</span>
            </a>
            {client.phone && (
              <a
                href={`tel:${client.phone}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-card hover:bg-muted text-sm transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-500" />
                <span>{client.phone}</span>
              </a>
            )}
            {client.url && (
              <a
                href={client.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-card hover:bg-muted text-sm transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-violet-500" />
                <span className="truncate max-w-xs">{client.url}</span>
              </a>
            )}
            <Link
              href={`/clients/${client.id}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View client profile
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Articles + their pending FAQs — one card per article */}
      <div className="space-y-4">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="h-9 w-9 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base leading-snug">{article.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {article.status}
                      </Badge>
                      {article.datePublished && (
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(article.datePublished, "MMM d, yyyy")}
                        </span>
                      )}
                      <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20">
                        <HelpCircle className="h-3 w-3 me-1" />
                        {article.faqs.length} pending
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/articles/${article.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Link>
                  <Link
                    href={`https://www.modonty.com/articles/${article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium hover:bg-muted"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-y bg-muted/30">
                    <tr>
                      <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-12">#</th>
                      <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Question</th>
                      <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Source</th>
                      <th className="text-start px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {article.faqs.map((faq, i) => {
                      const source = faq.source ?? "manual";
                      return (
                        <tr key={faq.id} className="hover:bg-muted/40">
                          <td className="px-4 py-3 text-muted-foreground tabular-nums">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{faq.question}</div>
                            {faq.submittedByName && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                from {faq.submittedByName}
                                {faq.submittedByEmail && ` · ${faq.submittedByEmail}`}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium ${SOURCE_BADGE[source] ?? SOURCE_BADGE.manual}`}
                            >
                              {SOURCE_LABEL[source] ?? source}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {formatDistanceToNow(faq.createdAt, { addSuffix: true })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
