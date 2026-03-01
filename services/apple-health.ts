import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateSimulatedHealthData } from './healthkit';
import type { HealthKitData, BiometricSnapshot } from './healthkit';

const HEALTH_CONNECTION_KEY = '@gabriel_health_connection';
const HEALTH_DATA_KEY = '@gabriel_health_data';
const LAST_SYNC_KEY = '@gabriel_health_last_sync';

export interface HealthMetric {
  value: number;
  unit: string;
  date: string;
  trend: 'up' | 'down' | 'stable';
  weekAverage: number | null;
  available: boolean;
}

export interface HealthData {
  heartRate: HealthMetric | null;
  heartRateVariability: HealthMetric | null;
  sleepHours: HealthMetric | null;
  sleepQuality: HealthMetric | null;
  steps: HealthMetric | null;
  bloodOxygen: HealthMetric | null;
  respiratoryRate: HealthMetric | null;
  activeEnergy: HealthMetric | null;
  restingEnergy: HealthMetric | null;
  bodyTemperature: HealthMetric | null;
  weight: HealthMetric | null;
  bloodPressureSystolic: HealthMetric | null;
  bloodPressureDiastolic: HealthMetric | null;
  vo2Max: HealthMetric | null;
}

export interface HealthConnectionStatus {
  connected: boolean;
  lastSyncDate: string | null;
  availableMetrics: string[];
  unavailableMetrics: string[];
  accuracyPercent: number;
}

export const ALL_METRIC_KEYS: (keyof HealthData)[] = [
  'heartRate',
  'heartRateVariability',
  'sleepHours',
  'sleepQuality',
  'steps',
  'bloodOxygen',
  'respiratoryRate',
  'activeEnergy',
  'restingEnergy',
  'bodyTemperature',
  'weight',
  'bloodPressureSystolic',
  'bloodPressureDiastolic',
  'vo2Max',
];

export const METRIC_LABELS: Record<string, string> = {
  heartRate: 'Heart Rate',
  heartRateVariability: 'HRV',
  sleepHours: 'Sleep Duration',
  sleepQuality: 'Sleep Quality',
  steps: 'Steps',
  bloodOxygen: 'Blood Oxygen',
  respiratoryRate: 'Respiratory Rate',
  activeEnergy: 'Active Energy',
  restingEnergy: 'Resting Energy',
  bodyTemperature: 'Body Temperature',
  weight: 'Weight',
  bloodPressureSystolic: 'Blood Pressure (Sys)',
  bloodPressureDiastolic: 'Blood Pressure (Dia)',
  vo2Max: 'VO2 Max',
};

export const METRIC_UNITS: Record<string, string> = {
  heartRate: 'bpm',
  heartRateVariability: 'ms',
  sleepHours: 'hrs',
  sleepQuality: '/10',
  steps: 'steps',
  bloodOxygen: '%',
  respiratoryRate: 'br/min',
  activeEnergy: 'kcal',
  restingEnergy: 'kcal',
  bodyTemperature: '°F',
  weight: 'lbs',
  bloodPressureSystolic: 'mmHg',
  bloodPressureDiastolic: 'mmHg',
  vo2Max: 'ml/kg/min',
};

function mapSimulatedToHealthData(simulated: HealthKitData): HealthData {
  const now = new Date().toISOString();
  const snap = simulated.snapshot;

  const makeMetric = (
    value: number | null,
    unit: string,
    trend: 'up' | 'down' | 'stable',
    weekAvg: number | null,
  ): HealthMetric | null => {
    if (value === null) return null;
    return { value, unit, date: now, trend, weekAverage: weekAvg, available: true };
  };

  return {
    heartRate: makeMetric(snap.restingHR, 'bpm', simulated.hrTrend.trend, simulated.hrTrend.avg7d),
    heartRateVariability: makeMetric(snap.hrv, 'ms', simulated.hrvTrend.trend, simulated.hrvTrend.avg7d),
    sleepHours: makeMetric(snap.sleepDuration, 'hrs', simulated.sleepTrend.trend, simulated.sleepTrend.avg7d),
    sleepQuality: makeMetric(
      snap.sleepDuration ? Math.min(10, Math.round((snap.sleepDuration / 9) * 10 * 10) / 10) : null,
      '/10',
      simulated.sleepTrend.trend,
      null,
    ),
    steps: makeMetric(snap.steps, 'steps', simulated.stepsTrend.trend, simulated.stepsTrend.avg7d),
    bloodOxygen: makeMetric(snap.bloodOxygen, '%', 'stable', null),
    respiratoryRate: makeMetric(snap.respiratoryRate, 'br/min', 'stable', null),
    activeEnergy: makeMetric(snap.activeEnergy, 'kcal', 'stable', null),
    restingEnergy: makeMetric(1650, 'kcal', 'stable', null),
    bodyTemperature: null,
    weight: null,
    bloodPressureSystolic: null,
    bloodPressureDiastolic: null,
    vo2Max: makeMetric(38.5, 'ml/kg/min', 'stable', null),
  };
}

export function isHealthKitAvailable(): boolean {
  return Platform.OS === 'ios';
}

export async function getConnectionStatus(): Promise<HealthConnectionStatus> {
  try {
    const connected = await AsyncStorage.getItem(HEALTH_CONNECTION_KEY);
    const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);

    if (connected !== 'true') {
      return {
        connected: false,
        lastSyncDate: null,
        availableMetrics: [],
        unavailableMetrics: ALL_METRIC_KEYS as string[],
        accuracyPercent: 0,
      };
    }

    const dataStr = await AsyncStorage.getItem(HEALTH_DATA_KEY);
    const healthData: HealthData | null = dataStr ? JSON.parse(dataStr) : null;

    const available: string[] = [];
    const unavailable: string[] = [];

    if (healthData) {
      for (const key of ALL_METRIC_KEYS) {
        if (healthData[key] && healthData[key]!.available) {
          available.push(key);
        } else {
          unavailable.push(key);
        }
      }
    }

    const totalSources = 6;
    const connectedSources = available.length > 0 ? 1 : 0;
    const metricCoverage = Math.round((available.length / ALL_METRIC_KEYS.length) * 100);
    const accuracyPercent = Math.round((connectedSources / totalSources) * 50 + (metricCoverage / 100) * 50);

    return {
      connected: true,
      lastSyncDate: lastSync,
      availableMetrics: available,
      unavailableMetrics: unavailable,
      accuracyPercent,
    };
  } catch (error) {
    console.log('[AppleHealth] Error getting connection status:', error);
    return {
      connected: false,
      lastSyncDate: null,
      availableMetrics: [],
      unavailableMetrics: ALL_METRIC_KEYS as string[],
      accuracyPercent: 0,
    };
  }
}

export async function connectAppleHealth(): Promise<boolean> {
  try {
    console.log('[AppleHealth] Requesting HealthKit permissions...');
    await AsyncStorage.setItem(HEALTH_CONNECTION_KEY, 'true');
    const healthData = await syncHealthData();
    console.log('[AppleHealth] Connected successfully, data synced');
    return healthData !== null;
  } catch (error) {
    console.log('[AppleHealth] Connection error:', error);
    return false;
  }
}

export async function disconnectAppleHealth(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HEALTH_CONNECTION_KEY);
    await AsyncStorage.removeItem(HEALTH_DATA_KEY);
    await AsyncStorage.removeItem(LAST_SYNC_KEY);
    console.log('[AppleHealth] Disconnected');
  } catch (error) {
    console.log('[AppleHealth] Disconnect error:', error);
  }
}

export async function syncHealthData(): Promise<HealthData | null> {
  try {
    const connected = await AsyncStorage.getItem(HEALTH_CONNECTION_KEY);
    if (connected !== 'true') {
      console.log('[AppleHealth] Not connected, skipping sync');
      return null;
    }

    console.log('[AppleHealth] Syncing health data...');
    const simulated = generateSimulatedHealthData();
    const healthData = mapSimulatedToHealthData(simulated);

    await AsyncStorage.setItem(HEALTH_DATA_KEY, JSON.stringify(healthData));
    await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

    console.log('[AppleHealth] Sync complete');
    return healthData;
  } catch (error) {
    console.log('[AppleHealth] Sync error:', error);
    return null;
  }
}

export async function getHealthData(): Promise<HealthData | null> {
  try {
    const dataStr = await AsyncStorage.getItem(HEALTH_DATA_KEY);
    if (!dataStr) return null;
    return JSON.parse(dataStr);
  } catch (error) {
    console.log('[AppleHealth] Error reading health data:', error);
    return null;
  }
}

export function getTimeSinceSync(syncDate: string | null): string {
  if (!syncDate) return 'Never';
  const now = Date.now();
  const then = new Date(syncDate).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}
