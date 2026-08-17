import { SectionCard } from "./section-card";
import { TeamAvatar } from "./team-avatar";

export interface ClientTeamMember {
  name: string;
  role?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
}

interface Props {
  teamMembers: ClientTeamMember[];
}

/** «فريق العمل» — optional team cards (E-E-A-T). Server, lazy photos. Hide-if-empty. */
export function ClientTeamSection({ teamMembers }: Props) {
  const items = teamMembers.filter((m) => m.name?.trim());
  if (items.length === 0) return null;

  return (
    <SectionCard id="team" icon="👥" title="فريق العمل">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {items.map((m, i) => (
          <div key={i} className="rounded-md border bg-muted/40 p-[15px_10px] text-center">
            <div className="relative mx-auto mb-2.5 grid h-[58px] w-[58px] place-items-center overflow-hidden rounded-full bg-gradient-to-br from-foreground to-accent text-[20px] font-extrabold text-white">
              {m.photoUrl?.trim() ? (
                <TeamAvatar src={m.photoUrl} name={m.name} />
              ) : (
                m.name.trim().charAt(0)
              )}
            </div>
            <h4 className="text-[12.5px] font-extrabold text-foreground">{m.name}</h4>
            {m.role?.trim() && <span className="text-[11px] text-muted-foreground">{m.role}</span>}
            {m.bio?.trim() && (
              <p className="mt-1.5 text-[10.5px] leading-[1.45] text-muted-foreground">{m.bio}</p>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
