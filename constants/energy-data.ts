export interface EnergyReading {
  timestamp: string; // ISO
  level: number; // 1-10
  source: 'auto' | 'manual' | 'apple-health';
  context?: string; // "post-workout", "afternoon-dip", "morning-peak"
}

export interface EnergyForecast {
  date: string;
  sleepHours: number;
  sleepQuality: number; // 1-10
  restingHR: number;
  hrv: number;
  peakWindow: { start: string; end: string }; // "10:00 AM" - "11:30 AM"
  dipWindow: { start: string; end: string }; // "2:00 PM" - "3:00 PM"
  secondWind: { start: string; end: string } | null;
  overallScore: number; // 1-10
  recommendation: string;
}

export interface EnergyPattern {
  dayOfWeek: string;
  avgPeakTime: string;
  avgDipTime: string;
  avgScore: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface FlowSession {
  startTime: string;
  endTime: string | null;
  duration: number; // minutes
  activity: string; // "Deep Work", "Creative", "Exercise"
  energyBefore: number;
  energyAfter: number | null;
}

// Demo data
export const DEMO_FORECAST: EnergyForecast = {
  date: new Date().toISOString(),
  sleepHours: 7.2,
  sleepQuality: 7,
  restingHR: 62,
  hrv: 48,
  peakWindow: { start: '10:00 AM', end: '11:30 AM' },
  dipWindow: { start: '2:00 PM', end: '3:00 PM' },
  secondWind: { start: '4:30 PM', end: '6:00 PM' },
  overallScore: 7.4,
  recommendation:
    'Good energy day. Block your hardest work between 10-11:30 AM. Expect a dip around 2 PM — use that for light tasks or a walk. Second wind likely around 4:30 PM.',
};

export const DEMO_READINGS: EnergyReading[] = [
  { timestamp: '2026-02-27T08:00:00Z', level: 6, source: 'auto', context: 'morning' },
  { timestamp: '2026-02-27T10:30:00Z', level: 9, source: 'auto', context: 'morning-peak' },
  { timestamp: '2026-02-27T12:00:00Z', level: 7, source: 'manual', context: 'post-lunch' },
  { timestamp: '2026-02-27T14:30:00Z', level: 4, source: 'auto', context: 'afternoon-dip' },
  { timestamp: '2026-02-27T16:00:00Z', level: 7, source: 'auto', context: 'second-wind' },
  { timestamp: '2026-02-27T19:00:00Z', level: 5, source: 'auto', context: 'evening-wind-down' },
];

export const DEMO_PATTERNS: EnergyPattern[] = [
  { dayOfWeek: 'Mon', avgPeakTime: '10:15 AM', avgDipTime: '2:30 PM', avgScore: 7.1, trend: 'stable' },
  { dayOfWeek: 'Tue', avgPeakTime: '10:00 AM', avgDipTime: '2:00 PM', avgScore: 7.5, trend: 'improving' },
  { dayOfWeek: 'Wed', avgPeakTime: '10:30 AM', avgDipTime: '2:45 PM', avgScore: 6.8, trend: 'stable' },
  { dayOfWeek: 'Thu', avgPeakTime: '9:45 AM', avgDipTime: '2:15 PM', avgScore: 7.2, trend: 'improving' },
  { dayOfWeek: 'Fri', avgPeakTime: '10:00 AM', avgDipTime: '3:00 PM', avgScore: 6.5, trend: 'declining' },
  { dayOfWeek: 'Sat', avgPeakTime: '11:00 AM', avgDipTime: '3:30 PM', avgScore: 7.8, trend: 'stable' },
  { dayOfWeek: 'Sun', avgPeakTime: '11:30 AM', avgDipTime: '3:00 PM', avgScore: 8.0, trend: 'improving' },
];

export const DEMO_FLOW_SESSIONS: FlowSession[] = [
  {
    startTime: '2026-02-27T10:00:00Z',
    endTime: '2026-02-27T11:45:00Z',
    duration: 105,
    activity: 'Deep Work',
    energyBefore: 8,
    energyAfter: 6,
  },
  {
    startTime: '2026-02-27T14:30:00Z',
    endTime: '2026-02-27T15:15:00Z',
    duration: 45,
    activity: 'Creative',
    energyBefore: 5,
    energyAfter: 4,
  },
];

export const ENERGY_COLORS = {
  high: '#4FD1C5', // teal — high energy (7-10)
  medium: '#B8A088', // gold — moderate (4-6)
  low: '#e87b6b', // red — low energy (1-3)
};

export function getEnergyColor(level: number): string {
  if (level >= 7) return ENERGY_COLORS.high;
  if (level >= 4) return ENERGY_COLORS.medium;
  return ENERGY_COLORS.low;
}

export function getEnergyLabel(level: number): string {
  if (level >= 9) return 'Peak';
  if (level >= 7) return 'High';
  if (level >= 5) return 'Moderate';
  if (level >= 3) return 'Low';
  return 'Depleted';
}
