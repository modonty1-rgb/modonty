import { Resend } from "resend";

/**
 * Reliable Email Client with Retry Logic
 * Based on official Resend documentation: https://resend.com/docs/send-with-nodejs
 *
 * Features:
 * - Singleton Resend instance
 * - Retry with exponential backoff (3 attempts)
 * - Rate limit handling (429 errors)
 * - Transient vs permanent error detection
 */

// Singleton instance
let resendInstance: Resend | null = null;

/**
 * Get or create Resend client instance
 */
function getResendClient(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

/**
 * Email parameters type
 */
export interface SendEmailParams {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Email result type
 */
export interface SendEmailResult {
  id: string;
  success: true;
}

/**
 * Check if error is retryable (transient)
 * - 429: Rate limit (retryable)
 * - 500+: Server errors (retryable)
 * - Network errors (retryable)
 */
function isRetryableError(error: unknown): boolean {
  if (!error) return false;

  const err = error as { statusCode?: number; code?: string; message?: string };

  // Rate limit error
  if (err.statusCode === 429) return true;

  // Server errors (5xx)
  if (err.statusCode && err.statusCode >= 500) return true;

  // Network errors
  if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT") return true;
  if (err.message?.includes("network") || err.message?.includes("timeout")) return true;

  return false;
}

/**
 * Check if error is permanent (don't retry)
 * - 400: Bad request
 * - 401: Unauthorized (API key issue)
 * - 403: Forbidden (domain not verified)
 * - 422: Unprocessable entity
 */
function isPermanentError(error: unknown): boolean {
  if (!error) return false;

  const err = error as { statusCode?: number };
  const permanentCodes = [400, 401, 403, 422];

  return permanentCodes.includes(err.statusCode || 0);
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 * Attempt 0: 1000ms (1s)
 * Attempt 1: 2000ms (2s)
 * Attempt 2: 4000ms (4s)
 * Max: 5000ms (5s)
 */
function getBackoffMs(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 5000);
}

/**
 * Send email with retry logic and exponential backoff
 *
 * @param params Email parameters (from, to, subject, html)
 * @param maxRetries Maximum retry attempts (default: 3)
 * @returns Email result with ID
 * @throws Error if all retries fail or permanent error occurs
 */
export async function sendEmailWithRetry(
  params: SendEmailParams,
  maxRetries: number = 3
): Promise<SendEmailResult> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM?.trim() || params.from;

  if (!from) {
    throw new Error("RESEND_FROM is not configured and no 'from' provided");
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Log EXACTLY what we're sending to Resend
      const emailPayload = {
        from,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
        replyTo: params.replyTo,
      };

      console.log(`[Email] Attempt ${attempt + 1}/${maxRetries} - SENDING TO RESEND:`, {
        to: emailPayload.to,
        subject: emailPayload.subject,
        htmlLength: emailPayload.html.length,
        // Log token from HTML to verify it's correct
        htmlContainsToken: emailPayload.html.includes("token=") 
          ? emailPayload.html.match(/token=([a-f0-9]+)/)?.[1]?.substring(0, 16) + "..."
          : "NO TOKEN FOUND",
      });

      const { data, error } = await resend.emails.send(emailPayload);

      // Handle Resend API errors
      if (error) {
        const err = error as { statusCode?: number; message?: string; name?: string };

        console.error(`[Email] Attempt ${attempt + 1} failed:`, {
          name: err.name,
          message: err.message,
          statusCode: err.statusCode,
        });

        // Don't retry permanent errors
        if (isPermanentError(error)) {
          throw new Error(err.message || "Email failed (permanent error)");
        }

        // Retry transient errors
        if (isRetryableError(error) && attempt < maxRetries - 1) {
          const backoffMs = getBackoffMs(attempt);
          console.log(`[Email] Retrying in ${backoffMs}ms...`);
          await delay(backoffMs);
          continue;
        }

        // All retries exhausted
        throw new Error(err.message || "Email failed after retries");
      }

      // Success
      console.log(`[Email] Sent successfully:`, { id: data?.id, to: params.to });
      return { id: data?.id || "sent", success: true };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry if it's a permanent error we threw
      if (lastError.message.includes("permanent error")) {
        throw lastError;
      }

      // Retry if attempts remain
      if (attempt < maxRetries - 1) {
        const backoffMs = getBackoffMs(attempt);
        console.log(`[Email] Caught error, retrying in ${backoffMs}ms:`, lastError.message);
        await delay(backoffMs);
      }
    }
  }

  // All retries exhausted
  throw lastError || new Error("Email failed after max retries");
}

/**
 * Simple email send (no retry, for backwards compatibility)
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  return sendEmailWithRetry(params, 1);
}

/**
 * Validate email configuration
 */
export function validateEmailConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.RESEND_API_KEY?.trim()) {
    errors.push("RESEND_API_KEY is not configured");
  }

  if (!process.env.RESEND_FROM?.trim()) {
    errors.push("RESEND_FROM is not configured");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
