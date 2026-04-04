import { getFAQs } from "./actions/faq-actions";
import { FAQList } from "./components/faq-list";
import { FAQCreateDialog } from "./components/faq-create-dialog";
import { Badge } from "@/components/ui/badge";
import { CircleHelp } from "lucide-react";

export default async function FAQManagementPage() {
  const faqs = await getFAQs();
  const activeCount = faqs.filter((f) => f.isActive).length;
  const inactiveCount = faqs.length - activeCount;

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <CircleHelp className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">FAQ</h1>
            <Badge variant="secondary" className="text-xs">{faqs.length}</Badge>
            {activeCount > 0 && (
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                {activeCount} active
              </Badge>
            )}
            {inactiveCount > 0 && (
              <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-600 bg-yellow-500/10">
                {inactiveCount} hidden
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage frequently asked questions — shown on the public FAQ page
          </p>
        </div>
        <FAQCreateDialog />
      </div>
      <FAQList faqs={faqs} />
    </div>
  );
}
