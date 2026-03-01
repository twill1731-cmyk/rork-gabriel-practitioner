export type TreatmentType =
  | 'iv-therapy'
  | 'acupuncture'
  | 'chiropractic'
  | 'massage'
  | 'float-therapy'
  | 'cryotherapy'
  | 'biowell-scan'
  | 'heartmath-session'
  | 'nrt'
  | 'supplement-start'
  | 'blood-panel'
  | 'other';

export interface Treatment {
  id: string;
  type: TreatmentType;
  name: string; // "High-Dose Vitamin C IV"
  location: string; // "Next Health, Studio City"
  date: string; // ISO date
  notes: string;
  checkIn: TreatmentCheckIn | null;
  biometricDelta: BiometricDelta | null;
}

export interface TreatmentCheckIn {
  completedAt: string;
  mood: number; // 1-10
  energy: number; // 1-10
  pain: number; // 1-10 (10 = no pain)
  notes: string;
}

export interface BiometricDelta {
  // Pre vs post treatment (24h windows)
  heartRate: { before: number; after: number; delta: number } | null;
  hrv: { before: number; after: number; delta: number } | null;
  sleepHours: { before: number; after: number; delta: number } | null;
  steps: { before: number; after: number; delta: number } | null;
  bloodOxygen: { before: number; after: number; delta: number } | null;
}

export const TREATMENT_TYPES: { type: TreatmentType; label: string; icon: string; color: string }[] = [
  { type: 'iv-therapy', label: 'IV Therapy', icon: '💉', color: '#4FD1C5' },
  { type: 'acupuncture', label: 'Acupuncture', icon: '📍', color: '#7C6FD4' },
  { type: 'chiropractic', label: 'Chiropractic', icon: '🦴', color: '#B8A088' },
  { type: 'massage', label: 'Massage', icon: '💆', color: '#C5A572' },
  { type: 'float-therapy', label: 'Float Therapy', icon: '🌊', color: '#3498DB' },
  { type: 'cryotherapy', label: 'Cryotherapy', icon: '❄️', color: '#85C1E9' },
  { type: 'biowell-scan', label: 'Bio-Well Scan', icon: '🔮', color: '#9B59B6' },
  { type: 'heartmath-session', label: 'HeartMath Session', icon: '💚', color: '#2ECC71' },
  { type: 'nrt', label: 'NRT Session', icon: '🤲', color: '#E67E22' },
  { type: 'supplement-start', label: 'New Supplement', icon: '💊', color: '#4FD1C5' },
  { type: 'blood-panel', label: 'Blood Panel', icon: '🔬', color: '#E74C3C' },
  { type: 'other', label: 'Other', icon: '✨', color: '#a89d8c' },
];

// Demo data
export const DEMO_TREATMENTS: Treatment[] = [
  {
    id: '1',
    type: 'iv-therapy',
    name: 'High-Dose Vitamin C IV',
    location: 'Next Health, Studio City',
    date: '2026-02-26T14:00:00Z',
    notes: '25g Vitamin C drip, 45 min session',
    checkIn: {
      completedAt: '2026-02-26T17:00:00Z',
      mood: 8,
      energy: 9,
      pain: 9,
      notes: 'Feeling great, very energized',
    },
    biometricDelta: {
      heartRate: { before: 72, after: 68, delta: -4 },
      hrv: { before: 42, after: 51, delta: 9 },
      sleepHours: { before: 6.8, after: 7.9, delta: 1.1 },
      steps: null,
      bloodOxygen: { before: 97, after: 99, delta: 2 },
    },
  },
  {
    id: '2',
    type: 'acupuncture',
    name: 'Acupuncture — Stress & Sleep',
    location: 'Dr. Chen Wellness, Beverly Hills',
    date: '2026-02-22T10:00:00Z',
    notes: 'Focus on liver and kidney meridians',
    checkIn: {
      completedAt: '2026-02-22T13:00:00Z',
      mood: 7,
      energy: 6,
      pain: 8,
      notes: 'Relaxed but a bit drowsy',
    },
    biometricDelta: {
      heartRate: { before: 74, after: 70, delta: -4 },
      hrv: { before: 38, after: 46, delta: 8 },
      sleepHours: { before: 6.2, after: 8.1, delta: 1.9 },
      steps: null,
      bloodOxygen: null,
    },
  },
];

export function getInsightForTreatment(treatment: Treatment): string | null {
  if (!treatment.biometricDelta) return null;

  if (treatment.id === '1') {
    return "Your Vitamin C IV at Next Health showed measurable improvements: heart rate dropped 4 bpm and HRV improved 21%. Sleep quality increased by 16% the following night. This is a strong positive response.";
  }

  if (treatment.id === '2') {
    return "Acupuncture session showed excellent results: HRV increased 21% and sleep duration improved by 31%. Your body responded very well to meridian-based stress release.";
  }

  // Generic insight for other treatments
  const { heartRate, hrv, sleepHours } = treatment.biometricDelta;
  const improvements: string[] = [];
  
  if (heartRate && heartRate.delta < 0) {
    improvements.push(`heart rate decreased by ${Math.abs(heartRate.delta)} bpm`);
  }
  if (hrv && hrv.delta > 0) {
    improvements.push(`HRV improved by ${hrv.delta} ms`);
  }
  if (sleepHours && sleepHours.delta > 0) {
    improvements.push(`sleep increased by ${sleepHours.delta.toFixed(1)} hours`);
  }

  if (improvements.length === 0) return null;

  return `Your ${treatment.name} showed positive changes: ${improvements.join(', ')}. Your body is responding well to this intervention.`;
}
