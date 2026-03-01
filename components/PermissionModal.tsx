import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Linking, Platform, Easing } from 'react-native';
import { Shield, Settings, X } from 'lucide-react-native';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { hapticLight } from '../utils/haptics';

interface PermissionModalProps {
  visible: boolean;
  onClose: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  settingsLabel?: string;
}

export default function PermissionModal({
  visible,
  onClose,
  icon,
  title,
  description,
  settingsLabel = 'Open Settings',
}: PermissionModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.92);
      opacityAnim.setValue(0);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 9, tension: 100, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.92, duration: 200, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 20, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleOpenSettings = () => {
    hapticLight();
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      Linking.openSettings().catch(() => {
        console.log('[PermissionModal] Could not open settings');
      });
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }, { translateY: slideAnim }] }]}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={18} color={Colors.whiteDim} strokeWidth={1.5} />
          </TouchableOpacity>

          <View style={styles.iconWrap}>
            <View style={styles.iconGlow} />
            {icon}
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={handleOpenSettings}
            activeOpacity={0.7}
            testID="permission-open-settings-btn"
          >
            <Settings size={16} color={Colors.darkBg} strokeWidth={1.8} />
            <Text style={styles.settingsBtnText}>{settingsLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissBtnText}>Maybe Later</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: '#132E22',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.12)',
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(79, 209, 197, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.06)',
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.cream,
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: Colors.whiteMuted,
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.teal,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 15,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 12,
  },
  settingsBtnText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.darkBg,
    letterSpacing: 0.3,
  },
  dismissBtn: {
    paddingVertical: 10,
  },
  dismissBtnText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.whiteDim,
    letterSpacing: 0.3,
  },
});
