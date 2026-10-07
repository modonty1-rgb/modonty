import { memo, type ReactElement } from 'react';
import { I18nManager } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

import { ICON_GEOMETRY, type IconGeometryName, type IconNode, type IconPaint } from './icon-geometry';

/**
 * أيقونات مدونتي — الهندسة من `shared/components/icons/` حرفياً عبر `scripts/generate-icons.mjs`.
 * `close` و`dislike` خارج المولِّد: الأولى فيها قناع SVG، فنُقلت هندستها كما هي من نسخة الكونسول
 * المعتمدة (`console-mobile/src/components/brand/icons/ModontyIcon.tsx`)، والثانية هي علامة الإعجاب
 * مقلوبة رأساً — لا علامة «لا يعجبني» في مصدر الماركة.
 */
export type ModontyIconName = IconGeometryName | 'close' | 'dislike' | 'back' | 'forward';

type Props = {
  name: ModontyIconName;
  size?: number;
  color: string;
  accent: string;
  /** لون «الثقب» داخل بعض العلامات (دوائر المشاركة) — لون السطح تحتها. */
  knockout: string;
};

const ELEMENTS = { Path, Rect, Circle, G, Ellipse, Line, Polyline, Polygon } as const;

function paintOf(value: IconPaint | undefined, p: Props): string | undefined {
  switch (value) {
    case undefined:
      return undefined;
    case 'none':
      return 'none';
    case 'accent':
      return p.accent;
    case 'white':
      return p.knockout;
    case 'primary':
      return p.color;
  }
}

function renderNodes(nodes: readonly IconNode[], p: Props): ReactElement[] {
  return nodes.map((node, index) => {
    const { t, fill, stroke, children, ...attrs } = node;
    const Element = ELEMENTS[t] as unknown as (props: Record<string, unknown>) => ReactElement;
    return (
      <Element key={index} {...attrs} fill={paintOf(fill, p) ?? (t === 'G' ? undefined : 'none')} stroke={paintOf(stroke, p)}>
        {children ? renderNodes(children, p) : null}
      </Element>
    );
  });
}

function geometry(name: ModontyIconName): readonly IconNode[] {
  switch (name) {
    case 'back':
    case 'forward':
      return ICON_GEOMETRY.arrow;
    case 'dislike':
      return ICON_GEOMETRY.like;
    case 'close':
      return [];
    default:
      return ICON_GEOMETRY[name];
  }
}

/**
 * الاتجاه: علامة السهم في المصدر تشير إلى «بداية السطر» في RTL (اليسار) — أي «التالي».
 * `forward` كما هي في RTL ومعكوسة في LTR؛ `back` عكسها. (UIUX §٩: الأيقونات ذات الاتجاه تُعكس.)
 */
function transformOf(name: ModontyIconName): string | undefined {
  const rtl = I18nManager.isRTL;
  if (name === 'dislike') return 'rotate(180 60 60)';
  if (name === 'forward') return rtl ? undefined : 'scale(-1 1) translate(-120 0)';
  if (name === 'back') return rtl ? 'scale(-1 1) translate(-120 0)' : undefined;
  return undefined;
}

export const ModontyIcon = memo(function ModontyIcon(props: Props) {
  const { name, size = 24 } = props;
  const svg = { width: size, height: size, viewBox: '0 0 120 120', fill: 'none' as const };
  if (name === 'close') {
    return (
      <Svg {...svg}>
        <Path d="M25.4 25.4L94.6 94.6M94.6 25.4L25.4 94.6" stroke={props.color} strokeWidth={12.2} strokeLinecap="round" />
        <Rect x={54} y={54} width={12} height={12} rx={2} transform="rotate(45 60 60)" fill={props.accent} />
      </Svg>
    );
  }
  return (
    <Svg {...svg}>
      <G transform={transformOf(name)}>{renderNodes(geometry(name), props)}</G>
    </Svg>
  );
});
