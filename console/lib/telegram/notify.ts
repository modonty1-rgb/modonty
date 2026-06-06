/**
 * Event router. Called from server actions across modonty + console after a
 * visitor-engagement event is persisted. Loads the client's telegramChatId +
 * preferences, checks whether the event is enabled, and dispatches a formatted
 * Telegram message via sendTelegramMessage.
 *
 * Failure to send must NEVER block the originating flow — we always swallow
 * errors and continue.
 */

import { db } from "@/lib/db";
import { sendTelegramMessage, sendAdminTelegram, escapeTgHtml } from "./client";
import {
  TELEGRAM_EVENTS,
  isTelegramEventEnabled,
  type TelegramEventKey,
  type TelegramEventPreferences,
} from "./events";
import {
  buildTelegramFooter,
  lookupGeoByIp,
  readGeoFromHeaders,
  type GeoInfo,
} from "./geo";

export interface TelegramEventPayload {
  /** Optional human-readable headline shown after the emoji + label. */
  title?: string;
  /** Optional body — e.g. visitor name + comment text. */
  body?: string;
  /** Optional link (article URL, dashboard URL etc) shown at the bottom. */
  link?: { label: string; url: string };
  /** Optional metadata lines (key:value) shown in a small block. */
  meta?: Record<string, string | number | undefined | null>;
  /** Visitor IP — used for geo footer (city + country). Optional. */
  ipAddress?: string | null;
  /** Pre-resolved geo info (e.g. from Vercel/CF headers). Optional. */
  geo?: GeoInfo | null;
  /** Request headers — if provided, geo is auto-extracted (free, instant). */
  headers?: Headers | null;
}

const eventByKey = new Map(TELEGRAM_EVENTS.map((e) => [e.key, e]));

function formatMessage(
  eventKey: TelegramEventKey,
  payload: TelegramEventPayload
): string {
  const def = eventByKey.get(eventKey);
  if (!def) return escapeTgHtml(payload.title ?? eventKey);

  const lines: string[] = [];
  lines.push(`${def.emoji} <b>${escapeTgHtml(def.label)}</b>`);
  if (payload.title) lines.push(escapeTgHtml(payload.title));
  if (payload.body) {
    const trimmed =
      payload.body.length > 400
        ? `${payload.body.slice(0, 400)}…`
        : payload.body;
    lines.push("");
    lines.push(`<i>${escapeTgHtml(trimmed)}</i>`);
  }
  if (payload.meta) {
    const metaLines = Object.entries(payload.meta)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `<b>${escapeTgHtml(k)}:</b> ${escapeTgHtml(String(v))}`);
    if (metaLines.length) {
      lines.push("");
      lines.push(...metaLines);
    }
  }
  if (payload.link) {
    lines.push("");
    lines.push(
      `<a href="${escapeTgHtml(payload.link.url)}">${escapeTgHtml(payload.link.label)}</a>`
    );
  }
  return lines.join("\n");
}

// Admin mirror — copies client events to the admin alerts chat (TELEGRAM_ADMIN_CHAT_ID),
// independent of whether the client connected Telegram. The "mirror everything"
// switch lives in Settings.telegramAdminMirrorAll (toggled from the admin UI):
//   true  → full firehose: EVERY event (site-activity monitoring).
//   false → only the high-signal events below.
const ADMIN_MIRROR_EVENTS: ReadonlySet<TelegramEventKey> = new Set([
  "bookingRequest",
  "supportMessage",
  "askClientQuestion",
  "campaignInterest",
]);

/**
 * Public entry point. Safe to call from any server action.
 *  - clientId: the Client whose Telegram chat should receive the message
 *  - eventKey: one of the 26 supported events
 *  - payload: optional content (visitor name, article title, link, etc.)
 *
 * Sends to the client's own chat (if connected + event enabled) AND mirrors
 * high-signal events to the admin chat (prefixed with the client name).
 */
export async function notifyTelegram(
  clientId: string | null | undefined,
  eventKey: TelegramEventKey,
  payload: TelegramEventPayload = {}
): Promise<void> {
  if (!clientId) return;

  try {
    const [client, settings] = await Promise.all([
      db.client.findUnique({
        where: { id: clientId },
        select: {
          name: true,
          telegramChatId: true,
          telegramEventPreferences: true,
        },
      }),
      db.settings.findUnique({
        where: { singletonKey: "global" },
        select: { telegramAdminMirrorAll: true },
      }),
    ]);
    if (!client) return;

    const prefs = (client.telegramEventPreferences ??
      null) as TelegramEventPreferences | null;
    const clientWants =
      Boolean(client.telegramChatId) && isTelegramEventEnabled(prefs, eventKey);
    const mirrorAll = settings?.telegramAdminMirrorAll ?? true;
    const adminWants = mirrorAll || ADMIN_MIRROR_EVENTS.has(eventKey);
    if (!clientWants && !adminWants) return;

    // Resolve geo (free path first, IP API as fallback) — once for both sends.
    let geo: GeoInfo | null = payload.geo ?? null;
    if (!geo && payload.headers) geo = readGeoFromHeaders(payload.headers);
    if (!geo && payload.ipAddress) geo = await lookupGeoByIp(payload.ipAddress);

    const text = formatMessage(eventKey, payload) + buildTelegramFooter(geo);

    if (clientWants && client.telegramChatId) {
      await sendTelegramMessage(client.telegramChatId, text);
    }
    if (adminWants) {
      await sendAdminTelegram(`👤 <b>${escapeTgHtml(client.name)}</b>\n${text}`);
    }
  } catch {
    // Never let Telegram failures break business flows.
  }
}
