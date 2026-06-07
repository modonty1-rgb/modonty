import { getClientsForSidebar, getClientHeroSlides } from "@/app/api/helpers/client-queries";
import { cn } from "@/lib/utils";
import { RightSidebarContent } from "./RightSidebarContent";

interface RightSidebarProps {
  className?: string;
}

export async function RightSidebar({ className }: RightSidebarProps) {
  const [clients, heroSlides] = await Promise.all([
    getClientsForSidebar(20),
    getClientHeroSlides(5),
  ]);

  return (
    <aside
      aria-label="الشريط الجانبي الأيمن"
      className={cn(
        "hidden lg:block w-[300px] sticky top-[3.5rem] self-start h-[calc(100dvh-5rem)] overflow-hidden",
        className
      )}
    >
      <RightSidebarContent clients={clients} heroSlides={heroSlides} />
    </aside>
  );
}
