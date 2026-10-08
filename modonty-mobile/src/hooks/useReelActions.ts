import { router } from 'expo-router';
import { useMemo } from 'react';

import type { ReelSlideActions, ReelSlideModel } from '@/components/reels/ReelSlide';
import { open } from '@/lib/nav';
import { shareLink } from '@/lib/share';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { actionsApi } from '@/services/api';
import { reelActionsApi } from '@/services/api-actions';
import { toApiError } from '@/services/errors';
import { haptic } from '@/lib/haptics';

/** أفعال الريل المشتركة بين الفيد وصفحة الريل الواحد: E16 إعجاب/حفظ (تبديل) · E18 مشاركة. */
export function useReelActions(update: (id: string, fn: (s: ReelSlideModel) => ReelSlideModel) => void): ReelSlideActions {
  const { requireAuth } = useAuth();
  const toast = useToast();
  return useMemo<ReelSlideActions>(
    () => ({
      onLike: (id) =>
        requireAuth(async () => {
          try {
            const r = await actionsApi.likeReel(id);
            haptic.success();
            update(id, (s) => ({ ...s, liked: r.active, likes: r.count }));
          } catch (error) {
            toast.show(toApiError(error).message, 'error');
          }
        }),
      onFavorite: (id) =>
        requireAuth(async () => {
          try {
            const r = await actionsApi.favoriteReel(id);
            haptic.success();
            update(id, (s) => ({ ...s, favorited: r.active, favorites: r.count }));
            toast.show(r.active ? 'حُفظ في ريلزك' : 'أُزيل من ريلزك', 'success');
          } catch (error) {
            toast.show(toApiError(error).message, 'error');
          }
        }),
      onComments: (s) => router.push({ pathname: '/reels/[slug]/comments', params: { slug: s.slug, id: s.id } }),
      onShare: async (s) => {
        try {
          const shared = await shareLink(s.title || s.publisher, `/reels/${s.slug}`);
          if (shared) await reelActionsApi.share(s.id, 'OTHER');
        } catch (error) {
          toast.show(toApiError(error).message, 'error');
        }
      },
      onPublisher: open.partner,
    }),
    [requireAuth, toast, update],
  );
}

/** مشاهدة الريل مرّة لكل جلسة تطبيق (الويب يحفظها في sessionStorage — الخادم بلا جدول منع تكرار). */
const viewed = new Set<string>();
export function trackReelViewOnce(id: string): void {
  if (viewed.has(id)) return;
  viewed.add(id);
  actionsApi.viewReel(id).catch((error: unknown) => {
    viewed.delete(id);
    console.warn('[reels] view', toApiError(error).message);
  });
}
