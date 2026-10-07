import { FlashList } from '@shopify/flash-list';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Composer } from '@/components/content/Composer';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState, StateView } from '@/components/ui/StateView';
import { Tap } from '@/components/ui/Tap';
import { useResource } from '@/hooks/useResource';
import { open } from '@/lib/nav';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { miscApi } from '@/services/api-actions';
import type { ChatArticleRef, ChatPartner } from '@/services/api-types-actions';
import { toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

type Bubble = { id: string; role: 'user' | 'assistant'; text: string; partners?: ChatPartner[]; article?: ChatArticleRef };

/**
 * S39 — مودو (V3 — /chat): المساعد الذكي لحسابات القرّاء فقط (لا حصّة مجهولة في التطبيق — الويب يربطها
 * بكوكي). المحادثة السابقة من `/chat/history`. الحدّ نفسه حدّ الويب (checkRateLimit).
 */
export default function ChatScreen() {
  const { colors } = useAppTheme();
  const { status, requireAuth } = useAuth();
  const toast = useToast();
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [live, setLive] = useState<Bubble[]>([]);
  const history = useResource(async (signal) => {
    if (status !== 'signedIn') return [];
    const d = await miscApi.chatHistory(null, signal);
    return d.messages
      .slice()
      .reverse()
      .flatMap<Bubble>((m) => [
        { id: `${m.id}-q`, role: 'user', text: m.userQuery },
        { id: `${m.id}-a`, role: 'assistant', text: m.assistantResponse },
      ]);
  }, [status]);

  const send = useCallback(
    async (text: string) => {
      if (status !== 'signedIn') {
        requireAuth(() => undefined);
        return false;
      }
      const question: Bubble = { id: `q-${Date.now()}`, role: 'user', text };
      setLive((l) => [...l, question]);
      try {
        const turns = [...live, question].slice(-10).map((b) => ({ role: b.role, content: b.text }));
        const r = await miscApi.chat({ messages: turns, conversationId });
        setConversationId(r.conversationId);
        setLive((l) => [
          ...l,
          r.type === 'message'
            ? { id: `a-${Date.now()}`, role: 'assistant', text: r.text, partners: r.partners }
            : { id: `a-${Date.now()}`, role: 'assistant', text: r.message, partners: r.partners, article: r.suggestedArticle },
        ]);
        return true;
      } catch (error) {
        setLive((l) => l.filter((b) => b.id !== question.id));
        toast.show(toApiError(error).message, 'error');
        return false;
      }
    },
    [status, requireAuth, live, conversationId, toast],
  );

  const data = [...(history.data ?? []), ...live];
  const renderItem = useCallback(
    ({ item }: { item: Bubble }) => (
      <View style={[styles.bubble, item.role === 'user' ? [styles.mine, { backgroundColor: colors.primaryContainer }] : [styles.theirs, { backgroundColor: colors.surface, borderColor: colors.border }]]}>
        <AppText variant="body" tone={item.role === 'user' ? 'onPrimaryContainer' : 'text'}>
          {item.text}
        </AppText>
        {item.article ? <Button label={`اقرأ: ${item.article.title}`} kind="text" compact onPress={() => open.article(item.article!.slug)} /> : null}
        {item.partners?.map((p) => (
          <Tap key={p.slug} label={p.name} role="link" onPress={() => open.partner(p.slug)} style={[styles.partner, { borderColor: colors.border }]}>
            <AppText variant="label">{p.name}</AppText>
            <AppText variant="secondary" tone="muted">
              {p.whyRecommended}
            </AppText>
          </Tap>
        ))}
      </View>
    ),
    [colors],
  );

  return (
    <Screen>
      <Header back title="اسأل مودو" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.flex}>
          {status !== 'signedIn' ? (
            <StateView icon="support" title="مودو للقرّاء المسجّلين" body="ادخل لتسأل مودو عن أي موضوع في مدونتي." actionLabel="تسجيل الدخول" onAction={() => requireAuth(() => undefined)} />
          ) : history.status === 'loading' ? (
            <ListSkeleton kind="row" />
          ) : history.status === 'error' && live.length === 0 ? (
            <ErrorState error={history.error} onRetry={history.reload} what="محادثاتك" />
          ) : data.length === 0 ? (
            <StateView icon="support" title="اسأل مودو" body="اكتب سؤالك — يجيبك من مقالات مدونتي ويقترح الشريك المناسب." />
          ) : (
            <FlashList data={data} renderItem={renderItem} keyExtractor={(b) => b.id} contentContainerStyle={styles.list} />
          )}
        </View>
        {status === 'signedIn' ? <Composer placeholder="اكتب سؤالك لمودو" onSend={send} /> : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: space.screen },
  bubble: { borderRadius: radius.card, padding: space.sm, gap: space.xs, marginBottom: space.xs, maxWidth: '88%' },
  mine: { alignSelf: 'flex-start' },
  theirs: { alignSelf: 'flex-end', borderWidth: StyleSheet.hairlineWidth },
  partner: { borderRadius: radius.field, borderWidth: StyleSheet.hairlineWidth, padding: space.xs, gap: space.xxs },
});
