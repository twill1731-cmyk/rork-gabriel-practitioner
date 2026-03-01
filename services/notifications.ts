import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Web platform — skipping permission request');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    console.log('[Notifications] Permission status:', finalStatus);
    return finalStatus === 'granted';
  } catch (e) {
    console.log('[Notifications] Permission request error:', e);
    return false;
  }
}

function parseTime(timeStr: string): { hour: number; minute: number } {
  const [h, m] = timeStr.split(':').map(Number);
  return { hour: h || 0, minute: m || 0 };
}

function isTimeInQuietHours(
  hour: number,
  minute: number,
  quietStart: string,
  quietEnd: string
): boolean {
  const start = parseTime(quietStart);
  const end = parseTime(quietEnd);
  const timeMinutes = hour * 60 + minute;
  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;

  if (startMinutes > endMinutes) {
    return timeMinutes >= startMinutes || timeMinutes < endMinutes;
  }
  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
}

interface ProtocolBlock {
  timeBlock: 'morning' | 'afternoon' | 'evening';
  count: number;
}

export async function scheduleProtocolReminders(
  prefs: NotificationPrefs,
  protocolBlocks: ProtocolBlock[]
): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Web platform — skipping scheduling');
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] Cancelled all existing notifications');

    if (!prefs.masterEnabled) {
      console.log('[Notifications] Master toggle off — no notifications scheduled');
      return;
    }

    const blocks: {
      key: 'morning' | 'afternoon' | 'evening';
      enabled: boolean;
      time: string;
      titleFn: (count: number) => string;
      bodyFn: (count: number) => string;
    }[] = [
      {
        key: 'morning',
        enabled: prefs.morningEnabled,
        time: prefs.morningTime,
        titleFn: () => 'Good morning ☀️',
        bodyFn: (c) => `Time for your morning protocol (${c} supplement${c !== 1 ? 's' : ''})`,
      },
      {
        key: 'afternoon',
        enabled: prefs.afternoonEnabled,
        time: prefs.afternoonTime,
        titleFn: () => 'Afternoon check',
        bodyFn: (c) => `${c} supplement${c !== 1 ? 's' : ''} waiting for you`,
      },
      {
        key: 'evening',
        enabled: prefs.eveningEnabled,
        time: prefs.eveningTime,
        titleFn: () => 'Wind down 🌙',
        bodyFn: (c) => `Don't forget your evening protocol (${c} supplement${c !== 1 ? 's' : ''})`,
      },
    ];

    for (const block of blocks) {
      if (!block.enabled) {
        console.log(`[Notifications] ${block.key} disabled — skipping`);
        continue;
      }

      const protocolBlock = protocolBlocks.find((b) => b.timeBlock === block.key);
      if (!protocolBlock || protocolBlock.count === 0) {
        console.log(`[Notifications] No supplements in ${block.key} — skipping`);
        continue;
      }

      const { hour, minute } = parseTime(block.time);

      if (
        prefs.quietHoursEnabled &&
        isTimeInQuietHours(hour, minute, prefs.quietHoursStart, prefs.quietHoursEnd)
      ) {
        console.log(`[Notifications] ${block.key} falls in quiet hours — skipping`);
        continue;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: block.titleFn(protocolBlock.count),
          body: block.bodyFn(protocolBlock.count),
          data: { screen: 'protocol', timeBlock: block.key },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });

      console.log(`[Notifications] Scheduled ${block.key} at ${hour}:${String(minute).padStart(2, '0')}`);
    }
  } catch (e) {
    console.log('[Notifications] Scheduling error:', e);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] All notifications cancelled');
  } catch (e) {
    console.log('[Notifications] Cancel error:', e);
  }
}
