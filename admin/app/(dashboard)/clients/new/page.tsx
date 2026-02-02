import { createClient } from "../actions/clients-actions";
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
    <div className="container mx-auto max-w-[1128px]">
      <ClientFormHeaderWrapper
        title="Create Client"
      >
        <ClientForm industries={industries} clients={clients} onSubmit={createClient} />
      </ClientFormHeaderWrapper>
    </div>
  );
}
