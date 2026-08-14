/**
 * EntityCard shared utilities — Category / Industry / Tag
 * Pure functions, safe on server or client.
 */

import type { ComponentType } from "react";
import { IconCategory, IconIndustry, IconHash } from "@/lib/icons";

export type EntityType = "category" | "industry" | "tag";
export type EntityIconComponent = ComponentType<{ className?: string }>;

const ENTITY_ICONS: Record<EntityType, EntityIconComponent> = {
  category: IconCategory,
  industry: IconIndustry,
  tag: IconHash,
};

export function getEntityIcon(type: EntityType): EntityIconComponent {
  return ENTITY_ICONS[type];
}
