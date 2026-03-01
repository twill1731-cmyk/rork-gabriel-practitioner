import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Easing } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GoldenShimmerProps {
  visible: boolean;
  onComplete?: () => void;
}

export default function GoldenShimmer({ visible, onComplete }: GoldenShimmerProps) {
  const translateX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    translateX.setValue(-SCREEN_WIDTH);
    opacity.setValue(1);

    Animated.sequence([
      Animated.timing(translateX, {
        toValue: SCREEN_WIDTH,
        duration: 700,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete?.();
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.shimmer,
        {
          opacity,
          transform: [{ translateX }],
        },
      ]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 998,
    backgroundColor: 'rgba(184, 160, 136, 0.2)',
    width: 80,
    borderRadius: 40,
  },
});
