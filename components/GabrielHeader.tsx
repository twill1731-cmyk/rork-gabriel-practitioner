import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Plus, LayoutGrid } from 'lucide-react-native';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { useGabriel } from '../contexts/GabrielContext';
import { hapticLight } from '../utils/haptics';

interface GabrielHeaderProps {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  centerTitle?: string;
  scrollY?: Animated.Value;
  onMenuPress?: () => void;
  onNewChat?: () => void;
  onDashboardPress?: () => void;
}

export default function GabrielHeader({ 
  leftContent, 
  rightContent, 
  centerTitle, 
  scrollY,
  onMenuPress,
  onNewChat,
  onDashboardPress,
}: GabrielHeaderProps) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const parallaxStyle = scrollY
    ? {
        transform: [
          {
            translateY: scrollY.interpolate({
              inputRange: [0, 120],
              outputRange: [0, -60],
              extrapolate: 'clamp' as const,
            }),
          },
        ],
        opacity: scrollY.interpolate({
          inputRange: [0, 100],
          outputRange: [1, 0.85],
          extrapolate: 'clamp' as const,
        }),
      }
    : {};

  const handleMenuPress = () => {
    hapticLight();
    onMenuPress?.();
  };

  const handleNewChatPress = () => {
    hapticLight();
    onNewChat?.();
  };

  const handleDashboardPress = () => {
    hapticLight();
    onDashboardPress?.();
  };

  return (
    <Animated.View style={[styles.header, { paddingTop: insets.top + 12, opacity: fadeAnim }, parallaxStyle]}>
      <View style={styles.left}>
        {leftContent || (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleMenuPress}
            activeOpacity={0.7}
          >
            <Menu size={22} color={Colors.cream} />
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1}>
          {centerTitle || 'Gabriel'}
        </Text>
      </View>
      <View style={styles.right}>
        {rightContent || (
          <>
            <TouchableOpacity
              style={styles.dashboardButton}
              onPress={handleDashboardPress}
              activeOpacity={0.7}
            >
              <LayoutGrid size={18} color={Colors.teal} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.newChatButton}
              onPress={handleNewChatPress}
              activeOpacity={0.7}
            >
              <Plus size={20} color={Colors.teal} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(79, 209, 197, 0.1)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: Colors.cream,
    letterSpacing: 1.5,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -12,
  },
  dashboardButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 209, 197, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 209, 197, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
