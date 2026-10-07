import "server-only";

import { db } from "@/lib/db";
import { disableReaderDevices } from "./disable-reader-devices";

/**
 * Expo's public push endpoint and batch limit — verified against expo-server-sdk 7.2.0
 * (`ExpoClientValues.js`: `sendApiUrl = https://exp.host/--/api/v2/push/send`,
 * `pushNotificationChunkLimit = 100`). Not a Modonty secret.
 */
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const CHUNK = 100;

/** One reader notification to push — `type` is the Notification row's own type (one key, no `event`). */
export interface ReaderPush {
  notificationId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  articleSlug?: string | null;
  reelSlug?: string | null;
  /** Whoever caused the event. A reader is never pushed about their own action (no echo). */
  actorUserId?: string | null;
}

interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  sound: "default";
  channelId: "default";
  data: { type: string; notificationId: string; articleSlug?: string; reelSlug?: string };
}

/** expo-server-sdk `ExpoPushTicket`: `{ status: 'ok', id }` | `{ status: 'error', message, details?: { error? } }`. */
interface ExpoTicket {
  status: "ok" | "error";
  message?: string;
  details?: { error?: string };
}

export interface NotifyReaderResult {
  /** Notifications whose every message reached Expo (or that had no phone to reach) — done. */
  settled: Set<string>;
  sent: number;
  disabledDevices: number;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Encoding": "gzip, deflate",
    "Content-Type": "application/json",
  };
  // Only when "Enhanced Security for Push Notifications" is on for the Expo project.
  const token = process.env.EXPO_ACCESS_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Sends reader notifications to every enabled `ReaderDevice` of their recipients through the Expo
 * Push API, ≤100 messages per request. A ticket `DeviceNotRegistered` disables that row (the
 * `lib/mobile-push.ts` rule). A failed request leaves its notifications unsettled so the caller can
 * retry; nothing here throws for an Expo outage — it is logged.
 */
export async function notifyReader(pushes: ReaderPush[]): Promise<NotifyReaderResult> {
  const settled = new Set<string>();
  const wanted = pushes.filter((p) => {
    const echo = !!p.actorUserId && p.actorUserId === p.userId;
    if (echo) settled.add(p.notificationId);
    return !echo;
  });
  if (wanted.length === 0) return { settled, sent: 0, disabledDevices: 0 };

  const devices = await db.readerDevice.findMany({
    where: { userId: { in: [...new Set(wanted.map((p) => p.userId))] }, enabled: true },
    select: { userId: true, expoPushToken: true },
  });
  const tokensByUser = new Map<string, string[]>();
  for (const d of devices) tokensByUser.set(d.userId, [...(tokensByUser.get(d.userId) ?? []), d.expoPushToken]);

  const messages: { message: ExpoMessage; notificationId: string }[] = [];
  for (const p of wanted) {
    const tokens = tokensByUser.get(p.userId) ?? [];
    if (tokens.length === 0) settled.add(p.notificationId);
    for (const to of tokens) {
      messages.push({
        notificationId: p.notificationId,
        message: {
          to,
          title: p.title,
          body: p.body,
          sound: "default",
          channelId: "default",
          data: {
            type: p.type,
            notificationId: p.notificationId,
            ...(p.articleSlug ? { articleSlug: p.articleSlug } : {}),
            ...(p.reelSlug ? { reelSlug: p.reelSlug } : {}),
          },
        },
      });
    }
  }

  const failed = new Set<string>();
  const deadTokens: string[] = [];
  let sent = 0;
  for (let i = 0; i < messages.length; i += CHUNK) {
    const chunk = messages.slice(i, i + CHUNK);
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(chunk.map((c) => c.message)),
      });
      const json = (await response.json().catch(() => null)) as { data?: ExpoTicket[]; errors?: unknown } | null;
      if (!response.ok || !Array.isArray(json?.data)) {
        console.error("[push:notify-reader] Expo rejected the request", response.status, json?.errors ?? json);
        chunk.forEach((c) => failed.add(c.notificationId));
        continue;
      }
      // Tickets come back in message order.
      json.data.forEach((ticket, index) => {
        if (ticket.status === "ok") {
          sent += 1;
          return;
        }
        if (ticket.details?.error === "DeviceNotRegistered") deadTokens.push(chunk[index].message.to);
        else console.warn("[push:notify-reader] ticket error", ticket.details?.error ?? ticket.message);
      });
    } catch (error) {
      console.error("[push:notify-reader] Expo request failed", error);
      chunk.forEach((c) => failed.add(c.notificationId));
    }
  }

  for (const m of messages) if (!failed.has(m.notificationId)) settled.add(m.notificationId);
  const disabledDevices = deadTokens.length
    ? await disableReaderDevices({ tokens: deadTokens }, "DeviceNotRegistered")
    : 0;
  return { settled, sent, disabledDevices };
}
