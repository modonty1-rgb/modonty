import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { ClientHeroClient } from "./types";

interface HeroAvatarProps {
  client: ClientHeroClient;
  initials: string;
}

export function HeroAvatar({ client, initials }: HeroAvatarProps) {
  return (
    <Avatar className="h-20 w-20 md:h-28 md:w-28 border-4 border-background shadow-xl bg-background flex-shrink-0">
      <AvatarImage src={client.logoMedia?.url || undefined} alt={client.name} />
      <AvatarFallback className="text-xl md:text-2xl font-bold text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
