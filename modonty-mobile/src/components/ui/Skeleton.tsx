import { memo } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';
import { media, radius, space } from '@/theme/tokens';

/** هيكل التحميل بشكل المحتوى نفسه — لا دوّارة في منتصف الشاشة (UIUX §٨). */
export const Bone = memo(function Bone({ width = '100%', height, round }: { width?: DimensionValue; height: number; round?: boolean }) {
  const { colors } = useAppTheme();
  return <View style={{ width, height, borderRadius: round ? radius.pill : radius.image / 2, backgroundColor: colors.skeleton }} />;
});

export function ArticleCardSkeleton() {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.image}>
        <Bone height={0} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.skeleton, borderRadius: radius.image }]} />
      </View>
      <Bone width="90%" height={16} />
      <Bone width="70%" height={16} />
      <Bone width="40%" height={12} />
    </View>
  );
}

export function RowSkeleton() {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Bone width={48} height={48} round />
      <View style={styles.rowText}>
        <Bone width="60%" height={14} />
        <Bone width="35%" height={12} />
      </View>
    </View>
  );
}

export function ListSkeleton({ kind = 'card', count = 3 }: { kind?: 'card' | 'row'; count?: number }) {
  return (
    <View style={styles.list} accessibilityLabel="جارٍ التحميل" accessibilityRole="progressbar">
      {Array.from({ length: count }, (_, i) => (kind === 'card' ? <ArticleCardSkeleton key={i} /> : <RowSkeleton key={i} />))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: space.screen, gap: space.listGap },
  card: { borderRadius: radius.card, borderWidth: 1, padding: space.card, gap: space.xs },
  image: { aspectRatio: media.articleAspect, marginBottom: space.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.card, borderWidth: 1, padding: space.card },
  rowText: { flex: 1, gap: space.xs },
});
