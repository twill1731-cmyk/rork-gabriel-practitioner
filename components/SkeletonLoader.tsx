import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, StyleProp, Easing } from 'react-native';
import Colors from '../constants/colors';

interface SkeletonCardProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  delayMs?: number;
}

function SkeletonCard({ width = '100%', height = 80, borderRadius = 14, style, delayMs = 0 }: SkeletonCardProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entryTimer = setTimeout(() => {
      Animated.timing(entryAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, delayMs);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => {
      clearTimeout(entryTimer);
      loop.stop();
    };
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.55],
  });

  return (
    <Animated.View
      style={[
        skeletonStyles.card,
        {
          width: width as any,
          height,
          borderRadius,
          opacity: Animated.multiply(opacity, entryAnim),
        },
        style,
      ]}
    />
  );
}

export function SkeletonProtocolCards() {
  return (
    <View style={skeletonStyles.container}>
      <SkeletonCard height={72} style={skeletonStyles.mb} delayMs={0} />
      <SkeletonCard height={72} style={skeletonStyles.mb} delayMs={60} />
      <SkeletonCard height={72} style={skeletonStyles.mb} delayMs={120} />
      <View style={skeletonStyles.spacer} />
      <SkeletonCard height={100} style={skeletonStyles.mb} delayMs={180} />
      <SkeletonCard height={100} style={skeletonStyles.mb} delayMs={240} />
    </View>
  );
}

export function SkeletonLabCards() {
  return (
    <View style={skeletonStyles.container}>
      <SkeletonCard height={120} borderRadius={16} style={skeletonStyles.mb} delayMs={0} />
      <View style={skeletonStyles.row}>
        <SkeletonCard width="31%" height={40} borderRadius={20} delayMs={60} />
        <SkeletonCard width="31%" height={40} borderRadius={20} delayMs={100} />
        <SkeletonCard width="31%" height={40} borderRadius={20} delayMs={140} />
      </View>
      <View style={skeletonStyles.spacer} />
      <SkeletonCard height={90} style={skeletonStyles.mb} delayMs={180} />
      <SkeletonCard height={90} style={skeletonStyles.mb} delayMs={240} />
      <SkeletonCard height={90} style={skeletonStyles.mb} delayMs={300} />
    </View>
  );
}

export function SkeletonPractitionerCards() {
  return (
    <View style={skeletonStyles.container}>
      <SkeletonCard height={140} borderRadius={16} style={skeletonStyles.mb} delayMs={0} />
      <SkeletonCard height={140} borderRadius={16} style={skeletonStyles.mb} delayMs={80} />
      <SkeletonCard height={140} borderRadius={16} style={skeletonStyles.mb} delayMs={160} />
    </View>
  );
}

export function SkeletonConditionDetail() {
  return (
    <View style={skeletonStyles.container}>
      <SkeletonCard height={28} width="60%" borderRadius={8} style={skeletonStyles.mb} delayMs={0} />
      <SkeletonCard height={14} width="40%" borderRadius={6} style={skeletonStyles.mb} delayMs={50} />
      <View style={skeletonStyles.spacer} />
      <SkeletonCard height={160} borderRadius={16} style={skeletonStyles.mb} delayMs={100} />
      <SkeletonCard height={200} borderRadius={16} style={skeletonStyles.mb} delayMs={160} />
      <SkeletonCard height={140} borderRadius={16} style={skeletonStyles.mb} delayMs={220} />
      <SkeletonCard height={120} borderRadius={16} style={skeletonStyles.mb} delayMs={280} />
    </View>
  );
}

export function SkeletonPractitionerDetail() {
  return (
    <View style={[skeletonStyles.container, { alignItems: 'center' }]}>
      <SkeletonCard height={28} width="70%" borderRadius={8} style={skeletonStyles.mb} delayMs={0} />
      <SkeletonCard height={14} width="40%" borderRadius={6} style={skeletonStyles.mb} delayMs={50} />
      <View style={skeletonStyles.spacer} />
      <SkeletonCard height={140} width={140} borderRadius={70} style={skeletonStyles.mb} delayMs={100} />
      <SkeletonCard height={14} width="30%" borderRadius={6} style={skeletonStyles.mb} delayMs={150} />
      <View style={skeletonStyles.spacer} />
      <View style={[skeletonStyles.row, { width: '100%' }]}>
        <SkeletonCard width="30%" height={36} borderRadius={20} delayMs={200} />
        <SkeletonCard width="30%" height={36} borderRadius={20} delayMs={240} />
        <SkeletonCard width="30%" height={36} borderRadius={20} delayMs={280} />
      </View>
      <View style={skeletonStyles.spacer} />
      <View style={[skeletonStyles.row, { width: '100%' }]}>
        <SkeletonCard width="48%" height={54} borderRadius={14} delayMs={320} />
        <SkeletonCard width="48%" height={54} borderRadius={14} delayMs={360} />
      </View>
      <View style={skeletonStyles.spacer} />
      <SkeletonCard height={100} borderRadius={14} style={skeletonStyles.mb} delayMs={400} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(79, 209, 197, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.06)',
  },
  mb: {
    marginBottom: 12,
  },
  spacer: {
    height: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});

export default SkeletonCard;
