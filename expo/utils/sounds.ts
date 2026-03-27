import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_PREF_KEY = 'gabriel_sound_enabled';
let cachedEnabled: boolean | null = null;

async function loadPreference(): Promise<boolean> {
  if (cachedEnabled !== null) return cachedEnabled;
  try {
    const val = await AsyncStorage.getItem(SOUND_PREF_KEY);
    cachedEnabled = val !== 'false';
  } catch {
    cachedEnabled = true;
  }
  return cachedEnabled;
}

loadPreference();

export async function setSoundEnabled(enabled: boolean): Promise<void> {
  cachedEnabled = enabled;
  try {
    await AsyncStorage.setItem(SOUND_PREF_KEY, String(enabled));
    console.log('[Sounds] Preference saved:', enabled);
  } catch (e) {
    console.log('[Sounds] Failed to save preference:', e);
  }
}

export async function getSoundEnabled(): Promise<boolean> {
  return loadPreference();
}

function playToneWeb(frequency: number, duration: number, volume: number = 0.12): void {
  try {
    const AC = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
    setTimeout(() => {
      try { ctx.close(); } catch {}
    }, (duration + 0.5) * 1000);
  } catch (e) {
    console.log('[Sounds] Web tone error:', e);
  }
}

export async function playMessageSent(): Promise<void> {
  if (!(await loadPreference())) return;
  console.log('[Sounds] Playing message sent');
  if (Platform.OS === 'web') {
    playToneWeb(1200, 0.1, 0.12);
  }
}

export async function playCheckbox(): Promise<void> {
  if (!(await loadPreference())) return;
  console.log('[Sounds] Playing checkbox');
  if (Platform.OS === 'web') {
    playToneWeb(1400, 0.06, 0.1);
  }
}

export async function playUploadComplete(): Promise<void> {
  if (!(await loadPreference())) return;
  console.log('[Sounds] Playing upload complete');
  if (Platform.OS === 'web') {
    playToneWeb(880, 0.3, 0.15);
  }
}

export async function playCelebration(): Promise<void> {
  if (!(await loadPreference())) return;
  console.log('[Sounds] Playing celebration');
  if (Platform.OS === 'web') {
    playToneWeb(660, 0.15, 0.1);
    setTimeout(() => playToneWeb(880, 0.15, 0.12), 120);
    setTimeout(() => playToneWeb(1100, 0.2, 0.14), 240);
  }
}
