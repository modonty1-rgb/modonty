import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List } from 'react-native-paper';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState, StateView } from '@/components/ui/StateView';
import { useResource } from '@/hooks/useResource';
import { moreContentApi } from '@/services/api-content';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

/** S36 — الأسئلة الشائعة (C20 faq — getActiveFAQs). */
export default function HelpScreen() {
  const { colors } = useAppTheme();
  const res = useResource((signal) => moreContentApi.faq(signal), []);
  return (
    <Screen>
      <Header back title="الأسئلة الشائعة" />
      {res.status === 'loading' ? (
        <ListSkeleton kind="row" />
      ) : res.status === 'error' || !res.data ? (
        <ErrorState error={res.error} onRetry={res.reload} what="الأسئلة الشائعة" />
      ) : res.data.items.length === 0 ? (
        <StateView icon="question" title="لا أسئلة منشورة بعد" actionLabel="تواصل معنا" onAction={() => router.push('/contact')} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {res.data.items.map((f) => (
              <List.Accordion key={f.id} title={f.question} titleNumberOfLines={4} style={{ backgroundColor: colors.surface }} right={({ isExpanded }) => <Icon name={isExpanded ? 'close' : 'question'} size={control.iconSmall} tone="muted" />}>
                <AppText variant="body" tone="muted" style={styles.answer}>
                  {f.answer}
                </AppText>
              </List.Accordion>
            ))}
          </View>
          <Button label="لم تجد جوابك؟ تواصل معنا" kind="outlined" icon="email" onPress={() => router.push('/contact')} />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.screen, gap: space.md, paddingBottom: space.xxl },
  group: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  answer: { paddingHorizontal: space.card, paddingBottom: space.card },
});
