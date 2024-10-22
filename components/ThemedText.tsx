import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import {TEXT_DESCRIPTION, TEXT_SUBTITLE, TEXT_TITLE} from "@/utils/colors";
import {useFonts} from "expo-font";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const [fontsLoaded] = useFonts({
    'SF-Pro': require('../assets/fonts/SF-Pro.ttf'),
  });
  return (
    <Text ellipsizeMode="tail"
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  titleStyle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.408,
    color: TEXT_TITLE,
    fontFamily:'SF-Pro'
  },
  subtitleStyle: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.24,
    color: TEXT_SUBTITLE,
    fontFamily:'SF-Pro'
  },
  descriptionStyle: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: -0.078,
    color: TEXT_DESCRIPTION,
    fontFamily:'SF-Pro'
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
