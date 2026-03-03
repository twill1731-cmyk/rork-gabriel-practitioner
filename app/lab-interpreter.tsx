import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Send,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  ChevronRight,
  Trash2,
} from 'lucide-react-native';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { hapticLight, hapticSuccess } from '../utils/haptics';

type LabMarker = {
  id: string;
  name: string;
  value: string;
  unit: string;
  standardLow: number;
  standardHigh: number;
  optimalLow: number;
  optimalHigh: number;
  status: 'optimal' | 'standard' | 'low' | 'high' | 'critical';
};

type PatternFlag = {
  title: string;
  description: string;
  markers: string[];
  severity: 'info' | 'warning' | 'critical';
};

// Common lab panels
const LAB_PANELS: { name: string; markers: Omit<LabMarker, 'id' | 'value' | 'status'>[] }[] = [
  {
    name: 'Thyroid Panel',
    markers: [
      { name: 'TSH', unit: 'mIU/L', standardLow: 0.4, standardHigh: 4.5, optimalLow: 1.0, optimalHigh: 2.5 },
      { name: 'Free T4', unit: 'ng/dL', standardLow: 0.8, standardHigh: 1.8, optimalLow: 1.0, optimalHigh: 1.5 },
      { name: 'Free T3', unit: 'pg/mL', standardLow: 2.3, standardHigh: 4.2, optimalLow: 3.0, optimalHigh: 3.8 },
      { name: 'TPO Antibodies', unit: 'IU/mL', standardLow: 0, standardHigh: 35, optimalLow: 0, optimalHigh: 15 },
      { name: 'Reverse T3', unit: 'ng/dL', standardLow: 9.2, standardHigh: 24.1, optimalLow: 9.2, optimalHigh: 18 },
    ],
  },
  {
    name: 'Metabolic Panel',
    markers: [
      { name: 'Fasting Glucose', unit: 'mg/dL', standardLow: 70, standardHigh: 100, optimalLow: 75, optimalHigh: 90 },
      { name: 'HbA1c', unit: '%', standardLow: 4.0, standardHigh: 5.6, optimalLow: 4.5, optimalHigh: 5.2 },
      { name: 'Fasting Insulin', unit: 'μIU/mL', standardLow: 2.6, standardHigh: 24.9, optimalLow: 3, optimalHigh: 8 },
      { name: 'Homocysteine', unit: 'μmol/L', standardLow: 5, standardHigh: 15, optimalLow: 5, optimalHigh: 8 },
      { name: 'hs-CRP', unit: 'mg/L', standardLow: 0, standardHigh: 3.0, optimalLow: 0, optimalHigh: 1.0 },
    ],
  },
  {
    name: 'Iron Panel',
    markers: [
      { name: 'Ferritin', unit: 'ng/mL', standardLow: 12, standardHigh: 150, optimalLow: 50, optimalHigh: 100 },
      { name: 'Serum Iron', unit: 'μg/dL', standardLow: 60, standardHigh: 170, optimalLow: 80, optimalHigh: 120 },
      { name: 'TIBC', unit: 'μg/dL', standardLow: 250, standardHigh: 370, optimalLow: 250, optimalHigh: 325 },
      { name: 'Iron Saturation', unit: '%', standardLow: 20, standardHigh: 50, optimalLow: 25, optimalHigh: 40 },
    ],
  },
  {
    name: 'Vitamin Panel',
    markers: [
      { name: 'Vitamin D (25-OH)', unit: 'ng/mL', standardLow: 30, standardHigh: 100, optimalLow: 50, optimalHigh: 80 },
      { name: 'Vitamin B12', unit: 'pg/mL', standardLow: 200, standardHigh: 900, optimalLow: 500, optimalHigh: 800 },
      { name: 'Folate', unit: 'ng/mL', standardLow: 2.7, standardHigh: 17, optimalLow: 10, optimalHigh: 17 },
      { name: 'Magnesium (RBC)', unit: 'mg/dL', standardLow: 4.2, standardHigh: 6.8, optimalLow: 5.5, optimalHigh: 6.5 },
    ],
  },
];

function getStatus(value: number, marker: Omit<LabMarker, 'id' | 'value' | 'status'>): LabMarker['status'] {
  if (value < marker.standardLow * 0.7 || value > marker.standardHigh * 1.3) return 'critical';
  if (value < marker.standardLow || value > marker.standardHigh) return 'high';
  if (value >= marker.optimalLow && value <= marker.optimalHigh) return 'optimal';
  return 'standard';
}

function detectPatterns(markers: LabMarker[]): PatternFlag[] {
  const patterns: PatternFlag[] = [];
  const byName: Record<string, LabMarker> = {};
  markers.forEach(m => { byName[m.name] = m; });

  // Thyroid conversion issue
  if (byName['Free T4'] && byName['Free T3']) {
    const t4 = parseFloat(byName['Free T4'].value);
    const t3 = parseFloat(byName['Free T3'].value);
    if (t4 > 1.2 && t3 < 3.0) {
      patterns.push({
        title: 'T4 to T3 Conversion Issue',
        description: 'Free T4 is adequate but Free T3 is suboptimal, suggesting poor conversion. Consider selenium, zinc, and checking iron/cortisol.',
        markers: ['Free T4', 'Free T3'],
        severity: 'warning',
      });
    }
  }

  // Insulin resistance pattern
  if (byName['Fasting Glucose'] && byName['Fasting Insulin']) {
    const glucose = parseFloat(byName['Fasting Glucose'].value);
    const insulin = parseFloat(byName['Fasting Insulin'].value);
    if (glucose > 85 && insulin > 8) {
      patterns.push({
        title: 'Early Insulin Resistance',
        description: 'Glucose and insulin are both trending high. HOMA-IR likely elevated. Consider berberine, chromium, and dietary intervention.',
        markers: ['Fasting Glucose', 'Fasting Insulin'],
        severity: 'warning',
      });
    }
  }

  // Inflammation + low iron
  if (byName['hs-CRP'] && byName['Ferritin']) {
    const crp = parseFloat(byName['hs-CRP'].value);
    const ferritin = parseFloat(byName['Ferritin'].value);
    if (crp > 1.5 && ferritin > 150) {
      patterns.push({
        title: 'Elevated Ferritin May Be Inflammatory',
        description: 'High ferritin with elevated CRP suggests ferritin is acting as an acute phase reactant. True iron status may be lower than ferritin suggests.',
        markers: ['hs-CRP', 'Ferritin'],
        severity: 'info',
      });
    }
  }

  // Autoimmune thyroid
  if (byName['TPO Antibodies']) {
    const tpo = parseFloat(byName['TPO Antibodies'].value);
    if (tpo > 15) {
      patterns.push({
        title: 'Elevated Thyroid Antibodies',
        description: tpo > 35
          ? 'TPO antibodies above standard range. Hashimoto\'s thyroiditis likely. Consider selenium 200mcg, gluten elimination trial, and gut assessment.'
          : 'TPO antibodies within range but above optimal. Monitor quarterly. Consider autoimmune prevention protocol.',
        markers: ['TPO Antibodies'],
        severity: tpo > 35 ? 'warning' : 'info',
      });
    }
  }

  return patterns;
}

const STATUS_COLORS: Record<string, string> = {
  optimal: Colors.green,
  standard: Colors.textSecondary,
  low: Colors.amber,
  high: Colors.amber,
  critical: Colors.softRed,
};

const STATUS_LABELS: Record<string, string> = {
  optimal: 'Optimal',
  standard: 'Standard',
  low: 'Low',
  high: 'Out of Range',
  critical: 'Critical',
};

function RangeBar({ marker }: { marker: LabMarker }) {
  const value = parseFloat(marker.value);
  if (isNaN(value)) return null;

  const totalRange = marker.standardHigh * 1.5;
  const valuePos = Math.min(Math.max((value / totalRange) * 100, 2), 98);
  const optimalStart = (marker.optimalLow / totalRange) * 100;
  const optimalWidth = ((marker.optimalHigh - marker.optimalLow) / totalRange) * 100;

  return (
    <View style={styles.rangeBar}>
      <View style={styles.rangeTrack}>
        <View style={[styles.optimalZone, { left: `${optimalStart}%`, width: `${optimalWidth}%` }]} />
        <View style={[styles.valueMarker, { left: `${valuePos}%`, backgroundColor: STATUS_COLORS[marker.status] }]} />
      </View>
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabelText}>{marker.standardLow}</Text>
        <Text style={[styles.rangeLabelText, { color: Colors.green }]}>Optimal: {marker.optimalLow}-{marker.optimalHigh}</Text>
        <Text style={styles.rangeLabelText}>{marker.standardHigh}</Text>
      </View>
    </View>
  );
}

function MarkerCard({ marker, onRemove }: { marker: LabMarker; onRemove: () => void }) {
  const color = STATUS_COLORS[marker.status];

  return (
    <View style={[styles.markerCard, marker.status === 'critical' && styles.markerCardCritical]}>
      <View style={styles.markerHeader}>
        <View style={styles.markerLeft}>
          <Text style={styles.markerName}>{marker.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: color + '18' }]}>
            <Text style={[styles.statusText, { color }]}>{STATUS_LABELS[marker.status]}</Text>
          </View>
        </View>
        <View style={styles.markerRight}>
          <Text style={[styles.markerValue, { color }]}>{marker.value}</Text>
          <Text style={styles.markerUnit}>{marker.unit}</Text>
        </View>
      </View>
      <RangeBar marker={marker} />
    </View>
  );
}

function PatternCard({ pattern }: { pattern: PatternFlag }) {
  const colors = {
    info: { bg: Colors.blueBg, border: 'rgba(59, 123, 192, 0.2)', text: Colors.blue, icon: <Sparkles size={16} color={Colors.blue} strokeWidth={2} /> },
    warning: { bg: Colors.amberBg, border: 'rgba(212, 133, 28, 0.2)', text: Colors.amber, icon: <AlertTriangle size={16} color={Colors.amber} strokeWidth={2} /> },
    critical: { bg: Colors.softRedBg, border: 'rgba(201, 74, 74, 0.2)', text: Colors.softRed, icon: <AlertTriangle size={16} color={Colors.softRed} strokeWidth={2} /> },
  };
  const c = colors[pattern.severity];

  return (
    <View style={[styles.patternCard, { backgroundColor: c.bg, borderColor: c.border }]}>
      <View style={styles.patternHeader}>
        {c.icon}
        <Text style={[styles.patternTitle, { color: c.text }]}>{pattern.title}</Text>
      </View>
      <Text style={styles.patternDesc}>{pattern.description}</Text>
      <View style={styles.patternMarkers}>
        {pattern.markers.map(m => (
          <Text key={m} style={[styles.patternMarkerTag, { color: c.text }]}>{m}</Text>
        ))}
      </View>
    </View>
  );
}

export default function LabInterpreterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const patientName = (params.patient as string) || 'Patient';

  const [markers, setMarkers] = useState<LabMarker[]>([]);
  const [patterns, setPatterns] = useState<PatternFlag[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [showPanels, setShowPanels] = useState(true);
  const [gabrielQuery, setGabrielQuery] = useState('');
  const [gabrielResponse, setGabrielResponse] = useState('');

  const selectPanel = useCallback((panelName: string) => {
    hapticLight();
    const panel = LAB_PANELS.find(p => p.name === panelName);
    if (!panel) return;

    const newMarkers: LabMarker[] = panel.markers.map((m, i) => ({
      id: `marker-${Date.now()}-${i}`,
      ...m,
      value: '',
      status: 'standard' as const,
    }));

    setMarkers(prev => [...prev, ...newMarkers]);
    setSelectedPanel(panelName);
    setShowPanels(false);
  }, []);

  const updateMarkerValue = useCallback((id: string, value: string) => {
    setMarkers(prev => {
      const updated = prev.map(m => {
        if (m.id !== id) return m;
        const numVal = parseFloat(value);
        const status = isNaN(numVal) ? 'standard' as const : getStatus(numVal, m);
        return { ...m, value, status };
      });

      // Detect patterns
      const filled = updated.filter(m => m.value !== '');
      setPatterns(detectPatterns(filled));

      return updated;
    });
  }, []);

  const removeMarker = useCallback((id: string) => {
    hapticLight();
    setMarkers(prev => {
      const updated = prev.filter(m => m.id !== id);
      const filled = updated.filter(m => m.value !== '');
      setPatterns(detectPatterns(filled));
      return updated;
    });
  }, []);

  const handleGabrielQuery = useCallback(() => {
    if (!gabrielQuery.trim()) return;
    hapticLight();

    setTimeout(() => {
      const filledMarkers = markers.filter(m => m.value !== '');
      const outOfRange = filledMarkers.filter(m => m.status !== 'optimal' && m.status !== 'standard');

      let response = "Based on the markers entered, here's my analysis:\n\n";

      if (outOfRange.length > 0) {
        response += `${outOfRange.length} marker${outOfRange.length > 1 ? 's' : ''} outside optimal range:\n`;
        outOfRange.forEach(m => {
          response += `\n• ${m.name}: ${m.value} ${m.unit} (optimal: ${m.optimalLow}-${m.optimalHigh})`;
        });
        response += "\n\n";
      }

      if (patterns.length > 0) {
        response += `I've detected ${patterns.length} pattern${patterns.length > 1 ? 's' : ''} worth noting (see cards above).\n\n`;
      }

      response += "Recommended follow-up testing:\n• Retest flagged markers in 6-8 weeks\n• Consider adding markers not yet tested that relate to the patterns above";

      setGabrielResponse(response);
    }, 1000);

    setGabrielQuery('');
  }, [gabrielQuery, markers, patterns]);

  const optimalCount = markers.filter(m => m.value && m.status === 'optimal').length;
  const outOfRangeCount = markers.filter(m => m.value && (m.status === 'high' || m.status === 'critical' || m.status === 'low')).length;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Lab Interpreter</Text>
          <Text style={styles.headerSubtitle}>for {patientName}</Text>
        </View>
        <View style={styles.headerStats}>
          {optimalCount > 0 && (
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatNum, { color: Colors.green }]}>{optimalCount}</Text>
              <Text style={styles.miniStatLabel}>optimal</Text>
            </View>
          )}
          {outOfRangeCount > 0 && (
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatNum, { color: Colors.amber }]}>{outOfRangeCount}</Text>
              <Text style={styles.miniStatLabel}>flagged</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Panel selector */}
        {showPanels && (
          <View style={styles.panelSection}>
            <Text style={styles.sectionTitle}>Select a lab panel</Text>
            {LAB_PANELS.map((panel) => (
              <TouchableOpacity
                key={panel.name}
                style={styles.panelCard}
                onPress={() => selectPanel(panel.name)}
                activeOpacity={0.7}
              >
                <FileText size={18} color={Colors.teal} strokeWidth={2} />
                <View style={styles.panelInfo}>
                  <Text style={styles.panelName}>{panel.name}</Text>
                  <Text style={styles.panelMarkerCount}>{panel.markers.length} markers</Text>
                </View>
                <ChevronRight size={18} color={Colors.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addMorePanel}
              onPress={() => { hapticLight(); setShowPanels(false); }}
            >
              <Plus size={16} color={Colors.teal} strokeWidth={2} />
              <Text style={styles.addMoreText}>Add individual marker</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pattern flags */}
        {patterns.length > 0 && (
          <View style={styles.patternsSection}>
            <Text style={styles.sectionTitle}>🧠 Gabriel's Pattern Analysis</Text>
            {patterns.map((pattern, i) => (
              <PatternCard key={i} pattern={pattern} />
            ))}
          </View>
        )}

        {/* Marker inputs */}
        {markers.length > 0 && (
          <View style={styles.markersSection}>
            <Text style={styles.sectionTitle}>Lab Results</Text>
            <Text style={styles.sectionDesc}>Enter values to see optimal vs standard range analysis</Text>
            {markers.map((marker) => (
              <View key={marker.id} style={styles.markerInputRow}>
                <View style={styles.markerInputLeft}>
                  <Text style={styles.markerInputName}>{marker.name}</Text>
                  <Text style={styles.markerInputUnit}>{marker.unit}</Text>
                </View>
                <TextInput
                  style={[styles.markerInput, marker.value && { borderColor: STATUS_COLORS[marker.status] }]}
                  placeholder="Value"
                  placeholderTextColor={Colors.textTertiary}
                  value={marker.value}
                  onChangeText={(v) => updateMarkerValue(marker.id, v)}
                  keyboardType="decimal-pad"
                />
                {marker.value ? (
                  <View style={[styles.miniStatusBadge, { backgroundColor: STATUS_COLORS[marker.status] + '18' }]}>
                    <Text style={[styles.miniStatusText, { color: STATUS_COLORS[marker.status] }]}>
                      {marker.status === 'optimal' ? '✓' : marker.status === 'critical' ? '!' : '~'}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}

            {/* Show filled marker cards */}
            {markers.filter(m => m.value !== '').map(m => (
              <MarkerCard key={`card-${m.id}`} marker={m} onRemove={() => removeMarker(m.id)} />
            ))}
          </View>
        )}

        {/* Add more panels */}
        {!showPanels && (
          <TouchableOpacity
            style={styles.addPanelBtn}
            onPress={() => setShowPanels(true)}
            activeOpacity={0.7}
          >
            <Plus size={16} color={Colors.teal} strokeWidth={2} />
            <Text style={styles.addPanelBtnText}>Add another panel</Text>
          </TouchableOpacity>
        )}

        {/* Ask Gabriel */}
        {markers.filter(m => m.value).length > 0 && (
          <View style={styles.gabrielSection}>
            <View style={styles.gabrielHeader}>
              <Sparkles size={16} color={Colors.teal} strokeWidth={2} />
              <Text style={styles.gabrielTitle}>Ask Gabriel about these results</Text>
            </View>
            <View style={styles.gabrielInputRow}>
              <TextInput
                style={styles.gabrielInput}
                placeholder="What should I look at? Any concerns?"
                placeholderTextColor={Colors.textTertiary}
                value={gabrielQuery}
                onChangeText={setGabrielQuery}
                onSubmitEditing={handleGabrielQuery}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.gabrielSendBtn, !gabrielQuery.trim() && styles.gabrielSendBtnDisabled]}
                onPress={handleGabrielQuery}
                disabled={!gabrielQuery.trim()}
              >
                <Send size={16} color={gabrielQuery.trim() ? Colors.textInverse : Colors.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            {gabrielResponse ? (
              <View style={styles.gabrielResponse}>
                <Text style={styles.gabrielResponseText}>{gabrielResponse}</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 17, fontFamily: Fonts.semiBold, color: Colors.text, letterSpacing: 0.2 },
  headerSubtitle: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textTertiary },
  headerStats: { flexDirection: 'row', gap: 12 },
  miniStat: { alignItems: 'center' },
  miniStatNum: { fontSize: 16, fontFamily: Fonts.bold },
  miniStatLabel: { fontSize: 9, fontFamily: Fonts.regular, color: Colors.textTertiary, letterSpacing: 0.3 },
  content: { flex: 1 },
  contentInner: { padding: 16, paddingBottom: 40, gap: 16 },
  sectionTitle: { fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.text, letterSpacing: 0.2, marginBottom: 4 },
  sectionDesc: { fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary, marginBottom: 8 },
  // Panels
  panelSection: { gap: 8 },
  panelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  panelInfo: { flex: 1 },
  panelName: { fontSize: 15, fontFamily: Fonts.medium, color: Colors.text },
  panelMarkerCount: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textTertiary, marginTop: 2 },
  addMorePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  addMoreText: { fontSize: 14, fontFamily: Fonts.medium, color: Colors.teal },
  // Patterns
  patternsSection: { gap: 10 },
  patternCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  patternHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  patternTitle: { fontSize: 14, fontFamily: Fonts.semiBold, letterSpacing: 0.2 },
  patternDesc: { fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 19 },
  patternMarkers: { flexDirection: 'row', gap: 6 },
  patternMarkerTag: { fontSize: 11, fontFamily: Fonts.medium, letterSpacing: 0.3 },
  // Marker inputs
  markersSection: { gap: 10 },
  markerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  markerInputLeft: { flex: 1 },
  markerInputName: { fontSize: 14, fontFamily: Fonts.medium, color: Colors.text },
  markerInputUnit: { fontSize: 11, fontFamily: Fonts.regular, color: Colors.textTertiary, marginTop: 1 },
  markerInput: {
    width: 80,
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  miniStatusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniStatusText: { fontSize: 12, fontFamily: Fonts.bold },
  // Marker cards
  markerCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
  },
  markerCardCritical: { borderColor: 'rgba(201, 74, 74, 0.3)' },
  markerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  markerLeft: { flex: 1, gap: 4 },
  markerName: { fontSize: 14, fontFamily: Fonts.medium, color: Colors.text },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontFamily: Fonts.semiBold, letterSpacing: 0.3 },
  markerRight: { alignItems: 'flex-end' },
  markerValue: { fontSize: 20, fontFamily: Fonts.bold },
  markerUnit: { fontSize: 11, fontFamily: Fonts.regular, color: Colors.textTertiary },
  // Range bar
  rangeBar: { gap: 4 },
  rangeTrack: {
    height: 8,
    backgroundColor: Colors.bgTertiary,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  optimalZone: {
    position: 'absolute',
    height: '100%',
    backgroundColor: Colors.greenBg,
    borderRadius: 4,
  },
  valueMarker: {
    position: 'absolute',
    width: 4,
    height: 12,
    borderRadius: 2,
    top: -2,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeLabelText: { fontSize: 10, fontFamily: Fonts.regular, color: Colors.textTertiary },
  // Add panel
  addPanelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.tealBg,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.tealLight,
  },
  addPanelBtnText: { fontSize: 14, fontFamily: Fonts.medium, color: Colors.teal },
  // Gabriel
  gabrielSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.tealLight,
    gap: 10,
  },
  gabrielHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gabrielTitle: { fontSize: 15, fontFamily: Fonts.semiBold, color: Colors.text, letterSpacing: 0.2 },
  gabrielInputRow: { flexDirection: 'row', gap: 8 },
  gabrielInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.text,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gabrielSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gabrielSendBtnDisabled: { backgroundColor: Colors.bgTertiary },
  gabrielResponse: {
    backgroundColor: Colors.tealBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.tealLight,
  },
  gabrielResponseText: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.text, lineHeight: 21 },
});
