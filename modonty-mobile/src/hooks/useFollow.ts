import { useEffect, useState } from 'react';

import { haptic } from '@/lib/haptics';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { actionsApi } from '@/services/api';
import { toApiError } from '@/services/errors';

/**
 * متابعة شريك (E9) — الحالة تُقرأ من الخادم بعد الدخول، والضغط يمنع التكرار. يستعملها زرّ «تابِع»
 * العامّ (`FollowButton`) وزرّ «تابع مدونتي» العريض في صفحة مدونتي — منطق واحد بشكلين.
 */
export function useFollow(slug: string, onCount?: (followers: number) => void) {
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
        haptic.success();
        setFollowing(d.following);
        onCount?.(d.followersCount);
      } catch (error) {
        toast.show(toApiError(error).message, 'error');
      } finally {
        setBusy(false);
      }
    });

  return { following, busy, toggle };
}
