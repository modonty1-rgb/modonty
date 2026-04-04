import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getContactMessageById } from "../actions/contact-messages-actions";
import { ContactMessageView } from "./components/contact-message-view";

export default async function ContactMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const message = await getContactMessageById(id);

  if (!message) {
    redirect("/contact-messages");
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Contact Message"
        description="View and manage contact message details"
      />
      <ContactMessageView message={message} />
    </div>
  );
}
