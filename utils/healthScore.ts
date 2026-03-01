import type { LabMarker, ProtocolItem } from '../constants/gabriel';
import type { CheckIn, ComplianceEntry } from '../contexts/GabrielContext';

export interface HealthScoreInput {
  profile: {
    name: string;
    conditions: string[];
    medications: string[];
    healthGoals: { length: number };
    onboardingComplete: boolean;
  };
  labResults: LabMarker[];
  protocol: ProtocolItem[];
  complianceLog: ComplianceEntry[];
  checkIns: CheckIn[];
  chatCount: number;
}

export interface HealthScoreResult {
  score: number;
  breakdown: {
    profileCompleteness: number;
    labResults: number;
    protocolCompliance: number;
    checkInStreak: number;
    checkInQuality: number;
    activeEngagement: number;
  };
  insight: string;
  color: string;
}

function getProfileCompletenessScore(profile: HealthScoreInput['profile']): number {
  let points = 0;
  if (profile.name && profile.name.trim().length > 0) points += 2;
  if (profile.conditions.length > 0) points += 2;
  if (profile.medications.length > 0) points += 2;
  if (profile.healthGoals.length > 0) points += 2;
  if (profile.onboardingComplete) points += 2;
  return Math.min(points, 10);
}

function getLabResultsScore(labResults: LabMarker[]): number {
  if (labResults.length === 0) return 0;
  let points = 5;
  for (const marker of labResults) {
    if (marker.status === 'optimal') {
      points += 3;
    } else if (marker.status === 'attention') {
      points -= 2;
    }
  }
  return Math.max(0, Math.min(points, 20));
}

function getProtocolComplianceScore(protocol: ProtocolItem[], complianceLog: ComplianceEntry[]): number {
  if (protocol.length === 0) return 0;
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = complianceLog.filter(e => e.date === today);
  const completedItems = new Set<string>();
  for (const entry of todayEntries) {
    for (const item of entry.items) {
      completedItems.add(item);
    }
  }
  const protocolNames = protocol.map(p => p.name);
  let checked = 0;
  for (const name of protocolNames) {
    if (completedItems.has(name)) checked++;
  }
  return Math.min(checked * 3, 15);
}

function getCheckInStreakScore(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0;
  const sortedDates = [...new Set(checkIns.map(c => c.date))].sort().reverse();
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (sortedDates.includes(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return Math.min(streak * 3, 15);
}

function getCheckInQualityScore(checkIns: CheckIn[]): number {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = checkIns.filter(c => c.timestamp >= sevenDaysAgo);
  if (recent.length === 0) return 0;
  let total = 0;
  for (const c of recent) {
    total += c.mood + c.energy + c.sleep;
  }
  const avg = total / (recent.length * 3);
  return Math.round((avg / 5) * 10);
}

function getActiveEngagementScore(chatCount: number): number {
  const recentChats = Math.min(chatCount, 5);
  return recentChats * 2;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#4FD1C5';
  if (score >= 60) return '#B8A088';
  if (score >= 40) return '#E8A838';
  return '#E85D5D';
}

function getInsight(input: HealthScoreInput, breakdown: HealthScoreResult['breakdown']): string {
  if (breakdown.checkInStreak >= 15) return 'Great streak! 5 days of check-ins 🔥';
  if (breakdown.protocolCompliance >= 15) return 'All protocol items completed today! 🎉';
  if (breakdown.labResults === 0 && input.labResults.length === 0) return 'Upload your labs to improve your score';
  if (breakdown.profileCompleteness < 6) return 'Complete your profile to boost your score';
  if (breakdown.checkInStreak === 0) return 'Start a check-in streak to level up';
  if (breakdown.activeEngagement < 4) return 'Chat with Gabriel to improve your score';
  if (breakdown.labResults >= 15) return 'Your lab markers are looking strong 💪';
  if (breakdown.protocolCompliance === 0 && input.protocol.length > 0) return 'Check off your supplements today';
  return 'Keep building healthy habits every day';
}

export function calculateHealthScore(input: HealthScoreInput): HealthScoreResult {
  const breakdown = {
    profileCompleteness: getProfileCompletenessScore(input.profile),
    labResults: getLabResultsScore(input.labResults),
    protocolCompliance: getProtocolComplianceScore(input.protocol, input.complianceLog),
    checkInStreak: getCheckInStreakScore(input.checkIns),
    checkInQuality: getCheckInQualityScore(input.checkIns),
    activeEngagement: getActiveEngagementScore(input.chatCount),
  };

  const raw = 50
    + (breakdown.profileCompleteness - 5)
    + (breakdown.labResults - 10)
    + breakdown.protocolCompliance
    + breakdown.checkInStreak
    + breakdown.checkInQuality
    + breakdown.activeEngagement;

  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const color = getScoreColor(score);
  const insight = getInsight(input, breakdown);

  console.log('[HealthScore] Calculated:', { score, breakdown, insight });

  return { score, breakdown, insight, color };
}
