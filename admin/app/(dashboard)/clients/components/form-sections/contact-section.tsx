"use client";

import { UseFormReturn } from "react-hook-form";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

interface ContactSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
}

export function ContactSection(_: ContactSectionProps) {
  return (
    <div className="text-sm text-muted-foreground">
      Contact details are now managed in the Information tab.
    </div>
  );
}
