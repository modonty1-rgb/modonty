import { ALERT_CHANNELS, ALERT_TOPICS, type AlertChannelId, type AlertTopicId } from "./alert-topics";

export interface TopicAlert {
  channels: AlertChannelId[];
  /** When the reader agreed — «وافق» alone is not enough on the day someone asks when. */
  consentAt: string;
}

export interface AlertPreferences {
  marketingEmails: boolean;
  topics: Partial<Record<AlertTopicId, TopicAlert>>;
}

const channelIds = new Set<string>(ALERT_CHANNELS.map((c) => c.id));
const topicIds = new Set<string>(ALERT_TOPICS.map((t) => t.id));

/**
 * The reader's alert choices, read out of `User.notificationPreferences` (a free JSON column the
 * registration already writes `marketingEmails` into). Anything unknown or malformed is dropped:
 * a topic only counts with at least one known channel and a consent date.
 */
export function readAlertPreferences(raw: unknown): AlertPreferences {
  const prefs = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const topics: AlertPreferences["topics"] = {};
  const rawTopics = prefs.topics && typeof prefs.topics === "object" ? (prefs.topics as Record<string, unknown>) : {};

  for (const [id, value] of Object.entries(rawTopics)) {
    if (!topicIds.has(id) || !value || typeof value !== "object") continue;
    const v = value as { channels?: unknown; consentAt?: unknown };
    const channels = Array.isArray(v.channels) ? v.channels.filter((c): c is AlertChannelId => channelIds.has(String(c))) : [];
    if (channels.length && typeof v.consentAt === "string") topics[id as AlertTopicId] = { channels, consentAt: v.consentAt };
  }

  return { marketingEmails: prefs.marketingEmails === true, topics };
}
