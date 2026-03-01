import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Pill,
  FileText,
  TrendingUp,
  MapPin,
  Settings,
  ChevronRight,
  Sun,
  CloudSun,
  Moon,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Activity,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { useGabriel } from '../contexts/GabrielContext';
import { hapticLight } from '../utils/haptics';
import type { ProtocolItem, LabMarker } from '../constants/gabriel';
import { MOCK_PRACTITIONERS } from '../constants/practitioners';
import { OVERALL_HEALTH_SCORE, getScoreColor, getScoreLabel, getEffectiveOverallScore } from '../constants/health-twin-data';
import { DEMO_COHERENCE_PROFILE, getCoherenceLevel, getCoherenceLevelColor, getCoherenceLevelLabel } from '../constants/heart-coherence-data';
import { useRouter } from 'expo-router';
import { HeartPulse, Link2, Sparkles, BarChart3 } from 'lucide-react-native';
import { hasCheckedInToday } from '../services/morning-checkin';
import { useState } from 'react';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DASHBOARD_WIDTH = Math.min(SCREEN_WIDTH * 0.88, 380);

interface HealthDashboardProps {
  visible: boolean;
  onClose: () => void;
  onAskGabriel: (question: string) => void;
  onNavigate: (target: string) => void;
}

function getLabStatus(marker: LabMarker): 'optimal' | 'suboptimal' | 'concerning' {
  if (marker.gabrielLow !== undefined && marker.gabrielHigh !== undefined) {
    if (marker.value >= marker.gabrielLow && marker.value <= marker.gabrielHigh) return 'optimal';
    const lowDist = marker.gabrielLow - marker.value;
    const highDist = marker.value - marker.gabrielHigh;
    const maxDist = Math.max(lowDist, highDist);
    const range = marker.gabrielHigh - marker.gabrielLow;
    if (range > 0 && maxDist / range > 0.5) return 'concerning';
    return 'suboptimal';
  }
  return 'optimal';
}

function getStatusColor(status: 'optimal' | 'suboptimal' | 'concerning'): string {
  if (status === 'optimal') return Colors.teal;
  if (status === 'suboptimal') return '#E8A838';
  return Colors.softRed;
}

function getStatusBg(status: 'optimal' | 'suboptimal' | 'concerning'): string {
  if (status === 'optimal') return 'rgba(79, 209, 197, 0.12)';
  if (status === 'suboptimal') return 'rgba(232, 168, 56, 0.12)';
  return 'rgba(232, 93, 93, 0.12)';
}

function ProtocolSection({ onAskGabriel }: { onAskGabriel: (q: string) => void }) {
  const { protocol, getTodayCompliance, complianceLog } = useGabriel();

  const morningItems = useMemo(() => protocol.filter(p => p.timeOfDay === 'morning' || !p.timeOfDay), [protocol]);
  const afternoonItems = useMemo(() => protocol.filter(p => p.timeOfDay === 'afternoon'), [protocol]);
  const eveningItems = useMemo(() => protocol.filter(p => p.timeOfDay === 'evening'), [protocol]);

  const todayCompliance = useMemo(() => getTodayCompliance(), [getTodayCompliance]);

  const getBlockCompliance = useCallback((block: string) => {
    const entry = todayCompliance.find(e => e.timeBlock === block);
    return entry?.items?.length ?? 0;
  }, [todayCompliance]);

  const totalItems = protocol.length;
  const completedToday = todayCompliance.reduce((sum, e) => sum + (e.items?.length ?? 0), 0);
  const compliancePct = totalItems > 0 ? Math.round((completedToday / totalItems) * 100) : 0;

  if (protocol.length === 0) {
    return (
      <View style={sectionStyles.emptyCard}>
        <Pill size={20} color={Colors.whiteDim} strokeWidth={1.5} />
        <Text style={sectionStyles.emptyText}>No supplements in your protocol yet</Text>
        <TouchableOpacity style={sectionStyles.askBtn} onPress={() => onAskGabriel('Help me build a supplement protocol for my health goals')} activeOpacity={0.7}>
          <MessageCircle size={13} color={Colors.darkBg} strokeWidth={2} />
          <Text style={sectionStyles.askBtnText}>Ask Gabriel to build one</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderBlock = (label: string, items: ProtocolItem[], icon: React.ReactNode, blockKey: string) => {
    if (items.length === 0) return null;
    const done = getBlockCompliance(blockKey);
    return (
      <View key={blockKey} style={sectionStyles.timeBlock}>
        <View style={sectionStyles.timeBlockHeader}>
          {icon}
          <Text style={sectionStyles.timeBlockLabel}>{label}</Text>
          <Text style={sectionStyles.timeBlockCount}>{done}/{items.length}</Text>
        </View>
        {items.map((item, idx) => (
          <TouchableOpacity key={item.id || idx} style={sectionStyles.supplementRow} onPress={() => onAskGabriel(`Tell me about ${item.name} and why I'm taking it`)} activeOpacity={0.7}>
            <Text style={sectionStyles.supplementName}>{item.name}</Text>
            <Text style={sectionStyles.supplementDosage}>{item.dosage}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View>
      <View style={sectionStyles.complianceRow}>
        <View style={sectionStyles.complianceBar}>
          <View style={[sectionStyles.complianceFill, { width: `${compliancePct}%` as unknown as number }]} />
        </View>
        <Text style={sectionStyles.compliancePct}>{compliancePct}%</Text>
      </View>
      {renderBlock('Morning', morningItems, <Sun size={13} color="#F5C842" strokeWidth={1.5} />, 'morning')}
      {renderBlock('Afternoon', afternoonItems, <CloudSun size={13} color={Colors.teal} strokeWidth={1.5} />, 'afternoon')}
      {renderBlock('Evening', eveningItems, <Moon size={13} color="#8B7EC8" strokeWidth={1.5} />, 'evening')}
    </View>
  );
}

function LabsSection({ onAskGabriel }: { onAskGabriel: (q: string) => void }) {
  const { labResults } = useGabriel();

  const uniqueMarkers = useMemo(() => {
    const seen = new Set<string>();
    return labResults.filter(m => {
      if (seen.has(m.name)) return false;
      seen.add(m.name);
      return true;
    }).slice(0, 8);
  }, [labResults]);

  if (uniqueMarkers.length === 0) {
    return (
      <View style={sectionStyles.emptyCard}>
        <FileText size={20} color={Colors.whiteDim} strokeWidth={1.5} />
        <Text style={sectionStyles.emptyText}>No lab results uploaded yet</Text>
        <TouchableOpacity style={sectionStyles.askBtn} onPress={() => onAskGabriel('How do I upload my lab results?')} activeOpacity={0.7}>
          <MessageCircle size={13} color={Colors.darkBg} strokeWidth={2} />
          <Text style={sectionStyles.askBtnText}>Ask Gabriel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={sectionStyles.labGrid}>
      {uniqueMarkers.map((marker, idx) => {
        const status = getLabStatus(marker);
        const color = getStatusColor(status);
        const bg = getStatusBg(status);
        return (
          <TouchableOpacity key={idx} style={[sectionStyles.labChip, { backgroundColor: bg }]} onPress={() => onAskGabriel(`Interpret my ${marker.name} result of ${marker.value} ${marker.unit}`)} activeOpacity={0.7}>
            <Text style={[sectionStyles.labChipName, { color }]}>{marker.name}</Text>
            <Text style={sectionStyles.labChipValue}>{marker.value} {marker.unit}</Text>
            {status === 'optimal' && <CheckCircle size={11} color={color} strokeWidth={2} />}
            {status === 'suboptimal' && <AlertCircle size={11} color={color} strokeWidth={2} />}
            {status === 'concerning' && <AlertCircle size={11} color={color} strokeWidth={2} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TrendsSection() {
  const { getRecentCheckIns } = useGabriel();
  const recent = useMemo(() => getRecentCheckIns(14), [getRecentCheckIns]);

  if (recent.length === 0) {
    return (
      <View style={sectionStyles.emptyCard}>
        <TrendingUp size={20} color={Colors.whiteDim} strokeWidth={1.5} />
        <Text style={sectionStyles.emptyText}>Check in daily to see trends</Text>
      </View>
    );
  }

  const last7 = recent.slice(0, 7);
  const avgMood = last7.reduce((s, c) => s + c.mood, 0) / last7.length;
  const avgEnergy = last7.reduce((s, c) => s + c.energy, 0) / last7.length;
  const avgSleep = last7.reduce((s, c) => s + c.sleep, 0) / last7.length;

  return (
    <View style={sectionStyles.trendsGrid}>
      {[
        { label: 'Mood', value: avgMood, emoji: '\u{1F60A}' },
        { label: 'Energy', value: avgEnergy, emoji: '\u26A1' },
        { label: 'Sleep', value: avgSleep, emoji: '\u{1F634}' },
      ].map((metric) => (
        <View key={metric.label} style={sectionStyles.trendItem}>
          <Text style={sectionStyles.trendEmoji}>{metric.emoji}</Text>
          <Text style={sectionStyles.trendValue}>{metric.value.toFixed(1)}</Text>
          <Text style={sectionStyles.trendLabel}>{metric.label}</Text>
          <View style={sectionStyles.miniBar}>
            <View style={[sectionStyles.miniBarFill, { width: `${(metric.value / 5) * 100}%` as unknown as number }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

function SymptomsSection({ onAskGabriel }: { onAskGabriel: (q: string) => void }) {
  const { getRecentSymptoms } = useGabriel();
  const recent = useMemo(() => getRecentSymptoms(14), [getRecentSymptoms]);

  if (recent.length === 0) {
    return (
      <View style={sectionStyles.emptyCard}>
        <Activity size={20} color={Colors.whiteDim} strokeWidth={1.5} />
        <Text style={sectionStyles.emptyText}>No recent symptoms logged</Text>
      </View>
    );
  }

  const severityColor = (s: string) => s === 'severe' ? Colors.softRed : s === 'moderate' ? '#E8A838' : Colors.tealMuted;

  return (
    <View>
      {recent.slice(0, 5).map((symptom, idx) => (
        <TouchableOpacity key={symptom.id || idx} style={sectionStyles.symptomRow} onPress={() => onAskGabriel(`I've been having ${symptom.symptom} in my ${symptom.region}. What could be causing this?`)} activeOpacity={0.7}>
          <View style={[sectionStyles.severityDot, { backgroundColor: severityColor(symptom.severity) }]} />
          <View style={sectionStyles.symptomInfo}>
            <Text style={sectionStyles.symptomName}>{symptom.symptom}</Text>
            <Text style={sectionStyles.symptomRegion}>{symptom.region} · {symptom.severity}</Text>
          </View>
          <ChevronRight size={14} color={Colors.whiteDim} strokeWidth={1.5} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function PractitionersSection({ onNavigate }: { onNavigate: (t: string) => void }) {
  const practitioners = useMemo(() => MOCK_PRACTITIONERS.slice(0, 3), []);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Pulsing animation for active connections
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Blinking animation for pending connections
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.8, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 0.4, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim, blinkAnim]);

  return (
    <View>
      {practitioners.map((p) => {
        const status = p.connectionStatus || 'inactive';
        const isActive = status === 'active';
        const isPending = status === 'pending';

        return (
          <TouchableOpacity key={p.id} style={sectionStyles.practitionerRow} onPress={() => onNavigate(`/practitioner/${p.id}`)} activeOpacity={0.7}>
            <View style={sectionStyles.practitionerAvatar}>
              {isActive && (
                <View style={sectionStyles.connectionStatusContainer}>
                  <View style={[sectionStyles.connectionGlow, { backgroundColor: 'rgba(79, 209, 197, 0.15)' }]} />
                  <Animated.View style={[sectionStyles.connectionDot, { backgroundColor: Colors.teal, transform: [{ scale: pulseAnim }] }]} />
                </View>
              )}
              {isPending && (
                <Animated.View style={[sectionStyles.connectionDot, { backgroundColor: Colors.gold, width: 8, height: 8, opacity: blinkAnim }]} />
              )}
              {!isActive && !isPending && (
                <View style={[sectionStyles.connectionDot, { backgroundColor: 'rgba(255, 255, 255, 0.2)', width: 8, height: 8 }]} />
              )}
            </View>
            <View style={sectionStyles.practitionerInfo}>
              <Text style={sectionStyles.practitionerName}>{p.name}</Text>
              <Text style={sectionStyles.practitionerSpecialty}>{p.specialties?.[0] ?? p.credentials}</Text>
              {isActive && p.lastSync && (
                <Text style={sectionStyles.lastSyncText}>Last sync: {p.lastSync}</Text>
              )}
              {isPending && (
                <Text style={sectionStyles.pendingText}>Pending</Text>
              )}
            </View>
            <ChevronRight size={14} color={Colors.whiteDim} strokeWidth={1.5} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function DashboardSection({ title, icon, children, onAskGabriel, askQuestion }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; onAskGabriel?: (q: string) => void; askQuestion?: string;
}) {
  return (
    <View style={dashSectionStyles.container}>
      <View style={dashSectionStyles.header}>
        <View style={dashSectionStyles.iconWrap}>{icon}</View>
        <Text style={dashSectionStyles.title}>{title}</Text>
        {onAskGabriel && askQuestion && (
          <TouchableOpacity style={dashSectionStyles.askCta} onPress={() => { hapticLight(); onAskGabriel(askQuestion); }} activeOpacity={0.7}>
            <MessageCircle size={12} color={Colors.teal} strokeWidth={2} />
            <Text style={dashSectionStyles.askCtaText}>Ask</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

function PressableCard({ children, onPress, style, testID }: { children: React.ReactNode; onPress: () => void; style: any; testID?: string }) {
  const pressScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(pressScale, { toValue: 0.97, speed: 50, bounciness: 0, useNativeDriver: true }).start();
  }, [pressScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(pressScale, { toValue: 1, speed: 40, bounciness: 6, useNativeDriver: true }).start();
  }, [pressScale]);

  return (
    <Animated.View style={{ transform: [{ scale: pressScale }] }}>
      <TouchableOpacity
        style={style}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

function TreatmentIntelligenceCard({ onNavigate, onClose }: { onNavigate: (t: string) => void; onClose: () => void }) {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing dot animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const hasActiveTreatment = false; // TODO: Connect to actual state later

  return (
    <PressableCard
      style={treatmentCardStyles.container}
      onPress={() => { hapticLight(); onClose(); router.push('/treatment-log' as never); }}
      testID="treatment-intelligence-card"
    >
      <View style={treatmentCardStyles.left}>
        <View style={treatmentCardStyles.iconWrap}>
          <Text style={treatmentCardStyles.emoji}>💉</Text>
        </View>
      </View>
      <View style={treatmentCardStyles.right}>
        <Text style={treatmentCardStyles.title}>Treatment Intelligence</Text>
        {hasActiveTreatment ? (
          <View style={treatmentCardStyles.statusRow}>
            <Animated.View style={[treatmentCardStyles.activeDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={treatmentCardStyles.activeText}>Tracking: Vitamin C IV</Text>
          </View>
        ) : (
          <Text style={treatmentCardStyles.subtitle}>Track treatments & measure impact</Text>
        )}
      </View>
      <ChevronRight size={16} color={Colors.whiteDim} strokeWidth={1.5} />
    </PressableCard>
  );
}

function EnergyIntelligenceCard({ onNavigate, onClose }: { onNavigate: (t: string) => void; onClose: () => void }) {
  const router = useRouter();

  return (
    <PressableCard
      style={energyCardStyles.container}
      onPress={() => { hapticLight(); onClose(); router.push('/energy-intelligence' as never); }}
      testID="energy-intelligence-card"
    >
      <View style={energyCardStyles.left}>
        <View style={energyCardStyles.iconWrap}>
          <Text style={energyCardStyles.emoji}>⚡</Text>
        </View>
      </View>
      <View style={energyCardStyles.right}>
        <Text style={energyCardStyles.title}>Energy Intelligence</Text>
        <Text style={energyCardStyles.subtitle}>Peak at 10 AM • Score: 7.4</Text>
      </View>
      <ChevronRight size={16} color={Colors.whiteDim} strokeWidth={1.5} />
    </PressableCard>
  );
}

function ConnectHealthCard({ onNavigate, onClose }: { onNavigate: (t: string) => void; onClose: () => void }) {
  const router = useRouter();

  return (
    <PressableCard
      style={connectCardStyles.container}
      onPress={() => { hapticLight(); onClose(); router.push('/connect-health' as never); }}
      testID="connect-health-card"
    >
      <View style={connectCardStyles.left}>
        <View style={connectCardStyles.iconWrap}>
          <Link2 size={20} color="#4FD1C5" strokeWidth={1.5} />
        </View>
      </View>
      <View style={connectCardStyles.right}>
        <Text style={connectCardStyles.title}>Connect Your Data</Text>
        <Text style={connectCardStyles.subtitle}>Sync Apple Health, labs & devices</Text>
      </View>
      <ChevronRight size={16} color={Colors.whiteDim} strokeWidth={1.5} />
    </PressableCard>
  );
}

function MorningCheckInCard({ onNavigate, onClose }: { onNavigate: (t: string) => void; onClose: () => void }) {
  const router = useRouter();
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    hasCheckedInToday().then(setCheckedIn);
  }, []);

  if (checkedIn) {
    // Already checked in today — show summary
    return (
      <PressableCard
        style={morningCheckInCardStyles.container}
        onPress={() => { hapticLight(); onClose(); router.push('/morning-checkin' as never); }}
        testID="morning-checkin-card"
      >
        <View style={morningCheckInCardStyles.left}>
          <View style={morningCheckInCardStyles.iconWrap}>
            <CheckCircle size={20} color={Colors.teal} strokeWidth={1.5} />
          </View>
        </View>
        <View style={morningCheckInCardStyles.right}>
          <Text style={morningCheckInCardStyles.title}>☀️ Today's Check-in</Text>
          <Text style={morningCheckInCardStyles.subtitle}>Sleep 7 • Energy 6 • Mood 8</Text>
        </View>
        <ChevronRight size={16} color={Colors.whiteDim} strokeWidth={1.5} />
      </PressableCard>
    );
  }

  // Not checked in yet — prompt to check in
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <PressableCard
      style={morningCheckInCardStyles.container}
      onPress={() => { hapticLight(); onClose(); router.push('/morning-checkin' as never); }}
      testID="morning-checkin-card"
    >
      <View style={morningCheckInCardStyles.left}>
        <Animated.View style={[morningCheckInCardStyles.iconWrap, { transform: [{ scale: pulseAnim }] }]}>
          <Sun size={20} color={Colors.teal} strokeWidth={1.5} />
        </Animated.View>
      </View>
      <View style={morningCheckInCardStyles.right}>
        <Text style={morningCheckInCardStyles.title}>☀️ Morning Check-in</Text>
        <Text style={morningCheckInCardStyles.subtitle}>How did you sleep?</Text>
      </View>
      <ChevronRight size={16} color={Colors.whiteDim} strokeWidth={1.5} />
    </PressableCard>
  );
}

function WeeklyDigestCard({ onNavigate, onClose }: { onNavigate: (t: string) => void; onClose: () => void }) {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <PressableCard
      style={weeklyDigestCardStyles.container}
      onPress={() => { hapticLight(); onClose(); router.push('/weekly-digest' as never); }}
      testID="weekly-digest-card"
    >
      <View style={weeklyDigestCardStyles.left}>
        <Animated.View style={[weeklyDigestCardStyles.iconWrap, { transform: [{ scale: pulseAnim }] }]}>
          <BarChart3 size={20} color={Colors.teal} strokeWidth={1.5} />
        </Animated.View>
      </View>
      <View style={weeklyDigestCardStyles.right}>
        <Text style={weeklyDigestCardStyles.title}>📊 Weekly Digest</Text>
        <Text style={weeklyDigestCardStyles.subtitle}>Your week in health</Text>
      </View>
      <ChevronRight size={16} color={Colors.whiteDim} strokeWidth={1.5} />
    </PressableCard>
  );
}

function HealthTwinCard({ onNavigate, onClose }: { onNavigate: (t: string) => void; onClose: () => void }) {
  const router = useRouter();
  const score = getEffectiveOverallScore();
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <PressableCard
      style={twinCardStyles.container}
      onPress={() => { hapticLight(); onClose(); router.push('/health-twin' as never); }}
      testID="health-twin-card"
    >
      <View style={twinCardStyles.left}>
        <View style={twinCardStyles.silhouetteWrap}>
          <Animated.View style={[twinCardStyles.silhouetteGlow, { opacity: pulseAnim }]} />
          <View style={twinCardStyles.silhouette}>
            <View style={twinCardStyles.silHead} />
            <View style={twinCardStyles.silBody} />
            <View style={twinCardStyles.silLegs}>
              <View style={twinCardStyles.silLeg} />
              <View style={twinCardStyles.silLeg} />
            </View>
          </View>
        </View>
      </View>
      <View style={twinCardStyles.right}>
        <Text style={twinCardStyles.title}>Health Twin</Text>
        <Text style={twinCardStyles.subtitle}>Interactive body health map</Text>
        <View style={twinCardStyles.scoreRow}>
          <Text style={[twinCardStyles.scoreNum, { color }]}>{score.toFixed(1)}</Text>
          <Text style={[twinCardStyles.scoreLabel, { color }]}>{label}</Text>
        </View>
      </View>
      <ChevronRight size={16} color={Colors.whiteDim} strokeWidth={1.5} />
    </PressableCard>
  );
}

function CoherenceWaveIcon() {
  const wave1Opacity = useRef(new Animated.Value(0.4)).current;
  const wave2Opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(wave1Opacity, { toValue: 0.8, duration: 1800, useNativeDriver: true }),
        Animated.timing(wave1Opacity, { toValue: 0.4, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(wave2Opacity, { toValue: 0.8, duration: 2200, useNativeDriver: true }),
        Animated.timing(wave2Opacity, { toValue: 0.4, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={coherenceCardStyles.iconWrap}>
      <Animated.View style={{ opacity: wave1Opacity }}>
        <Svg width={40} height={40} viewBox="0 0 40 40">
          <Path
            d="M4 22 Q8 14, 12 22 Q16 30, 20 22 Q24 14, 28 22 Q32 30, 36 22"
            stroke="#C5A572"
            strokeWidth={1.8}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
      <Animated.View style={[coherenceCardStyles.iconOverlay, { opacity: wave2Opacity }]}>
        <Svg width={40} height={40} viewBox="0 0 40 40">
          <Path
            d="M4 20 Q10 12, 14 20 Q18 28, 22 18 Q26 10, 30 20 Q34 28, 36 18"
            stroke="#7C6FD4"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

function CoherenceCard({ onNavigate, onClose }: { onNavigate: (t: string) => void; onClose: () => void }) {
  const router = useRouter();
  const profile = DEMO_COHERENCE_PROFILE;
  const level = getCoherenceLevel(profile.averageCoherence);
  const levelColor = getCoherenceLevelColor(level);
  const levelLabel = getCoherenceLevelLabel(level);

  return (
    <PressableCard
      style={coherenceCardStyles.container}
      onPress={() => { hapticLight(); onClose(); router.push('/heart-coherence' as never); }}
      testID="coherence-card"
    >
      <View style={coherenceCardStyles.left}>
        <CoherenceWaveIcon />
      </View>
      <View style={coherenceCardStyles.right}>
        <Text style={coherenceCardStyles.title}>Heart-Brain Coherence</Text>
        <Text style={coherenceCardStyles.subtitle}>Mind-body energy alignment</Text>
        <View style={coherenceCardStyles.scoreRow}>
          <Text style={[coherenceCardStyles.scoreNum, { color: levelColor }]}>{profile.averageCoherence}</Text>
          <Text style={[coherenceCardStyles.scoreLabel, { color: levelColor }]}>{levelLabel}</Text>
        </View>
      </View>
      <ChevronRight size={16} color={Colors.whiteDim} strokeWidth={1.5} />
    </PressableCard>
  );
}

export default function HealthDashboard({ visible, onClose, onAskGabriel, onNavigate }: HealthDashboardProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(DASHBOARD_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  useEffect(() => {
    if (visible) {
      isAnimating.current = true;
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 65, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start(() => { isAnimating.current = false; });
    } else {
      isAnimating.current = true;
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: DASHBOARD_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => { isAnimating.current = false; });
    }
  }, [visible]);

  if (!visible && !isAnimating.current) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[dashStyles.overlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[dashStyles.panel, { width: DASHBOARD_WIDTH, transform: [{ translateX: slideAnim }], paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
        <View style={dashStyles.header}>
          <Text style={dashStyles.headerTitle}>Health Dashboard</Text>
          <TouchableOpacity style={dashStyles.closeBtn} onPress={onClose} activeOpacity={0.7} testID="close-dashboard-btn">
            <X size={18} color={Colors.whiteDim} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <ScrollView style={dashStyles.content} contentContainerStyle={dashStyles.contentInner} showsVerticalScrollIndicator={false}>
          <View style={{ marginHorizontal: 20, marginTop: 12, gap: 10 }}>
            <MorningCheckInCard onNavigate={onNavigate} onClose={onClose} />
            <WeeklyDigestCard onNavigate={onNavigate} onClose={onClose} />
            <HealthTwinCard onNavigate={onNavigate} onClose={onClose} />
            <CoherenceCard onNavigate={onNavigate} onClose={onClose} />
            <TreatmentIntelligenceCard onNavigate={onNavigate} onClose={onClose} />
            <EnergyIntelligenceCard onNavigate={onNavigate} onClose={onClose} />
            <ConnectHealthCard onNavigate={onNavigate} onClose={onClose} />
          </View>

          <DashboardSection title="Protocol" icon={<Pill size={15} color={Colors.teal} strokeWidth={1.5} />} onAskGabriel={onAskGabriel} askQuestion="How is my supplement protocol going?">
            <ProtocolSection onAskGabriel={onAskGabriel} />
          </DashboardSection>

          <DashboardSection title="Recent Labs" icon={<FileText size={15} color="#E8A838" strokeWidth={1.5} />} onAskGabriel={onAskGabriel} askQuestion="Review my latest lab results and tell me what stands out">
            <LabsSection onAskGabriel={onAskGabriel} />
          </DashboardSection>

          <DashboardSection title="Health Trends" icon={<TrendingUp size={15} color={Colors.teal} strokeWidth={1.5} />} onAskGabriel={onAskGabriel} askQuestion="How have my mood, energy, and sleep been trending?">
            <TrendsSection />
          </DashboardSection>

          <DashboardSection title="Symptom Log" icon={<Activity size={15} color={Colors.softRed} strokeWidth={1.5} />} onAskGabriel={onAskGabriel} askQuestion="Analyze my recent symptoms and suggest what might help">
            <SymptomsSection onAskGabriel={onAskGabriel} />
          </DashboardSection>

          <DashboardSection title="My Practitioners" icon={<MapPin size={15} color="#B8A088" strokeWidth={1.5} />}>
            <PractitionersSection onNavigate={onNavigate} />
          </DashboardSection>

          <TouchableOpacity style={dashStyles.settingsRow} onPress={() => { hapticLight(); onNavigate('/settings'); onClose(); }} activeOpacity={0.7} testID="dashboard-settings">
            <Settings size={16} color={Colors.whiteDim} strokeWidth={1.5} />
            <Text style={dashStyles.settingsText}>Settings</Text>
            <ChevronRight size={14} color={Colors.whiteDim} strokeWidth={1.5} />
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const dashStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  panel: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#091912',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(79, 209, 197, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(79, 209, 197, 0.1)',
  },
  headerTitle: { fontSize: 17, fontFamily: Fonts.regular,
    fontWeight: '400' as const, color: Colors.cream, letterSpacing: 0.5 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255, 255, 255, 0.06)', justifyContent: 'center' as const, alignItems: 'center' as const },
  content: { flex: 1 },
  contentInner: { paddingVertical: 8, paddingBottom: 40 },
  settingsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  settingsText: { flex: 1, fontSize: 14, fontFamily: Fonts.regular,
    fontWeight: '400' as const, color: Colors.whiteMuted, letterSpacing: 0.3 },
});

const dashSectionStyles = StyleSheet.create({
  container: { marginHorizontal: 20, marginTop: 16, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(79, 209, 197, 0.08)', padding: 14, overflow: 'hidden' as const },
  header: { flexDirection: 'row' as const, alignItems: 'center', gap: 8, marginBottom: 12 },
  iconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(79, 209, 197, 0.08)', justifyContent: 'center' as const, alignItems: 'center' as const },
  title: { flex: 1, fontSize: 14, fontFamily: Fonts.medium,
    fontWeight: '500' as const, color: Colors.cream, letterSpacing: 0.3 },
  askCta: { flexDirection: 'row' as const, alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: 'rgba(79, 209, 197, 0.08)', borderWidth: 1, borderColor: 'rgba(79, 209, 197, 0.15)' },
  askCtaText: { fontSize: 11, fontFamily: Fonts.medium,
    fontWeight: '500' as const, color: Colors.teal, letterSpacing: 0.3 },
});

const sectionStyles = StyleSheet.create({
  emptyCard: { alignItems: 'center' as const, paddingVertical: 16, gap: 8 },
  emptyText: { fontSize: 12, fontFamily: Fonts.light,
    fontWeight: '300' as const, color: Colors.whiteDim, letterSpacing: 0.2 },
  askBtn: { flexDirection: 'row' as const, alignItems: 'center', gap: 6, backgroundColor: Colors.teal, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, marginTop: 4 },
  askBtnText: { fontSize: 12, fontFamily: Fonts.semiBold,
    fontWeight: '600' as const, color: Colors.darkBg, letterSpacing: 0.2 },
  complianceRow: { flexDirection: 'row' as const, alignItems: 'center', gap: 10, marginBottom: 12 },
  complianceBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  complianceFill: { height: 4, borderRadius: 2, backgroundColor: Colors.teal },
  compliancePct: { fontSize: 12, fontFamily: Fonts.medium,
    fontWeight: '500' as const, color: Colors.teal, letterSpacing: 0.2, minWidth: 36, textAlign: 'right' as const },
  timeBlock: { marginBottom: 10 },
  timeBlockHeader: { flexDirection: 'row' as const, alignItems: 'center', gap: 6, marginBottom: 6 },
  timeBlockLabel: { flex: 1, fontSize: 12, fontFamily: Fonts.medium,
    fontWeight: '500' as const, color: Colors.cream, letterSpacing: 0.3 },
  timeBlockCount: { fontSize: 11, fontFamily: Fonts.light,
    fontWeight: '300' as const, color: Colors.whiteDim },
  supplementRow: { flexDirection: 'row' as const, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.02)', marginBottom: 3 },
  supplementName: { fontSize: 13, fontFamily: Fonts.regular,
    fontWeight: '400' as const, color: Colors.whiteMuted, letterSpacing: 0.2 },
  supplementDosage: { fontSize: 11, fontFamily: Fonts.light,
    fontWeight: '300' as const, color: Colors.whiteDim },
  labGrid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 6 },
  labChip: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row' as const, alignItems: 'center', gap: 5 },
  labChipName: { fontSize: 11, fontFamily: Fonts.medium,
    fontWeight: '500' as const, letterSpacing: 0.2 },
  labChipValue: { fontSize: 11, fontFamily: Fonts.light,
    fontWeight: '300' as const, color: Colors.whiteMuted },
  trendsGrid: { flexDirection: 'row' as const, justifyContent: 'space-between', gap: 8 },
  trendItem: { flex: 1, alignItems: 'center' as const, gap: 4 },
  trendEmoji: { fontSize: 20 },
  trendValue: { fontSize: 18, fontFamily: Fonts.light,
    fontWeight: '300' as const, color: Colors.cream, letterSpacing: -0.5 },
  trendLabel: { fontSize: 10, fontFamily: Fonts.light,
    fontWeight: '300' as const, color: Colors.whiteDim, letterSpacing: 0.3 },
  miniBar: { width: '80%' as unknown as number, height: 3, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.06)', marginTop: 2 },
  miniBarFill: { height: 3, borderRadius: 2, backgroundColor: Colors.teal },
  symptomRow: { flexDirection: 'row' as const, alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255, 255, 255, 0.04)' },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  symptomInfo: { flex: 1, gap: 2 },
  symptomName: { fontSize: 13, fontFamily: Fonts.regular,
    fontWeight: '400' as const, color: Colors.cream, letterSpacing: 0.2 },
  symptomRegion: { fontSize: 11, fontFamily: Fonts.light,
    fontWeight: '300' as const, color: Colors.whiteDim },
  practitionerRow: { flexDirection: 'row' as const, alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255, 255, 255, 0.04)' },
  practitionerAvatar: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(184, 160, 136, 0.1)', justifyContent: 'center' as const, alignItems: 'center' as const },
  practitionerInfo: { flex: 1, gap: 2 },
  practitionerName: { fontSize: 13, fontFamily: Fonts.regular,
    fontWeight: '400' as const, color: Colors.cream, letterSpacing: 0.2 },
  practitionerSpecialty: { fontSize: 11, fontFamily: Fonts.light,
    fontWeight: '300' as const, color: Colors.whiteDim },
  connectionStatusContainer: { position: 'relative' as const, justifyContent: 'center' as const, alignItems: 'center' as const },
  connectionGlow: { position: 'absolute' as const, width: 16, height: 16, borderRadius: 8 },
  connectionDot: { width: 10, height: 10, borderRadius: 5 },
  lastSyncText: { fontSize: 10, fontFamily: Fonts.light,
    fontWeight: '300' as const, color: Colors.teal, letterSpacing: 0.2, marginTop: 1 },
  pendingText: { fontSize: 10, fontFamily: Fonts.medium,
    fontWeight: '500' as const, color: Colors.gold, letterSpacing: 0.3, marginTop: 1 },
});

const morningCheckInCardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: 'rgba(79, 209, 197, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.12)',
    padding: 16,
    gap: 12,
  },
  left: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(79, 209, 197, 0.12)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  right: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.cream,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.whiteMuted,
    letterSpacing: 0.2,
  },
});

const weeklyDigestCardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: 'rgba(79, 209, 197, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.12)',
    padding: 16,
    gap: 12,
  },
  left: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(79, 209, 197, 0.12)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  right: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.cream,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.whiteMuted,
    letterSpacing: 0.2,
  },
});

const twinCardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: 'rgba(79, 209, 197, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.12)',
    padding: 14,
    gap: 14,
  },
  left: {
    width: 48,
    height: 56,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  silhouetteWrap: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  silhouetteGlow: {
    position: 'absolute' as const,
    width: 44,
    height: 54,
    borderRadius: 22,
    backgroundColor: 'rgba(79, 209, 197, 0.15)',
  },
  silhouette: {
    alignItems: 'center' as const,
    gap: 2,
  },
  silHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#4FD1C5',
    opacity: 0.6,
  },
  silBody: {
    width: 16,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#4FD1C5',
    opacity: 0.5,
    borderTopWidth: 0,
  },
  silLegs: {
    flexDirection: 'row' as const,
    gap: 3,
  },
  silLeg: {
    width: 5,
    height: 14,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#4FD1C5',
    opacity: 0.4,
    borderTopWidth: 0,
  },
  right: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.cream,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: Colors.whiteDim,
    letterSpacing: 0.2,
  },
  scoreRow: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    gap: 6,
    marginTop: 2,
  },
  scoreNum: {
    fontSize: 20,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    letterSpacing: -0.5,
  },
  scoreLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
  },
});

const connectCardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: 'rgba(79, 209, 197, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.08)',
    padding: 14,
    gap: 14,
  },
  left: {
    width: 48,
    height: 48,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 209, 197, 0.1)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.15)',
  },
  right: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.cream,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: Colors.whiteDim,
    letterSpacing: 0.2,
  },
});


const coherenceCardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: 'rgba(124, 111, 212, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 111, 212, 0.12)',
    padding: 14,
    gap: 14,
  },
  left: {
    width: 48,
    height: 56,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  iconWrap: {
    width: 40,
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  iconOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
  },
  right: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.cream,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: Colors.whiteDim,
    letterSpacing: 0.2,
  },
  scoreRow: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    gap: 6,
    marginTop: 2,
  },
  scoreNum: {
    fontSize: 20,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    letterSpacing: -0.5,
  },
  scoreLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
  },
});

const energyCardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: 'rgba(79, 209, 197, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.08)',
    padding: 14,
    gap: 14,
  },
  left: {
    width: 48,
    height: 48,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 209, 197, 0.1)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.15)',
  },
  emoji: {
    fontSize: 20,
  },
  right: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.cream,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: Colors.whiteDim,
    letterSpacing: 0.2,
  },
});

const treatmentCardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: 'rgba(79, 209, 197, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.08)',
    padding: 14,
    gap: 14,
  },
  left: {
    width: 48,
    height: 48,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 209, 197, 0.1)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.15)',
  },
  emoji: {
    fontSize: 20,
  },
  right: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.cream,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: Colors.whiteDim,
    letterSpacing: 0.2,
  },
  statusRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.teal,
  },
  activeText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.teal,
    letterSpacing: 0.2,
  },
});
