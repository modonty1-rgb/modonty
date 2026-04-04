import { getIndustries } from "../../industries/actions/industries-actions";
import { getClientsForSelect } from "../actions/clients-actions/get-clients-for-select";
import { ClientForm } from "../components/client-form";
import { ClientFormHeaderWrapper } from "../components/client-form-header-wrapper";

export default async function NewClientPage() {
  const [industries, clients] = await Promise.all([
    getIndustries(),
    getClientsForSelect(),
  ]);

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      <ClientFormHeaderWrapper
        title="Create Client"
      >
        <div className="py-6">
          <ClientForm industries={industries} clients={clients} />
        </div>
      </ClientFormHeaderWrapper>
    </div>
  );
}
