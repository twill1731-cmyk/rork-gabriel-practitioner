import React, { useEffect, useRef, useCallback } from 'react';
import { Animated, ViewStyle, StyleProp, Platform, Easing } from 'react-native';

interface AnimatedCardProps {
  index: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  android: {
    elevation: 6,
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
});

export default function AnimatedCard({ index, children, style, delay = 60 }: AnimatedCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const scale = useRef(new Animated.Value(0.98)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const staggerDelay = index * delay;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: staggerDelay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        delay: staggerDelay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 350,
        delay: staggerDelay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 0.975,
      speed: 60,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 1,
      speed: 40,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  return (
    <Animated.View
      style={[
        style,
        CARD_SHADOW,
        {
          opacity,
          transform: [{ translateY }, { scale: Animated.multiply(scale, pressScale) }],
        },
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
    >
      {children}
    </Animated.View>
  );
}
