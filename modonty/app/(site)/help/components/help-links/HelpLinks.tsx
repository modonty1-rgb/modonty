import Link from "next/link";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IconHelpCircle, IconFaqQuestion, IconEmail } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";

import type { ComponentType } from "react";

const text = messages.help.cards;

interface HelpLink {
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

/** The three doors out of the help centre: the FAQ, the feedback form, and support. */
const LINKS: HelpLink[] = [
  {
    href: "/help/faq",
    icon: IconFaqQuestion,
    title: text.faq.title,
    description: text.faq.description,
  },
  {
    href: "/help/feedback",
    icon: IconEmail,
    title: text.feedback.title,
    description: text.feedback.description,
  },
  {
    href: "/contact",
    icon: IconHelpCircle,
    title: text.contact.title,
    description: text.contact.description,
  },
];

export function HelpLinks() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {LINKS.map(({ href, icon: Icon, title, description }) => (
        <Link key={href} href={href}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
