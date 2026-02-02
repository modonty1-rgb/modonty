import { db } from "@/lib/db";

export interface GTMSettings {
  containerId: string | null;
  enabled: boolean;
}

export async function getGTMSettings(): Promise<GTMSettings> {
  try {
    const settings = await db.settings.findFirst();
    
    // Support both NEXT_PUBLIC_GTM_CONTAINER_ID (preferred) and NEXT_PUBLIC_GTM_ID (legacy)
    const containerId = settings?.gtmContainerId 
      || process.env.NEXT_PUBLIC_GTM_CONTAINER_ID 
      || process.env.NEXT_PUBLIC_GTM_ID 
      || null;
    const enabled = settings?.gtmEnabled ?? (!!containerId);
    
    return {
      containerId,
      enabled: enabled && !!containerId,
    };
  } catch (error) {
    console.error("Error fetching GTM settings:", error);
    const fallbackId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID 
      || process.env.NEXT_PUBLIC_GTM_ID 
      || null;
    return {
      containerId: fallbackId,
      enabled: !!fallbackId,
    };
  }
}
