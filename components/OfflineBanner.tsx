import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Easing } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';

let NetInfoModule: any = null;
if (Platform.OS !== 'web') {
  try {
    NetInfoModule = require('@react-native-community/netinfo');
  } catch (e) {
    console.log('[OfflineBanner] NetInfo not available');
  }
}

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      if (typeof window !== 'undefined') {
        setIsOffline(!window.navigator.onLine);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
      return;
    }

    if (!NetInfoModule) return;

    const unsubscribe = NetInfoModule.default.addEventListener((state: any) => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
      console.log('[OfflineBanner] Network state:', { connected: state.isConnected, reachable: state.isInternetReachable });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isOffline) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, friction: 10, tension: 90, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -50, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isOffline]);

  if (!isOffline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
      pointerEvents="none"
      testID="offline-banner"
    >
      <View style={styles.inner}>
        <WifiOff size={14} color={Colors.amber} strokeWidth={1.8} />
        <Text style={styles.text}>You're offline — some features may be limited</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    paddingTop: 4,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(232, 168, 56, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232, 168, 56, 0.2)',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  text: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.amber,
    letterSpacing: 0.2,
  },
});
