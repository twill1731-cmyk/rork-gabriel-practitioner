import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Users,
  FlaskConical,
  Activity,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import Colors from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { usePractitioner } from '../../../contexts/PractitionerContext';
import { hapticLight } from '../../../utils/haptics';
import type { Appointment, PatientAlert } from '../../../constants/practitioner-data';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

function StatCard({ label, value, icon, trend, color }: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.96, friction: 8, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={[styles.statCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.statCardInner}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.statIconWrap, { backgroundColor: color + '14' }]}>
          {icon}
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <View style={styles.statLabelRow}>
          <Text style={styles.statLabel}>{label}</Text>
          {trend !== undefined && trend !== 0 && (
            <View style={styles.trendBadge}>
              {trend > 0 ? (
                <TrendingUp size={10} color={Colors.green} strokeWidth={2} />
              ) : (
                <TrendingDown size={10} color={Colors.softRed} strokeWidth={2} />
              )}
              <Text style={[styles.trendText, { color: trend > 0 ? Colors.green : Colors.softRed }]}>
                {trend > 0 ? '+' : ''}{trend}%
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function AppointmentRow({ appointment, onPress }: { appointment: Appointment; onPress: () => void }) {
  const typeColors: Record<string, string> = {
    'initial': Colors.blue,
    'follow-up': Colors.teal,
    'lab-review': Colors.amber,
    'protocol-review': Colors.gold,
  };
  const typeLabels: Record<string, string> = {
    'initial': 'Initial',
    'follow-up': 'Follow-up',
    'lab-review': 'Lab Review',
    'protocol-review': 'Protocol Review',
  };
  const color = typeColors[appointment.type] || Colors.teal;

  return (
    <TouchableOpacity style={styles.appointmentRow} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.appointmentTime}>
        <Text style={styles.appointmentTimeText}>{appointment.time}</Text>
        <Text style={styles.appointmentDuration}>{appointment.duration}min</Text>
      </View>
      <View style={[styles.appointmentDivider, { backgroundColor: color }]} />
      <View style={styles.appointmentInfo}>
        <Text style={styles.appointmentName}>{appointment.patientName}</Text>
        <View style={styles.appointmentMeta}>
          <View style={[styles.appointmentTypeBadge, { backgroundColor: color + '14' }]}>
            <Text style={[styles.appointmentTypeText, { color }]}>{typeLabels[appointment.type]}</Text>
          </View>
          {appointment.notes && (
            <Text style={styles.appointmentNotes} numberOfLines={1}>{appointment.notes}</Text>
          )}
        </View>
      </View>
      <ChevronRight size={16} color={Colors.textTertiary} strokeWidth={1.5} />
    </TouchableOpacity>
  );
}

function AlertRow({ alert, onPress }: { alert: PatientAlert; onPress: () => void }) {
  const severityColors: Record<string, string> = {
    'info': Colors.blue,
    'warning': Colors.amber,
    'critical': Colors.softRed,
  };
  const color = severityColors[alert.severity] || Colors.blue;
  const patient = usePractitioner().getPatient(alert.patientId);

  return (
    <TouchableOpacity style={styles.alertRow} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.alertDot, { backgroundColor: color }]} />
      <View style={styles.alertInfo}>
        <Text style={styles.alertTitle}>{alert.title}</Text>
        <Text style={styles.alertDesc} numberOfLines={1}>{patient?.name} — {alert.description}</Text>
      </View>
      <ChevronRight size={14} color={Colors.textTertiary} strokeWidth={1.5} />
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { stats, appointments, unreadAlerts, patients } = usePractitioner();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const greeting = useMemo(() => getGreeting(), []);
  const today = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, []);

  const needsReview = useMemo(() => {
    return patients.filter(p => p.status === 'review');
  }, [patients]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerLeft}>
          <View style={styles.gabrielMark}>
            <Sparkles size={16} color={Colors.gold} strokeWidth={1.8} />
          </View>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.dateText}>{today}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.notifButton}
          onPress={() => { hapticLight(); }}
          activeOpacity={0.7}
          testID="dashboard-notif-btn"
        >
          <Bell size={20} color={Colors.text} strokeWidth={1.8} />
          {unreadAlerts.length > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadAlerts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          <StatCard
            label="Patients"
            value={stats.totalPatients}
            icon={<Users size={18} color={Colors.teal} strokeWidth={1.8} />}
            color={Colors.teal}
          />
          <StatCard
            label="Avg Compliance"
            value={`${stats.avgCompliance}%`}
            icon={<Activity size={18} color={Colors.green} strokeWidth={1.8} />}
            trend={3}
            color={Colors.green}
          />
          <StatCard
            label="Labs to Review"
            value={stats.labsToReview}
            icon={<FlaskConical size={18} color={Colors.amber} strokeWidth={1.8} />}
            color={Colors.amber}
          />
          <StatCard
            label="Appointments"
            value={stats.appointmentsToday}
            icon={<Calendar size={18} color={Colors.blue} strokeWidth={1.8} />}
            color={Colors.blue}
          />
        </View>

        {unreadAlerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <AlertTriangle size={15} color={Colors.amber} strokeWidth={1.8} />
                <Text style={styles.sectionTitle}>Alerts</Text>
              </View>
              <Text style={styles.sectionCount}>{unreadAlerts.length}</Text>
            </View>
            <View style={styles.sectionCard}>
              {unreadAlerts.map((alert, idx) => (
                <View key={alert.id}>
                  {idx > 0 && <View style={styles.divider} />}
                  <AlertRow
                    alert={alert}
                    onPress={() => {
                      hapticLight();
                      router.push(`/patient/${alert.patientId}` as never);
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Calendar size={15} color={Colors.teal} strokeWidth={1.8} />
              <Text style={styles.sectionTitle}>Today{"'"}{"s"} Schedule</Text>
            </View>
            <Text style={styles.sectionCount}>{appointments.length}</Text>
          </View>
          <View style={styles.sectionCard}>
            {appointments.map((apt, idx) => (
              <View key={apt.id}>
                {idx > 0 && <View style={styles.divider} />}
                <AppointmentRow
                  appointment={apt}
                  onPress={() => {
                    hapticLight();
                    router.push(`/patient/${apt.patientId}` as never);
                  }}
                />
              </View>
            ))}
          </View>
        </View>

        {needsReview.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Clock size={15} color={Colors.gold} strokeWidth={1.8} />
                <Text style={styles.sectionTitle}>Needs Review</Text>
              </View>
              <Text style={styles.sectionCount}>{needsReview.length}</Text>
            </View>
            <View style={styles.sectionCard}>
              {needsReview.map((patient, idx) => (
                <View key={patient.id}>
                  {idx > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    style={styles.reviewRow}
                    onPress={() => {
                      hapticLight();
                      router.push(`/patient/${patient.id}` as never);
                    }}
                    activeOpacity={0.6}
                  >
                    <View style={styles.avatarSmall}>
                      <Text style={styles.avatarSmallText}>{patient.avatar}</Text>
                    </View>
                    <View style={styles.reviewInfo}>
                      <Text style={styles.reviewName}>{patient.name}</Text>
                      <Text style={styles.reviewConditions}>{patient.primaryConditions.join(' · ')}</Text>
                    </View>
                    <View style={styles.reviewScoreWrap}>
                      <Text style={[styles.reviewScore, {
                        color: patient.healthScore >= 70 ? Colors.green : patient.healthScore >= 50 ? Colors.amber : Colors.softRed,
                      }]}>{patient.healthScore}</Text>
                      <View style={styles.reviewDelta}>
                        {patient.healthScoreDelta > 0 ? (
                          <TrendingUp size={10} color={Colors.green} strokeWidth={2} />
                        ) : patient.healthScoreDelta < 0 ? (
                          <TrendingDown size={10} color={Colors.softRed} strokeWidth={2} />
                        ) : null}
                      </View>
                    </View>
                    <ChevronRight size={14} color={Colors.textTertiary} strokeWidth={1.5} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
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
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gabrielMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  greeting: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  notifButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.softRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: {
    fontSize: 9,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%' as unknown as number,
    flexGrow: 1,
    flexBasis: '46%' as unknown as number,
  },
  statCardInner: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.textTertiary,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 16,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  appointmentTime: {
    width: 56,
    alignItems: 'center',
  },
  appointmentTimeText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  appointmentDuration: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  appointmentDivider: {
    width: 3,
    height: 36,
    borderRadius: 2,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentName: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  appointmentTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  appointmentTypeText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
  appointmentNotes: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
    flex: 1,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  alertDesc: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  avatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.tealBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarSmallText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.teal,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  reviewConditions: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reviewScoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewScore: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    fontWeight: '700' as const,
  },
  reviewDelta: {
    marginTop: 1,
  },
});
