import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { useTabBottomInset } from '@/components/navigation/NavScroll';
import { Header } from '@/components/ui/Header';
import { NavGroup } from '@/components/ui/NavGroup';
import { Screen } from '@/components/ui/Screen';
import { space } from '@/theme/tokens';

/** S02 — استكشف: أبواب التصفّح كلّها، بنفس أقسام قائمة الويب. لا بيانات هنا — كل وجهة تطلب بياناتها عند فتحها. */
export default function DiscoverScreen() {
  const tabInset = useTabBottomInset();
  return (
    <Screen>
      <Header title="استكشف" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabInset }]}>
        <NavGroup
          title="المحتوى"
          items={[
            { key: 'archive', icon: 'articles', label: 'كل المقالات', hint: 'بحسب المجال والتصنيف ووقت القراءة', onPress: () => router.push('/articles') },
            { key: 'trending', icon: 'trending', label: 'الرائج', onPress: () => router.push('/trending') },
            { key: 'news', icon: 'info', label: 'آخر الأخبار', onPress: () => router.push('/news') },
            { key: 'audio', icon: 'audio', label: 'مقالات مسموعة', onPress: () => router.push('/audio') },
            { key: 'sectors', icon: 'keypoints', label: 'قطاعات مدونتي', onPress: () => router.push('/sectors') },
          ]}
        />
        <NavGroup
          title="تصفّح حسب"
          items={[
            { key: 'categories', icon: 'categories', label: 'التصنيفات', onPress: () => router.push('/categories') },
            { key: 'industries', icon: 'industries', label: 'المجالات', onPress: () => router.push('/industries') },
            { key: 'tags', icon: 'tags', label: 'الوسوم', onPress: () => router.push('/tags') },
            { key: 'partners', icon: 'partner', label: 'دليل الشركاء', onPress: () => router.push('/partners') },
          ]}
        />
        <NavGroup
          title="مساعدة"
          items={[
            { key: 'modo', icon: 'support', label: 'اسأل مودو', hint: 'المساعد الذكي', onPress: () => router.push('/chat') },
            { key: 'faq', icon: 'question', label: 'الأسئلة الشائعة', onPress: () => router.push('/help') },
            { key: 'contact', icon: 'email', label: 'تواصل معنا', onPress: () => router.push('/contact') },
            { key: 'about', icon: 'info', label: 'عن مدونتي', onPress: () => router.push({ pathname: '/pages/[key]', params: { key: 'about' } }) },
          ]}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({ content: { padding: space.screen, gap: space.section, paddingBottom: space.xxl } });
