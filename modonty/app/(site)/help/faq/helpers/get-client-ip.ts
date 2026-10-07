"use server";

import { headers } from "next/headers";

/**
 * Get client IP address from request headers
 */
export async function getClientIp(): Promise<string | null> {
  const headersList = await headers();
  
  // Check various headers for IP address (in order of preference)
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headersList.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headersList.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return null;
}
