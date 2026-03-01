import type { LabMarker, ProtocolItem } from '../constants/gabriel';
import type { CheckIn, ComplianceEntry } from '../contexts/GabrielContext';
import { DRUG_INTERACTION_DB } from '../services/gabriel-ai';
import { calculateHealthScore } from './healthScore';

export interface HealthReportInput {
  profile: {
    name: string;
    conditions: string[];
    medications: string[];
    healthGoals: { length: number } & string[];
    onboardingComplete: boolean;
    supplements: string[];
  };
  labResults: LabMarker[];
  protocol: ProtocolItem[];
  complianceLog: ComplianceEntry[];
  checkIns: CheckIn[];
  chatCount: number;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getMarkerStatus(marker: LabMarker): string {
  if (marker.value >= marker.gabrielLow && marker.value <= marker.gabrielHigh) {
    return 'Optimal';
  }
  if (marker.value >= marker.conventionalLow && marker.value <= marker.conventionalHigh) {
    return 'Borderline (within conventional, outside optimal)';
  }
  return 'Out of Range';
}

function getCheckInTrend(checkIns: CheckIn[]): string {
  if (checkIns.length < 3) return 'insufficient data';
  const sorted = [...checkIns].sort((a, b) => b.timestamp - a.timestamp);
  const recent = sorted.slice(0, 3);
  const older = sorted.slice(3, 6);
  if (older.length === 0) return 'stable';

  const recentAvg = recent.reduce((s, c) => s + c.mood + c.energy + c.sleep, 0) / (recent.length * 3);
  const olderAvg = older.reduce((s, c) => s + c.mood + c.energy + c.sleep, 0) / (older.length * 3);
  const diff = recentAvg - olderAvg;

  if (diff > 0.3) return 'improving';
  if (diff < -0.3) return 'declining';
  return 'stable';
}

function findInteractions(medications: string[], protocol: ProtocolItem[]): string[] {
  const warnings: string[] = [];
  const medsLower = medications.map(m => m.toLowerCase());
  const supplementNames = protocol.map(p => p.name.toLowerCase());

  for (const med of medsLower) {
    for (const interaction of DRUG_INTERACTION_DB) {
      if (med.includes(interaction.medication) || interaction.medication.includes(med)) {
        for (const supp of interaction.supplements) {
          const matchingProtocol = supplementNames.find(s => s.includes(supp) || supp.includes(s.split(' ')[0].toLowerCase()));
          if (matchingProtocol) {
            const severity = interaction.severity === 'critical' ? 'CRITICAL' : 'WARNING';
            warnings.push(`[${severity}] ${supp} may interact with ${med}: ${interaction.risk}`);
          }
        }
      }
    }
  }

  return [...new Set(warnings)];
}

function getAnalysisPriorities(input: HealthReportInput): string[] {
  const priorities: string[] = [];

  const attentionMarkers = input.labResults.filter(m => m.status === 'attention');
  const suboptimalMarkers = input.labResults.filter(m => m.status === 'suboptimal');

  if (attentionMarkers.length > 0) {
    priorities.push(
      `${attentionMarkers.length} lab marker(s) require attention: ${attentionMarkers.map(m => `${m.name} (${m.value} ${m.unit})`).join(', ')}`
    );
  }

  if (suboptimalMarkers.length > 0) {
    priorities.push(
      `${suboptimalMarkers.length} lab marker(s) are suboptimal by naturopathic standards: ${suboptimalMarkers.map(m => m.name).join(', ')}`
    );
  }

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentCheckIns = input.checkIns.filter(c => c.timestamp >= sevenDaysAgo);
  if (recentCheckIns.length >= 3) {
    const avgEnergy = recentCheckIns.reduce((s, c) => s + c.energy, 0) / recentCheckIns.length;
    const avgMood = recentCheckIns.reduce((s, c) => s + c.mood, 0) / recentCheckIns.length;
    if (avgEnergy <= 2.5) {
      priorities.push(`Consistently low energy over the past week (avg ${avgEnergy.toFixed(1)}/5) — investigate thyroid, iron, adrenal function`);
    }
    if (avgMood <= 2.5) {
      priorities.push(`Low mood trend detected (avg ${avgMood.toFixed(1)}/5) — consider neurotransmitter support, vitamin D, and gut-brain axis evaluation`);
    }
  }

  if (input.profile.conditions.length > 0 && input.labResults.length === 0) {
    priorities.push('No lab results on file — comprehensive bloodwork recommended to guide protocol');
  }

  if (priorities.length === 0) {
    priorities.push('Continue current protocol and monitor progress with regular check-ins');
  }

  return priorities.slice(0, 3);
}

function getRecommendedTests(input: HealthReportInput): { test: string; reason: string }[] {
  const existingMarkerNames = new Set(input.labResults.map(m => m.name.toLowerCase()));
  const tests: { test: string; reason: string }[] = [];

  const conditionTestMap: Record<string, { test: string; reason: string }[]> = {
    'thyroid': [
      { test: 'Free T3', reason: 'Active thyroid hormone — most clinically relevant marker' },
      { test: 'TPO Antibodies', reason: 'Screen for autoimmune thyroiditis (Hashimoto\'s)' },
      { test: 'Reverse T3', reason: 'Assess thyroid hormone conversion efficiency' },
    ],
    'inflammation': [
      { test: 'hs-CRP', reason: 'Primary marker of systemic inflammation' },
      { test: 'Homocysteine', reason: 'Cardiovascular and methylation marker' },
      { test: 'Omega-3 Index', reason: 'Assess anti-inflammatory fatty acid status' },
    ],
    'gut': [
      { test: 'GI-MAP Stool Test', reason: 'Comprehensive gut microbiome and pathogen analysis' },
      { test: 'Zonulin', reason: 'Marker of intestinal permeability' },
    ],
    'hormone': [
      { test: 'DUTCH Complete', reason: 'Comprehensive hormone metabolite analysis' },
      { test: 'Cortisol (4-point)', reason: 'Assess adrenal function throughout the day' },
    ],
    'anxiety': [
      { test: 'Cortisol (4-point)', reason: 'Evaluate HPA axis and stress response' },
      { test: 'Magnesium RBC', reason: 'Intracellular magnesium status affects GABA activity' },
    ],
    'fatigue': [
      { test: 'Ferritin', reason: 'Iron storage — low ferritin is a top cause of fatigue' },
      { test: 'Vitamin D, 25-OH', reason: 'Deficiency strongly linked to fatigue' },
      { test: 'B12', reason: 'Essential for energy production and neurological function' },
    ],
    'sleep': [
      { test: 'Cortisol (4-point)', reason: 'Elevated nighttime cortisol disrupts sleep architecture' },
      { test: 'Magnesium RBC', reason: 'Magnesium supports GABA and melatonin production' },
    ],
  };

  const conditionsLower = input.profile.conditions.map(c => c.toLowerCase());

  for (const [key, conditionTests] of Object.entries(conditionTestMap)) {
    const matches = conditionsLower.some(c => c.includes(key));
    if (matches) {
      for (const t of conditionTests) {
        if (!existingMarkerNames.has(t.test.toLowerCase()) && !tests.some(x => x.test === t.test)) {
          tests.push(t);
        }
      }
    }
  }

  if (tests.length === 0 && input.labResults.length === 0) {
    tests.push(
      { test: 'CBC with Differential', reason: 'Baseline blood cell health and immune status' },
      { test: 'Comprehensive Metabolic Panel', reason: 'Liver, kidney, electrolyte baseline' },
      { test: 'Thyroid Panel (TSH, Free T4, Free T3)', reason: 'Thyroid function screening' },
      { test: 'Vitamin D, 25-OH', reason: 'Most common nutritional deficiency' },
    );
  }

  return tests.slice(0, 4);
}

export function generateHealthReport(input: HealthReportInput): string {
  console.log('[HealthReport] Generating comprehensive health report');

  const now = new Date();
  const dateStr = formatDate(now);
  const displayName = input.profile.name || 'Not provided';

  const healthScore = calculateHealthScore({
    profile: input.profile,
    labResults: input.labResults,
    protocol: input.protocol,
    complianceLog: input.complianceLog,
    checkIns: input.checkIns,
    chatCount: input.chatCount,
  });

  let report = '';
  report += '═══════════════════════════\n';
  report += 'GABRIEL HEALTH REPORT\n';
  report += `Generated: ${dateStr}\n`;
  report += '═══════════════════════════\n\n';

  report += 'PATIENT PROFILE\n';
  report += `Name: ${displayName}\n`;
  report += `Conditions: ${input.profile.conditions.length > 0 ? input.profile.conditions.join(', ') : 'None listed'}\n`;
  report += `Current Medications: ${input.profile.medications.length > 0 ? input.profile.medications.join(', ') : 'None listed'}\n`;
  report += `Health Goals: ${input.profile.healthGoals.length > 0 ? input.profile.healthGoals.join(', ') : 'None listed'}\n`;
  report += `Gabriel Health Score: ${healthScore.score}/100\n`;

  report += '\n───────────────────────────\n';
  report += 'LAB RESULTS (Most Recent)\n';
  if (input.labResults.length === 0) {
    report += 'No lab results on file.\n';
  } else {
    for (const marker of input.labResults) {
      report += `• ${marker.name}: ${marker.value} ${marker.unit}\n`;
      report += `  Conventional Range: ${marker.conventionalLow}–${marker.conventionalHigh} ${marker.unit}\n`;
      report += `  Optimal Range: ${marker.gabrielLow}–${marker.gabrielHigh} ${marker.unit}\n`;
      report += `  Status: ${getMarkerStatus(marker)}\n`;
    }
  }

  report += '\n───────────────────────────\n';
  report += 'CURRENT PROTOCOL\n';
  const morningItems = input.protocol.filter(p => p.timeOfDay === 'morning');
  const afternoonItems = input.protocol.filter(p => p.timeOfDay === 'afternoon');
  const eveningItems = input.protocol.filter(p => p.timeOfDay === 'evening');

  if (input.protocol.length === 0) {
    report += 'No protocol items on file.\n';
  } else {
    if (morningItems.length > 0) {
      report += 'Morning:\n';
      for (const item of morningItems) {
        report += `• ${item.name} — ${item.dosage} — ${item.reason.split('.')[0]}.\n`;
      }
    }
    if (afternoonItems.length > 0) {
      report += 'Afternoon:\n';
      for (const item of afternoonItems) {
        report += `• ${item.name} — ${item.dosage} — ${item.reason.split('.')[0]}.\n`;
      }
    }
    if (eveningItems.length > 0) {
      report += 'Evening:\n';
      for (const item of eveningItems) {
        report += `• ${item.name} — ${item.dosage} — ${item.reason.split('.')[0]}.\n`;
      }
    }
  }

  report += '\n───────────────────────────\n';
  report += 'RECENT CHECK-INS (Last 7 Days)\n';
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentCheckIns = input.checkIns.filter(c => c.timestamp >= sevenDaysAgo);
  if (recentCheckIns.length === 0) {
    report += 'No check-ins recorded in the last 7 days.\n';
  } else {
    const avgMood = (recentCheckIns.reduce((s, c) => s + c.mood, 0) / recentCheckIns.length).toFixed(1);
    const avgEnergy = (recentCheckIns.reduce((s, c) => s + c.energy, 0) / recentCheckIns.length).toFixed(1);
    const avgSleep = (recentCheckIns.reduce((s, c) => s + c.sleep, 0) / recentCheckIns.length).toFixed(1);
    const trend = getCheckInTrend(input.checkIns);
    report += `Avg Mood: ${avgMood}/5 | Avg Energy: ${avgEnergy}/5 | Avg Sleep: ${avgSleep}/5\n`;
    report += `Trend: ${trend}\n`;
  }

  report += '\n───────────────────────────\n';
  report += 'DRUG-SUPPLEMENT INTERACTIONS\n';
  const interactions = findInteractions(input.profile.medications, input.protocol);
  if (interactions.length === 0) {
    report += 'No interactions detected between current medications and protocol.\n';
  } else {
    for (const warning of interactions) {
      report += `• ${warning}\n`;
    }
  }

  report += '\n───────────────────────────\n';
  report += "GABRIEL'S ANALYSIS\n";
  report += 'Based on available data, key areas of focus:\n';
  const priorities = getAnalysisPriorities(input);
  priorities.forEach((p, i) => {
    report += `${i + 1}. ${p}\n`;
  });

  const recommendedTests = getRecommendedTests(input);
  if (recommendedTests.length > 0) {
    report += '\nRecommended Next Tests:\n';
    for (const t of recommendedTests) {
      report += `• ${t.test} — ${t.reason}\n`;
    }
  }

  report += '\n═══════════════════════════\n';
  report += 'Generated by Gabriel — trygabriel.ai\n';
  report += 'This report is for informational purposes only\n';
  report += 'and does not constitute medical advice.\n';
  report += '═══════════════════════════\n';

  console.log('[HealthReport] Report generated, length:', report.length);
  return report;
}
