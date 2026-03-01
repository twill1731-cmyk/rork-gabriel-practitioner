import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'gabriel_app_settings';
let cachedHapticEnabled: boolean | null = null;

async function isHapticEnabled(): Promise<boolean> {
  if (cachedHapticEnabled !== null) return cachedHapticEnabled;
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      cachedHapticEnabled = parsed.hapticFeedback !== false;
    } else {
      cachedHapticEnabled = true;
    }
  } catch {
    cachedHapticEnabled = true;
  }
  return cachedHapticEnabled;
}

export function setHapticEnabledCache(enabled: boolean): void {
  cachedHapticEnabled = enabled;
}

isHapticEnabled();

export async function hapticLight() {
  if (Platform.OS === 'web') return;
  if (!(await isHapticEnabled())) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function hapticMedium() {
  if (Platform.OS === 'web') return;
  if (!(await isHapticEnabled())) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export async function hapticSuccess() {
  if (Platform.OS === 'web') return;
  if (!(await isHapticEnabled())) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function hapticHeavy() {
  if (Platform.OS === 'web') return;
  if (!(await isHapticEnabled())) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}
