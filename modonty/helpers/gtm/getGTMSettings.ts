import { db } from "@/lib/db";

export interface GTMSettings {
  containerId: string | null;
  enabled: boolean;
}

export async function getGTMSettings(): Promise<GTMSettings> {
  try {
    const settings = await db.settings.findFirst();
    
    const containerId = settings?.gtmContainerId || process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || null;
    const enabled = settings?.gtmEnabled ?? (!!process.env.NEXT_PUBLIC_GTM_CONTAINER_ID);
    
    return {
      containerId,
      enabled: enabled && !!containerId,
    };
  } catch (error) {
    console.error("Error fetching GTM settings:", error);
    const fallbackId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || null;
    return {
      containerId: fallbackId,
      enabled: !!fallbackId,
    };
  }
}
