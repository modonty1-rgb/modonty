import { router } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { accountApi } from '@/services/api';
import type { AuthData, ReaderProfile } from '@/services/api-types';
import { getDeviceId } from '@/services/device-id';
import { toApiError } from '@/services/errors';
import { clearSession, loadSession, peekSession, saveTokens, subscribeSession } from '@/services/session';

type AuthState = {
  status: 'loading' | 'signedOut' | 'signedIn';
  user: ReaderProfile | null;
  unreadNotifications: number;
  signIn: (data: AuthData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
  setUnread: (count: number) => void;
  /** فعل يحتاج حساباً: ينفّذه إن كان القارئ داخلاً، وإلا يفتح الدخول. */
  requireAuth: (action: () => void) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthState['status']>('loading');
  const [user, setUser] = useState<ReaderProfile | null>(null);
  const [unread, setUnread] = useState(0);

  const refreshMe = useCallback(async () => {
    if (!peekSession()) return;
    try {
      const me = await accountApi.me();
      setUser(me.user);
      setUnread(me.unreadNotifications);
      setStatus('signedIn');
    } catch (error) {
      const e = toApiError(error);
      // الجلسة أُلغيت أو انتهت — الخادم هو الحكم. أي فشل آخر (شبكة) يُبقي القارئ داخلاً.
      if (e.isUnauthorized) {
        await clearSession();
        return;
      }
      console.warn('[auth] /me failed', e.kind, e.message);
      setStatus('signedIn');
    }
  }, []);

  useEffect(() => {
    let alive = true;
    void loadSession()
      .then((session) => {
        if (!alive) return;
        if (session) void refreshMe();
        else setStatus('signedOut');
      })
      .catch((error: unknown) => {
        console.warn('[auth] secure store read failed', error);
        if (alive) setStatus('signedOut');
      });
    const unsubscribe = subscribeSession((session) => {
      if (!session) {
        setUser(null);
        setUnread(0);
        setStatus('signedOut');
      }
    });
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [refreshMe]);

  const signIn = useCallback(async (data: AuthData) => {
    await saveTokens(data);
    setUser(data.user);
    setStatus('signedIn');
    void refreshMe();
  }, [refreshMe]);

  const signOut = useCallback(async () => {
    const session = peekSession();
    if (session) {
      try {
        await accountApi.logout(session.refreshToken, await getDeviceId());
      } catch (error) {
        // الخروج المحلّي يتمّ مهما كان: الجلسة على الخادم تنتهي وحدها خلال ٣٠ يوماً إن لم تصل.
        console.warn('[auth] server logout failed', toApiError(error).message);
      }
    }
    await clearSession();
  }, []);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (status === 'signedIn') action();
      else router.push('/auth/login');
    },
    [status],
  );

  const value = useMemo<AuthState>(
    () => ({ status, user, unreadNotifications: unread, signIn, signOut, refreshMe, setUnread, requireAuth }),
    [status, user, unread, signIn, signOut, refreshMe, requireAuth],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
