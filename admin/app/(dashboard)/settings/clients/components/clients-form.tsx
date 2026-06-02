"use client";

import { ListingPageForm } from "../../_shared/listing-page-form";
import type { AllSettings } from "../../actions/settings-actions";

// The B2B "JBR SEO — Sales Channel" panel was moved to the Modonty Homepage settings (its own JBR SEO tab).
export function ClientsForm({ initialSettings }: { initialSettings: AllSettings }) {
  return (
    <ListingPageForm
      pageKey="clients"
      pageName="Clients"
      initialSettings={initialSettings}
    />
  );
}
