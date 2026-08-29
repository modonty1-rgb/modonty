import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import type { VideoSummary } from '@/src/services/engagement-api';
import { control, fonts, media, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * One upload on S09.
 *
 * The status is a word, not just a colour — «قيد المراجعة» says the state on its own, so the
 * card still reads correctly with no colour perception at all.
 *
 * The card is not pressable: there is no video detail screen, and a card that highlights on
 * touch and then does nothing reads as a broken app.
 */

export const VideoCard = memo(function VideoCard({ item }: { item: VideoSummary }) {
  const { theme } = useAppTheme();
  const statusColor = item.statusTone === 'warning' ? theme.colors.warning
    : item.statusTone === 'danger' ? theme.colors.danger
    : item.statusTone === 'muted' ? theme.colors.muted
    : theme.colors.textInteractive;
  return <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
    {/*
      * المصغّرة ١٦:٩ لا مربّعة.
      *
      * كانت ٦٣×٦٣ (نسبة ١٫٠٠) لمحتوى ١٦:٩ — أي أنّها تقصّ نحو ٤٤٪ من عرض الإطار،
      * فيرى العميل وسط اللقطة وحده. والمصغّرة هنا وظيفتها أن يتعرّف على فيديوه، والتعرّف
      * يقع على تكوين اللقطة كلّها لا على مربّع من وسطها.
      */}
    <View style={[styles.thumb, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}>
      {item.thumbnailUrl
        ? <Image accessibilityLabel={item.filename} cachePolicy="memory-disk" contentFit="cover" source={item.thumbnailUrl} style={styles.thumbImage} transition={200} />
        : <ModontyIcon name="reels" size={control.iconSize} primary={theme.colors.muted} accent={theme.colors.accent} />}
    </View>
    <View style={styles.copy}>
      {item.statusLabel ? <Text maxFontSizeMultiplier={1} style={[styles.status, { color: statusColor }]}>{item.statusLabel}</Text> : null}
      <Text numberOfLines={1} style={[styles.filename, { color: theme.colors.text }]}>{item.filename}</Text>
      {item.metaLine ? <Text style={[styles.meta, { color: theme.colors.muted }]}>{item.metaLine}</Text> : null}
      {item.rejectionReason ? <Text style={[styles.rejection, { color: theme.colors.errorText }]}>{item.rejectionReason}</Text> : null}
    </View>
  </View>;
});

const styles = StyleSheet.create({
  card: { flexDirection: 'row-reverse', gap: spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.card, padding: spacing.md, marginBottom: spacing.sm },
  /**
   * المصغّرة **تتمدّد لارتفاع النصّ** وعرضها يُشتَقّ من ١٦:٩ — لا مقاس ثابت.
   *
   * بعرض ٨٠ صار ارتفاعها ٤٤ بينما عمود النصّ ٩٦، فبقي **≈٥٠ بكسل فراغاً ميّتاً** تحتها.
   * وعولج الفراغ من طرفيه معاً: سطر البيانات صار واحداً بدل اثنين (النصّ ٧٣)، والعرض ١٢٨
   * يعطي بـ١٦:٩ ارتفاع ٧٢.
   *
   * و`flexShrink: 0` ليست زينة: بلاها يعصرها الصفّ (قِيس: انهارت إلى **1px**).
   */
  thumb: { alignSelf: 'flex-start', flexShrink: 0, width: media.videoThumbnailWidth, aspectRatio: media.cardImageAspectRatio, borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.field, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImage: { width: '100%', height: '100%' },
  copy: { flex: 1, minWidth: 0, alignItems: 'flex-end' },
  /**
   * الحالة ترجع إلى رفّ النصّ.
   *
   * كانت `alignSelf: 'flex-start'` داخل عمود `alignItems: 'flex-end'`، فقِيس أنّ نصّها
   * ينتهي عند **١٠٣** بينما العنوان واليوم والمدّة تنتهي كلها عند **٢٨٧** — أي **١٨٤ بكسل**
   * تفصل أوّل ما يُقرأ عن بقيّة البطاقة. الحالة رأس الصفّ لا حاشية على طرفه المقابل.
   */
  status: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, writingDirection: 'rtl' },
  filename: { alignSelf: 'stretch', fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'ltr', marginTop: spacing.xs },
  meta: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xxs },
  rejection: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xs },
});
