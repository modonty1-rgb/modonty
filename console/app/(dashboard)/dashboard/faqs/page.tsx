import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { redirect } from "next/navigation";
import { getClientFaqs, getFaqStats, formatFaqDate } from "./helpers/faq-queries";
import { FaqsTable } from "./components/faqs-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FaqsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;

  if (!clientId) redirect("/");

  const [faqsRaw, stats] = await Promise.all([
    getClientFaqs(clientId),
    getFaqStats(clientId),
  ]);

  const faqs = faqsRaw.map((q) => ({
    ...q,
    createdAtFormatted: formatFaqDate(q.createdAt),
  }));

  const f = ar.faqs;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">{f.title}</h1>
        <p className="text-muted-foreground mt-1">{f.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-base font-medium">{f.pending}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.pending}</p>
            <p className="text-xs text-muted-foreground mt-1">{f.awaitingApproval}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{f.published}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.published}</p>
            <p className="text-xs text-muted-foreground mt-1">{f.publishedFaqs}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-medium">{f.total}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">{f.allFaqs}</p>
          </CardContent>
        </Card>
      </div>

      <FaqsTable faqs={faqs} />
    </div>
  );
}
