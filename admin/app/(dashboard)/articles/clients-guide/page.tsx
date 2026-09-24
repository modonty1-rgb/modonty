import { ClientsGuideTable } from "./components/clients-guide-table";
import { getClientsGuide } from "./helpers/get-clients-guide";

export const metadata = { title: "Clients Articles" };

/**
 * **Clients Articles** — under «Articles» in the sidebar (Khalid, 2026-09-24): so the content team
 * knows, per client, the plan, how many articles were agreed, how many are with the client
 * awaiting approval, how many are published, how many remain, and when the account was activated.
 * Article counts only, no money — open to everyone who can sign in to the admin.
 */
export default async function ClientsGuidePage() {
  const { rows, plans } = await getClientsGuide();

  return (
    <div className="space-y-3 px-4 pb-6 sm:px-5">
      <ClientsGuideTable
        rows={rows}
        plans={plans}
        title={
          <div className="min-w-[240px] flex-1 basis-0">
            <h1 className="text-base font-bold">Clients Articles</h1>
            <p
              className="truncate text-[12px] text-muted-foreground"
              title="Quota from the active order · published since service start — same numbers as the order card."
            >
              Quota from the active order · published since service start — same numbers as the order card.
            </p>
          </div>
        }
      />
    </div>
  );
}
