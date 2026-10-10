import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { useSaved } from '@/providers/SavedProvider';
import type { ArticleRowModel, ReadBucket } from '@/lib/models';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale, dsType, type AppColors } from '@/theme/tokens';

/** لون نقطة وقت القراءة = لون بلاطة الفئة في «عندك كم دقيقة؟». */
export const BUCKET_COLOR: Record<ReadBucket, keyof AppColors> = { short: 'actionListen', medium: 'actionSave', long: 'actionShare' };

/**
 * صفّ المقال — Screens A · 01: النصّ عند البداية والصورة ٨٨ (زاوية ١٤) عند النهاية.
 * الناشر (شعار ٢٠ + اسم بالأزرق) · العنوان ١٦/٢٤ بلا حدّ أسطر · نقطة الفئة + المدّة والعمر.
 * زرّ الحفظ عند نهاية سطر المدّة — حالته من `SavedProvider` (المحفوظة الحقيقية للقارئ، وحارس التبديل).
 */
export const ArticleRow = memo(function ArticleRow({
  item,
  onOpen,
  divider = true,
  publisher = true,
  thumb = 88,
}: {
  item: ArticleRowModel;
  onOpen: (slug: string) => void;
  divider?: boolean;
  /** صفحة الناشر نفسه («من قلمنا»): الاسم مكرّر فيُخفى. */
  publisher?: boolean;
  thumb?: number;
}) {
  const { colors } = useAppTheme();
  return (
    <Tap
      label={`${item.title}، ${item.publisher}${item.meta ? `، ${item.meta}` : ''}`}
      role="link"
      onPress={() => onOpen(item.slug)}
      style={[styles.row, divider && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
    >
      <View style={styles.text}>
        {publisher ? <Publisher name={item.publisher} logo={item.publisherLogo} /> : null}
        <Text style={[dsType.titleSm, { color: colors.text }]} maxFontSizeMultiplier={dsFontScale.max}>
          {item.title}
        </Text>
        <View style={styles.meta}>
          {item.bucket ? <View style={[styles.dot, { backgroundColor: colors[BUCKET_COLOR[item.bucket]] }]} /> : null}
          {item.meta ? (
            <Text style={[dsType.caption, styles.metaText, { color: colors.muted }]} maxFontSizeMultiplier={dsFontScale.max}>
              {item.meta}
            </Text>
          ) : (
            <View style={styles.metaText} />
          )}
          <SaveButton id={item.key} slug={item.slug} title={item.title} />
        </View>
      </View>
      {item.image ? (
        <Image cachePolicy="memory-disk" recyclingKey={item.key} source={item.image} placeholder={item.imageBlur ?? undefined} style={[styles.thumb, { width: thumb, height: thumb, backgroundColor: colors.surfaceHigh }]} contentFit="cover" />
      ) : null}
    </Tap>
  );
});

/** زرّ الحفظ — Ø40 مرئي بهدف ٤٨ (hitSlop). محفوظ = العلامة الممتلئة بالأزرق. */
function SaveButton({ id, slug, title }: { id: string; slug: string; title: string }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(id);
  return (
    <Tap
      label={saved ? `إزالة «${title}» من المحفوظة` : `احفظ «${title}»`}
      accessibilityState={{ selected: saved }}
      minTarget={false}
      hitSlop={4}
      onPress={() => toggle(id, slug)}
      style={styles.save}
    >
      <Icon name={saved ? 'bookmarkFilled' : 'bookmark'} size={20} tone={saved ? 'primaryText' : 'text'} knockout="page" />
    </Tap>
  );
}

export function Publisher({ name, logo }: { name: string; logo: string | null }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.publisher}>
      {logo ? <Image cachePolicy="memory-disk" source={logo} recyclingKey={logo} style={[styles.logo, { borderColor: colors.border }]} contentFit="contain" /> : null}
      <Text style={[styles.publisherName, { color: colors.primaryText }]} numberOfLines={1} maxFontSizeMultiplier={dsFontScale.max}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, paddingVertical: ds.space.s4, paddingHorizontal: ds.layout.gutter, alignItems: 'flex-start' },
  text: { flex: 1, minWidth: 0, gap: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: ds.space.s2, minHeight: 40, marginBottom: -8 },
  metaText: { flex: 1 },
  save: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginEnd: -8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  thumb: { width: 88, height: 88, borderRadius: ds.radius.md },
  publisher: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logo: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: StyleSheet.hairlineWidth },
  publisherName: { ...dsType.label, fontSize: 13, flexShrink: 1 },
});
