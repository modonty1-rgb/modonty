import { getIndustries } from "../../industries/actions/industries-actions";
import { getClientsForSelect } from "../actions/clients-actions/get-clients-for-select";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { ClientForm } from "../components/client-form";
import { ClientFormHeaderWrapper } from "../components/client-form-header-wrapper";

export default async function NewClientPage() {
  const [industries, clients, siteUrl] = await Promise.all([
    getIndustries(),
    getClientsForSelect(),
    loadSiteUrl(),
  ]);

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      <ClientFormHeaderWrapper
        title="Create Client"
      >
        <div className="py-6">
          <ClientForm industries={industries} clients={clients} siteUrl={siteUrl} />
        </div>
      </ClientFormHeaderWrapper>
    </div>
  );
}
