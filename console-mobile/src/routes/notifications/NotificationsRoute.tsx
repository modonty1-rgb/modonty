import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fixtureInboxEvents } from '@/src/data/client-fixtures';
import { Card, EmptyState, Screen, StatusPill } from '@/src/components/ui/MobileUI';
import { ModontyIcon, ModontyIconName } from '@/src/components/brand/icons/ModontyIcon';
import { fonts } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

const iconByEvent: Record<string, ModontyIconName> = { articleAwaitingApproval: 'toc', askClientQuestion: 'question', reelProcessing: 'reels' };

export function NotificationsRoute({ onOpenArticle, onOpenAudience, onOpenVideo }: { onOpenArticle: () => void; onOpenAudience: () => void; onOpenVideo: () => void }) {
  const { theme } = useAppTheme();
  const open = (type: string) => type === 'articleAwaitingApproval' ? onOpenArticle() : type === 'askClientQuestion' ? onOpenAudience() : onOpenVideo();
  if (!fixtureInboxEvents.length) return <Screen title="التنبيهات" icon="notifications"><EmptyState icon="notifications" title="لا توجد تنبيهات جديدة" copy="سنظهر هنا ما يحتاج قرارك أو متابعتك."/></Screen>;
  return <Screen title="التنبيهات" icon="notifications"><View style={[styles.info, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}><Text style={[styles.infoText, { color: theme.colors.text }]}>الأولوية للأشياء التي تحتاج إجراءً منك</Text><StatusPill>2 جديد</StatusPill></View>{fixtureInboxEvents.map((event) => <Pressable key={event.id} accessibilityRole="button" accessibilityLabel={`فتح ${event.title}`} onPress={() => open(event.type)}><Card style={[styles.event, event.readAt ? undefined : { borderColor: theme.colors.primary }]}><ModontyIcon name={iconByEvent[event.type] ?? 'notifications'} size={26} primary={theme.colors.text} accent={theme.colors.primary}/><View style={styles.copy}><View style={styles.heading}><Text style={[styles.eventTitle, { color: theme.colors.text }]}>{event.title}</Text>{!event.readAt ? <View style={[styles.dot, { backgroundColor: theme.colors.primary }]}/> : null}</View><Text numberOfLines={2} style={[styles.body, { color: theme.colors.muted }]}>{event.body}</Text><Text style={[styles.time, { color: theme.colors.muted }]}>{event.readAt ? 'تمت رؤيته' : 'منذ قليل'}</Text></View></Card></Pressable>)}</Screen>;
}

const styles = StyleSheet.create({ info: { minHeight: 54, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }, infoText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, writingDirection: 'rtl' }, event: { flexDirection: 'row-reverse', gap: 13, marginBottom: 11 }, copy: { flex: 1 }, heading: { flexDirection: 'row-reverse', alignItems: 'center', gap: 7 }, eventTitle: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, writingDirection: 'rtl' }, dot: { width: 8, height: 8, borderRadius: 4 }, body: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl', marginTop: 3 }, time: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 16, textAlign: 'right', writingDirection: 'rtl', marginTop: 6 } });
