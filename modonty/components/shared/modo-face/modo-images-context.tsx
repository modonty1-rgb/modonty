"use client";

import { createContext, type ReactNode } from "react";
import type { ModoImages } from "@modonty/shared/lib/modo-images";

export const ModoImagesContext = createContext<ModoImages>({});

/** Mounted once by SiteShell with the admin-picked images, so any Modo on the page can pick its pose. */
export function ModoImagesProvider({ images, children }: { images: ModoImages; children: ReactNode }) {
  return <ModoImagesContext.Provider value={images}>{children}</ModoImagesContext.Provider>;
}
