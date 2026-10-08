import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { pushApi } from '@/services/push-api';
import { config } from '@/services/config';
import { getDeviceId } from '@/services/device-id';
import { toApiError } from '@/services/errors';
import { useAuth } from './AuthProvider';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** حمولة الخادم (`modonty/lib/push/notify-reader.ts`): مفتاح واحد `type` + وجهة الفتح. */
type PushData = { type?: string; notificationId?: string; articleSlug?: string; reelSlug?: string };

function openFromPush(data: PushData) {
  if (data.articleSlug) router.push({ pathname: '/articles/[slug]', params: { slug: data.articleSlug } });
  else if (data.reelSlug) router.push({ pathname: '/reels/[slug]', params: { slug: data.reelSlug } });
  else router.push('/account/notifications');
}

function projectId(): string | null {
  const fromConfig = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;
  return config.easProjectId ?? fromConfig ?? null;
}

async function registerForPush(): Promise<void> {
  if (!Device.isDevice) return; // المحاكي لا يملك توكن دفع.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'الإشعارات',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  const granted = current.granted || (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return;
  const id = projectId();
  if (!id) {
    console.warn('[push] EAS projectId غير مضبوط (EXPO_PUBLIC_EAS_PROJECT_ID) — لا تسجيل للدفع.');
    return;
  }
  const token = await Notifications.getExpoPushTokenAsync({ projectId: id });
  await pushApi.register({
    expoPushToken: token.data,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
    deviceId: await getDeviceId(),
    deviceName: Device.deviceName ?? undefined,
    appVersion: config.appVersion ?? undefined,
  });
}

/**
 * الدفع للقارئ (N3/N4): يُسجَّل توكن الجهاز بعد الدخول، وضغطة الإشعار تفتح وجهته.
 * إلغاء التسجيل يتمّ على الخادم مع الخروج (`/auth/logout` بمعرّف الجهاز).
 */
export function PushProvider({ children }: PropsWithChildren) {
  const { status } = useAuth();
  const registered = useRef(false);

  useEffect(() => {
    if (status !== 'signedIn') {
      registered.current = false;
      return;
    }
    if (registered.current) return;
    registered.current = true;
    registerForPush().catch((error: unknown) => {
      registered.current = false;
      console.warn('[push] register failed', toApiError(error).message);
    });
  }, [status]);

  useEffect(() => {
    const last = Notifications.getLastNotificationResponse();
    if (last) openFromPush(last.notification.request.content.data as PushData);
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      openFromPush(response.notification.request.content.data as PushData);
    });
    return () => sub.remove();
  }, []);

  return children;
}
