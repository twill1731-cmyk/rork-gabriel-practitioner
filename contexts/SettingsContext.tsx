import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { setHapticEnabledCache } from '../utils/haptics';
import { setSoundEnabled as setSoundEnabledCache } from '../utils/sounds';
import type { NotificationPrefs } from '../services/notifications';
import { DEFAULT_NOTIFICATION_PREFS, loadNotificationPrefs, saveNotificationPrefs, scheduleProtocolReminders, requestNotificationPermissions } from '../services/notifications';

export interface AppSettings {
  dailyCheckInReminder: boolean;
  labInterpretationUpdates: boolean;
  protocolReminders: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
}

export type { NotificationPrefs };

const DEFAULT_SETTINGS: AppSettings = {
  dailyCheckInReminder: false,
  labInterpretationUpdates: true,
  protocolReminders: true,
  soundEffects: true,
  hapticFeedback: true,
};

const SETTINGS_KEY = 'gabriel_app_settings';

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);

  const settingsQuery = useQuery({
    queryKey: ['gabriel_app_settings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...(JSON.parse(stored) as Partial<AppSettings>) } : DEFAULT_SETTINGS;
    },
  });

  const notifPrefsQuery = useQuery({
    queryKey: ['gabriel_notification_prefs'],
    queryFn: loadNotificationPrefs,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (updated: AppSettings) => {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gabriel_app_settings'] });
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setSettings(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    if (notifPrefsQuery.data) {
      setNotificationPrefs(notifPrefsQuery.data);
    }
  }, [notifPrefsQuery.data]);

  useEffect(() => {
    setHapticEnabledCache(settings.hapticFeedback);
    setSoundEnabledCache(settings.soundEffects);
  }, [settings.hapticFeedback, settings.soundEffects]);

  const updateNotificationPrefs = useCallback(async (
    updates: Partial<NotificationPrefs>,
    protocolBlocks?: { timeBlock: 'morning' | 'afternoon' | 'evening'; count: number }[]
  ) => {
    const updated = { ...notificationPrefs, ...updates };
    setNotificationPrefs(updated);
    await saveNotificationPrefs(updated);
    queryClient.invalidateQueries({ queryKey: ['gabriel_notification_prefs'] });
    if (protocolBlocks) {
      await scheduleProtocolReminders(updated, protocolBlocks);
    }
    console.log('[Settings] Notification prefs updated:', updates);
  }, [notificationPrefs, queryClient]);

  const requestNotifPermissions = useCallback(async (): Promise<boolean> => {
    const granted = await requestNotificationPermissions();
    console.log('[Settings] Notification permissions granted:', granted);
    return granted;
  }, []);

  const rescheduleNotifications = useCallback(async (
    protocolBlocks: { timeBlock: 'morning' | 'afternoon' | 'evening'; count: number }[]
  ) => {
    await scheduleProtocolReminders(notificationPrefs, protocolBlocks);
  }, [notificationPrefs]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    saveSettingsMutation.mutate(updated);
    if (updates.hapticFeedback !== undefined) {
      setHapticEnabledCache(updates.hapticFeedback);
    }
    if (updates.soundEffects !== undefined) {
      setSoundEnabledCache(updates.soundEffects);
    }
    console.log('[Settings] Updated:', updates);
  }, [settings, saveSettingsMutation]);

  return {
    settings,
    updateSettings,
    notificationPrefs,
    updateNotificationPrefs,
    requestNotifPermissions,
    rescheduleNotifications,
    isLoading: settingsQuery.isLoading,
  };
});
