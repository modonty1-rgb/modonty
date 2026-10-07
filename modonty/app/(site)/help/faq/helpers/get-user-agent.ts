"use server";

import { headers } from "next/headers";

/**
 * Get user agent from request headers
 */
export async function getUserAgent(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get("user-agent") || null;
}
