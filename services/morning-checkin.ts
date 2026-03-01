import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MorningCheckIn {
  date: string; // YYYY-MM-DD
  sleepQuality: number; // 1-10
  energy: number; // 1-10
  mood: number; // 1-10
  notes?: string;
  timestamp: number;
}

const STORAGE_KEY_PREFIX = 'morning_checkin_';

export async function saveMorningCheckIn(data: MorningCheckIn): Promise<void> {
  try {
    const key = `${STORAGE_KEY_PREFIX}${data.date}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('[MorningCheckIn] Failed to save:', error);
    throw error;
  }
}

export async function getMorningCheckIn(date: string): Promise<MorningCheckIn | null> {
  try {
    const key = `${STORAGE_KEY_PREFIX}${date}`;
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as MorningCheckIn;
  } catch (error) {
    console.error('[MorningCheckIn] Failed to get:', error);
    return null;
  }
}

export async function getRecentCheckIns(days: number): Promise<MorningCheckIn[]> {
  try {
    const results: MorningCheckIn[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const checkIn = await getMorningCheckIn(dateStr);
      if (checkIn) {
        results.push(checkIn);
      }
    }
    
    return results.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('[MorningCheckIn] Failed to get recent:', error);
    return [];
  }
}

export async function hasCheckedInToday(): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const checkIn = await getMorningCheckIn(today);
    return checkIn !== null;
  } catch (error) {
    console.error('[MorningCheckIn] Failed to check today:', error);
    return false;
  }
}
