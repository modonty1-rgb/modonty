import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IconUsers } from "@/lib/icons";

interface Follower {
  id: string;
  userId: string | null;
  name: string;
  image: string | null;
}

interface ClientFollowersPreviewProps {
  followers: Follower[];
  clientSlug: string;
  clientId?: string;
  showEmptyState?: boolean;
}

export function ClientFollowersPreview({
  followers,
  clientSlug,
  clientId,
  showEmptyState = false,
}: ClientFollowersPreviewProps) {
  const followersUrl = `/clients/${encodeURIComponent(clientSlug)}/followers`;

  if (followers.length === 0) {
    if (!showEmptyState) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitleWithIcon title="المتابعون" icon={IconUsers} />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            لا يوجد متابعون بعد. عند بدء متابعة هذا العميل، ستظهر الحسابات هنا.
          </p>
          <CtaTrackedLink
            href={followersUrl}
            label="View followers"
            type="LINK"
            clientId={clientId}
            className="inline-block mt-3 text-sm text-primary hover:underline"
          >
            عرض المتابعين
          </CtaTrackedLink>
        </CardContent>
      </Card>
    );
  }

  const maxDisplay = 5;
  const displayFollowers = followers.slice(0, maxDisplay);
  const remainingCount = followers.length > maxDisplay ? followers.length - maxDisplay : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitleWithIcon title="المتابعون" icon={IconUsers} />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex -space-x-2 rtl:space-x-reverse rtl:-space-x-reverse">
            {displayFollowers.map((follower) => {
              const initials = follower.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              const avatarEl = (
                <Avatar className="h-9 w-9 border-2 border-background ring-2 ring-background">
                  <AvatarImage src={follower.image || undefined} alt={follower.name} />
                  <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              );

              return follower.userId ? (
                <CtaTrackedLink
                  key={follower.id}
                  href={`/users/profile/${follower.userId}`}
                  label="View follower profile"
                  type="LINK"
                  clientId={clientId}
                  className="hover:z-10 transition-transform hover:scale-110"
                >
                  {avatarEl}
                </CtaTrackedLink>
              ) : (
                <span key={follower.id} className="hover:z-10">
                  {avatarEl}
                </span>
              );
            })}
            {remainingCount > 0 && (
              <CtaTrackedLink
                href={followersUrl}
                label="View followers – all"
                type="LINK"
                clientId={clientId}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium ring-2 ring-background hover:bg-muted/80 hover:z-10"
              >
                +{remainingCount}
              </CtaTrackedLink>
            )}
          </div>
          <CtaTrackedLink
            href={followersUrl}
            label="View followers – all"
            type="LINK"
            clientId={clientId}
            className="text-sm text-primary hover:underline"
          >
            عرض كل المتابعين
          </CtaTrackedLink>
        </div>
      </CardContent>
    </Card>
  );
}
