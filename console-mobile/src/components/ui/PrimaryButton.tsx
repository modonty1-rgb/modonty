import { ViewStyle } from 'react-native';
import { PillButton } from '@/src/components/ui/Nabd';

type PrimaryButtonProps = { label: string; onPress: () => void; icon?: string; style?: ViewStyle; disabled?: boolean };

/** الزرّ الأساسي = كبسولة «نبض» بأزرق البطل وظلّه (اهتزاز متوسّط: هو فعل الشاشة الرئيسي). */
export function PrimaryButton({ label, onPress, style, disabled = false }: PrimaryButtonProps) {
  return <PillButton label={label} onPress={onPress} disabled={disabled} style={style} />;
}
