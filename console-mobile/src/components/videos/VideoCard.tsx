import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { GroupRow, StatusBadge, type BadgeTone } from '@/src/components/ui/Nabd';
import type { StatusTone, VideoSummary } from '@/src/services/engagement-api';
import { control, fonts, media, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/** نغمة الخادم ← نغمة الشارة: منشور/معتمد = تمّ · قيد المراجعة = انتظار · مرفوض = خطر. */
const badgeTone: Record<StatusTone, BadgeTone> = { primary: 'positive', warning: 'warning', danger: 'danger', muted: 'neutral' };

/**
 * طلّة واحدة في S09 — «نبض»: صفّ في مجموعة مقطّعة (فجوة ٣ · زوايا ٢٤ للأطراف و٨ بينها).
 *
 * الحالة شارة = كلمة + رمز + لون، فتُقرأ بلا تمييز ألوان. وسبب الرفض في حاوية الخطر تحت الصفّ
 * — هو الشيء الوحيد في القائمة الذي يطلب من العميل فعلاً.
 *
 * الصفّ لا يُضغط: لا شاشة تفاصيل للطلّة، وصفٌّ يضيء عند اللمس ثم لا يفعل شيئاً يُقرأ تطبيقاً مكسوراً.
 */
export const VideoCard = memo(function VideoCard({ item, position }: { item: VideoSummary; position: 'only' | 'first' | 'middle' | 'last' }) {
  const { theme } = useAppTheme();
  return <GroupRow position={position} style={styles.row}>
    <View style={styles.main}>
      {/*
        * المصغّرة ١٢٨×٧٢ (١٦:٩) لا مربّعة: المربّع يقصّ ≈٤٤٪ من عرض الإطار، والعميل يتعرّف
        * على فيديوه من تكوين اللقطة كلّها. و`flexShrink: 0` كي لا يعصرها الصفّ.
        */}
      <View style={[styles.thumb, { backgroundColor: theme.colors.surfaceRaised }]}>
        {item.thumbnailUrl
          ? <Image accessibilityLabel={item.filename} cachePolicy="memory-disk" contentFit="cover" source={item.thumbnailUrl} style={styles.thumbImage} transition={200} />
          : <ModontyIcon name="reels" size={control.iconSize} primary={theme.colors.muted} accent={theme.colors.accent} />}
      </View>
      <View style={styles.copy}>
        {item.statusLabel ? <StatusBadge label={item.statusLabel} tone={item.statusTone ? badgeTone[item.statusTone] : 'neutral'} /> : null}
        <Text numberOfLines={2} style={[styles.filename, { color: theme.colors.text }]}>{item.filename}</Text>
        {item.metaLine ? <Text numberOfLines={1} style={[styles.meta, { color: theme.colors.muted }]}>{item.metaLine}</Text> : null}
      </View>
    </View>
    {item.rejectionReason ? <View style={[styles.rejection, { backgroundColor: theme.colors.dangerContainer }]}>
      <Text style={[styles.meta, { color: theme.colors.onDangerContainer }]}>{item.rejectionReason}</Text>
    </View> : null}
  </GroupRow>;
});

const styles = StyleSheet.create({
  row: { gap: spacing.xs },
  main: { alignItems: 'flex-start', flexDirection: 'row-reverse', gap: spacing.sm },
  thumb: { alignItems: 'center', aspectRatio: media.cardImageAspectRatio, borderRadius: radii.field, flexShrink: 0, justifyContent: 'center', overflow: 'hidden', width: media.videoThumbnailWidth },
  thumbImage: { width: '100%', height: '100%' },
  copy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  // اسم الملفّ قد يبدأ لاتينياً؛ المحاذاة يمين تبقيه على رفّ البطاقة العربي.
  filename: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  meta: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  rejection: { borderRadius: radii.field, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
});
