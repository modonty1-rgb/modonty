import { getReferenceData } from "./actions/reference-data-actions";
import { ReferenceDataClient } from "./components/reference-data-client";

export const dynamic = "force-dynamic";

export default async function ReferenceDataPage() {
  const { countries, authorities } = await getReferenceData();
  return <ReferenceDataClient initialCountries={countries} initialAuthorities={authorities} />;
}
