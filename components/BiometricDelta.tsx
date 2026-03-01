import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity, Heart, Moon, Droplet } from 'lucide-react-native';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';
import type { BiometricDelta as BiometricDeltaType } from '../constants/treatment-data';

interface BiometricDeltaProps {
  delta: BiometricDeltaType;
}

export default function BiometricDelta({ delta }: BiometricDeltaProps) {
  const renderMetricCard = (
    icon: React.ReactNode,
    label: string,
    data: { before: number; after: number; delta: number } | null,
    unit: string
  ) => {
    if (!data) {
      return (
        <View key={label} style={styles.metricCard}>
          {icon}
          <Text style={styles.metricLabel}>{label}</Text>
          <Text style={styles.noData}>No data</Text>
        </View>
      );
    }

    const deltaColor = data.delta > 0 ? Colors.teal : data.delta < 0 ? '#e87b6b' : Colors.whiteDim;
    const deltaSign = data.delta > 0 ? '+' : '';

    return (
      <View key={label} style={styles.metricCard}>
        {icon}
        <Text style={styles.metricLabel}>{label}</Text>
        <View style={styles.valuesRow}>
          <Text style={styles.beforeValue}>{data.before.toFixed(label === 'Sleep' ? 1 : 0)}</Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.afterValue}>{data.after.toFixed(label === 'Sleep' ? 1 : 0)}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
        <Text style={[styles.delta, { color: deltaColor }]}>
          {deltaSign}{data.delta.toFixed(label === 'Sleep' ? 1 : 0)} {unit}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Biometric Changes</Text>
      <View style={styles.grid}>
        {renderMetricCard(
          <Heart size={16} color={Colors.teal} strokeWidth={1.5} />,
          'Heart Rate',
          delta.heartRate,
          'bpm'
        )}
        {renderMetricCard(
          <Activity size={16} color={Colors.teal} strokeWidth={1.5} />,
          'HRV',
          delta.hrv,
          'ms'
        )}
        {renderMetricCard(
          <Moon size={16} color={Colors.teal} strokeWidth={1.5} />,
          'Sleep',
          delta.sleepHours,
          'hrs'
        )}
        {renderMetricCard(
          <Droplet size={16} color={Colors.teal} strokeWidth={1.5} />,
          'SpO₂',
          delta.bloodOxygen,
          '%'
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500',
    color: Colors.cream,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#132E22',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.12)',
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontWeight: '400',
    color: Colors.whiteDim,
    marginTop: 6,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  valuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  beforeValue: {
    fontSize: 15,
    fontFamily: Fonts.light,
    fontWeight: '300',
    color: Colors.whiteMuted,
  },
  arrow: {
    fontSize: 14,
    color: Colors.whiteDim,
    marginHorizontal: 4,
  },
  afterValue: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    fontWeight: '400',
    color: Colors.cream,
  },
  unit: {
    fontSize: 11,
    color: Colors.whiteDim,
    marginLeft: 3,
  },
  delta: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  noData: {
    fontSize: 13,
    color: Colors.whiteDim,
    fontFamily: Fonts.light,
    fontWeight: '300',
    marginTop: 8,
  },
});
