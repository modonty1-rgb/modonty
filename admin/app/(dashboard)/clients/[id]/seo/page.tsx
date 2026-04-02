import { redirect } from "next/navigation";
import { getClientById, updateClient } from "../../actions/clients-actions";
import { getIndustries } from "../../../industries/actions/industries-actions";
import { getClientsForSelect } from "../../actions/clients-actions/get-clients-for-select";
import { ClientFormHeaderWrapper } from "../../components/client-form-header-wrapper";
import { ClientSeoForm } from "../../components/client-seo-form";
import type { ClientFormData } from "@/lib/types";

export default async function ClientSeoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [client] = await Promise.all([
    getClientById(id),
    getIndustries(),
    getClientsForSelect(id),
  ]);

  if (!client) {
    redirect("/clients");
  }

  async function updateClientSeo(data: ClientFormData) {
    "use server";
    return updateClient(id, data);
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <ClientFormHeaderWrapper title={`${client.name} — SEO Setup`}>
        <ClientSeoForm initialData={client} clientId={id} onSubmit={updateClientSeo} />
      </ClientFormHeaderWrapper>
    </div>
  );
}

