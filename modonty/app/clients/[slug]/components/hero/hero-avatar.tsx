import Image from "next/image";
import type { ClientHeroClient } from "./types";

interface HeroAvatarProps {
  client: ClientHeroClient;
  initials: string;
}

export function HeroAvatar({ client, initials }: HeroAvatarProps) {
  return (
    <div className="relative h-20 w-20 md:h-28 md:w-28 rounded-full border-4 border-background shadow-xl bg-background flex-shrink-0 overflow-hidden flex items-center justify-center">
      {client.logoMedia?.url ? (
        <Image
          src={client.logoMedia.url}
          alt={client.name}
          fill
          className="object-contain p-1"
          sizes="(max-width: 768px) 80px, 112px"
        />
      ) : (
        <span className="text-xl md:text-2xl font-bold bg-primary text-primary-foreground w-full h-full flex items-center justify-center rounded-full">
          {initials}
        </span>
      )}
    </div>
  );
}
