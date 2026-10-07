import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List } from 'react-native-paper';

import { AskForm } from '@/components/content/AskForm';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState, StateView } from '@/components/ui/StateView';
import { AppText } from '@/components/ui/AppText';
import { useResource } from '@/hooks/useResource';
import { useAuth } from '@/providers/AuthProvider';
import { partnerActionsApi } from '@/services/api-actions';
import { moreContentApi } from '@/services/api-content';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

/** S09f — أسئلة الشريك (C13 faqs) + اسأل الشريك (E13 — حدّ ٥ أسئلة معلّقة يردّ به الخادم). */
export default function PartnerFaqsScreen() {
  const { slug, name } = useLocalSearchParams<{ slug: string; name?: string }>();
  const { colors } = useAppTheme();
  const { requireAuth } = useAuth();
  const [asking, setAsking] = useState(false);
  const res = useResource((signal) => moreContentApi.partnerFaqs(slug, signal), [slug]);

  if (asking) {
    return (
      <Screen>
        <Header back title={name ? `اسأل ${name}` : 'اسأل الشريك'} />
        <AskForm intro="سؤالك يصل الشريك مباشرة، ويُنشر مع جوابه في صفحته." submit={(question) => partnerActionsApi.ask(slug, { question })} />
      </Screen>
    );
  }
  return (
    <Screen>
      <Header back title={name ? `أسئلة ${name}` : 'الأسئلة'} />
      {res.status === 'loading' ? (
        <ListSkeleton kind="row" />
      ) : res.status === 'error' || !res.data ? (
        <ErrorState error={res.error} onRetry={res.reload} what="الأسئلة" />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Button label="اسأل الشريك" icon="question" onPress={() => requireAuth(() => setAsking(true))} />
          {res.data.items.length === 0 ? (
            <StateView icon="question" title="لا أسئلة منشورة بعد" body="كن أوّل من يسأل." />
          ) : (
            <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {res.data.items.map((f, i) => (
                <List.Accordion key={i} title={f.question} titleNumberOfLines={4} style={{ backgroundColor: colors.surface }} right={({ isExpanded }) => <Icon name={isExpanded ? 'close' : 'question'} size={control.iconSmall} tone="muted" />}>
                  <AppText variant="body" tone="muted" style={styles.answer}>
                    {f.answer}
                  </AppText>
                </List.Accordion>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.screen, gap: space.md },
  group: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  answer: { paddingHorizontal: space.card, paddingBottom: space.card },
});
