import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PREFS_KEY = 'gabriel_notification_prefs';

export interface NotificationPrefs {
  masterEnabled: boolean;
  morningEnabled: boolean;
  afternoonEnabled: boolean;
  eveningEnabled: boolean;
  morningTime: string;
  afternoonTime: string;
  eveningTime: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  masterEnabled: false,
  morningEnabled: true,
  afternoonEnabled: true,
  eveningEnabled: true,
  morningTime: '08:00',
  afternoonTime: '13:00',
  eveningTime: '20:00',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

export async function loadNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (stored) {
      return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.log('[Notifications] Error loading prefs:', e);
  }
  return DEFAULT_NOTIFICATION_PREFS;
}

export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
    console.log('[Notifications] Prefs saved:', prefs);
  } catch (e) {
    console.log('[Notifications] Error saving prefs:', e);
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  console.log('[Notifications] Notifications not available in this build');
  return false;
}

export async function scheduleProtocolReminders(
  _prefs: NotificationPrefs,
  _protocolBlocks: { timeBlock: 'morning' | 'afternoon' | 'evening'; count: number }[]
): Promise<void> {
  console.log('[Notifications] Scheduling not available in this build');
}

export async function cancelAllNotifications(): Promise<void> {
  console.log('[Notifications] Cancel not available in this build');
}
