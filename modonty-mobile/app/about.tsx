import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/ui/Header';
import { RowGroup } from '@/components/ui/RowGroup';
import { Screen } from '@/components/ui/Screen';
import { ds } from '@/theme/tokens';

const page = (key: 'about' | 'privacy-policy' | 'terms' | 'user-agreement') => () => router.push({ pathname: '/pages/[key]', params: { key } });

/** «عن مدونتي والسياسات» — الصفوف السبعة التي كانت في الحساب صارت صفّاً واحداً يفتح هنا (Screens B · 11). */
export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  return (
    <Screen>
      <Header back title="عن مدونتي والسياسات" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + ds.space.s8 }]}>
        <RowGroup
          rows={[
            { key: 'about', icon: 'info', label: 'عن مدونتي', onPress: page('about') },
            { key: 'help', icon: 'question', label: 'الأسئلة الشائعة', onPress: () => router.push('/help') },
            { key: 'contact', icon: 'email', label: 'تواصل معنا', onPress: () => router.push('/contact') },
            { key: 'newsletter', icon: 'notifications', label: 'النشرة البريدية', onPress: () => router.push('/newsletter') },
          ]}
        />
        <RowGroup
          rows={[
            { key: 'privacy', icon: 'lock', label: 'سياسة الخصوصية', onPress: page('privacy-policy') },
            { key: 'terms', icon: 'articles', label: 'الشروط والأحكام', onPress: page('terms') },
            { key: 'agreement', icon: 'articles', label: 'اتفاقية المستخدم', onPress: page('user-agreement') },
          ]}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({ content: { paddingTop: ds.space.s4, gap: ds.space.s3 } });
