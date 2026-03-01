import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  AlertCircle,
} from 'lucide-react-native';
import Colors from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { usePractitioner } from '../../../contexts/PractitionerContext';
import { hapticLight } from '../../../utils/haptics';
import type { Patient, PractitionerMessage } from '../../../constants/practitioner-data';

type FilterStatus = 'all' | 'active' | 'review' | 'new' | 'inactive';

const FILTER_OPTIONS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Review', value: 'review' },
  { label: 'New', value: 'new' },
  { label: 'Inactive', value: 'inactive' },
];

function PatientCard({ patient, onPress, unreadMessages }: { patient: Patient; onPress: () => void; unreadMessages: number }) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: Colors.greenBg, text: Colors.green },
    review: { bg: Colors.amberBg, text: Colors.amber },
    new: { bg: Colors.blueBg, text: Colors.blue },
    inactive: { bg: Colors.bgTertiary, text: Colors.textTertiary },
  };
  const statusStyle = statusColors[patient.status] || statusColors.active;
  const hasAlerts = patient.alerts.filter(a => !a.read).length > 0;

  return (
    <TouchableOpacity style={styles.patientCard} onPress={onPress} activeOpacity={0.6} testID={`patient-${patient.id}`}>
      <View style={styles.patientCardTop}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{patient.avatar}</Text>
          {hasAlerts && <View style={styles.alertDot} />}
          {unreadMessages > 0 && (
            <View style={styles.msgBadge}>
              <Text style={styles.msgBadgeText}>{unreadMessages}</Text>
            </View>
          )}
        </View>
        <View style={styles.patientInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.conditions}>{patient.primaryConditions.join(' · ')}</Text>
          <View style={styles.patientMeta}>
            <Text style={styles.metaText}>{patient.age}{patient.sex === 'F' ? 'F' : 'M'} · {patient.protocolCount} supplements</Text>
          </View>
        </View>
      </View>
      <View style={styles.patientCardBottom}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Health Score</Text>
          <View style={styles.metricValueRow}>
            <Text style={[styles.metricValue, {
              color: patient.healthScore >= 70 ? Colors.green : patient.healthScore >= 50 ? Colors.amber : Colors.softRed,
            }]}>{patient.healthScore}</Text>
            {patient.healthScoreDelta !== 0 && (
              <View style={styles.deltaWrap}>
                {patient.healthScoreDelta > 0 ? (
                  <TrendingUp size={10} color={Colors.green} strokeWidth={2} />
                ) : (
                  <TrendingDown size={10} color={Colors.softRed} strokeWidth={2} />
                )}
                <Text style={[styles.deltaText, {
                  color: patient.healthScoreDelta > 0 ? Colors.green : Colors.softRed,
                }]}>{patient.healthScoreDelta > 0 ? '+' : ''}{patient.healthScoreDelta}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Compliance</Text>
          <Text style={[styles.metricValue, {
            color: patient.complianceRate >= 85 ? Colors.green : patient.complianceRate >= 70 ? Colors.amber : Colors.softRed,
          }]}>{patient.complianceRate}%</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Last Visit</Text>
          <Text style={styles.metricValueDate}>{formatShortDate(patient.lastVisit)}</Text>
        </View>
        <ChevronRight size={16} color={Colors.textTertiary} strokeWidth={1.5} />
      </View>
    </TouchableOpacity>
  );
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PatientsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { patients, searchPatients, messages } = usePractitioner();

  const unreadByPatient = useMemo(() => {
    const map = new Map<string, number>();
    messages.forEach((m: PractitionerMessage) => {
      if (m.unreadCount > 0) map.set(m.patientId, m.unreadCount);
    });
    return map;
  }, [messages]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const filteredPatients = useMemo(() => {
    let result = searchQuery ? searchPatients(searchQuery) : patients;
    if (activeFilter !== 'all') {
      result = result.filter(p => p.status === activeFilter);
    }
    return result.sort((a, b) => {
      const statusOrder: Record<string, number> = { review: 0, new: 1, active: 2, inactive: 3 };
      return (statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2);
    });
  }, [patients, searchQuery, activeFilter, searchPatients]);

  const handlePatientPress = useCallback((id: string) => {
    hapticLight();
    router.push(`/patient/${id}` as never);
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>Patients</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => hapticLight()} activeOpacity={0.7}>
          <Plus size={20} color={Colors.teal} strokeWidth={2} />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textTertiary} strokeWidth={1.8} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients, conditions..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="patient-search"
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.filterChip, activeFilter === opt.value && styles.filterChipActive]}
            onPress={() => { hapticLight(); setActiveFilter(opt.value); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, activeFilter === opt.value && styles.filterChipTextActive]}>
              {opt.label}
            </Text>
            {opt.value !== 'all' && (
              <Text style={[styles.filterCount, activeFilter === opt.value && styles.filterCountActive]}>
                {patients.filter(p => p.status === opt.value).length}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredPatients.length === 0 ? (
          <View style={styles.emptyState}>
            <AlertCircle size={32} color={Colors.textTertiary} strokeWidth={1.2} />
            <Text style={styles.emptyTitle}>No patients found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          filteredPatients.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onPress={() => handlePatientPress(patient.id)}
              unreadMessages={unreadByPatient.get(patient.id) ?? 0}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.tealBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchWrap: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.text,
    padding: 0,
  },
  filterScroll: {
    maxHeight: 44,
    marginBottom: 12,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  filterCount: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
  },
  filterCountActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  patientCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  patientCardTop: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  avatarText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  alertDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.softRed,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  msgBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  msgBadgeText: {
    fontSize: 9,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  patientInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  patientName: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },
  conditions: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  patientMeta: {
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
  },
  patientCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg + '80',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.textTertiary,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    fontWeight: '700' as const,
  },
  metricValueDate: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  deltaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  deltaText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
  },
});
