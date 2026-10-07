import Image from "next/image";

import { cn } from "@/lib/utils";

import { clubInitial } from "../../helpers/club-initial";

interface TeamMarkProps {
  name: string;
  /** Crest URL from API-Football; without one the club's first letter stands in. */
  crest?: string;
  /** Breathing room inside the frame — for a crest on a filled disc (the lead card). */
  inset?: boolean;
  className?: string;
}

/**
 * A club's crest — the club's identity, so a letter is only the fallback for a club the crest
 * list could not match (Khalid, 27 Sep 2026: «النادي له شعاره»).
 *
 * The crest is `fill`ed into the frame, not sized with `h-full`: a percentage height inside a grid
 * cell resolves against an auto track, so tall crests grew past the frame — measured on a 360px
 * phone, Al-Hazem 28×49 and Al-Fateh 28×57 in a 28×28 frame, spilling into the next table row.
 */
export function TeamMark({ name, crest, inset = false, className }: TeamMarkProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold text-foreground",
        !crest && "bg-muted",
        className,
      )}
    >
      {crest ? (
        <Image src={crest} alt="" fill sizes="64px" className={cn("object-contain", inset && "p-[18%]")} />
      ) : (
        clubInitial(name)
      )}
    </span>
  );
}
