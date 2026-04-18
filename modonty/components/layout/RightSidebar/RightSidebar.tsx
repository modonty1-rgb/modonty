import { getClientsForSidebar } from "@/app/api/helpers/client-queries";
import { cn } from "@/lib/utils";
import { isMobileRequest } from "../is-mobile-request";
import { FollowCard } from "./FollowCard";
import { NewClientsCard } from "./NewClientsCard";

interface RightSidebarProps {
  className?: string;
}

export async function RightSidebar({ className }: RightSidebarProps) {
  if (await isMobileRequest()) {
    return null;
  }

  const clients = await getClientsForSidebar(20);

  return (
    <aside
      aria-label="الشريط الجانبي الأيمن"
      className={cn(
        "hidden lg:block w-[300px] sticky top-[3.5rem] self-start h-[calc(100dvh-5rem)] overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <FollowCard />
        <NewClientsCard clients={clients} />
      </div>
    </aside>
  );
}
