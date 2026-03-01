import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Circle as SvgCircle,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { hapticLight } from '../utils/haptics';
import type { CheckIn } from '../contexts/GabrielContext';
import type { HealthKitData } from '../services/healthkit';
import { formatSleepDuration } from '../services/healthkit';

interface HealthTrendsProps {
  checkIns: CheckIn[];
  healthKitData?: HealthKitData | null;
}

type TimeRange = '7d' | '30d';
type MetricKey = 'mood' | 'energy' | 'sleep';

interface MetricData {
  label: string;
  key: MetricKey;
  values: number[];
  dates: string[];
  current: number;
  trend: 'up' | 'down' | 'stable';
  trendArrow: string;
}

const CHART_WIDTH = 280;
const CHART_HEIGHT = 60;
const CHART_PADDING_X = 8;
const CHART_PADDING_Y = 6;
const DRAW_WIDTH = CHART_WIDTH - CHART_PADDING_X * 2;
const DRAW_HEIGHT = CHART_HEIGHT - CHART_PADDING_Y * 2;

function getSmoothedPath(values: number[], minVal: number, maxVal: number): string {
  if (values.length < 2) return '';

  const range = maxVal - minVal || 1;
  const points = values.map((v, i) => ({
    x: CHART_PADDING_X + (i / (values.length - 1)) * DRAW_WIDTH,
    y: CHART_PADDING_Y + DRAW_HEIGHT - ((v - minVal) / range) * DRAW_HEIGHT,
  }));

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

function getGradientPath(values: number[], minVal: number, maxVal: number): string {
  const linePath = getSmoothedPath(values, minVal, maxVal);
  if (!linePath) return '';

  const lastPoint = values.length - 1;
  const lastX = CHART_PADDING_X + (lastPoint / (values.length - 1)) * DRAW_WIDTH;
  const firstX = CHART_PADDING_X;
  const bottom = CHART_HEIGHT;

  return `${linePath} L ${lastX} ${bottom} L ${firstX} ${bottom} Z`;
}

function computeTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 3) return 'stable';
  const recent = values.slice(-3);
  const older = values.slice(-6, -3);
  if (older.length === 0) return 'stable';
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  const diff = recentAvg - olderAvg;
  if (diff > 0.3) return 'up';
  if (diff < -0.3) return 'down';
  return 'stable';
}

function getDayLabels7(dates: string[]): string[] {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dates.map(d => {
    const date = new Date(d + 'T12:00:00');
    return dayNames[date.getDay()];
  });
}

function getDayLabels30(dates: string[]): string[] {
  return dates.map(d => {
    const date = new Date(d + 'T12:00:00');
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
}

function SparklineChart({
  metric,
  drawAnim,
  timeRange,
}: {
  metric: MetricData;
  drawAnim: Animated.Value;
  timeRange: TimeRange;
}) {
  const { values, dates, current, trend, trendArrow, label, key } = metric;

  const trendColor = trend === 'up' ? Colors.teal : trend === 'down' ? Colors.softRed : Colors.amber;

  const minVal = Math.max(0, Math.min(...values) - 0.5);
  const maxVal = Math.min(5, Math.max(...values) + 0.5);

  const linePath = getSmoothedPath(values, minVal, maxVal);
  const gradientPath = getGradientPath(values, minVal, maxVal);

  const labels = timeRange === '7d' ? getDayLabels7(dates) : getDayLabels30(dates);
  const showEvery = timeRange === '30d' ? Math.ceil(labels.length / 6) : 1;

  const lastPointX = values.length > 1
    ? CHART_PADDING_X + ((values.length - 1) / (values.length - 1)) * DRAW_WIDTH
    : CHART_PADDING_X;
  const lastPointY = values.length > 0
    ? CHART_PADDING_Y + DRAW_HEIGHT - ((values[values.length - 1] - minVal) / (maxVal - minVal || 1)) * DRAW_HEIGHT
    : CHART_HEIGHT / 2;

  const [clipWidth, setClipWidth] = useState<number>(CHART_WIDTH);

  useEffect(() => {
    const id = drawAnim.addListener(({ value }) => {
      setClipWidth(value * CHART_WIDTH);
    });
    return () => drawAnim.removeListener(id);
  }, [drawAnim]);

  return (
    <View style={chartStyles.chartCard} testID={`trend-chart-${key}`}>
      <View style={chartStyles.chartHeader}>
        <View style={chartStyles.chartLabelRow}>
          <View style={[chartStyles.chartDot, { backgroundColor: Colors.teal }]} />
          <Text style={chartStyles.chartLabel}>{label}</Text>
        </View>
        <View style={chartStyles.chartValueRow}>
          <Text style={chartStyles.chartValue}>{current.toFixed(1)}</Text>
          <Text style={[chartStyles.chartTrendArrow, { color: trendColor }]}>{trendArrow}</Text>
        </View>
      </View>

      <View style={chartStyles.svgContainer}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 18} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT + 18}`}>
          <Defs>
            <SvgLinearGradient id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={Colors.teal} stopOpacity="0.25" />
              <Stop offset="1" stopColor={Colors.teal} stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>

          {[1, 2, 3, 4, 5].map(v => {
            const y = CHART_PADDING_Y + DRAW_HEIGHT - ((v - minVal) / (maxVal - minVal || 1)) * DRAW_HEIGHT;
            if (y < 0 || y > CHART_HEIGHT) return null;
            return (
              <Line
                key={v}
                x1={CHART_PADDING_X}
                y1={y}
                x2={CHART_WIDTH - CHART_PADDING_X}
                y2={y}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={0.5}
              />
            );
          })}

          {gradientPath ? (
            <Path
              d={gradientPath}
              fill={`url(#grad-${key})`}
              opacity={clipWidth >= CHART_WIDTH ? 1 : clipWidth / CHART_WIDTH}
            />
          ) : null}

          {linePath ? (
            <Path
              d={linePath}
              fill="none"
              stroke={Colors.teal}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={clipWidth >= CHART_WIDTH ? undefined : `${clipWidth}`}
              strokeDashoffset={0}
            />
          ) : null}

          {clipWidth >= CHART_WIDTH * 0.9 && values.length > 0 && (
            <>
              <SvgCircle cx={lastPointX} cy={lastPointY} r={4} fill={Colors.teal} opacity={0.3} />
              <SvgCircle cx={lastPointX} cy={lastPointY} r={2.5} fill={Colors.teal} />
            </>
          )}

          {labels.map((lbl, i) => {
            if (i % showEvery !== 0 && i !== labels.length - 1) return null;
            const x = CHART_PADDING_X + (i / (labels.length - 1 || 1)) * DRAW_WIDTH;
            return (
              <SvgText
                key={i}
                x={x}
                y={CHART_HEIGHT + 14}
                fill="rgba(255,255,255,0.3)"
                fontSize={9}
                textAnchor="middle"
              >
                {lbl}
              </SvgText>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

function WearableTrendRow({ label, avg7d, avg30d, trend, trendPercent, unit, timeRange }: {
  label: string;
  avg7d: number;
  avg30d: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  unit: string;
  timeRange: TimeRange;
}) {
  const trendArrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor = trend === 'up' ? Colors.teal : trend === 'down' ? Colors.softRed : Colors.amber;
  const displayVal = timeRange === '7d' ? avg7d : avg30d;

  return (
    <View style={wearableStyles.row}>
      <View style={wearableStyles.rowLeft}>
        <View style={[wearableStyles.dot, { backgroundColor: Colors.teal }]} />
        <Text style={wearableStyles.label}>{label}</Text>
      </View>
      <View style={wearableStyles.rowRight}>
        <Text style={wearableStyles.value}>{label === 'Steps' ? Math.round(displayVal).toLocaleString() : displayVal}{unit ? ` ${unit}` : ''}</Text>
        {trendPercent > 0 && (
          <Text style={[wearableStyles.trend, { color: trendColor }]}>{trendArrow} {trendPercent}%</Text>
        )}
      </View>
    </View>
  );
}

export default function HealthTrends({ checkIns, healthKitData }: HealthTrendsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const drawAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const days = timeRange === '7d' ? 7 : 30;

  const metrics = useMemo((): MetricData[] => {
    const now = new Date();
    const dateMap = new Map<string, { mood: number[]; energy: number[]; sleep: number[] }>();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dateMap.set(key, { mood: [], energy: [], sleep: [] });
    }

    for (const ci of checkIns) {
      const entry = dateMap.get(ci.date);
      if (entry) {
        entry.mood.push(ci.mood);
        entry.energy.push(ci.energy);
        entry.sleep.push(ci.sleep);
      }
    }

    const orderedDates = Array.from(dateMap.keys());
    const buildMetric = (label: string, key: MetricKey): MetricData => {
      const filledDates: string[] = [];
      const filledValues: number[] = [];

      for (const date of orderedDates) {
        const entry = dateMap.get(date)!;
        const vals = entry[key];
        if (vals.length > 0) {
          filledDates.push(date);
          filledValues.push(vals.reduce((a, b) => a + b, 0) / vals.length);
        }
      }

      const currentVal = filledValues.length > 0 ? filledValues[filledValues.length - 1] : 0;
      const trend = computeTrend(filledValues);
      const trendArrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

      return {
        label,
        key,
        values: filledValues,
        dates: filledDates,
        current: currentVal,
        trend,
        trendArrow,
      };
    };

    return [
      buildMetric('Mood', 'mood'),
      buildMetric('Energy', 'energy'),
      buildMetric('Sleep', 'sleep'),
    ];
  }, [checkIns, days]);

  const hasEnoughData = metrics.some(m => m.values.length >= 3);

  useEffect(() => {
    drawAnim.setValue(0);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(drawAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [timeRange]);

  const handleToggle = useCallback((range: TimeRange) => {
    if (range === timeRange) return;
    hapticLight();
    setTimeRange(range);
  }, [timeRange]);

  return (
    <View style={trendStyles.container} testID="health-trends-section">
      <View style={trendStyles.headerRow}>
        <Text style={trendStyles.sectionTitle}>Health Trends</Text>
        <View style={trendStyles.toggleRow}>
          <TouchableOpacity
            style={[trendStyles.toggleBtn, timeRange === '7d' && trendStyles.toggleBtnActive]}
            onPress={() => handleToggle('7d')}
            activeOpacity={0.7}
            testID="trends-7d-btn"
          >
            <Text style={[trendStyles.toggleText, timeRange === '7d' && trendStyles.toggleTextActive]}>7D</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[trendStyles.toggleBtn, timeRange === '30d' && trendStyles.toggleBtnActive]}
            onPress={() => handleToggle('30d')}
            activeOpacity={0.7}
            testID="trends-30d-btn"
          >
            <Text style={[trendStyles.toggleText, timeRange === '30d' && trendStyles.toggleTextActive]}>30D</Text>
          </TouchableOpacity>
        </View>
      </View>

      {healthKitData && (
        <View style={wearableStyles.container}>
          <View style={wearableStyles.header}>
            <Text style={wearableStyles.headerIcon}>⌚</Text>
            <Text style={wearableStyles.headerTitle}>Wearable Biometrics</Text>
          </View>
          <WearableTrendRow
            label="Sleep"
            avg7d={healthKitData.sleepTrend.avg7d}
            avg30d={healthKitData.sleepTrend.avg30d}
            trend={healthKitData.sleepTrend.trend}
            trendPercent={healthKitData.sleepTrend.trendPercent}
            unit="hrs"
            timeRange={timeRange}
          />
          <WearableTrendRow
            label="Resting HR"
            avg7d={healthKitData.hrTrend.avg7d}
            avg30d={healthKitData.hrTrend.avg30d}
            trend={healthKitData.hrTrend.trend}
            trendPercent={healthKitData.hrTrend.trendPercent}
            unit="bpm"
            timeRange={timeRange}
          />
          <WearableTrendRow
            label="HRV"
            avg7d={healthKitData.hrvTrend.avg7d}
            avg30d={healthKitData.hrvTrend.avg30d}
            trend={healthKitData.hrvTrend.trend}
            trendPercent={healthKitData.hrvTrend.trendPercent}
            unit="ms"
            timeRange={timeRange}
          />
          <WearableTrendRow
            label="Steps"
            avg7d={healthKitData.stepsTrend.avg7d}
            avg30d={healthKitData.stepsTrend.avg30d}
            trend={healthKitData.stepsTrend.trend}
            trendPercent={healthKitData.stepsTrend.trendPercent}
            unit=""
            timeRange={timeRange}
          />
        </View>
      )}

      {!hasEnoughData ? (
        <View style={trendStyles.emptyCard}>
          <Text style={trendStyles.emptyIcon}>📊</Text>
          <Text style={trendStyles.emptyTitle}>Not enough data yet</Text>
          <Text style={trendStyles.emptySubtitle}>Complete a few more check-ins to see your trends</Text>
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}>
          {metrics.map(metric => (
            <SparklineChart
              key={metric.key}
              metric={metric}
              drawAnim={drawAnim}
              timeRange={timeRange}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chartLabel: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.cream,
    letterSpacing: 0.4,
  },
  chartValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  chartValue: {
    fontSize: 22,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.cream,
    letterSpacing: -0.5,
  },
  chartTrendArrow: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
  },
  svgContainer: {
    alignItems: 'center',
  },
});

const trendStyles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.cream,
    letterSpacing: 0.4,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 2,
    gap: 2,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: Colors.teal,
  },
  toggleText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.whiteDim,
    letterSpacing: 0.3,
  },
  toggleTextActive: {
    color: Colors.darkBg,
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.cream,
    letterSpacing: 0.3,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: Colors.whiteDim,
    letterSpacing: 0.3,
    textAlign: 'center',
    lineHeight: 19,
  },
});

const wearableStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerIcon: {
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.cream,
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79, 209, 197, 0.06)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  label: {
    fontSize: 13,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: Colors.whiteDim,
    letterSpacing: 0.3,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.cream,
    letterSpacing: 0.2,
  },
  trend: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
  },
});
