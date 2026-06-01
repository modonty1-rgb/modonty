import { redirect } from "next/navigation";
import { getClientById } from "../../actions/clients-actions";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { ClientSeoForm } from "../../components/client-seo-form";

export default async function ClientSeoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [client, siteUrl] = await Promise.all([getClientById(id), loadSiteUrl()]);

  if (!client) {
    redirect("/clients");
  }

  // No page title bar — the SEO readiness header inside the form is the page header.
  return (
    <div className="max-w-[1200px] mx-auto">
      <ClientSeoForm initialData={client} clientId={id} siteUrl={siteUrl} />
    </div>
  );
}
