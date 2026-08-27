import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { Card, EmptyState, Screen, SectionTitle, StatusPill } from '@/src/components/ui/MobileUI';
import { MobileSubscription } from '@/src/services/mobile-api';
import { control, fonts, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type SubscriptionRouteProps = { subscription: MobileSubscription | null; onBack: () => void };
const statusTone = (status: string) => status === 'ACTIVE' ? 'primary' : status === 'EXPIRED' ? 'danger' : 'warning';
const formatDate = (value: string) => new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));

export function SubscriptionRoute({ subscription, onBack }: SubscriptionRouteProps) {
  const { theme } = useAppTheme();
  if (!subscription) return <Screen title="تفاصيل الاشتراك" icon="toc"><EmptyState icon="toc" title="لا تتوفر تفاصيل اشتراك" copy="لم تصل تفاصيل الاشتراك من الحساب." actionLabel="رجوع" onAction={onBack} /></Screen>;
  return <Screen title="تفاصيل الاشتراك" icon="toc">
    <Card style={styles.hero}><View style={styles.heroHeader}><View><Text style={[styles.tier, { color: theme.colors.text }]}>{subscription.tierName}</Text><Text style={[styles.status, { color: theme.colors.muted }]}>{subscription.statusLabel}</Text></View><ModontyIcon name="toc" size={control.iconSize} primary={theme.colors.text} accent={theme.colors.primary} /></View><StatusPill tone={statusTone(subscription.status)}>{subscription.statusLabel}</StatusPill>{subscription.daysRemaining !== null ? <Text style={[styles.days, { color: theme.colors.text }]}>{subscription.daysRemaining} يومًا متبقيًا</Text> : null}</Card>
    <SectionTitle>الاستخدام الشهري</SectionTitle><Card style={styles.usage}>{subscription.articlesPerMonth !== null ? <DetailRow label="حد المقالات الشهري" value={String(subscription.articlesPerMonth)} /> : null}<DetailRow label="المقالات المنشورة هذا الشهر" value={String(subscription.articlesPublishedThisMonth)} />{subscription.articlesRemaining !== null ? <DetailRow label="المقالات المتبقية" value={String(subscription.articlesRemaining)} /> : null}</Card>
    <SectionTitle>تفاصيل المدة</SectionTitle><Card>{subscription.startDate ? <DetailRow label="تاريخ البداية" value={formatDate(subscription.startDate)} /> : null}{subscription.endDate ? <DetailRow label="تاريخ النهاية" value={formatDate(subscription.endDate)} /> : null}{subscription.durationDays !== null ? <DetailRow label="مدة الاشتراك" value={`${subscription.durationDays} يومًا`} /> : null}{subscription.price ? <DetailRow label="سعر الاشتراك" value={subscription.price.display} /> : null}</Card>
    <Pressable accessibilityRole="button" accessibilityLabel="رجوع" onPress={onBack} style={styles.backButton}><Text style={[styles.backText, { color: theme.colors.textInteractive }]}>رجوع</Text></Pressable>
  </Screen>;
}

function DetailRow({ label, value }: { label: string; value: string }) { const { theme } = useAppTheme(); return <View style={[styles.detailRow, { borderBottomColor: theme.colors.border }]}><Text style={[styles.detailValue, { color: theme.colors.text }]}>{value}</Text><Text style={[styles.detailLabel, { color: theme.colors.muted }]}>{label}</Text></View>; }

const styles = StyleSheet.create({ hero: { gap: spacing.sm }, heroHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }, tier: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, writingDirection: 'rtl' }, status: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, writingDirection: 'rtl' }, days: { fontFamily: fonts.medium, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, writingDirection: 'rtl' }, usage: { paddingVertical: spacing.xs }, detailRow: { minHeight: control.headerHeight, borderBottomWidth: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }, detailLabel: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, writingDirection: 'rtl' }, detailValue: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' }, backButton: { minHeight: control.minTouchTarget, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md, borderRadius: radii.button }, backText: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' } });
