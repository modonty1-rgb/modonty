import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { duration, plainNumber } from '@/lib/format';
import { open } from '@/lib/nav';
import type { ReelFeedItem } from '@/services/api-types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsType } from '@/theme/tokens';
import { SectionTitle } from './SectionTitle';

const W = 122;
const H = 204;

/**
 * صفّ الطلّات — Screens A · 01: بطاقات طولية ١٢٢×٢٠٤ (زاوية ٢٠) · المدّة أعلى البداية · تدرّج كحلي تحته
 * العنوان (حتى ٣ أسطر) وشعار الشريك واسمه · آخر الصفّ «شاهد الكل» بعدد الطلّات.
 * القرار (UI-DECISIONS): الدائرة للهوية (شريك)، والبطاقة للمحتوى (طلّة).
 * صور غلاف فقط، والفيديو يعمل عند الضغط في صفحة الطلّة. كانت أوّل طلّة تعمل صامتة متكرّرة — قِيس على جوال
 * A21s (١٠ أكتوبر، ٣ قياسات لكلٍّ): الإطارات المتأخّرة في الرئيسية ٣١٪ معها و٢٢٪ بدونها، فأُزيلت (قرار خالد).
 */
export const ReelRail = memo(function ReelRail({ reels, total }: { reels: ReelFeedItem[]; total: number | null }) {
  const { colors } = useAppTheme();
  if (reels.length === 0) return null;
  const all = () => router.navigate('/reels');
  return (
    <View>
      <SectionTitle title="الطلّات" more={{ label: 'الكل', a11y: 'كل الطلّات', onPress: all }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {reels.map((r) => (
          <ReelCard key={r.id} reel={r} />
        ))}
        <Tap label={total ? `شاهد كل الطلّات، ${plainNumber(total)} طلّة` : 'شاهد كل الطلّات'} role="link" scale={0.97} onPress={all} style={[styles.card, styles.all, { backgroundColor: colors.surfaceRaised }]}>
          <View style={[styles.allIcon, { backgroundColor: colors.surface }]}>
            <Icon name="arrow" size={22} tone="text" monochrome />
          </View>
          <Text style={[dsType.label, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
            شاهد الكل
          </Text>
          {total ? (
            <Text style={[dsType.caption, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
              {plainNumber(total)} طلّة
            </Text>
          ) : null}
        </Tap>
      </ScrollView>
    </View>
  );
});

function ReelCard({ reel }: { reel: ReelFeedItem }) {
  const { colors } = useAppTheme();
  // أرقام عربية كبقية الواجهة (Screens A · 01: «١:٠٥»).
  const time = reel.isVideo ? (duration(reel.durationSec)?.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)] ?? d) ?? null) : null;
  const cover = reel.posterUrl ?? reel.imageUrl;
  return (
    <Tap
      label={[reel.title || 'طلّة', reel.clientName, time ? `المدّة ${time}` : null].filter(Boolean).join('، ')}
      role="link"
      onPress={() => open.reel(reel.slug)}
      scale={0.97}
      // نصّ وتدرّج فوق صورة = دمج شفافية يُعاد كل إطار تمرير على أندرويد؛ توثيق React Native (Performance ›
      // «Moving a view on the screen…»): renderToHardwareTextureAndroid يحفظ البطاقة طبقةً جاهزة.
      renderToHardwareTextureAndroid
      style={[styles.card, { backgroundColor: colors.navy }]}
    >
      {cover ? <Image cachePolicy="memory-disk" source={cover} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
      {time ? (
        <View style={[styles.time, { backgroundColor: colors.navy }]}>
          <Icon name="play" size={12} tone="onReels" monochrome />
          <Text style={[dsType.caption, styles.timeText]} maxFontSizeMultiplier={1}>
            {time}
          </Text>
        </View>
      ) : null}
      <LinearGradient colors={['rgba(14,6,90,0)', 'rgba(14,6,90,0.9)', 'rgba(14,6,90,0.96)']} locations={[0, 0.3, 1]} style={styles.shade}>
        {reel.title ? (
          <Text style={[dsType.label, styles.white]} numberOfLines={3} maxFontSizeMultiplier={1.2}>
            {reel.title}
          </Text>
        ) : null}
        <View style={styles.partner}>
          {reel.clientLogoUrl ? <Image cachePolicy="memory-disk" source={reel.clientLogoUrl} style={styles.logo} contentFit="cover" /> : null}
          <Text style={[dsType.caption, styles.partnerName]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
            {reel.clientName}
          </Text>
        </View>
      </LinearGradient>
    </Tap>
  );
}

const styles = StyleSheet.create({
  rail: { paddingHorizontal: ds.layout.gutter, gap: ds.space.s3 },
  card: { width: W, height: H, borderRadius: ds.radius.lg, overflow: 'hidden' },
  all: { alignItems: 'center', justifyContent: 'center', gap: 10 },
  allIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  time: { position: 'absolute', top: 8, start: 8, height: 26, paddingHorizontal: 9, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { color: '#FFFFFF', fontFamily: dsType.label.fontFamily, lineHeight: 16 },
  shade: { position: 'absolute', start: 0, end: 0, bottom: 0, height: '64%', paddingHorizontal: 10, paddingBottom: 10, justifyContent: 'flex-end', gap: 6 },
  white: { color: '#FFFFFF' },
  partner: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  logo: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF' },
  partnerName: { color: '#DCDAF2', flexShrink: 1, lineHeight: 16 },
});

