import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { setHapticEnabledCache } from '../utils/haptics';
import { setSoundEnabled as setSoundEnabledCache } from '../utils/sounds';

export interface AppSettings {
  dailyCheckInReminder: boolean;
  labInterpretationUpdates: boolean;
  protocolReminders: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
}

export interface NotificationPrefs {
  masterEnabled: boolean;
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  masterEnabled: false,
};

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
    setHapticEnabledCache(settings.hapticFeedback);
    setSoundEnabledCache(settings.soundEffects);
  }, [settings.hapticFeedback, settings.soundEffects]);

  const updateNotificationPrefs = useCallback(async (
    updates: Partial<NotificationPrefs>,
  ) => {
    const updated = { ...notificationPrefs, ...updates };
    setNotificationPrefs(updated);
    console.log('[Settings] Notification prefs updated:', updates);
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
  }, [settings, saveSettingsMutation.mutate]);

  return {
    settings,
    updateSettings,
    notificationPrefs,
    updateNotificationPrefs,
    isLoading: settingsQuery.isLoading,
  };
});
