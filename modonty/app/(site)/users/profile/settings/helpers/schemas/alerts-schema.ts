import { z } from "zod";
import type { AlertChannelId, AlertTopicId } from "@/lib/users/alert-topics";

export const alertsInput = z.object({
  marketingEmails: z.boolean(),
  /** Per topic, the channels chosen — an empty list turns the topic off. */
  topics: z.record(z.string(), z.array(z.string()).max(3)),
  /** Dial code without + («966») or «other» when the reader typed the full international number. */
  phoneDial: z.string().trim().max(8).optional().default("966"),
  phone: z.string().trim().max(30).optional().default(""),
});

export interface AlertSettings {
  email: string | null;
  phone: string | null;
  marketingEmails: boolean;
  topics: Partial<Record<AlertTopicId, AlertChannelId[]>>;
}
