/**
 * EntityCard shared utilities — Category / Industry / Tag
 * Pure functions, safe on server or client.
 */

import type { ComponentType } from "react";
import { IconCategory, IconHash } from "@/lib/icons";
import { ModontyIndustriesMark } from "@/components/icons/modonty-industries-mark";

export type EntityType = "category" | "industry" | "tag";
export type EntityIconComponent = ComponentType<{ className?: string }>;

const ENTITY_ICONS: Record<EntityType, EntityIconComponent> = {
  category: IconCategory,
  industry: ModontyIndustriesMark,
  tag: IconHash,
};

export function getEntityIcon(type: EntityType): EntityIconComponent {
  return ENTITY_ICONS[type];
}
