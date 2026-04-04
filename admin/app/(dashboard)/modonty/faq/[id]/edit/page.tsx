import { redirect } from "next/navigation";
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
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Edit FAQ</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Update question and answer</p>
      </div>
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
