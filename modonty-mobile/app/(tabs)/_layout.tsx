import { Tabs } from 'expo-router';

import { TabBar } from '@/components/navigation/TabBar';

/**
 * التابات السبع بترتيب شريط الموقع (`TabBar.tsx` — ORBIT). البحث وحسابي واستكشف تبقى شاشات بلا خانة
 * في الشريط: البحث من خانة «بحث متقدم» والحساب من رأس الرئيسية — مثل رأس الموقع.
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="articles-tab" />
      <Tabs.Screen name="industries-tab" />
      <Tabs.Screen name="reels" />
      <Tabs.Screen name="partners-tab" />
      <Tabs.Screen name="audio-tab" />
      <Tabs.Screen name="modo" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="account" />
      <Tabs.Screen name="discover" />
    </Tabs>
  );
}
