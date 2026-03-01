export interface CoherenceReading {
  id: string;
  date: string;
  source: CoherenceSource;
  coherenceScore: number;
  hrvMs: number | null;
  notes: string;
  practitionerId: string | null;
}

export type CoherenceSource =
  | 'heartmath'
  | 'biowell'
  | 'practitioner'
  | 'apple-health'
  | 'manual';

export type CoherenceLevel =
  | 'scattered'
  | 'settling'
  | 'coherent'
  | 'elevated'
  | 'transcendent';

export interface CoherenceInsight {
  title: string;
  body: string;
  category: 'interpretation' | 'recommendation' | 'connection';
}

export interface CoherenceProfile {
  totalReadings: number;
  averageCoherence: number;
  bestStreak: number;
  currentStreak: number;
  readings: CoherenceReading[];
}

export function getCoherenceLevel(score: number): CoherenceLevel {
  if (score >= 91) return 'transcendent';
  if (score >= 76) return 'elevated';
  if (score >= 51) return 'coherent';
  if (score >= 26) return 'settling';
  return 'scattered';
}

export function getCoherenceLevelColor(level: CoherenceLevel): string {
  switch (level) {
    case 'transcendent': return '#D4AF37';
    case 'elevated': return '#4FD1C5';
    case 'coherent': return '#7C6FD4';
    case 'settling': return '#C5A572';
    case 'scattered': return '#e87b6b';
  }
}

export function getCoherenceLevelLabel(level: CoherenceLevel): string {
  switch (level) {
    case 'transcendent': return 'Transcendent';
    case 'elevated': return 'Elevated';
    case 'coherent': return 'Coherent';
    case 'settling': return 'Settling';
    case 'scattered': return 'Scattered';
  }
}

export function getCoherenceScoreColor(score: number): string {
  if (score >= 91) return '#D4AF37';
  if (score >= 76) return '#4FD1C5';
  if (score >= 51) return '#7C6FD4';
  if (score >= 26) return '#C5A572';
  return '#e87b6b';
}

export const SOURCE_LABELS: Record<CoherenceSource, { label: string; icon: string }> = {
  heartmath: { label: 'HeartMath', icon: '💖' },
  biowell: { label: 'Bio-Well', icon: '🔮' },
  practitioner: { label: 'Practitioner', icon: '🩺' },
  'apple-health': { label: 'Apple Health', icon: '⌚' },
  manual: { label: 'Manual Entry', icon: '✏️' },
};

export function getGabrielInsights(score: number, readings: CoherenceReading[]): CoherenceInsight[] {
  const level = getCoherenceLevel(score);
  const insights: CoherenceInsight[] = [];

  if (level === 'transcendent') {
    insights.push({
      title: 'Exceptional Coherence',
      body: 'Your heart and brain are in deep synchronization. This state is associated with enhanced intuition, accelerated healing, and elevated gene expression. Research shows sustained coherence at this level can measurably reduce inflammatory markers.',
      category: 'interpretation',
    });
  } else if (level === 'elevated') {
    insights.push({
      title: 'Strong Coherence',
      body: 'Your heart rhythm patterns show organized, sine-wave-like oscillations. This indicates your autonomic nervous system is balanced and your body is in a regenerative state rather than survival mode.',
      category: 'interpretation',
    });
  } else if (level === 'coherent') {
    insights.push({
      title: 'Building Coherence',
      body: 'Your heart-brain communication is functional but has room to deepen. The heart generates an electromagnetic field 5,000 times stronger than the brain — as coherence improves, this field becomes more organized and influential.',
      category: 'interpretation',
    });
  } else if (level === 'settling') {
    insights.push({
      title: 'Developing Coherence',
      body: 'Your readings suggest your nervous system spends significant time in sympathetic (stress) dominance. Heart-brain coherence practices can help shift toward parasympathetic balance, where healing and regeneration occur.',
      category: 'interpretation',
    });
  } else {
    insights.push({
      title: 'Low Coherence Detected',
      body: 'Your heart rhythm patterns are irregular, suggesting stress-driven autonomic activity. This is common and reversible. Chronic incoherence is linked to elevated cortisol, reduced immune function, and impaired cognitive performance.',
      category: 'interpretation',
    });
  }

  if (readings.length >= 3) {
    const recent = readings.slice(0, 3).map(r => r.coherenceScore);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const older = readings.slice(-3).map(r => r.coherenceScore);
    const oldAvg = older.reduce((a, b) => a + b, 0) / older.length;
    if (avg > oldAvg + 5) {
      insights.push({
        title: 'Upward Trend',
        body: `Your coherence has improved ${Math.round(avg - oldAvg)} points on average compared to earlier readings. Whatever you're doing is working.`,
        category: 'interpretation',
      });
    }
  }

  insights.push({
    title: 'Deepen Your Understanding',
    body: 'For the most accurate coherence measurements, work with a certified HeartMath or Bio-Well practitioner who can provide clinical-grade readings and personalized protocols.',
    category: 'recommendation',
  });

  return insights;
}

export const GABRIEL_WISDOM: string[] = [
  "The heart generates an electromagnetic field 5,000 times stronger than the brain.",
  "HeartMath research shows coherence practice can reduce cortisol by 23%.",
  "In coherence, the heart sends more information to the brain than the brain sends to the heart.",
  "Your emotional state literally changes your DNA expression.",
];

export const DEMO_READINGS: CoherenceReading[] = [
  { id: '1', date: '2026-02-25', source: 'heartmath', coherenceScore: 72, hrvMs: 68, notes: 'Morning reading, felt focused', practitionerId: null },
  { id: '2', date: '2026-02-22', source: 'practitioner', coherenceScore: 81, hrvMs: 74, notes: 'Session with Dr. Chen, post-treatment reading', practitionerId: 'dr-chen' },
  { id: '3', date: '2026-02-18', source: 'heartmath', coherenceScore: 58, hrvMs: 52, notes: 'Evening, stressful day', practitionerId: null },
  { id: '4', date: '2026-02-14', source: 'biowell', coherenceScore: 65, hrvMs: null, notes: 'Bio-Well full scan at wellness center', practitionerId: null },
  { id: '5', date: '2026-02-10', source: 'apple-health', coherenceScore: 45, hrvMs: 42, notes: 'Derived from Apple Watch HRV', practitionerId: null },
];

export const DEMO_COHERENCE_PROFILE: CoherenceProfile = {
  totalReadings: 5,
  averageCoherence: 64,
  bestStreak: 4,
  currentStreak: 2,
  readings: DEMO_READINGS,
};
