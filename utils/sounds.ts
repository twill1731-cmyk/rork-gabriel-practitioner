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

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function generateWav(frequency: number, duration: number, volume: number = 0.5, decay: number = 10): string {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * duration);
  const fileSize = 44 + numSamples;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * decay);
    const sample = Math.sin(2 * Math.PI * frequency * t) * volume * envelope;
    view.setUint8(44 + i, Math.floor(128 + sample * 127));
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

const wavCache: Record<string, string> = {};

function getWav(key: string, freq: number, dur: number, vol: number, decay: number): string {
  if (!wavCache[key]) {
    wavCache[key] = generateWav(freq, dur, vol, decay);
  }
  return wavCache[key];
}

async function playNativeTone(key: string, freq: number, dur: number, vol: number, decay: number): Promise<void> {
  try {
    const { createAudioPlayer } = require('expo-audio');
    const wav = getWav(key, freq, dur, vol, decay);
    const player = createAudioPlayer({ uri: wav });
    player.play();
    setTimeout(() => {
      try { player.remove(); } catch {}
    }, Math.max(dur * 1000 + 1000, 1500));
  } catch (e) {
    console.log('[Sounds] Native play error:', e);
  }
}

export async function playMessageSent(): Promise<void> {
  if (!(await loadPreference())) return;
  console.log('[Sounds] Playing message sent');
  if (Platform.OS === 'web') {
    playToneWeb(1200, 0.1, 0.12);
  } else {
    await playNativeTone('msgSent', 1200, 0.1, 0.4, 15);
  }
}

export async function playCheckbox(): Promise<void> {
  if (!(await loadPreference())) return;
  console.log('[Sounds] Playing checkbox');
  if (Platform.OS === 'web') {
    playToneWeb(1400, 0.06, 0.1);
  } else {
    await playNativeTone('checkbox', 1400, 0.06, 0.3, 20);
  }
}

export async function playUploadComplete(): Promise<void> {
  if (!(await loadPreference())) return;
  console.log('[Sounds] Playing upload complete');
  if (Platform.OS === 'web') {
    playToneWeb(880, 0.3, 0.15);
  } else {
    await playNativeTone('upload', 880, 0.3, 0.5, 6);
  }
}

export async function playCelebration(): Promise<void> {
  if (!(await loadPreference())) return;
  console.log('[Sounds] Playing celebration');
  if (Platform.OS === 'web') {
    playToneWeb(660, 0.15, 0.1);
    setTimeout(() => playToneWeb(880, 0.15, 0.12), 120);
    setTimeout(() => playToneWeb(1100, 0.2, 0.14), 240);
  } else {
    await playNativeTone('celebration', 880, 0.35, 0.5, 4);
  }
}
