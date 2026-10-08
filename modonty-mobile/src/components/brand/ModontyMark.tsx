import { memo } from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';

/**
 * علامة «m» — هندسة `shared/components/icons/modonty-mark.tsx` حرفياً (أيقونة «مدونتي» في شريط الموقع).
 * الماسة بلون مستقلّ: أكسنت على السطح الفاتح، وبلون الجسم على الدائرة الزرقاء.
 */
export const ModontyMark = memo(function ModontyMark({ size, color, accent }: { size: number; color: string; accent: string }) {
  return (
    <Svg viewBox="18 18 64 64" width={size} height={size}>
      <G transform="translate(0 -6)">
        <Path
          fill={color}
          d="M74.41 50.23v24.42h-5.43V50.23c0-4.49-3.64-8.14-8.13-8.14-4.5 0-8.14 3.65-8.14 8.14v24.42h-5.42V50.23c0-4.49-3.65-8.14-8.14-8.14-4.5 0-8.14 3.65-8.14 8.14V63.8h-5.42V50.23c0-.92.09-1.83.27-2.72.4-2 1.25-3.84 2.44-5.42.77-1.02 1.68-1.93 2.72-2.71 2.26-1.7 5.08-2.72 8.14-2.72 3.05 0 5.86 1.01 8.14 2.72 1.02.76 1.93 1.68 2.71 2.71.77-1.02 1.68-1.93 2.72-2.71 2.27-1.7 5.08-2.72 8.14-2.72 3.05 0 5.86 1.01 8.13 2.72 1.03.76 1.95 1.68 2.72 2.71 1.18 1.58 2.03 3.42 2.45 5.42.18.89.28 1.8.28 2.72Z"
        />
        <Rect fill={accent} x="25.59" y="69.22" width="5.42" height="5.42" transform="rotate(-45 28.3 71.93)" />
      </G>
    </Svg>
  );
});
