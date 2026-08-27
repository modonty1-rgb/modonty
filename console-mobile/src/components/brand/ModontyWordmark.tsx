import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

type ModontyWordmarkProps = { width?: number; height?: number };

/** Official Modonty wordmark rendered from the approved brand asset for native surfaces. */
export function ModontyWordmark({ width = 140, height = 48 }: ModontyWordmarkProps) {
  return <Image source={require('../../../assets/brand/modonty-wordmark-on-navy.png')} style={[styles.image, { width, height }]} contentFit="contain" />;
}

const styles = StyleSheet.create({ image: {} });
