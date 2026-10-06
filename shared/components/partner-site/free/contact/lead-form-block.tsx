import type { HomeData } from "../home/home-data";
import { LeadFormIsland } from "./lead-form";

/** «اترك رقمك» as a registry block — a server component that hands the form only its three fields. */
export function LeadForm({ data, preview = false }: { data: HomeData; preview?: boolean }) {
  return <LeadFormIsland clientId={data.clientId} name={data.name} isYmyl={Boolean(data.isYmyl)} preview={preview} />;
}
