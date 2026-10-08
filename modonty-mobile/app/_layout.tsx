import '../global.css';
import { Tajawal_400Regular } from '@expo-google-fonts/tajawal/400Regular';
import { Tajawal_500Medium } from '@expo-google-fonts/tajawal/500Medium';
import { Tajawal_700Bold } from '@expo-google-fonts/tajawal/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
  const [loaded, error] = useFonts({ Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold });

  useEffect(() => {
    if (error) console.error('[fonts] Tajawal failed to load', error);
    if (loaded || error) SplashScreen.hideAsync().catch((e: unknown) => console.warn('[splash] hide', e));
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <PushProvider>
              <ToastProvider>
                <RootStack />
                <UpdateGate />
              </ToastProvider>
            </PushProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
