import { redirect } from "next/navigation";
import { getClientById } from "../../actions/clients-actions";
import { getIndustries } from "../../../industries/actions/industries-actions";
import { getClientsForSelect } from "../../actions/clients-actions/get-clients-for-select";
import { getActiveCountries } from "../../../settings/reference-data/actions/reference-data-actions";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { ClientForm } from "../../components/client-form";
import { ClientFormHeaderWrapper } from "../../components/client-form-header-wrapper";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [client, industries, clients, siteUrl, countries] = await Promise.all([
    getClientById(id),
    getIndustries(),
    getClientsForSelect(id), // Exclude current client from parent options
    loadSiteUrl(),
    getActiveCountries(),
  ]);

  if (!client) {
    redirect("/clients");
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      <ClientFormHeaderWrapper
        title="Edit Client"
      >
        <ClientForm initialData={client} industries={industries} clients={clients} clientId={id} siteUrl={siteUrl} countries={countries} />
      </ClientFormHeaderWrapper>
    </div>
  );
}
