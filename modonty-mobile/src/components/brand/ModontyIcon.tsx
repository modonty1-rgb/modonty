import { memo } from 'react';
import { I18nManager, StyleSheet, Text, View } from 'react-native';

import type { IconGeometryName } from './icon-geometry';
import { ICON_GLYPHS } from './icon-glyphs';

/**
 * أيقونات مدونتي v2 — الهندسة من `shared/components/icons/` حرفياً عبر `scripts/generate-icons.mjs`،
 * على شبكة ٢٤ (ICON-STANDARD-v2: ٢٤ وحدة = ٢٤pt = ٢٤dp). `dislike` وحدها خارج المولِّد: علامة الإعجاب
 * مقلوبة رأساً — لا علامة «لا يعجبني» في مصدر الماركة.
 *
 * الرسم بخطّ أيقونات (`assets/fonts/ModontyIcons.ttf`، يُولَّد من الهندسة نفسها بـSkia): طبقتان — الجسم
 * والأكسنت — حرفان فوق بعض، و«الثقب» محفور في الحرف. كانت كل أيقونة رسماً متّجهياً يُعاد رسمه كل إطار؛
 * قِيس على جوال A21s (١٠ أكتوبر): إخفاؤها خفّض الإطارات المتأخّرة في دليل الشركاء من ٣٤٪ إلى ١٤٪
 * و«Slow issue draw commands» من ٤١٧ إلى ١٤٧. الحرف يُرسم مرّة ويُخزَّن في ذاكرة كرت الرسوم.
 */
export type ModontyIconName = IconGeometryName | 'dislike' | 'back' | 'forward';

type Props = {
  name: ModontyIconName;
  size?: number;
  color: string;
  accent: string;
  /** كان لون «الثقب» — الثقب الآن محفور في الحرف فيظهر ما تحته. يبقى للتوافق. */
  knockout?: string;
};

/** الاتجاه كما كان: السهم يشير لبداية السطر في RTL؛ `forward` كما هو في RTL و`back` معكوسه. */
function glyphOf(name: ModontyIconName): string {
  const rtl = I18nManager.isRTL;
  if (name === 'forward') return rtl ? 'arrow' : 'arrowMirror';
  if (name === 'back') return rtl ? 'arrowMirror' : 'arrow';
  return name;
}

export const ModontyIcon = memo(function ModontyIcon({ name, size = 24, color, accent }: Props) {
  const [body, mark] = ICON_GLYPHS[glyphOf(name)] ?? [0, 0];
  const box = { width: size, height: size };
  const type = { fontSize: size, lineHeight: size };
  return (
    <View style={box} accessible={false} importantForAccessibility="no-hide-descendants" pointerEvents="none">
      {body ? (
        <Text style={[styles.glyph, box, type, { color }]} allowFontScaling={false}>
          {String.fromCharCode(body)}
        </Text>
      ) : null}
      {mark ? (
        <Text style={[styles.glyph, styles.over, box, type, { color: accent }]} allowFontScaling={false}>
          {String.fromCharCode(mark)}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  glyph: { fontFamily: 'ModontyIcons', includeFontPadding: false, textAlign: 'center', writingDirection: 'ltr' },
  over: { position: 'absolute', top: 0, left: 0 },
});
