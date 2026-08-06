import { StaffRole } from "@prisma/client";

import { db } from "@/lib/db";

// Who can be picked as a recipient.
//
// Only the two roles that act on a brief: EDITOR writes it, CREATIVE designs for it.
// Sales, QC, social and admins are in the same Telegram group but a note addressed to
// them would be noise — and a picker that lists everybody makes choosing nobody the
// easy path.

export interface RecipientOption {
  id: string;
  name: string;
  role: StaffRole;
  /** Arabic word for the role — the picker groups by it. */
  roleLabel: string;
}

const ROLE_LABELS: Partial<Record<StaffRole, string>> = {
  EDITOR: "محرّر",
  CREATIVE: "مصمّم",
};

export async function getRecipientOptions(): Promise<RecipientOption[]> {
  const staff = await db.staff.findMany({
    where: {
      role: { in: [StaffRole.EDITOR, StaffRole.CREATIVE] },
      // `isActive` is optional in the schema, so a row that predates the field has it
      // absent — and absent means "never deactivated". Only an explicit false is out.
      NOT: { isActive: false },
    },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });

  return staff.map((s) => ({
    id: s.id,
    // Falls back to the email so a nameless row is still pickable rather than blank.
    name: s.name?.trim() || s.email || "بلا اسم",
    role: s.role,
    roleLabel: ROLE_LABELS[s.role] ?? s.role,
  }));
}
