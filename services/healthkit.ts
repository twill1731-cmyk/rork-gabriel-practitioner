import { Platform } from 'react-native';

export interface BiometricSample {
  value: number;
  date: string;
  timestamp: number;
}

export interface DailySleepData {
  duration: number;
  date: string;
  timestamp: number;
}

export interface BiometricSnapshot {
  sleepDuration: number | null;
  restingHR: number | null;
  hrv: number | null;
  steps: number | null;
  activeEnergy: number | null;
  bloodOxygen: number | null;
  respiratoryRate: number | null;
}

export interface BiometricTrend {
  metric: string;
  key: string;
  unit: string;
  values: number[];
  dates: string[];
  current: number;
  avg7d: number;
  avg30d: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
}

export interface HealthKitData {
  snapshot: BiometricSnapshot;
  sleepTrend: BiometricTrend;
  hrTrend: BiometricTrend;
  hrvTrend: BiometricTrend;
  stepsTrend: BiometricTrend;
  lastSynced: number;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateDailyValues(
  baseLine: number,
  variance: number,
  days: number,
  improveTrend: boolean = false
): { values: number[]; dates: string[] } {
  const values: number[] = [];
  const dates: string[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dates.push(dateStr);

    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    const rand = seededRandom(seed);
    const trendBoost = improveTrend ? (days - i) * (variance * 0.02) : 0;
    const val = baseLine + (rand - 0.5) * variance * 2 + trendBoost;
    values.push(Math.round(val * 10) / 10);
  }

  return { values, dates };
}

function computeTrendFromValues(values: number[]): { trend: 'up' | 'down' | 'stable'; percent: number } {
  if (values.length < 4) return { trend: 'stable', percent: 0 };
  const recent = values.slice(-3);
  const older = values.slice(-7, -3);
  if (older.length === 0) return { trend: 'stable', percent: 0 };
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  const diff = recentAvg - olderAvg;
  const percent = olderAvg !== 0 ? Math.round((diff / olderAvg) * 100) : 0;
  if (Math.abs(percent) < 3) return { trend: 'stable', percent: 0 };
  return { trend: diff > 0 ? 'up' : 'down', percent: Math.abs(percent) };
}

function buildTrend(
  metric: string,
  key: string,
  unit: string,
  baseLine: number,
  variance: number,
  days: number = 30,
  improveTrend: boolean = false
): BiometricTrend {
  const { values, dates } = generateDailyValues(baseLine, variance, days, improveTrend);
  const current = values[values.length - 1];
  const last7 = values.slice(-7);
  const avg7d = Math.round((last7.reduce((a, b) => a + b, 0) / last7.length) * 10) / 10;
  const avg30d = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  const { trend, percent } = computeTrendFromValues(values);

  return { metric, key, unit, values, dates, current, avg7d, avg30d, trend, trendPercent: percent };
}

export function generateSimulatedHealthData(): HealthKitData {
  const sleepTrend = buildTrend('Sleep', 'sleep', 'hrs', 6.8, 1.2, 30, true);
  const hrTrend = buildTrend('Resting HR', 'restingHR', 'bpm', 62, 6, 30, false);
  const hrvTrend = buildTrend('HRV', 'hrv', 'ms', 42, 12, 30, true);
  const stepsTrend = buildTrend('Steps', 'steps', '', 7200, 3000, 30, false);

  const snapshot: BiometricSnapshot = {
    sleepDuration: sleepTrend.current,
    restingHR: Math.round(hrTrend.current),
    hrv: Math.round(hrvTrend.current),
    steps: Math.round(stepsTrend.current),
    activeEnergy: Math.round(280 + seededRandom(Date.now()) * 200),
    bloodOxygen: Math.round(96 + seededRandom(Date.now() + 1) * 3),
    respiratoryRate: Math.round((14 + seededRandom(Date.now() + 2) * 4) * 10) / 10,
  };

  return {
    snapshot,
    sleepTrend,
    hrTrend,
    hrvTrend,
    stepsTrend,
    lastSynced: Date.now(),
  };
}

export function isHealthKitAvailable(): boolean {
  return Platform.OS === 'ios';
}

export function getHealthInsightForAI(data: HealthKitData | null): string {
  if (!data) return '';

  const insights: string[] = [];
  const { snapshot, sleepTrend, hrvTrend, hrTrend, stepsTrend } = data;

  if (snapshot.sleepDuration !== null) {
    if (snapshot.sleepDuration < 6.5) {
      insights.push(`You averaged ${sleepTrend.avg7d} hours of sleep this week — that's below the recommended 7-9 hours. Let's work on improving that.`);
    } else if (snapshot.sleepDuration >= 7.5) {
      insights.push(`Great sleep last night — ${snapshot.sleepDuration} hours. Your 7-day average is ${sleepTrend.avg7d} hours.`);
    } else {
      insights.push(`You got ${snapshot.sleepDuration} hours of sleep last night. Your weekly average is ${sleepTrend.avg7d} hours.`);
    }
  }

  if (hrvTrend.trend === 'up' && hrvTrend.trendPercent > 5) {
    insights.push(`Your HRV has improved ${hrvTrend.trendPercent}% this week (${hrvTrend.avg7d}ms avg) — a sign your nervous system is recovering well.`);
  } else if (hrvTrend.trend === 'down' && hrvTrend.trendPercent > 5) {
    insights.push(`Your HRV has dropped ${hrvTrend.trendPercent}% this week (${hrvTrend.avg7d}ms avg) — this can indicate stress or under-recovery.`);
  }

  if (snapshot.restingHR !== null && hrTrend.avg7d > 72) {
    insights.push(`Your resting heart rate is averaging ${hrTrend.avg7d} bpm — higher than ideal. Magnesium and stress management can help bring this down.`);
  }

  if (snapshot.steps !== null && stepsTrend.avg7d < 5000) {
    insights.push(`You're averaging ${Math.round(stepsTrend.avg7d)} steps/day this week — increasing movement to 7,000+ steps has significant metabolic benefits.`);
  }

  if (insights.length === 0) return '';

  return '\n\n⌚ From Your Wearable Data:\n' + insights.map(i => `• ${i}`).join('\n');
}

export function formatSleepDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getMetricColor(key: string, value: number): string {
  switch (key) {
    case 'sleep':
      if (value >= 7.5) return '#4FD1C5';
      if (value >= 6.5) return '#B8A088';
      return '#E85D5D';
    case 'restingHR':
      if (value <= 60) return '#4FD1C5';
      if (value <= 72) return '#B8A088';
      return '#E85D5D';
    case 'hrv':
      if (value >= 50) return '#4FD1C5';
      if (value >= 30) return '#B8A088';
      return '#E85D5D';
    case 'steps':
      if (value >= 8000) return '#4FD1C5';
      if (value >= 5000) return '#B8A088';
      return '#E85D5D';
    default:
      return '#4FD1C5';
  }
}
