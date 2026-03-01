import React, { useRef, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  FlaskConical,
  Pill,
  FileText,
  MessageCircle,
  Calendar,
  AlertTriangle,
  Activity,
  ChevronRight,
  Sun,
  CloudSun,
  Moon,
  Edit3,
  Share2,
} from 'lucide-react-native';
import Colors from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { usePractitioner } from '../../contexts/PractitionerContext';
import { hapticLight } from '../../utils/haptics';
import type { LabFlag } from '../../constants/practitioner-data';

type TabId = 'overview' | 'labs' | 'protocol' | 'notes' | 'messages';

function LabRow({ lab }: { lab: LabFlag }) {
  const statusColors: Record<string, string> = {
    normal: Colors.green,
    low: Colors.amber,
    high: Colors.amber,
    critical: Colors.softRed,
  };
  const color = statusColors[lab.status] || Colors.textSecondary;

  return (
    <View style={styles.labRow}>
      <View style={styles.labInfo}>
        <Text style={styles.labMarker}>{lab.marker}</Text>
        <Text style={styles.labRange}>Ref: {lab.range} {lab.unit}</Text>
      </View>
      <View style={styles.labValueWrap}>
        <Text style={[styles.labValue, { color }]}>{lab.value}</Text>
        <Text style={styles.labUnit}>{lab.unit}</Text>
      </View>
      <View style={[styles.labStatusBadge, { backgroundColor: color + '14' }]}>
        <Text style={[styles.labStatusText, { color }]}>
          {lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}
        </Text>
      </View>
    </View>
  );
}

function HealthScoreRing({ score, delta }: { score: number; delta: number }) {
  const color = score >= 70 ? Colors.green : score >= 50 ? Colors.amber : Colors.softRed;

  return (
    <View style={styles.scoreRing}>
      <View style={[styles.scoreCircle, { borderColor: color + '30' }]}>
        <View style={[styles.scoreInner, { borderColor: color }]}>
          <Text style={[styles.scoreValue, { color }]}>{score}</Text>
          <Text style={styles.scoreLabel}>Health</Text>
        </View>
      </View>
      {delta !== 0 && (
        <View style={[styles.scoreDelta, { backgroundColor: delta > 0 ? Colors.greenBg : Colors.softRedBg }]}>
          {delta > 0 ? (
            <TrendingUp size={11} color={Colors.green} strokeWidth={2} />
          ) : (
            <TrendingDown size={11} color={Colors.softRed} strokeWidth={2} />
          )}
          <Text style={[styles.scoreDeltaText, { color: delta > 0 ? Colors.green : Colors.softRed }]}>
            {delta > 0 ? '+' : ''}{delta}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getPatient, getPatientMessages } = usePractitioner();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const patient = useMemo(() => getPatient(id || ''), [id, getPatient]);
  const patientMessages = useMemo(() => getPatientMessages(id || ''), [id, getPatientMessages]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  if (!patient) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Patient not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: Colors.greenBg, text: Colors.green },
    review: { bg: Colors.amberBg, text: Colors.amber },
    new: { bg: Colors.blueBg, text: Colors.blue },
    inactive: { bg: Colors.bgTertiary, text: Colors.textTertiary },
  };
  const statusStyle = statusColors[patient.status] || statusColors.active;

  const timeIcons: Record<string, React.ReactNode> = {
    morning: <Sun size={12} color="#D4851C" strokeWidth={1.8} />,
    afternoon: <CloudSun size={12} color={Colors.teal} strokeWidth={1.8} />,
    evening: <Moon size={12} color={Colors.blue} strokeWidth={1.8} />,
  };

  const unreadMsgCount = patientMessages?.unreadCount ?? 0;

  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'labs', label: 'Labs' },
    { id: 'protocol', label: 'Protocol' },
    { id: 'notes', label: 'Notes' },
    { id: 'messages', label: 'Messages', badge: unreadMsgCount },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => { hapticLight(); router.back(); }}
          activeOpacity={0.7}
          testID="patient-back-btn"
        >
          <ArrowLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{patient.name}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction} onPress={() => hapticLight()} activeOpacity={0.7}>
            <Edit3 size={18} color={Colors.textSecondary} strokeWidth={1.8} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction} onPress={() => hapticLight()} activeOpacity={0.7}>
            <Share2 size={18} color={Colors.textSecondary} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.profileLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{patient.avatar}</Text>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{patient.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.profileMeta}>{patient.age}{patient.sex === 'F' ? 'F' : 'M'} · Joined {formatDate(patient.joinedDate)}</Text>
              <Text style={styles.profileConditions}>{patient.primaryConditions.join(' · ')}</Text>
            </View>
          </View>
          <HealthScoreRing score={patient.healthScore} delta={patient.healthScoreDelta} />
        </View>

        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Activity size={14} color={Colors.teal} strokeWidth={1.8} />
            <Text style={styles.quickStatValue}>{patient.complianceRate}%</Text>
            <Text style={styles.quickStatLabel}>Compliance</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Pill size={14} color={Colors.gold} strokeWidth={1.8} />
            <Text style={styles.quickStatValue}>{patient.protocolCount}</Text>
            <Text style={styles.quickStatLabel}>Supplements</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Calendar size={14} color={Colors.blue} strokeWidth={1.8} />
            <Text style={styles.quickStatValue}>{formatShortDate(patient.lastVisit)}</Text>
            <Text style={styles.quickStatLabel}>Last Visit</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <FlaskConical size={14} color={Colors.amber} strokeWidth={1.8} />
            <Text style={styles.quickStatValue}>{patient.recentLabs.length}</Text>
            <Text style={styles.quickStatLabel}>Lab Markers</Text>
          </View>
        </View>

        {patient.alerts.filter(a => !a.read).length > 0 && (
          <View style={styles.alertsBanner}>
            <AlertTriangle size={15} color={Colors.amber} strokeWidth={1.8} />
            <View style={styles.alertsBannerInfo}>
              {patient.alerts.filter(a => !a.read).map(alert => (
                <Text key={alert.id} style={styles.alertsBannerText}>
                  {alert.title}: {alert.description}
                </Text>
              ))}
            </View>
          </View>
        )}

        <View style={styles.tabBar}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => { hapticLight(); setActiveTab(tab.id); }}
              activeOpacity={0.7}
            >
              <View style={styles.tabInner}>
                <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <View style={[styles.tabBadge, activeTab === tab.id && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, activeTab === tab.id && styles.tabBadgeTextActive]}>{tab.badge}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {patient.medications.length > 0 && (
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <Pill size={14} color={Colors.softRed} strokeWidth={1.8} />
                  <Text style={styles.infoCardTitle}>Medications</Text>
                </View>
                {patient.medications.map((med, idx) => (
                  <View key={idx} style={styles.infoItem}>
                    <View style={styles.infoDot} />
                    <Text style={styles.infoItemText}>{med}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <FlaskConical size={14} color={Colors.teal} strokeWidth={1.8} />
                <Text style={styles.infoCardTitle}>Current Supplements</Text>
                <Text style={styles.infoCardCount}>{patient.supplements.length}</Text>
              </View>
              {patient.supplements.map((supp, idx) => (
                <View key={idx} style={styles.infoItem}>
                  <View style={[styles.infoDot, { backgroundColor: Colors.teal }]} />
                  <Text style={styles.infoItemText}>{supp}</Text>
                </View>
              ))}
            </View>

            {patient.nextAppointment && (
              <View style={styles.nextApptCard}>
                <Calendar size={15} color={Colors.blue} strokeWidth={1.8} />
                <View style={styles.nextApptInfo}>
                  <Text style={styles.nextApptLabel}>Next Appointment</Text>
                  <Text style={styles.nextApptDate}>{formatDate(patient.nextAppointment)}</Text>
                </View>
                <ChevronRight size={16} color={Colors.textTertiary} strokeWidth={1.5} />
              </View>
            )}
          </View>
        )}

        {activeTab === 'labs' && (
          <View style={styles.tabContent}>
            {patient.recentLabs.length > 0 ? (
              <View style={styles.labsCard}>
                <View style={styles.labsHeader}>
                  <Text style={styles.labsHeaderText}>Recent Results</Text>
                  <Text style={styles.labsDate}>{patient.recentLabs[0]?.date}</Text>
                </View>
                {patient.recentLabs.map((lab, idx) => (
                  <View key={idx}>
                    {idx > 0 && <View style={styles.labDivider} />}
                    <LabRow lab={lab} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyTab}>
                <FlaskConical size={32} color={Colors.textTertiary} strokeWidth={1.2} />
                <Text style={styles.emptyTabText}>No lab results on file</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'protocol' && (
          <View style={styles.tabContent}>
            <View style={styles.protocolCard}>
              <View style={styles.protocolHeader}>
                <Text style={styles.protocolHeaderText}>Active Protocol</Text>
                <TouchableOpacity onPress={() => hapticLight()} activeOpacity={0.7}>
                  <Text style={styles.editProtocol}>Edit</Text>
                </TouchableOpacity>
              </View>
              {patient.supplements.map((supp, idx) => (
                <View key={idx} style={styles.protocolItem}>
                  {timeIcons[idx % 3 === 0 ? 'morning' : idx % 3 === 1 ? 'afternoon' : 'evening']}
                  <Text style={styles.protocolItemName}>{supp}</Text>
                </View>
              ))}
            </View>

            <View style={styles.complianceCard}>
              <View style={styles.complianceHeader}>
                <Activity size={14} color={Colors.teal} strokeWidth={1.8} />
                <Text style={styles.complianceTitle}>Compliance Rate</Text>
              </View>
              <View style={styles.complianceBar}>
                <View style={[styles.complianceFill, {
                  width: `${patient.complianceRate}%` as unknown as number,
                  backgroundColor: patient.complianceRate >= 85 ? Colors.green : patient.complianceRate >= 70 ? Colors.amber : Colors.softRed,
                }]} />
              </View>
              <Text style={styles.complianceValue}>{patient.complianceRate}% over last 30 days</Text>
            </View>
          </View>
        )}

        {activeTab === 'notes' && (
          <View style={styles.tabContent}>
            <View style={styles.notesCard}>
              <View style={styles.notesHeader}>
                <FileText size={14} color={Colors.gold} strokeWidth={1.8} />
                <Text style={styles.notesTitle}>Clinical Notes</Text>
              </View>
              <Text style={styles.notesText}>{patient.notes}</Text>
              <TouchableOpacity style={styles.addNoteButton} onPress={() => hapticLight()} activeOpacity={0.7}>
                <Edit3 size={14} color={Colors.teal} strokeWidth={1.8} />
                <Text style={styles.addNoteText}>Add Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'messages' && (
          <View style={styles.tabContent}>
            {patientMessages && patientMessages.messages.length > 0 ? (
              <View style={styles.messagesCard}>
                {patientMessages.messages.sort((a, b) => a.timestamp - b.timestamp).map((msg, idx) => (
                  <View key={msg.id}>
                    {idx > 0 && <View style={styles.msgDivider} />}
                    <View style={styles.msgRow}>
                      <View style={[
                        styles.msgSenderDot,
                        { backgroundColor: msg.sender === 'practitioner' ? Colors.teal : msg.sender === 'system' ? Colors.gold : Colors.blue },
                      ]} />
                      <View style={styles.msgContent}>
                        <View style={styles.msgTopRow}>
                          <Text style={styles.msgSender}>
                            {msg.sender === 'practitioner' ? 'You' : msg.sender === 'system' ? 'System' : patient.name.split(' ')[0]}
                          </Text>
                          <Text style={styles.msgTime}>{formatMsgTime(msg.timestamp)}</Text>
                        </View>
                        <Text style={[styles.msgText, !msg.read && styles.msgTextUnread]}>{msg.content}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyTab}>
                <MessageCircle size={32} color={Colors.textTertiary} strokeWidth={1.2} />
                <Text style={styles.emptyTabText}>No messages with this patient</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => hapticLight()} activeOpacity={0.7}>
            <MessageCircle size={18} color="#FFF" strokeWidth={1.8} />
            <Text style={styles.primaryActionText}>Message Patient</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={() => hapticLight()} activeOpacity={0.7}>
            <Calendar size={18} color={Colors.teal} strokeWidth={1.8} />
            <Text style={styles.secondaryActionText}>Schedule Visit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function formatMsgTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileLeft: {
    flexDirection: 'row',
    gap: 14,
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  profileInfo: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  profileName: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.3,
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
  profileMeta: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  profileConditions: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  scoreRing: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.card,
  },
  scoreValue: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    fontWeight: '700' as const,
  },
  scoreLabel: {
    fontSize: 8,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  scoreDelta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  scoreDeltaText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  quickStatValue: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  quickStatLabel: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
    letterSpacing: 0.2,
  },
  quickStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  alertsBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    backgroundColor: Colors.amberBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 133, 28, 0.2)',
    marginBottom: 16,
  },
  alertsBannerInfo: {
    flex: 1,
    gap: 4,
  },
  alertsBannerText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.amber,
    lineHeight: 18,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.teal,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tabText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFF',
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
  },
  tabBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabBadgeText: {
    fontSize: 9,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  tabBadgeTextActive: {
    color: '#FFF',
  },
  tabContent: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  infoCardCount: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.textTertiary,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  infoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.softRed,
  },
  infoItemText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.text,
  },
  nextApptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.blueBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 123, 192, 0.15)',
  },
  nextApptInfo: {
    flex: 1,
  },
  nextApptLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.blue,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },
  nextApptDate: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 2,
  },
  labsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  labsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  labsHeaderText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  labsDate: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
  },
  labDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 16,
  },
  labRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  labInfo: {
    flex: 1,
  },
  labMarker: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  labRange: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  labValueWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  labValue: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    fontWeight: '700' as const,
  },
  labUnit: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
  },
  labStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  labStatusText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  emptyTab: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTabText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
  },
  protocolCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  protocolHeaderText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  editProtocol: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.teal,
  },
  protocolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  protocolItemName: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.text,
  },
  complianceCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  complianceTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  complianceBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.bgTertiary,
    overflow: 'hidden',
    marginBottom: 8,
  },
  complianceFill: {
    height: '100%',
    borderRadius: 4,
  },
  complianceValue: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  notesCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  notesText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.tealBg,
    borderWidth: 1,
    borderColor: 'rgba(45, 138, 126, 0.15)',
  },
  addNoteText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.teal,
  },
  actionButtons: {
    gap: 10,
    marginTop: 24,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.teal,
  },
  primaryActionText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  secondaryActionText: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.teal,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  messagesCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  msgDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 32,
  },
  msgRow: {
    flexDirection: 'row',
    padding: 14,
    gap: 10,
  },
  msgSenderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  msgContent: {
    flex: 1,
  },
  msgTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  msgSender: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  msgTime: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
  },
  msgText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  msgTextUnread: {
    color: Colors.text,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
  },
  backLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backLinkText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.teal,
  },
});
