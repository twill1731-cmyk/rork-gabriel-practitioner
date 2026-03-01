import React, { useEffect, useRef, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fonts } from '../constants/fonts';
import Colors from '../constants/colors';
import { hapticLight } from '../utils/haptics';

interface AskGabrielPillProps {
  context: string;
  subtitle?: string;
}

function AskGabrielPill({ context, subtitle }: AskGabrielPillProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(10)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation - fade in + slide up, delayed 500ms
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = async () => {
    hapticLight();

    // Animate tap scale
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Store pending query for chat screen
    const query = `What is ${context} and how does it work?`;
    await AsyncStorage.setItem('askGabriel_pendingQuery', query);

    // Navigate to chat
    router.push('/');
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: 24 + insets.bottom,
          opacity: fadeAnim,
          transform: [
            { translateY: translateYAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.pill}
        onPress={handlePress}
        activeOpacity={1}
      >
        <Text style={styles.text}>💬 Ask Gabriel</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  pill: {
    backgroundColor: 'rgba(79, 209, 197, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.25)',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#4FD1C5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500',
    color: Colors.cream,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: Fonts.light,
    fontWeight: '300',
    color: Colors.whiteDim,
    letterSpacing: 0.2,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default memo(AskGabrielPill);
