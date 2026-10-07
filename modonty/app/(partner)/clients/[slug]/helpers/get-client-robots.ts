import type { Metadata } from "next";
import { resolveClientPageState } from "../components/client-page-state";
import type { ClientForMetadata } from "./get-client-for-metadata";

/** Thin "قيد التجهيز" pages → noindex,follow (perfect-before-index golden rule). */
export function getClientRobots(client: ClientForMetadata): Metadata["robots"] | undefined {
  let robots: Metadata["robots"] | undefined;
  const ps = resolveClientPageState({
    aboutText: client.description || client.seoDescription,
    servicesCount: 0,
    articlesCount: client._count.articles,
    teamCount: 0,
    achievementsCount: Array.isArray(client.achievements) ? client.achievements.length : 0,
    galleryCount: 0,
    hasContact: !!(client.phone || client.email || client.addressCity),
  });
  if (ps === "not-ready") robots = { index: false, follow: true };
  return robots;
}
