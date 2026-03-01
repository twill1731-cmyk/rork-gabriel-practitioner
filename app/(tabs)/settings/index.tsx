import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Bell,
  Volume2,
  Smartphone,
  FileText,
  ChevronRight,
  ExternalLink,
  Globe,
  Info,
  Shield,
  Moon,
  Database,
  LogOut,
  Sparkles,
} from 'lucide-react-native';
import Colors from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { hapticLight } from '../../../utils/haptics';

function ToggleRow({ icon, label, value, onValueChange }: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      {icon}
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={(val) => { hapticLight(); onValueChange(val); }}
        trackColor={{ false: Colors.bgTertiary, true: Colors.teal + '50' }}
        thumbColor={value ? Colors.teal : Colors.textTertiary}
      />
    </View>
  );
}

function ActionRow({ icon, label, onPress, labelColor, testID }: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  labelColor?: string;
  testID?: string;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={() => { hapticLight(); onPress(); }} activeOpacity={0.6} testID={testID}>
      {icon}
      <Text style={[styles.rowLabel, labelColor ? { color: labelColor } : null]}>{label}</Text>
      <ChevronRight size={16} color={Colors.textTertiary} strokeWidth={1.5} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Sparkles size={24} color={Colors.gold} strokeWidth={1.5} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Dr. Practice</Text>
            <Text style={styles.profileRole}>Naturopathic Practitioner</Text>
          </View>
          <ChevronRight size={18} color={Colors.textTertiary} strokeWidth={1.5} />
        </View>

        <Text style={styles.sectionHeader}>PRACTICE</Text>
        <View style={styles.sectionCard}>
          <ActionRow
            icon={<User size={18} color={Colors.teal} strokeWidth={1.5} />}
            label="Practice Profile"
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <ActionRow
            icon={<Database size={18} color={Colors.teal} strokeWidth={1.5} />}
            label="Protocol Library"
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <ActionRow
            icon={<FileText size={18} color={Colors.teal} strokeWidth={1.5} />}
            label="Export Patient Reports"
            onPress={() => {}}
          />
        </View>

        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        <View style={styles.sectionCard}>
          <ToggleRow
            icon={<Bell size={18} color={Colors.teal} strokeWidth={1.5} />}
            label="Patient Alerts"
            value={true}
            onValueChange={() => {}}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            icon={<Bell size={18} color={Colors.teal} strokeWidth={1.5} />}
            label="Lab Results Ready"
            value={true}
            onValueChange={() => {}}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            icon={<Bell size={18} color={Colors.teal} strokeWidth={1.5} />}
            label="Compliance Drops"
            value={true}
            onValueChange={() => {}}
          />
        </View>

        <Text style={styles.sectionHeader}>APPEARANCE</Text>
        <View style={styles.sectionCard}>
          <ActionRow
            icon={<Moon size={18} color={Colors.teal} strokeWidth={1.5} />}
            label="Dark Mode"
            onPress={() => {
              Alert.alert('Coming Soon', 'Dark mode for late-night charting will be available in a future update.');
            }}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            icon={<Volume2 size={18} color={Colors.teal} strokeWidth={1.5} />}
            label="Sound Effects"
            value={true}
            onValueChange={() => {}}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            icon={<Smartphone size={18} color={Colors.teal} strokeWidth={1.5} />}
            label="Haptic Feedback"
            value={true}
            onValueChange={() => {}}
          />
        </View>

        <Text style={styles.sectionHeader}>SECURITY</Text>
        <View style={styles.sectionCard}>
          <ActionRow
            icon={<Shield size={18} color={Colors.teal} strokeWidth={1.5} />}
            label="HIPAA Compliance"
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <ActionRow
            icon={<Shield size={18} color={Colors.teal} strokeWidth={1.5} />}
            label="Data Encryption"
            onPress={() => {}}
          />
        </View>

        <Text style={styles.sectionHeader}>ABOUT</Text>
        <View style={styles.sectionCard}>
          <View style={styles.row}>
            <Info size={18} color={Colors.textTertiary} strokeWidth={1.5} />
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.versionText}>1.0.0 (Practitioner Beta)</Text>
          </View>
          <View style={styles.rowDivider} />
          <ActionRow
            icon={<ExternalLink size={18} color={Colors.textTertiary} strokeWidth={1.5} />}
            label="Terms of Service"
            onPress={() => Linking.openURL('https://trygabriel.ai/terms')}
          />
          <View style={styles.rowDivider} />
          <ActionRow
            icon={<ExternalLink size={18} color={Colors.textTertiary} strokeWidth={1.5} />}
            label="Privacy Policy"
            onPress={() => Linking.openURL('https://trygabriel.ai/privacy')}
          />
          <View style={styles.rowDivider} />
          <ActionRow
            icon={<Globe size={18} color={Colors.teal} strokeWidth={1.5} />}
            label="Visit trygabriel.ai"
            onPress={() => Linking.openURL('https://trygabriel.ai')}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => hapticLight()} activeOpacity={0.7}>
          <LogOut size={18} color={Colors.softRed} strokeWidth={1.5} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.legalCard}>
          <Text style={styles.legalText}>
            Gabriel Practitioner provides clinical decision support tools only. It does not replace professional clinical judgment. All patient data is encrypted and HIPAA-compliant.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  profileRole: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.gold,
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 46,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.text,
    letterSpacing: 0.2,
  },
  versionText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    backgroundColor: Colors.softRedBg,
    borderRadius: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(201, 74, 74, 0.15)',
  },
  logoutText: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.softRed,
  },
  legalCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legalText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
    letterSpacing: 0.2,
    lineHeight: 18,
  },
});
