import { getClientsWithGalleryCounts } from "./helpers/load-galleries";
import { GalleriesClientsTable } from "./components/galleries-clients-table";

export default async function ClientGalleriesPage() {
  const clients = await getClientsWithGalleryCounts();

  return (
    <div className="mx-auto max-w-[1080px] space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Client Galleries</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          معرض صور كل عميل — يظهر على صفحته وفي ImageObject[] بالـ JSON-LD. يرفعها العميل من الكونسول،
          وتقدر تضيف أو تحذف من هنا.
        </p>
      </div>
      <GalleriesClientsTable clients={clients} />
    </div>
  );
}
