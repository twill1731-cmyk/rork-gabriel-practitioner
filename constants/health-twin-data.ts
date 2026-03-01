export type OrganTrend = 'improving' | 'stable' | 'declining';
export type DataConfidence = 'high' | 'medium' | 'low' | 'unlit';

export interface OrganData {
  id: string;
  name: string;
  system: string;
  score: number;
  trend: OrganTrend;
  confidence: DataConfidence;
  note: string;
  position: { x: number; y: number };
  dataSources: string[];
}

export const ORGAN_DATA: OrganData[] = [
  // ── Head / Nervous System ── (brain, center of head)
  {
    id: 'nervous-system',
    name: 'Nervous System',
    system: 'Neurological',
    score: 6.8,
    trend: 'improving',
    confidence: 'medium',
    note: 'Mental clarity is good. Sleep quality trending up. HRV suggests improving stress resilience.',
    position: { x: 48, y: 4 },
    dataSources: ['check-ins', 'wearable'],
  },
  // ── Throat ── (thyroid sits at base of neck, ~y:12)
  {
    id: 'thyroid',
    name: 'Thyroid',
    system: 'Endocrine',
    score: 5.4,
    trend: 'improving',
    confidence: 'medium',
    note: 'Thyroid function is moderate but improving with current selenium and iodine protocol.',
    position: { x: 48, y: 12 },
    dataSources: ['labs', 'protocol'],
  },
  // ── Chest ── (heart is left-center chest, ~y:21)
  {
    id: 'heart',
    name: 'Heart',
    system: 'Cardiovascular',
    score: 7.8,
    trend: 'stable',
    confidence: 'high',
    note: 'Cardiovascular markers are in optimal range. Resting HR and HRV both healthy.',
    position: { x: 53, y: 21 },
    dataSources: ['labs', 'wearable'],
  },
  {
    id: 'lungs',
    name: 'Lungs',
    system: 'Respiratory',
    score: 8.2,
    trend: 'stable',
    confidence: 'medium',
    note: 'Respiratory function is excellent. NAC supplementation is supporting lung health.',
    position: { x: 40, y: 20 },
    dataSources: ['self-report', 'protocol'],
  },
  {
    id: 'immune',
    name: 'Immune System',
    system: 'Immune',
    score: 6.5,
    trend: 'stable',
    confidence: 'low',
    note: 'Immune markers appear adequate. Consider adding vitamin C and zinc for additional support.',
    position: { x: 48, y: 16 },
    dataSources: ['self-report'],
  },
  // ── Upper Abdomen ── (liver is RIGHT side, stomach is LEFT-center)
  {
    id: 'liver',
    name: 'Liver',
    system: 'Hepatic',
    score: 6.3,
    trend: 'improving',
    confidence: 'high',
    note: 'Liver detox pathways are moderately active. Milk thistle is supporting Phase II detoxification.',
    position: { x: 56, y: 29 },
    dataSources: ['labs', 'protocol'],
  },
  {
    id: 'stomach',
    name: 'Stomach',
    system: 'Digestive',
    score: 5.8,
    trend: 'stable',
    confidence: 'medium',
    note: 'Digestive enzyme production is adequate. Consider adding zinc carnosine for mucosal support.',
    position: { x: 43, y: 30 },
    dataSources: ['self-report', 'protocol'],
  },
  {
    id: 'adrenals',
    name: 'Adrenals',
    system: 'Endocrine',
    score: 3.9,
    trend: 'declining',
    confidence: 'medium',
    note: 'Adrenal output is low. Likely HPA axis dysregulation. Ashwagandha may help restore balance.',
    position: { x: 44, y: 34 },
    dataSources: ['labs', 'check-ins'],
  },
  // ── Lower Abdomen ── (kidneys are lateral at ~y:34, gut is center ~y:40)
  {
    id: 'kidneys',
    name: 'Kidneys',
    system: 'Renal',
    score: 7.5,
    trend: 'stable',
    confidence: 'high',
    note: 'Kidney filtration is healthy. Hydration and electrolyte balance are well maintained.',
    position: { x: 55, y: 34 },
    dataSources: ['labs'],
  },
  {
    id: 'gut',
    name: 'Gut / Microbiome',
    system: 'Digestive',
    score: 4.6,
    trend: 'improving',
    confidence: 'medium',
    note: 'Microbiome diversity is below optimal. Probiotic protocol is showing early improvement.',
    position: { x: 48, y: 40 },
    dataSources: ['labs', 'protocol', 'self-report'],
  },
  {
    id: 'reproductive',
    name: 'Reproductive',
    system: 'Hormonal',
    score: 6.0,
    trend: 'stable',
    confidence: 'low',
    note: 'Hormonal markers are within functional range. Maca and vitex are supporting balance.',
    position: { x: 48, y: 48 },
    dataSources: ['labs'],
  },
  // ── Musculoskeletal (left shoulder area) ──
  {
    id: 'musculoskeletal',
    name: 'Musculoskeletal',
    system: 'Structural',
    score: 7.0,
    trend: 'stable',
    confidence: 'low',
    note: 'Mobility and recovery are adequate. Regular movement is supporting joint health.',
    position: { x: 32, y: 16 },
    dataSources: ['wearable', 'self-report'],
  },
];

export const OVERALL_HEALTH_SCORE = 6.2;
export const LAST_UPDATED = new Date().toISOString();

export function getScoreColor(score: number): string {
  if (score >= 7) return '#4FD1C5';
  if (score >= 5) return '#a89d8c';
  if (score >= 3) return '#C5A572';
  return '#e87b6b';
}

export function getConfidenceOpacity(confidence: DataConfidence): number {
  switch (confidence) {
    case 'high': return 1.0;
    case 'medium': return 0.8;
    case 'low': return 0.5;
    case 'unlit': return 0.2;
  }
}

export function getScoreLabel(score: number): string {
  if (score >= 7) return 'Optimal';
  if (score >= 5) return 'Moderate';
  if (score >= 3) return 'Below Optimal';
  return 'Needs Support';
}

export function getTrendIcon(trend: OrganTrend): string {
  if (trend === 'improving') return '↑';
  if (trend === 'stable') return '→';
  return '↓';
}

export function getTrendColor(trend: OrganTrend): string {
  if (trend === 'improving') return '#4FD1C5';
  if (trend === 'stable') return '#a89d8c';
  return '#e87b6b';
}

const dynamicScores: Map<string, Partial<OrganData>> = new Map();
let dynamicOverallScore: number | null = null;
let dynamicLastSynced: string | null = null;

export function updateOrganScore(
  organId: string,
  score: number,
  confidence: DataConfidence,
  dataSources: string[],
  note?: string,
  trend?: OrganTrend,
): void {
  const update: Partial<OrganData> = { score, confidence, dataSources };
  if (note) update.note = note;
  if (trend) update.trend = trend;
  dynamicScores.set(organId, update);
}

export function setDynamicOverallScore(score: number): void {
  dynamicOverallScore = score;
}

export function setDynamicLastSynced(date: string | null): void {
  dynamicLastSynced = date;
}

export function getDynamicLastSynced(): string | null {
  return dynamicLastSynced;
}

export function getEffectiveOrganData(): OrganData[] {
  if (dynamicScores.size === 0) return ORGAN_DATA;
  return ORGAN_DATA.map(organ => {
    const override = dynamicScores.get(organ.id);
    if (!override) return organ;
    return { ...organ, ...override };
  });
}

export function getEffectiveOverallScore(): number {
  return dynamicOverallScore ?? OVERALL_HEALTH_SCORE;
}

export function hasDynamicData(): boolean {
  return dynamicScores.size > 0;
}

export function clearDynamicScores(): void {
  dynamicScores.clear();
  dynamicOverallScore = null;
  dynamicLastSynced = null;
}
