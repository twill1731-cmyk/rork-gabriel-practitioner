import type { HealthData, HealthMetric } from './apple-health';
import type { OrganData, DataConfidence, OrganTrend } from '../constants/health-twin-data';

export interface OrganScoreResult {
  organId: string;
  score: number;
  confidence: DataConfidence;
  dataSources: string[];
  reasoning: string;
}

interface MetricMapping {
  metrics: (keyof HealthData)[];
  weights: number[];
}

const ORGAN_METRIC_MAP: Record<string, MetricMapping> = {
  'heart': {
    metrics: ['heartRate', 'heartRateVariability', 'bloodPressureSystolic', 'bloodPressureDiastolic', 'vo2Max'],
    weights: [0.25, 0.30, 0.20, 0.10, 0.15],
  },
  'lungs': {
    metrics: ['respiratoryRate', 'bloodOxygen', 'vo2Max'],
    weights: [0.30, 0.40, 0.30],
  },
  'nervous-system': {
    metrics: ['heartRateVariability', 'sleepQuality', 'sleepHours'],
    weights: [0.40, 0.35, 0.25],
  },
  'immune': {
    metrics: ['sleepHours', 'sleepQuality', 'bodyTemperature', 'steps'],
    weights: [0.30, 0.30, 0.20, 0.20],
  },
  'musculoskeletal': {
    metrics: ['steps', 'activeEnergy', 'vo2Max'],
    weights: [0.35, 0.35, 0.30],
  },
  'gut': {
    metrics: ['sleepQuality'],
    weights: [1.0],
  },
  'liver': {
    metrics: [],
    weights: [],
  },
  'kidneys': {
    metrics: [],
    weights: [],
  },
  'thyroid': {
    metrics: ['heartRate', 'bodyTemperature', 'restingEnergy'],
    weights: [0.35, 0.35, 0.30],
  },
  'adrenals': {
    metrics: ['heartRateVariability', 'sleepQuality', 'heartRate'],
    weights: [0.40, 0.35, 0.25],
  },
  'stomach': {
    metrics: [],
    weights: [],
  },
  'reproductive': {
    metrics: ['sleepHours', 'activeEnergy'],
    weights: [0.50, 0.50],
  },
};

function normalizeMetric(metricKey: keyof HealthData, value: number): number {
  switch (metricKey) {
    case 'heartRate':
      if (value <= 55) return 9.5;
      if (value <= 60) return 9.0;
      if (value <= 65) return 8.0;
      if (value <= 70) return 7.0;
      if (value <= 75) return 6.0;
      if (value <= 80) return 5.0;
      if (value <= 85) return 4.0;
      return 3.0;

    case 'heartRateVariability':
      if (value >= 65) return 9.5;
      if (value >= 55) return 8.5;
      if (value >= 45) return 7.5;
      if (value >= 35) return 6.0;
      if (value >= 25) return 4.5;
      return 3.0;

    case 'sleepHours':
      if (value >= 7.5 && value <= 9) return 9.0;
      if (value >= 7.0) return 8.0;
      if (value >= 6.5) return 7.0;
      if (value >= 6.0) return 5.5;
      if (value >= 5.0) return 4.0;
      return 3.0;

    case 'sleepQuality':
      return Math.min(10, value);

    case 'steps':
      if (value >= 10000) return 9.5;
      if (value >= 8000) return 8.5;
      if (value >= 6000) return 7.0;
      if (value >= 4000) return 5.5;
      if (value >= 2000) return 4.0;
      return 3.0;

    case 'bloodOxygen':
      if (value >= 98) return 9.5;
      if (value >= 96) return 8.5;
      if (value >= 94) return 7.0;
      if (value >= 92) return 5.0;
      return 3.0;

    case 'respiratoryRate':
      if (value >= 12 && value <= 16) return 9.0;
      if (value >= 10 && value <= 18) return 7.5;
      if (value >= 8 && value <= 20) return 6.0;
      return 4.0;

    case 'activeEnergy':
      if (value >= 500) return 9.0;
      if (value >= 400) return 8.0;
      if (value >= 300) return 7.0;
      if (value >= 200) return 5.5;
      if (value >= 100) return 4.0;
      return 3.0;

    case 'restingEnergy':
      if (value >= 1400 && value <= 2000) return 8.0;
      if (value >= 1200) return 7.0;
      return 5.5;

    case 'bodyTemperature':
      if (value >= 97.5 && value <= 98.8) return 9.0;
      if (value >= 97.0 && value <= 99.5) return 7.0;
      return 4.0;

    case 'vo2Max':
      if (value >= 45) return 9.5;
      if (value >= 40) return 8.5;
      if (value >= 35) return 7.0;
      if (value >= 30) return 5.5;
      return 4.0;

    case 'bloodPressureSystolic':
      if (value >= 110 && value <= 120) return 9.0;
      if (value >= 105 && value <= 130) return 7.5;
      if (value >= 100 && value <= 140) return 6.0;
      return 4.0;

    case 'bloodPressureDiastolic':
      if (value >= 70 && value <= 80) return 9.0;
      if (value >= 65 && value <= 85) return 7.5;
      if (value >= 60 && value <= 90) return 6.0;
      return 4.0;

    case 'weight':
      return 7.0;

    default:
      return 7.0;
  }
}

function calculateConfidence(availableCount: number, totalCount: number): DataConfidence {
  if (totalCount === 0) return 'unlit';
  const ratio = availableCount / totalCount;
  if (ratio >= 0.7) return 'high';
  if (ratio >= 0.4) return 'medium';
  if (ratio > 0) return 'low';
  return 'unlit';
}

function determineTrend(healthData: HealthData, metrics: (keyof HealthData)[]): OrganTrend {
  let upCount = 0;
  let downCount = 0;

  for (const key of metrics) {
    const metric = healthData[key] as HealthMetric | null;
    if (metric && metric.available) {
      if (metric.trend === 'up') upCount++;
      if (metric.trend === 'down') downCount++;
    }
  }

  if (upCount > downCount) return 'improving';
  if (downCount > upCount) return 'declining';
  return 'stable';
}

function generateReasoning(organId: string, score: number, dataSources: string[]): string {
  const sourceText = dataSources.length > 0
    ? `Based on ${dataSources.join(', ')} data.`
    : 'Limited data available from wearables.';

  if (score >= 8) {
    return `Excellent readings from your connected devices. ${sourceText}`;
  } else if (score >= 6.5) {
    return `Good overall metrics with room for optimization. ${sourceText}`;
  } else if (score >= 5) {
    return `Moderate readings suggest areas for improvement. ${sourceText}`;
  } else {
    return `Below optimal readings detected. Consider consulting a practitioner. ${sourceText}`;
  }
}

export function calculateOrganScores(healthData: HealthData): OrganScoreResult[] {
  const results: OrganScoreResult[] = [];

  for (const [organId, mapping] of Object.entries(ORGAN_METRIC_MAP)) {
    if (mapping.metrics.length === 0) {
      results.push({
        organId,
        score: -1,
        confidence: 'unlit',
        dataSources: [],
        reasoning: 'No wearable data available for this organ. Upload labs or visit a practitioner for assessment.',
      });
      continue;
    }

    let weightedSum = 0;
    let totalWeight = 0;
    const dataSources: string[] = [];
    let availableCount = 0;

    for (let i = 0; i < mapping.metrics.length; i++) {
      const metricKey = mapping.metrics[i];
      const weight = mapping.weights[i];
      const metric = healthData[metricKey] as HealthMetric | null;

      if (metric && metric.available) {
        const normalized = normalizeMetric(metricKey, metric.value);
        weightedSum += normalized * weight;
        totalWeight += weight;
        availableCount++;
        if (!dataSources.includes('Apple Health')) {
          dataSources.push('Apple Health');
        }
      }
    }

    if (totalWeight > 0) {
      const score = Math.round((weightedSum / totalWeight) * 10) / 10;
      const confidence = calculateConfidence(availableCount, mapping.metrics.length);

      results.push({
        organId,
        score: Math.max(1, Math.min(10, score)),
        confidence,
        dataSources,
        reasoning: generateReasoning(organId, score, dataSources),
      });
    } else {
      results.push({
        organId,
        score: -1,
        confidence: 'unlit',
        dataSources: [],
        reasoning: 'Waiting for data from connected devices.',
      });
    }
  }

  return results;
}

export function mergeScoresWithOrganData(
  organData: OrganData[],
  scoreResults: OrganScoreResult[],
): OrganData[] {
  return organData.map(organ => {
    const result = scoreResults.find(r => r.organId === organ.id);
    if (!result || result.score < 0) return organ;

    return {
      ...organ,
      score: result.score,
      confidence: result.confidence,
      dataSources: result.dataSources.length > 0 ? result.dataSources : organ.dataSources,
      note: result.reasoning,
    };
  });
}

export function calculateOverallScore(scoreResults: OrganScoreResult[]): number {
  const validScores = scoreResults.filter(r => r.score > 0);
  if (validScores.length === 0) return 6.2;

  const sum = validScores.reduce((acc, r) => acc + r.score, 0);
  return Math.round((sum / validScores.length) * 10) / 10;
}

export function getOrganTrendFromHealth(
  healthData: HealthData,
  organId: string,
): OrganTrend {
  const mapping = ORGAN_METRIC_MAP[organId];
  if (!mapping || mapping.metrics.length === 0) return 'stable';
  return determineTrend(healthData, mapping.metrics);
}
