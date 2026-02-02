import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getFAQById } from "../../actions/faq-actions";
import { FAQForm } from "../../components/faq-form";

export default async function EditFAQPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const faq = await getFAQById(id);

  if (!faq) {
    redirect("/modonty/faq");
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader
        title="Edit FAQ"
        description="Update frequently asked question details"
      />
      <FAQForm
        faqId={id}
        initialData={{
          question: faq.question,
          answer: faq.answer,
          position: faq.position,
          isActive: faq.isActive,
          seoTitle: faq.seoTitle || undefined,
          seoDescription: faq.seoDescription || undefined,
          lastReviewed: faq.lastReviewed || undefined,
          reviewedBy: faq.reviewedBy || undefined,
          author: faq.author || undefined,
          upvoteCount: faq.upvoteCount || undefined,
          answerCount: faq.answerCount || undefined,
          dateCreated: faq.dateCreated || undefined,
          datePublished: faq.datePublished || undefined,
          inLanguage: faq.inLanguage,
          speakable: faq.speakable || undefined,
          mainEntity: faq.mainEntity || undefined,
        }}
      />
    </div>
  );
}
