import { Tajawal_400Regular } from '@expo-google-fonts/tajawal/400Regular';
import { Tajawal_500Medium } from '@expo-google-fonts/tajawal/500Medium';
import { Tajawal_700Bold } from '@expo-google-fonts/tajawal/700Bold';
import { Tajawal_800ExtraBold } from '@expo-google-fonts/tajawal/800ExtraBold';
import { Tajawal_900Black } from '@expo-google-fonts/tajawal/900Black';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { loadAppearance } from '@/lib/appearance';
import { preloadBrandArt } from '@/lib/brand-art';
import { SavedProvider } from '@/providers/SavedProvider';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BrandSplash } from '@/components/brand/BrandSplash';
import { UpdateGate } from '@/components/system/UpdateGate';
import { AuthProvider } from '@/providers/AuthProvider';
import { PushProvider } from '@/providers/PushProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { ThemeProvider, useAppTheme } from '@/theme/ThemeProvider';

/**
 * RTL: البناء الأصلي يفرضه عبر إضافة expo-localization (`forcesRTL` في app.json). هذا السطر لبيئة
 * التطوير (Expo Go) التي لا تقرأ إعداد الإضافة — يأخذ أثره من التشغيل التالي.
 */
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

SplashScreen.preventAutoHideAsync().catch((error: unknown) => console.warn('[splash] preventAutoHide', error));

function RootStack() {
  const { scheme, colors } = useAppTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.page },
          animation: 'default',
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
        <Stack.Screen name="reels/[slug]/index" options={{ contentStyle: { backgroundColor: colors.reelsBackground } }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  // ModontyIcons: خطّ الأيقونات المولَّد من icon-geometry (ModontyIcon.tsx) — يُحمَّل مع Tajawal تحت شاشة البداية.
  const [loaded, error] = useFonts({ Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold, Tajawal_800ExtraBold, Tajawal_900Black, ModontyIcons: require('../assets/fonts/ModontyIcons.ttf') });
  // صور الهويّة المحلّية تتجهّز مع الخطوط تحت شاشة البداية (src/lib/brand-art.ts) — بحدّ أقصى ١٫٥ ثانية.
  const [artReady, setArtReady] = useState(false);
  useEffect(() => {
    // المظهر المحفوظ (فاتح/داكن) يُطبَّق قبل إخفاء شاشة البداية — بلا وميض الثيم الخطأ.
    Promise.all([preloadBrandArt(), loadAppearance()]).finally(() => setArtReady(true));
  }, []);
  const ready = (loaded || !!error) && artReady;
  // صورة النظام تُخفيها BrandSplash بعد أوّل رسم لنسختها المطابقة — ثم تُكمل الحركة فوق التطبيق الجاهز.
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    if (error) console.error('[fonts] Tajawal failed to load', error);
  }, [error]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <PushProvider>
              <ToastProvider>
                <SavedProvider>
                <RootStack />
                <UpdateGate />
                </SavedProvider>
              </ToastProvider>
            </PushProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
      {intro ? <BrandSplash onDone={() => setIntro(false)} /> : null}
    </GestureHandlerRootView>
  );
}
