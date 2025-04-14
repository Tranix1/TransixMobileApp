import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  color?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'italic' | 'tiny';
};

export function ThemedText({
  style,
  color,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const defaultColor = useThemeColor('text');

  return (
    <Text
      style={[
        { color: color ? color : defaultColor },
        type === 'tiny' ? styles.tiny : undefined,
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'italic' ? styles.italic : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 22,
    // fontFamily: 'Regular',
  },
  italic: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 22,
    // fontFamily: 'Italic',

  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 500,
    // fontFamily: 'Medium',
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    // fontFamily: 'Bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 600,
    // fontFamily: 'SemiBold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
    // fontFamily: 'Light',
  },
  tiny: {
    fontSize: 12,
    lineHeight: 16,
    // fontFamily: 'Regular',
  },
});
