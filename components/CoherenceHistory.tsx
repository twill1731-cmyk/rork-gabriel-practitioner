import { Fonts } from '../constants/fonts';
import React, { useMemo, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Brain } from 'lucide-react-native';
import { hapticLight } from '../utils/haptics';
import {
  getCoherenceScoreColor,
  getCoherenceLevelLabel,
  getCoherenceLevel,
  SOURCE_LABELS,
} from '../constants/heart-coherence-data';
import type { CoherenceReading } from '../constants/heart-coherence-data';

interface CoherenceHistoryProps {
  readings: CoherenceReading[];
}

function ReadingRow({ reading }: { reading: CoherenceReading }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const level = getCoherenceLevel(reading.coherenceScore);
  const levelLabel = getCoherenceLevelLabel(level);
  const color = getCoherenceScoreColor(reading.coherenceScore);
  const sourceInfo = SOURCE_LABELS[reading.source];

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  const handleToggle = useCallback(() => {
    hapticLight();
    setExpanded(prev => !prev);
  }, []);

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
      style={styles.readingRow}
      onPress={handleToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <View style={styles.readingTop}>
        <View style={styles.readingLeft}>
          <View style={styles.sourceRow}>
            <Text style={styles.sourceIcon}>{sourceInfo.icon}</Text>
            <Text style={styles.sourceLabel}>{sourceInfo.label}</Text>
          </View>
          <Text style={styles.readingDate}>{formatDate(reading.date)}</Text>
        </View>
        <View style={styles.readingRight}>
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreDot, { backgroundColor: color }]} />
            <Text style={[styles.readingScore, { color }]}>{reading.coherenceScore}</Text>
          </View>
          <Text style={[styles.readingLevel, { color }]}>{levelLabel}</Text>
        </View>
      </View>

      {reading.hrvMs !== null && (
        <View style={styles.hrvRow}>
          <Text style={styles.hrvLabel}>HRV</Text>
          <Text style={styles.hrvValue}>{reading.hrvMs} ms</Text>
        </View>
      )}

      {expanded && (
        <View style={styles.expandedSection}>
          {reading.notes ? (
            <Text style={styles.noteText}>{reading.notes}</Text>
          ) : (
            <Text style={styles.noteTextEmpty}>No notes for this reading</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
    </Animated.View>
  );
}

const CoherenceHistory = React.memo(function CoherenceHistory({
  readings,
}: CoherenceHistoryProps) {
  const sortedReadings = useMemo(() =>
    [...readings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [readings],
  );

  if (readings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
          <View style={styles.emptyIconGlow} />
          <Brain size={28} color="#7C6FD4" strokeWidth={1.2} />
        </View>
        <Text style={styles.emptyTitle}>Your coherence journey begins here</Text>
        <Text style={styles.emptyText}>
          Log your first reading to see Gabriel's insights and track your progress over time.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sortedReadings.map((reading) => (
        <ReadingRow key={reading.id} reading={reading} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  readingRow: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 8,
  },
  readingTop: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  readingLeft: {
    gap: 3,
  },
  sourceRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  sourceIcon: {
    fontSize: 14,
  },
  sourceLabel: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: '#F5F0E8',
    letterSpacing: 0.2,
  },
  readingDate: {
    fontSize: 11,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.3,
    marginLeft: 22,
  },
  readingRight: {
    alignItems: 'flex-end' as const,
    gap: 2,
  },
  scoreContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  scoreDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  readingScore: {
    fontSize: 22,
    fontFamily: Fonts.light,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    letterSpacing: -0.5,
  },
  readingLevel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
  },
  hrvRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginLeft: 22,
  },
  hrvLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  hrvValue: {
    fontSize: 11,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.3,
  },
  expandedSection: {
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
    marginTop: 2,
  },
  noteText: {
    fontSize: 12,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 18,
    letterSpacing: 0.2,
    fontStyle: 'italic' as const,
  },
  noteTextEmpty: {
    fontSize: 12,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: 'rgba(255,255,255,0.25)',
    lineHeight: 18,
    letterSpacing: 0.2,
    fontStyle: 'italic' as const,
  },
  emptyContainer: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center' as const,
    gap: 10,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 6,
  },
  emptyIconGlow: {
    position: 'absolute' as const,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(124, 111, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(124, 111, 212, 0.06)',
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: '#F5F0E8',
    textAlign: 'center' as const,
    letterSpacing: 0.3,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center' as const,
    lineHeight: 20,
    letterSpacing: 0.2,
    maxWidth: 260,
  },
});

export default CoherenceHistory;
