import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FlaskConical,
  Star,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Sun,
  CloudSun,
  Moon,
} from 'lucide-react-native';
import Colors from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { usePractitioner } from '../../../contexts/PractitionerContext';
import { hapticLight } from '../../../utils/haptics';
import { PROTOCOL_CATEGORIES } from '../../../constants/practitioner-data';
import type { ProtocolTemplate } from '../../../constants/practitioner-data';

function ProtocolCard({ protocol, expanded, onToggle }: {
  protocol: ProtocolTemplate;
  expanded: boolean;
  onToggle: () => void;
}) {
  const categoryColors: Record<string, string> = {
    'Endocrine': Colors.gold,
    'Metabolic': Colors.teal,
    'Gastrointestinal': Colors.green,
    'Immune/Inflammatory': Colors.softRed,
    'Neurological': Colors.blue,
    'Cardiovascular': Colors.amber,
  };
  const color = categoryColors[protocol.category] || Colors.teal;

  const timeIcons: Record<string, React.ReactNode> = {
    morning: <Sun size={11} color="#D4851C" strokeWidth={1.8} />,
    afternoon: <CloudSun size={11} color={Colors.teal} strokeWidth={1.8} />,
    evening: <Moon size={11} color={Colors.blue} strokeWidth={1.8} />,
  };

  return (
    <View style={styles.protocolCard}>
      <TouchableOpacity style={styles.protocolHeader} onPress={onToggle} activeOpacity={0.6}>
        <View style={[styles.categoryStrip, { backgroundColor: color }]} />
        <View style={styles.protocolHeaderInfo}>
          <View style={styles.protocolTitleRow}>
            <Text style={styles.protocolName}>{protocol.name}</Text>
            {expanded ? (
              <ChevronUp size={18} color={Colors.textTertiary} strokeWidth={1.5} />
            ) : (
              <ChevronDown size={18} color={Colors.textTertiary} strokeWidth={1.5} />
            )}
          </View>
          <Text style={styles.protocolDesc} numberOfLines={expanded ? 10 : 2}>{protocol.description}</Text>
          <View style={styles.protocolMeta}>
            <View style={[styles.categoryBadge, { backgroundColor: color + '14' }]}>
              <Text style={[styles.categoryBadgeText, { color }]}>{protocol.category}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={11} color={Colors.textTertiary} strokeWidth={1.5} />
              <Text style={styles.metaText}>{protocol.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={11} color={Colors.textTertiary} strokeWidth={1.5} />
              <Text style={styles.metaText}>{protocol.usageCount} uses</Text>
            </View>
            <View style={styles.metaItem}>
              <Star size={11} color="#D4851C" fill="#D4851C" strokeWidth={1.5} />
              <Text style={styles.metaText}>{protocol.rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.protocolItems}>
          <View style={styles.itemsHeader}>
            <FlaskConical size={13} color={Colors.teal} strokeWidth={1.8} />
            <Text style={styles.itemsHeaderText}>Protocol Items ({protocol.items.length})</Text>
          </View>
          {protocol.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                {timeIcons[item.timeOfDay]}
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDosage}>{item.dosage} · {item.frequency}</Text>
                  {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
                </View>
              </View>
            </View>
          ))}
          <View style={styles.protocolActions}>
            <TouchableOpacity
              style={styles.assignButton}
              onPress={() => hapticLight()}
              activeOpacity={0.7}
            >
              <Text style={styles.assignButtonText}>Assign to Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.duplicateButton}
              onPress={() => hapticLight()}
              activeOpacity={0.7}
            >
              <Text style={styles.duplicateButtonText}>Duplicate & Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export default function ProtocolsScreen() {
  const insets = useSafeAreaInsets();
  const { protocolTemplates } = usePractitioner();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return protocolTemplates;
    return protocolTemplates.filter(p => p.category === selectedCategory);
  }, [protocolTemplates, selectedCategory]);

  const handleToggle = useCallback((id: string) => {
    hapticLight();
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>Protocols</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => hapticLight()} activeOpacity={0.7}>
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {PROTOCOL_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
            onPress={() => { hapticLight(); setSelectedCategory(cat); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map(protocol => (
          <ProtocolCard
            key={protocol.id}
            protocol={protocol}
            expanded={expandedId === protocol.id}
            onToggle={() => handleToggle(protocol.id)}
          />
        ))}
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
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.teal,
  },
  createButtonText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: '#FFF',
    letterSpacing: 0.2,
  },
  categoryScroll: {
    maxHeight: 44,
    marginBottom: 12,
  },
  categoryContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  categoryChipText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  protocolCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  protocolHeader: {
    flexDirection: 'row',
  },
  categoryStrip: {
    width: 4,
  },
  protocolHeaderInfo: {
    flex: 1,
    padding: 16,
  },
  protocolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  protocolName: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
    letterSpacing: -0.2,
    flex: 1,
    marginRight: 8,
  },
  protocolDesc: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 19,
  },
  protocolMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
  },
  protocolItems: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.bg + '60',
  },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  itemsHeaderText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.teal,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  itemDosage: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemNotes: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.amber,
    marginTop: 3,
    fontStyle: 'italic' as const,
  },
  protocolActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  assignButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: Colors.teal,
    alignItems: 'center',
  },
  assignButtonText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  duplicateButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  duplicateButtonText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
});
