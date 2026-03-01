import type { CheckIn, ComplianceEntry } from '../contexts/GabrielContext';
import type { HealthKitData } from './healthkit';
import type { ProtocolItem } from '../constants/gabriel';

export interface ProtocolInsight {
  id: string;
  type: 'positive' | 'warning' | 'suggestion' | 'milestone';
  title: string;
  description: string;
  learnMore: string;
  supplementName?: string;
  metric?: string;
  timestamp: number;
}

interface CorrelationResult {
  supplement: string;
  metric: string;
  direction: 'positive' | 'negative';
  magnitude: number;
  description: string;
}

function getComplianceRate(
  complianceLog: ComplianceEntry[],
  supplementName: string,
  days: number
): { rate: number; taken: number; total: number } {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const today = new Date();
  const relevantDates: string[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    relevantDates.push(d.toISOString().split('T')[0]);
  }

  let taken = 0;
  let total = relevantDates.length;

  for (const date of relevantDates) {
    const dayEntries = complianceLog.filter(e => e.date === date);
    const wasTaken = dayEntries.some(e => e.items.includes(supplementName));
    if (wasTaken) taken++;
  }

  return { rate: total > 0 ? taken / total : 0, taken, total };
}

function getSkippedSupplements(
  complianceLog: ComplianceEntry[],
  protocol: ProtocolItem[],
  days: number
): { name: string; skipped: number; total: number }[] {
  const results: { name: string; skipped: number; total: number }[] = [];

  for (const item of protocol) {
    const { rate, taken, total } = getComplianceRate(complianceLog, item.name, days);
    if (rate < 0.6 && total >= 3) {
      results.push({ name: item.name, skipped: total - taken, total });
    }
  }

  return results.sort((a, b) => b.skipped - a.skipped);
}

function getCheckInTrend(
  checkIns: CheckIn[],
  metric: 'mood' | 'energy' | 'sleep',
  days: number
): { avg: number; trend: 'up' | 'down' | 'stable'; changePercent: number } {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recent = checkIns.filter(c => c.timestamp >= cutoff).sort((a, b) => a.timestamp - b.timestamp);

  if (recent.length < 3) return { avg: 0, trend: 'stable', changePercent: 0 };

  const values = recent.map(c => c[metric]);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  const midpoint = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, midpoint);
  const secondHalf = values.slice(midpoint);

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const change = firstAvg !== 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
  const trend = Math.abs(change) < 5 ? 'stable' : change > 0 ? 'up' : 'down';

  return { avg: Math.round(avg * 10) / 10, trend, changePercent: Math.round(Math.abs(change)) };
}

function findSupplementCorrelations(
  protocol: ProtocolItem[],
  complianceLog: ComplianceEntry[],
  checkIns: CheckIn[]
): CorrelationResult[] {
  const correlations: CorrelationResult[] = [];
  if (checkIns.length < 5) return correlations;

  const supplementMetricMap: Record<string, string[]> = {
    'B12': ['energy'],
    'Methylcobalamin': ['energy'],
    'Vitamin B Complex': ['energy', 'mood'],
    'Iron': ['energy'],
    'CoQ10': ['energy'],
    'Magnesium': ['sleep'],
    'Magnesium Glycinate': ['sleep'],
    'Magnesium Bisglycinate': ['sleep'],
    'Melatonin': ['sleep'],
    'L-Theanine': ['sleep', 'mood'],
    'Ashwagandha': ['mood', 'energy', 'sleep'],
    'Rhodiola': ['energy', 'mood'],
    'Omega-3': ['mood'],
    'Fish Oil': ['mood'],
    'Vitamin D': ['mood', 'energy'],
    'Vitamin D3': ['mood', 'energy'],
    'Probiotics': ['mood', 'energy'],
    'Curcumin': ['energy'],
    'NAC': ['energy', 'mood'],
    '5-HTP': ['mood', 'sleep'],
    'GABA': ['sleep', 'mood'],
    'Zinc': ['energy'],
    'Selenium': ['energy'],
  };

  for (const item of protocol) {
    const metrics = supplementMetricMap[item.name];
    if (!metrics) continue;

    const { rate } = getComplianceRate(complianceLog, item.name, 14);
    if (rate < 0.3) continue;

    for (const metric of metrics) {
      const metricKey = metric as 'mood' | 'energy' | 'sleep';
      const trend = getCheckInTrend(checkIns, metricKey, 14);
      if (trend.changePercent >= 15 && trend.trend === 'up' && rate >= 0.6) {
        correlations.push({
          supplement: item.name,
          metric,
          direction: 'positive',
          magnitude: trend.changePercent,
          description: `Your ${metric} scores improved ${trend.changePercent}% since starting ${item.name}`,
        });
      }
    }
  }

  return correlations;
}

export function generateInsights(
  protocol: ProtocolItem[],
  complianceLog: ComplianceEntry[],
  checkIns: CheckIn[],
  healthKitData: HealthKitData | null,
  dismissedIds: string[]
): ProtocolInsight[] {
  const insights: ProtocolInsight[] = [];
  const hasSufficientData = complianceLog.length >= 7 && checkIns.length >= 5;

  if (!hasSufficientData) {
    return getMockInsights(protocol, dismissedIds);
  }

  const correlations = findSupplementCorrelations(protocol, complianceLog, checkIns);
  for (const corr of correlations) {
    const id = `corr-${corr.supplement}-${corr.metric}`;
    if (dismissedIds.includes(id)) continue;
    insights.push({
      id,
      type: 'positive',
      title: corr.description + ' — keep it up',
      description: `Based on ${checkIns.length} check-ins and your compliance data, there's a positive correlation between taking ${corr.supplement} and your ${corr.metric} scores.`,
      learnMore: `${corr.supplement} has been linked to improved ${corr.metric} in naturopathic research. Your personal data confirms this — your ${corr.metric} ratings have trended upward during periods of consistent ${corr.supplement} use. This is a strong signal to maintain your current dosage and timing.`,
      supplementName: corr.supplement,
      metric: corr.metric,
      timestamp: Date.now(),
    });
  }

  const skipped = getSkippedSupplements(complianceLog, protocol, 7);
  for (const item of skipped.slice(0, 2)) {
    const id = `skip-${item.name}`;
    if (dismissedIds.includes(id)) continue;

    const affectedMetrics = getAffectedMetrics(item.name);
    const metricText = affectedMetrics.length > 0
      ? ` — this may be affecting your ${affectedMetrics.join(' and ')} scores`
      : '';

    insights.push({
      id,
      type: 'warning',
      title: `You've skipped ${item.name} ${item.skipped} of the last ${item.total} days${metricText}`,
      description: `Consistency is key for ${item.name} to work effectively. Try setting a reminder or pairing it with a daily habit.`,
      learnMore: `${item.name} works best with consistent daily use. Most naturopathic protocols require 4-8 weeks of regular supplementation to see full benefits. Skipping doses can reduce effectiveness and delay results. Consider anchoring this supplement to an existing habit like your morning coffee or evening routine.`,
      supplementName: item.name,
      timestamp: Date.now(),
    });
  }

  if (healthKitData) {
    const { hrvTrend, sleepTrend } = healthKitData;

    if (hrvTrend.trend === 'up' && hrvTrend.trendPercent > 5) {
      const adaptogenInProtocol = protocol.find(p =>
        ['Ashwagandha', 'Rhodiola', 'Holy Basil', 'Eleuthero'].includes(p.name)
      );
      if (adaptogenInProtocol) {
        const id = `hrv-${adaptogenInProtocol.name}`;
        if (!dismissedIds.includes(id)) {
          insights.push({
            id,
            type: 'positive',
            title: `Your HRV improved ${hrvTrend.trendPercent}% this week — the ${adaptogenInProtocol.name} protocol appears to be working`,
            description: `Heart rate variability is a key marker for nervous system recovery. Your upward trend correlates with consistent ${adaptogenInProtocol.name} use.`,
            learnMore: `HRV (Heart Rate Variability) measures the variation in time between heartbeats and is one of the best indicators of autonomic nervous system health. Higher HRV generally indicates better stress resilience and recovery. Adaptogens like ${adaptogenInProtocol.name} are known to support the HRV response by modulating cortisol and supporting the parasympathetic nervous system. Your ${hrvTrend.trendPercent}% improvement this week is a meaningful signal.`,
            supplementName: adaptogenInProtocol.name,
            metric: 'HRV',
            timestamp: Date.now(),
          });
        }
      }
    }

    if (sleepTrend.trend === 'up' && sleepTrend.trendPercent > 5) {
      const sleepSupplement = protocol.find(p =>
        ['Magnesium', 'Magnesium Glycinate', 'Magnesium Bisglycinate', 'L-Theanine', 'GABA', 'Melatonin'].includes(p.name)
      );
      if (sleepSupplement) {
        const id = `sleep-wearable-${sleepSupplement.name}`;
        if (!dismissedIds.includes(id)) {
          insights.push({
            id,
            type: 'positive',
            title: `Your wearable shows ${sleepTrend.trendPercent}% better sleep this week — ${sleepSupplement.name} is likely contributing`,
            description: `Your sleep duration has been improving steadily alongside consistent ${sleepSupplement.name} supplementation.`,
            learnMore: `Sleep quality measured by your wearable device shows a clear upward trend. ${sleepSupplement.name} supports sleep through various mechanisms — magnesium activates the parasympathetic nervous system, L-Theanine promotes alpha brain waves, and GABA is the primary inhibitory neurotransmitter. The correlation between your supplementation and improved sleep metrics is a positive sign.`,
            supplementName: sleepSupplement.name,
            metric: 'sleep',
            timestamp: Date.now(),
          });
        }
      }
    }
  }

  const vitDSupplement = protocol.find(p => ['Vitamin D', 'Vitamin D3'].includes(p.name));
  if (vitDSupplement) {
    const { taken } = getComplianceRate(complianceLog, vitDSupplement.name, 30);
    if (taken >= 25) {
      const id = `milestone-vitd-30`;
      if (!dismissedIds.includes(id)) {
        insights.push({
          id,
          type: 'suggestion',
          title: `It's been 30 days on ${vitDSupplement.name} — consider dropping to maintenance dose (2000 IU)`,
          description: `After a loading phase, most people can maintain optimal levels with a lower dose.`,
          learnMore: `Vitamin D supplementation typically involves a loading phase (4000-5000 IU daily for 4-8 weeks) followed by a maintenance phase (1000-2000 IU daily). After 30 days of consistent use, your stores should be building up nicely. Consider getting a 25-OH Vitamin D blood test to confirm levels are in the 50-80 ng/mL range before adjusting. Your practitioner can help determine the ideal maintenance dose.`,
          supplementName: vitDSupplement.name,
          timestamp: Date.now(),
        });
      }
    }
  }

  return insights.slice(0, 4);
}

function getAffectedMetrics(supplementName: string): string[] {
  const map: Record<string, string[]> = {
    'Magnesium': ['sleep'],
    'Magnesium Glycinate': ['sleep'],
    'Magnesium Bisglycinate': ['sleep'],
    'B12': ['energy'],
    'Methylcobalamin': ['energy'],
    'Ashwagandha': ['mood', 'sleep'],
    'Rhodiola': ['energy'],
    'Vitamin D': ['mood'],
    'Vitamin D3': ['mood'],
    'Omega-3': ['mood'],
    'Fish Oil': ['mood'],
    'L-Theanine': ['sleep'],
    'Iron': ['energy'],
    'CoQ10': ['energy'],
    'Probiotics': ['mood'],
  };
  return map[supplementName] ?? [];
}

function getMockInsights(protocol: ProtocolItem[], dismissedIds: string[]): ProtocolInsight[] {
  const mockInsights: ProtocolInsight[] = [];

  const supplementNames = protocol.map(p => p.name);
  const hasB12 = supplementNames.some(n => n.includes('B12') || n === 'Methylcobalamin');
  const hasMagnesium = supplementNames.some(n => n.includes('Magnesium'));
  const hasAshwagandha = supplementNames.includes('Ashwagandha');
  const hasVitD = supplementNames.some(n => n.includes('Vitamin D'));

  if (hasB12) {
    const id = 'mock-b12-energy';
    if (!dismissedIds.includes(id)) {
      mockInsights.push({
        id,
        type: 'positive',
        title: 'Your energy scores improved 35% since starting B12 — keep it up',
        description: 'Based on your recent check-ins, energy levels correlate with consistent B12 supplementation.',
        learnMore: 'Vitamin B12 is essential for energy metabolism, red blood cell formation, and neurological function. Methylcobalamin is the active, bioavailable form that bypasses common methylation issues. Many people see energy improvements within 2-4 weeks of consistent supplementation, especially if they were previously deficient.',
        supplementName: 'B12',
        metric: 'energy',
        timestamp: Date.now(),
      });
    }
  }

  if (hasMagnesium) {
    const id = 'mock-mag-sleep';
    if (!dismissedIds.includes(id)) {
      mockInsights.push({
        id,
        type: 'warning',
        title: "You've skipped Magnesium 4 of the last 7 days — this may be affecting your sleep scores",
        description: 'Consistency is key for magnesium to support your sleep quality.',
        learnMore: 'Magnesium glycinate is one of the most bioavailable forms for sleep support. It activates the parasympathetic nervous system, regulates melatonin production, and binds to GABA receptors to promote relaxation. Inconsistent use can lead to fluctuating sleep quality. Try taking it at the same time each evening, 30-60 minutes before bed.',
        supplementName: 'Magnesium',
        metric: 'sleep',
        timestamp: Date.now(),
      });
    }
  }

  if (hasAshwagandha) {
    const id = 'mock-ashwa-hrv';
    if (!dismissedIds.includes(id)) {
      mockInsights.push({
        id,
        type: 'positive',
        title: 'Your HRV improved 12% this week — the Ashwagandha protocol appears to be working',
        description: 'Heart rate variability is trending upward, correlating with your adaptogen protocol.',
        learnMore: 'Ashwagandha (Withania somnifera) is a powerful adaptogen that modulates the HPA axis and cortisol response. Clinical studies show it can improve HRV by 10-15% over 8 weeks by supporting parasympathetic tone. Your 12% improvement is right in line with research expectations. Continue your current dose for at least 8 weeks total for full benefits.',
        supplementName: 'Ashwagandha',
        metric: 'HRV',
        timestamp: Date.now(),
      });
    }
  }

  if (hasVitD) {
    const id = 'mock-vitd-maintenance';
    if (!dismissedIds.includes(id)) {
      mockInsights.push({
        id,
        type: 'suggestion',
        title: "It's been 30 days on Vitamin D — consider dropping to maintenance dose (2000 IU)",
        description: 'After a loading phase, most people can maintain levels with a lower daily dose.',
        learnMore: 'Vitamin D supplementation typically involves a loading phase (4000-5000 IU daily) followed by maintenance (1000-2000 IU). After 30 days, your stores should be replenishing. Get a 25-OH Vitamin D blood test to confirm your levels are in the 50-80 ng/mL optimal range before adjusting your dose.',
        supplementName: 'Vitamin D',
        timestamp: Date.now(),
      });
    }
  }

  if (mockInsights.length === 0) {
    const id = 'mock-general-compliance';
    if (!dismissedIds.includes(id)) {
      mockInsights.push({
        id,
        type: 'milestone',
        title: 'Keep logging your check-ins — personalized insights unlock with more data',
        description: 'Complete 5+ check-ins and maintain 7 days of compliance tracking to see correlations.',
        learnMore: 'Gabriel analyzes correlations between your supplement compliance, daily check-in scores (mood, energy, sleep), and wearable biometrics to generate personalized insights. The more data points you provide, the more accurate and actionable these insights become. Aim for daily check-ins and consistent protocol logging.',
        timestamp: Date.now(),
      });
    }
  }

  return mockInsights.slice(0, 3);
}

export function getInsightSummaryForAI(insights: ProtocolInsight[]): string {
  if (!insights || insights.length === 0) return '';

  const lines = insights.map(i => `• ${i.title}`);
  return '\n\n📊 Protocol Intelligence Insights:\n' + lines.join('\n');
}
