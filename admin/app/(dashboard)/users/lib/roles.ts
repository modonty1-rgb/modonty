import type { StaffRole } from "@prisma/client";

// Single source of truth for staff roles — the edit-form dropdown and the table badge
// both read this, so labels/colours never drift. Add a role here → it appears everywhere.
export interface RoleMeta {
  value: StaffRole;
  label: string;
  description: string;
  /** Badge classes for the role chip. */
  badge: string;
}

export const STAFF_ROLES: RoleMeta[] = [
  {
    value: "ADMIN",
    label: "Admin",
    description: "Full access — manages everything",
    badge: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
  },
  {
    value: "EDITOR",
    label: "Editor",
    description: "Writes & edits articles",
    badge: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  },
  {
    value: "CREATIVE",
    label: "Creative",
    description: "Designs images, media & reels",
    badge: "bg-pink-500/15 text-pink-600 dark:text-pink-300",
  },
  {
    value: "SOCIAL",
    label: "Social Media",
    description: "Manages social channels & publishing",
    badge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300",
  },
  {
    value: "QC",
    label: "Quality Control",
    description: "Reviews & approves content quality",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  },
  {
    value: "SALES",
    label: "Sales rep",
    description: "Brings & manages clients",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  },
];

const ROLE_BY_VALUE = new Map(STAFF_ROLES.map((r) => [r.value, r]));

export function roleMeta(role: string): RoleMeta {
  return (
    ROLE_BY_VALUE.get(role as StaffRole) ?? {
      value: role as StaffRole,
      label: role,
      description: "",
      badge: "bg-muted text-muted-foreground",
    }
  );
}
