import { Mail, MapPin, MessageCircle, Phone, StickyNote, Users } from "lucide-react";

import type { Channel } from "./funnel";

/** The icon of each follow-up channel — the log form's pills and the history's markers. */
export const CHANNEL_ICON: Record<Channel, typeof Phone> = {
  CALL: Phone,
  WHATSAPP: MessageCircle,
  EMAIL: Mail,
  MEETING: Users,
  VISIT: MapPin,
  NOTE: StickyNote,
};
