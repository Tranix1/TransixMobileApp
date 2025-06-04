import type { PropsWithChildren, ReactElement } from 'react';
import { Image, StyleSheet, TouchableHighlight, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import ScreenWrapper from './ScreenWrapper';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const HEADER_HEIGHT = hp(40);

type Props = PropsWithChildren<{
  headerImage: ReactElement;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';

  const backgroundColor = useThemeColor('background');
  const icon = useThemeColor('icon');

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <ScreenWrapper>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        // scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: 0 }}>
        <Animated.View
          style={[
            styles.header,
            headerAnimatedStyle,
            { position: 'relative' }
          ]}>
          <TouchableHighlight underlayColor={'icon'} onPress={() => router.back()} style={{ padding: wp(2.5), borderRadius: wp(4), position: 'absolute', top: wp(2), left: wp(2), backgroundColor: '#7f7f7f96', zIndex: 3 }}>
            <Ionicons name='chevron-back' size={wp(5)} color={'white'} />
          </TouchableHighlight>
          {headerImage}
        </Animated.View>
        <View style={[styles.content, { backgroundColor }]}>{children}</View>
      </Animated.ScrollView>
    </ScreenWrapper >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: wp(2),
    gap: 16,
    overflow: 'hidden',
  },
});
