import { memo, useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthProvider';
import { actionsApi } from '@/services/api';
import { toApiError } from '@/services/errors';
import { useToast } from '@/providers/ToastProvider';

/**
 * متابعة شريك (E9) — «تابع مدونتي» هو نفس الزرّ بـ`coreClientSlug`. الحالة تُقرأ من الخادم بعد
 * الدخول، والضغط يمنع التكرار ويعرض ما يحدث الآن.
 */
export const FollowButton = memo(function FollowButton({
  slug,
  compact,
  onCount,
}: {
  slug: string;
  compact?: boolean;
  onCount?: (followers: number) => void;
}) {
  const { status, requireAuth } = useAuth();
  const toast = useToast();
  const [following, setFollowing] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status !== 'signedIn') {
      setFollowing(false);
      return;
    }
    let alive = true;
    actionsApi
      .followState(slug)
      .then((d) => {
        if (alive) setFollowing(d.following);
      })
      .catch((error: unknown) => {
        if (alive) setFollowing(false);
        console.warn('[follow] state', toApiError(error).message);
      });
    return () => {
      alive = false;
    };
  }, [slug, status]);

  const toggle = () =>
    requireAuth(async () => {
      setBusy(true);
      try {
        const d = following ? await actionsApi.unfollow(slug) : await actionsApi.follow(slug);
        setFollowing(d.following);
        onCount?.(d.followersCount);
      } catch (error) {
        toast.show(toApiError(error).message, 'error');
      } finally {
        setBusy(false);
      }
    });

  return (
    <Button
      label={following ? 'تتابعه' : 'تابِع'}
      icon={following ? 'check' : undefined}
      kind={following ? 'outlined' : 'filled'}
      onPress={toggle}
      busy={busy || following === null}
      busyLabel={following === null ? 'جارٍ التحقّق…' : following ? 'يُلغى…' : 'يُتابَع…'}
      compact={compact}
    />
  );
});
