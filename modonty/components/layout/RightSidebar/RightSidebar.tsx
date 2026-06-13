import { getClientsForSidebar } from "@/app/api/helpers/client-queries";
import { cn } from "@/lib/utils";
import { NewClientsCard } from "./NewClientsCard";

interface RightSidebarProps {
  className?: string;
}

// Partners list — server-rendered directly (the slider moved to the left sidebar).
// `hidden lg:block` + lazy logos means mobile downloads nothing here; the mobile
// partner list lives in the bottom-bar sheet instead.
export async function RightSidebar({ className }: RightSidebarProps) {
  // Load ALL active partners (safety cap 500) so the industry filter shows EVERY
  // sector that has partners — not only the industries present in the first 20.
  const clients = await getClientsForSidebar(500);

  return (
    <aside
      aria-label="الشريط الجانبي الأيمن"
      className={cn(
        "hidden lg:block w-[300px] sticky top-[3.5rem] self-start h-[calc(100dvh-5rem)] overflow-hidden",
        className
      )}
    >
      <NewClientsCard clients={clients} />
    </aside>
  );
}
