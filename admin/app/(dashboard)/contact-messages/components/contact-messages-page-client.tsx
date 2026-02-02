"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ContactMessagesTable } from "./contact-messages-table";
import { useSearchContext } from "./contact-messages-header-wrapper";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
  client: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface ContactMessagesPageClientProps {
  messages: ContactMessage[];
}

export function ContactMessagesPageClient({ messages }: ContactMessagesPageClientProps) {
  const { search } = useSearchContext();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";

  const filteredMessages = useMemo(() => {
    let result = messages;

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((msg) => msg.status === statusFilter);
    }

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      result = result.filter((message) => {
        return (
          message.name.toLowerCase().includes(searchTerm) ||
          message.email.toLowerCase().includes(searchTerm) ||
          message.subject.toLowerCase().includes(searchTerm) ||
          message.message.toLowerCase().includes(searchTerm) ||
          message.client?.name.toLowerCase().includes(searchTerm)
        );
      });
    }

    return result;
  }, [messages, search, statusFilter]);

  return <ContactMessagesTable messages={filteredMessages} />;
}
