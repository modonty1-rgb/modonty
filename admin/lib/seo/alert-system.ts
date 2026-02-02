/**
 * Alert System - Phase 14
 *
 * Automated alerts for SEO issues via Slack, Discord, and Email.
 */

export interface AlertConfig {
  slackWebhookUrl?: string;
  discordWebhookUrl?: string;
  emailRecipients?: string[];
  alertThresholds?: {
    errorCount?: number;
    trendIncrease?: number;
  };
}

export interface Alert {
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  url?: string;
  timestamp: Date;
  severity?: "critical" | "high" | "medium" | "low";
  metadata?: Record<string, unknown>;
}

/**
 * Send alert via configured channels (Slack, Discord, Email)
 */
export async function sendAlert(
  alert: Alert,
  config: AlertConfig
): Promise<void> {
  const promises: Promise<void>[] = [];

  if (config.slackWebhookUrl) {
    promises.push(sendSlackAlert(alert, config.slackWebhookUrl));
  }

  if (config.discordWebhookUrl) {
    promises.push(sendDiscordAlert(alert, config.discordWebhookUrl));
  }

  if (config.emailRecipients && config.emailRecipients.length > 0) {
    promises.push(sendEmailAlert(alert, config.emailRecipients));
  }

  await Promise.allSettled(promises);
}

/**
 * Send Slack alert via webhook
 */
async function sendSlackAlert(alert: Alert, webhookUrl: string): Promise<void> {
  try {
    const emoji = getEmojiForAlertType(alert.type);
    const color = getColorForSeverity(alert.severity || "medium");

    const payload = {
      text: `${emoji} *${alert.title}*`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${alert.title}*\n${alert.message}`,
          },
        },
        ...(alert.url
          ? [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `<${alert.url}|View Details>`,
                },
              },
            ]
          : []),
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Severity: ${alert.severity || "medium"} | ${new Date(
                alert.timestamp
              ).toLocaleString()}`,
            },
          ],
        },
      ],
      attachments: [
        {
          color,
          footer: "Modonty SEO Alert System",
          ts: Math.floor(alert.timestamp.getTime() / 1000),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to send Slack alert:", error);
    throw error;
  }
}

/**
 * Send Discord alert via webhook
 */
async function sendDiscordAlert(
  alert: Alert,
  webhookUrl: string
): Promise<void> {
  try {
    const color = getDiscordColorForSeverity(alert.severity || "medium");

    const payload = {
      embeds: [
        {
          title: alert.title,
          description: alert.message,
          color,
          url: alert.url,
          timestamp: alert.timestamp.toISOString(),
          footer: {
            text: "Modonty SEO Alert System",
          },
          fields: alert.metadata
            ? Object.entries(alert.metadata).map(([key, value]) => ({
                name: key,
                value: String(value),
                inline: true,
              }))
            : [],
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to send Discord alert:", error);
    throw error;
  }
}

/**
 * Send Email alert (using Resend or similar service)
 */
async function sendEmailAlert(
  alert: Alert,
  recipients: string[]
): Promise<void> {
  try {
    // Check if Resend is available
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn(
        "RESEND_API_KEY not configured. Email alerts will not be sent."
      );
      return;
    }

    // In a real implementation, use Resend or similar service
    // For now, log the alert
    console.log("Email Alert:", {
      to: recipients,
      subject: alert.title,
      message: alert.message,
      url: alert.url,
      timestamp: alert.timestamp,
    });

    // TODO: Implement actual email sending when Resend is added
    // Example:
    // const { Resend } = await import('resend');
    // const resend = new Resend(resendApiKey);
    // await resend.emails.send({
    //   from: 'seo-alerts@modonty.com',
    //   to: recipients,
    //   subject: alert.title,
    //   html: generateEmailHTML(alert),
    // });
  } catch (error) {
    console.error("Failed to send email alert:", error);
    throw error;
  }
}

/**
 * Generate email HTML template
 */
function generateEmailHTML(alert: Alert): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${alert.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: ${getColorForSeverity(alert.severity || "medium")};">
            ${alert.title}
          </h1>
          <p>${alert.message}</p>
          ${alert.url ? `<p><a href="${alert.url}" style="color: #0073b1;">View Details</a></p>` : ""}
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            Severity: ${alert.severity || "medium"} | ${new Date(alert.timestamp).toLocaleString()}
          </p>
          <p style="color: #666; font-size: 12px;">
            This is an automated alert from Modonty SEO Alert System.
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Get emoji for alert type
 */
function getEmojiForAlertType(type: Alert["type"]): string {
  switch (type) {
    case "error":
      return "🚨";
    case "warning":
      return "⚠️";
    case "info":
      return "ℹ️";
    default:
      return "📢";
  }
}

/**
 * Get color for severity (hex)
 */
function getColorForSeverity(severity: Alert["severity"]): string {
  switch (severity) {
    case "critical":
      return "#ff0000";
    case "high":
      return "#ff6600";
    case "medium":
      return "#ffaa00";
    case "low":
      return "#00aa00";
    default:
      return "#666666";
  }
}

/**
 * Get Discord color for severity (decimal)
 */
function getDiscordColorForSeverity(severity: Alert["severity"]): number {
  switch (severity) {
    case "critical":
      return 0xff0000; // Red
    case "high":
      return 0xff6600; // Orange
    case "medium":
      return 0xffaa00; // Yellow
    case "low":
      return 0x00aa00; // Green
    default:
      return 0x666666; // Gray
  }
}

/**
 * Create alert from structured data error
 */
export function createAlertFromError(
  error: { url: string; type: string; description: string; severity?: "ERROR" | "WARNING" },
  baseUrl?: string
): Alert {
  return {
    type: error.severity === "ERROR" ? "error" : "warning",
    title: `Structured Data Error: ${error.type}`,
    message: error.description,
    url: error.url.startsWith("http") ? error.url : `${baseUrl}${error.url}`,
    timestamp: new Date(),
    severity:
      error.severity === "ERROR" ? "high" : "medium",
    metadata: {
      errorType: error.type,
      url: error.url,
    },
  };
}

/**
 * Get alert configuration from environment variables
 */
export function getAlertConfig(): AlertConfig {
  return {
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
    emailRecipients: process.env.ALERT_EMAIL_RECIPIENTS
      ? process.env.ALERT_EMAIL_RECIPIENTS.split(",").map((e) => e.trim())
      : undefined,
    alertThresholds: {
      errorCount: process.env.ALERT_ERROR_COUNT_THRESHOLD
        ? parseInt(process.env.ALERT_ERROR_COUNT_THRESHOLD, 10)
        : 5,
      trendIncrease: process.env.ALERT_TREND_INCREASE_THRESHOLD
        ? parseFloat(process.env.ALERT_TREND_INCREASE_THRESHOLD)
        : 20,
    },
  };
}