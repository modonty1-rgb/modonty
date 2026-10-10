import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import { haptic } from '@/lib/haptics';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { accountApi, actionsApi } from '@/services/api';
import { toApiError } from '@/services/errors';

/**
 * حالة «محفوظ» لصفوف المقالات في كل القوائم — بلا تعديل الخادم: تُقرأ مرّة من `/me/favorites` (حتى ٥٠)
 * للمسجّل، وتتبدّل محلّياً فوراً مع كل ضغطة.
 *
 * حارس الصحّة: نقطة الحفظ في الخادم «تبديل» لا «تعيين». فإن كان المقال محفوظاً قبل آخر ٥٠ (لا نعرفه)
 * وضغط القارئ «احفظ»، يعيد الخادم `favorited: false` — فنرسل مرّة ثانية حتى تطابق النتيجة ما أراده القارئ.
 * لا يُلغى حفظ لم يطلبه أحد.
 */
type SavedValue = { isSaved: (id: string) => boolean; toggle: (id: string, slug: string) => void; version: number };

const SavedContext = createContext<SavedValue | null>(null);

export function SavedProvider({ children }: PropsWithChildren) {
  const { status, requireAuth } = useAuth();
  const toast = useToast();
  const ids = useRef(new Set<string>());
  const busy = useRef(new Set<string>());
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    ids.current = new Set();
    bump();
    if (status !== 'signedIn') return;
    const ctrl = new AbortController();
    accountApi
      .favorites(ctrl.signal)
      .then((d) => {
        ids.current = new Set(d.items.map((a) => a.id));
        bump();
      })
      .catch((e: unknown) => {
        if (!ctrl.signal.aborted) console.warn('[saved] load', toApiError(e).message);
      });
    return () => ctrl.abort();
  }, [status, bump]);

  const toggle = useCallback(
    (id: string, slug: string) =>
      requireAuth(async () => {
        if (busy.current.has(id)) return;
        busy.current.add(id);
        const want = !ids.current.has(id);
        // فوري: الواجهة تتبع النيّة، والخادم يؤكّدها بعدها.
        if (want) ids.current.add(id);
        else ids.current.delete(id);
        bump();
        haptic.success();
        try {
          let r = await actionsApi.favoriteArticle(id, slug);
          if (r.favorited !== want) r = await actionsApi.favoriteArticle(id, slug);
          if (r.favorited) ids.current.add(id);
          else ids.current.delete(id);
          if (want) toast.show('حُفظ في «المحفوظة»');
        } catch (e) {
          if (want) ids.current.delete(id);
          else ids.current.add(id);
          toast.show(toApiError(e).message, 'error');
        } finally {
          busy.current.delete(id);
          bump();
        }
      }),
    [requireAuth, bump, toast],
  );

  const value = useMemo<SavedValue>(() => ({ isSaved: (id) => ids.current.has(id), toggle, version }), [toggle, version]);
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSaved outside SavedProvider');
  return ctx;
}
