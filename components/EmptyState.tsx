import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;

  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.06,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    breatheLoop.start();

    return () => breatheLoop.stop();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]} testID="empty-state">
      <View style={styles.iconArea}>
        <View style={styles.glowOrb} />
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: breatheAnim }] }]}>
          {icon}
        </Animated.View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.7}
          testID="empty-state-action"
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  iconArea: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  glowOrb: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(79, 209, 197, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.04)',
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: Colors.cream,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: '#B8A088',
    letterSpacing: 0.2,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 21,
    marginTop: 8,
  },
  actionButton: {
    marginTop: 28,
    paddingHorizontal: 30,
    paddingVertical: 13,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.5)',
    backgroundColor: 'rgba(79, 209, 197, 0.08)',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.teal,
    letterSpacing: 0.4,
  },
});
