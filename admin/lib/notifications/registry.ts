import {
  Bell,
  MessageSquare,
  Megaphone,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export interface NotificationLike {
  id: string;
  type: string;
  title: string;
  body: string;
  relatedId: string | null;
  clientId: string | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface NotificationMeta {
  icon: LucideIcon;
  /** Tailwind tone classes — text/bg/ring for the icon chip */
  toneClasses: string;
  /** Short label shown above the title in the dropdown row */
  label: string;
  /** Where clicking the row navigates */
  href: (n: NotificationLike) => string;
}

const REGISTRY: Record<string, NotificationMeta> = {
  contact_reply: {
    icon: MessageSquare,
    toneClasses: "bg-blue-100 text-blue-700 ring-blue-200",
    label: "Contact reply",
    href: (n) => (n.relatedId ? `/contact-messages` : "/contact-messages"),
  },
  campaign_interest: {
    icon: Megaphone,
    toneClasses: "bg-violet-100 text-violet-700 ring-violet-200",
    label: "Campaign lead",
    href: () => "/campaigns/leads",
  },
  faq_reply: {
    icon: HelpCircle,
    toneClasses: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    label: "FAQ reply",
    href: () => "/chatbot-questions",
  },
};

const FALLBACK: NotificationMeta = {
  icon: Bell,
  toneClasses: "bg-slate-100 text-slate-600 ring-slate-200",
  label: "Notification",
  href: () => "/",
};

export function getNotificationMeta(type: string): NotificationMeta {
  return REGISTRY[type] ?? FALLBACK;
}

export function isKnownNotificationType(type: string): boolean {
  return type in REGISTRY;
}
