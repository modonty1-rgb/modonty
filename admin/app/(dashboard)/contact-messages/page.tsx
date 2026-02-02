import { getContactMessages, getContactMessagesStats } from "./actions/contact-messages-actions";
import { ContactMessagesStats } from "./components/contact-messages-stats";
import { ContactMessagesPageClient } from "./components/contact-messages-page-client";
import { ContactMessagesHeaderWrapper } from "./components/contact-messages-header-wrapper";

export default async function ContactMessagesPage() {
  const [messages, stats] = await Promise.all([
    getContactMessages(),
    getContactMessagesStats(),
  ]);

  const getDescription = () => {
    return "Manage and respond to contact messages from visitors";
  };

  return (
    <div className="container mx-auto max-w-[1128px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <ContactMessagesHeaderWrapper
        messageCount={messages.length}
        description={getDescription()}
      >
        <ContactMessagesStats stats={stats} />
        <ContactMessagesPageClient messages={messages} />
      </ContactMessagesHeaderWrapper>
    </div>
  );
}
