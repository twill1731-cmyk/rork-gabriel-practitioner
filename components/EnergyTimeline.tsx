import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Fonts } from '../constants/fonts';
import { EnergyReading, getEnergyColor } from '../constants/energy-data';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CHART_HEIGHT = 160;
const PADDING = 20;

interface EnergyTimelineProps {
  readings: EnergyReading[];
  peakWindow?: { start: string; end: string };
  dipWindow?: { start: string; end: string };
}

export const EnergyTimeline: React.FC<EnergyTimelineProps> = ({
  readings,
  peakWindow,
  dipWindow,
}) => {
  const pathAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(pathAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [readings]);

  if (readings.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No energy readings yet</Text>
      </View>
    );
  }

  // Parse timestamps and map to coordinates
  const dataPoints = readings.map((r, i) => {
    const date = new Date(r.timestamp);
    const hour = date.getHours() + date.getMinutes() / 60;
    const x = PADDING + ((hour - 8) / 14) * (CHART_WIDTH - PADDING * 2); // 8 AM to 10 PM = 14 hours
    const y = CHART_HEIGHT - PADDING - ((r.level - 1) / 9) * (CHART_HEIGHT - PADDING * 2);
    return { x, y, level: r.level, hour };
  });

  // Build smooth curve path
  let pathData = `M ${dataPoints[0].x} ${dataPoints[0].y}`;
  for (let i = 0; i < dataPoints.length - 1; i++) {
    const curr = dataPoints[i];
    const next = dataPoints[i + 1];
    const cpX = (curr.x + next.x) / 2;
    pathData += ` Q ${cpX} ${curr.y}, ${next.x} ${next.y}`;
  }

  // Current time indicator
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const currentX = PADDING + ((currentHour - 8) / 14) * (CHART_WIDTH - PADDING * 2);

  return (
    <View style={styles.container}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#4FD1C5" stopOpacity="0.2" />
            <Stop offset="1" stopColor="#4FD1C5" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="dipGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#B8A088" stopOpacity="0.2" />
            <Stop offset="1" stopColor="#B8A088" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Horizontal grid lines */}
        {[2.5, 5, 7.5].map((level) => {
          const y = CHART_HEIGHT - PADDING - ((level - 1) / 9) * (CHART_HEIGHT - PADDING * 2);
          return (
            <Line
              key={level}
              x1={PADDING}
              y1={y}
              x2={CHART_WIDTH - PADDING}
              y2={y}
              stroke="#F5F0E8"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          );
        })}

        {/* Peak zone background */}
        {peakWindow && (
          <Rect
            x={PADDING}
            y={PADDING}
            width={(CHART_WIDTH - PADDING * 2) * 0.15}
            height={CHART_HEIGHT - PADDING * 2}
            fill="url(#peakGrad)"
          />
        )}

        {/* Dip zone background */}
        {dipWindow && (
          <Rect
            x={PADDING + (CHART_WIDTH - PADDING * 2) * 0.45}
            y={PADDING}
            width={(CHART_WIDTH - PADDING * 2) * 0.15}
            height={CHART_HEIGHT - PADDING * 2}
            fill="url(#dipGrad)"
          />
        )}

        {/* Energy curve path */}
        <Path d={pathData} stroke="#4FD1C5" strokeWidth={3} fill="none" strokeLinecap="round" />

        {/* Data point dots */}
        {dataPoints.map((point, i) => (
          <Circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={6}
            fill={getEnergyColor(point.level)}
            stroke="#0A0F1A"
            strokeWidth={2}
          />
        ))}

        {/* Current time indicator */}
        {currentHour >= 8 && currentHour <= 22 && (
          <>
            <Line
              x1={currentX}
              y1={PADDING}
              x2={currentX}
              y2={CHART_HEIGHT - PADDING}
              stroke="#F5F0E8"
              strokeOpacity={0.6}
              strokeWidth={2}
              strokeDasharray="4,4"
            />
            <Circle cx={currentX} cy={PADDING - 5} r={4} fill="#4FD1C5" />
          </>
        )}
      </Svg>

      {/* Time labels */}
      <View style={styles.timeLabels}>
        {['8 AM', '12 PM', '4 PM', '8 PM'].map((label, i) => (
          <Text key={label} style={styles.timeLabel}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#132E22',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#F5F0E8',
    opacity: 0.5,
    textAlign: 'center',
    paddingVertical: 40,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: PADDING,
  },
  timeLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#F5F0E8',
    opacity: 0.5,
  },
});
