import { PageHeader } from "@/components/shared/page-header";
import { getFAQs } from "./actions/faq-actions";
import { FAQList } from "./components/faq-list";
import { FAQCreateDialog } from "./components/faq-create-dialog";

export default async function FAQManagementPage() {
  const faqs = await getFAQs();

  return (
    <div className="container mx-auto max-w-[1128px]">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="FAQ Management"
          description="Manage frequently asked questions for the public FAQ page"
        />
        <FAQCreateDialog />
      </div>
      <FAQList faqs={faqs} />
    </div>
  );
}
