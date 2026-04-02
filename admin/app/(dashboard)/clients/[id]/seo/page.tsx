import { redirect } from "next/navigation";
import { getClientById } from "../../actions/clients-actions";
import { ClientFormHeaderWrapper } from "../../components/client-form-header-wrapper";
import { ClientSeoForm } from "../../components/client-seo-form";

export default async function ClientSeoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    redirect("/clients");
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <ClientFormHeaderWrapper title={`${client.name} — SEO Setup`}>
        <ClientSeoForm initialData={client} clientId={id} />
      </ClientFormHeaderWrapper>
    </div>
  );
}
