import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/ui/Icon';
import type { ArticleCardModel } from '@/lib/models';
import { control } from '@/theme/tokens';

type Props = {
  item: ArticleCardModel;
  onOpen: (slug: string) => void;
  /** بطاقة «الواجهة» الواحدة أعلى الفيد — مثل الموقع (`MobilePostCard` hero). */
  hero?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * بطاقة الفيد بتصميم موقع مدونتي على الجوال (`modonty/components/feed/postcard/MobilePostCard.tsx`،
 * الهجين الذي اعتمده خالد ٢٣ أغسطس): بطاقة واجهة واحدة بغلاف ١٦:٩ فوق، وبقيّة البطاقات مدمجة —
 * النصّ ثم صورة ١٢٤ بنسبة ٤:٣ بجانبه — فيرى القارئ ضعف البطاقات في الشاشة.
 * الضغط ينكمش ١٫٥٪ ويعود بهدوء (Reanimated) — لمسة لا استعراض (خالد ٨ أكتوبر: «جنتل وأنيق»).
 */
export const FeedCard = memo(function FeedCard({ item, onOpen, hero }: Props) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const publisher = item.publisher ? (
    <View className="flex-row items-center gap-1.5">
      {item.publisherLogo ? (
        <Image source={item.publisherLogo} style={{ width: 20, height: 20, borderRadius: 10 }} contentFit="cover" />
      ) : null}
      <Text className="shrink font-tajawal-medium text-xs text-muted-foreground" numberOfLines={1}>
        {item.publisher}
      </Text>
      {item.verified ? <Icon name="trust" size={control.iconInline} tone="interactive" /> : null}
    </View>
  ) : null;

  const footer = (
    <View className="mt-2 flex-row items-center gap-3">
      {item.hasAudio ? <Icon name="audio" size={18} tone="muted" /> : null}
      <Text className="flex-1 font-tajawal text-xs text-muted-foreground" numberOfLines={1}>
        {[item.meta, item.stats].filter(Boolean).join('، ')}
      </Text>
    </View>
  );

  return (
    <AnimatedPressable
      accessibilityRole="link"
      accessibilityLabel={item.title}
      onPress={() => onOpen(item.slug)}
      onPressIn={() => (scale.value = withTiming(0.985, { duration: 90, easing: Easing.out(Easing.quad) }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) }))}
      style={pressStyle}
      className="overflow-hidden rounded-2xl border border-border bg-card p-2.5"
    >
      {hero ? (
        <>
          {item.image ? (
            <View style={{ marginHorizontal: -10, marginTop: -10, marginBottom: 10 }}>
              <Image
                source={item.image}
                placeholder={item.imageBlur ? { uri: item.imageBlur } : undefined}
                style={{ aspectRatio: 16 / 9 }}
                contentFit="cover"
                transition={250}
                accessibilityIgnoresInvertColors
              />
              {/* مثل الموقع: الشارة فوق الغلاف في الركن الأوّل، كحلية. */}
              <View className="absolute start-3 top-3 rounded-full bg-foreground px-3 py-1">
                <Text className="font-tajawal-bold text-xs text-background">الأحدث</Text>
              </View>
            </View>
          ) : null}
          <Text className="font-tajawal-bold text-xl leading-8 text-card-foreground" numberOfLines={2}>
            {item.title}
          </Text>
          <View className="mt-1.5">{publisher}</View>
          {item.excerpt ? (
            <Text className="mt-1 font-tajawal text-sm leading-6 text-muted-foreground" numberOfLines={2}>
              {item.excerpt}
            </Text>
          ) : null}
          {footer}
        </>
      ) : (
        <>
          {publisher}
          <View className="mt-1.5 flex-row gap-3">
            <View className="flex-1">
              <Text className="font-tajawal-bold text-base leading-6 text-card-foreground" numberOfLines={3}>
                {item.title}
              </Text>
              {item.excerpt ? (
                <Text className="mt-1 font-tajawal text-[13px] leading-5 text-muted-foreground" numberOfLines={2}>
                  {item.excerpt}
                </Text>
              ) : null}
            </View>
            {item.image ? (
              <Image
                source={item.image}
                placeholder={item.imageBlur ? { uri: item.imageBlur } : undefined}
                style={{ width: 124, aspectRatio: 4 / 3, borderRadius: 8 }}
                contentFit="cover"
                transition={250}
                accessibilityIgnoresInvertColors
              />
            ) : null}
          </View>
          {footer}
        </>
      )}
    </AnimatedPressable>
  );
});
