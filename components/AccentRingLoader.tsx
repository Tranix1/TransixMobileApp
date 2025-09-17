import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

interface AccentRingLoaderProps {
  color: string;
  size?: number;     // overall diameter
  dotSize?: number;  // each circle diameter
  durationMs?: number;
}

// A ring of small circles rotating around a center space
// Default: 8 dots, smooth rotation
export default function AccentRingLoader({
  color,
  size = 40,
  dotSize = 8,
  durationMs = 1200,
}: AccentRingLoaderProps) {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [rotate, durationMs]);

  const radius = size / 2 - dotSize; // leave inner space
  const count = 8;
  const dots = Array.from({ length: count });
  const rotation = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={{ width: size, height: size, transform: [{ rotate: rotation }] }}>
        {dots.map((_, i) => {
          const angle = (i / count) * 2 * Math.PI;
          const x = radius * Math.cos(angle) + size / 2 - dotSize / 2;
          const y = radius * Math.sin(angle) + size / 2 - dotSize / 2;
          return (
            <View
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: color,
              }}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}
