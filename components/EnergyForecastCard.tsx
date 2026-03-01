import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Fonts } from '../constants/fonts';
import { EnergyForecast, getEnergyColor } from '../constants/energy-data';

interface EnergyForecastCardProps {
  forecast: EnergyForecast;
}

export const EnergyForecastCard: React.FC<EnergyForecastCardProps> = ({ forecast }) => {
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate score count-up
    Animated.timing(scoreAnim, {
      toValue: forecast.overallScore,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [forecast.overallScore]);

  const scoreColor = getEnergyColor(forecast.overallScore);

  return (
    <View style={styles.container}>
      {/* Large circular score gauge */}
      <View style={styles.scoreSection}>
        <Animated.View
          style={[
            styles.scoreRing,
            {
              borderColor: scoreColor,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>
            {forecast.overallScore.toFixed(1)}
          </Text>
          <Text style={styles.scoreLabel}>Good Energy Day</Text>
        </Animated.View>
      </View>

      {/* Sleep/HRV/RHR stats */}
      <Text style={styles.statsText}>
        {forecast.sleepHours.toFixed(1)}h sleep • HRV {forecast.hrv}ms • RHR {forecast.restingHR}bpm
      </Text>

      {/* Peak/Dip/SecondWind windows */}
      <View style={styles.windowsSection}>
        <View style={styles.windowRow}>
          <Text style={styles.windowIcon}>⚡</Text>
          <Text style={[styles.windowText, { color: '#4FD1C5' }]}>
            Peak: {forecast.peakWindow.start} - {forecast.peakWindow.end}
          </Text>
        </View>
        <View style={styles.windowRow}>
          <Text style={styles.windowIcon}>😴</Text>
          <Text style={[styles.windowText, { color: '#B8A088' }]}>
            Dip: {forecast.dipWindow.start} - {forecast.dipWindow.end}
          </Text>
        </View>
        {forecast.secondWind && (
          <View style={styles.windowRow}>
            <Text style={styles.windowIcon}>🔄</Text>
            <Text style={[styles.windowText, { color: '#4FD1C580' }]}>
              Second Wind: {forecast.secondWind.start} - {forecast.secondWind.end}
            </Text>
          </View>
        )}
      </View>

      {/* Gabriel's recommendation */}
      <View style={styles.recommendationSection}>
        <Text style={styles.recommendationText}>{forecast.recommendation}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#132E22',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4FD1C533',
    padding: 24,
    marginBottom: 24,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0F1A',
  },
  scoreNumber: {
    fontSize: 48,
    fontFamily: Fonts.light,
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#F5F0E8',
    opacity: 0.7,
  },
  statsText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#F5F0E8',
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 20,
  },
  windowsSection: {
    marginBottom: 20,
  },
  windowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  windowIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  windowText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  recommendationSection: {
    backgroundColor: '#0A0F1A',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#4FD1C5',
  },
  recommendationText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#F5F0E8',
    lineHeight: 20,
  },
});
