import { memo, useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { useFollow } from '@/hooks/useFollow';

/**
 * متابعة شريك (E9) — «تابع مدونتي» هو نفس الزرّ بـ`coreClientSlug`. المنطق في `useFollow`.
 */
export const FollowButton = memo(function FollowButton({
  slug,
  compact,
  onCount,
  onFollowingChange,
}: {
  slug: string;
  compact?: boolean;
  onCount?: (followers: number) => void;
  /** الحالة بعد قراءتها من الخادم أو بعد الضغط — للبانر الذي يختفي عن المتابِع. */
  onFollowingChange?: (following: boolean) => void;
}) {
  const { following, busy, toggle } = useFollow(slug, onCount);

  useEffect(() => {
    if (following !== null) onFollowingChange?.(following);
  }, [following, onFollowingChange]);

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
