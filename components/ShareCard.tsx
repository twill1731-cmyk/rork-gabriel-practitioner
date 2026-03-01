import React, { useRef, useCallback, useMemo } from 'react';
import { Fonts } from '../constants/fonts';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Share,
  Alert,
} from 'react-native';
import Svg, {
  Path,
  Ellipse,
  Circle,
  Polygon,
  Line,
  Defs,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hapticSuccess } from '../utils/haptics';
import {
  DEMO_PROFILE,
  STAT_LABELS,
  getTitleForLevel,
} from '../constants/health-twin-leveling';
import type { StatKey, HealthTwinProfile, Achievement } from '../constants/health-twin-leveling';
import {
  OVERALL_HEALTH_SCORE,
  getScoreColor,
  getScoreLabel,
  getEffectiveOverallScore,
} from '../constants/health-twin-data';
import {
  DEMO_READINGS,
  getCoherenceLevel,
  getCoherenceLevelLabel,
  getCoherenceLevelColor,
  getCoherenceScoreColor,
} from '../constants/heart-coherence-data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = CARD_WIDTH * 1.6;

const STAT_KEYS: StatKey[] = ['vitality', 'clarity', 'resilience', 'digestion', 'balance', 'structure'];

const SHARE_COUNT_KEY = 'share_count';
const SHARE_XP_KEY = 'share_xp_awarded';

const BODY_OUTLINE_SIMPLE = 'M50,8 C46,8 43,10 42,14 C41,18 42,22 44,24 L44,24 C42,26 40,28 39,31 C37,35 36,40 37,44 C38,47 39,49 41,50 L40,58 C39,62 38,66 38,70 C38,74 39,78 41,80 L41,86 C41,90 42,94 44,96 L44,96 C44,96 43,96 43,96 C42,96 41,97 41,98 L44,98 L48,98 L48,96 L48,86 L48,80 C49,78 50,76 50,74 C50,76 51,78 52,80 L52,86 L52,96 L52,98 L56,98 L59,98 C59,97 58,96 57,96 C57,96 56,96 56,96 L56,96 C58,94 59,90 59,86 L59,80 C61,78 62,74 62,70 C62,66 61,62 60,58 L59,50 C61,49 62,47 63,44 C64,40 63,35 61,31 C60,28 58,26 56,24 L56,24 C58,22 59,18 58,14 C57,10 54,8 50,8 Z';

async function trackShare(): Promise<void> {
  try {
    const countStr = await AsyncStorage.getItem(SHARE_COUNT_KEY);
    const count = countStr ? parseInt(countStr, 10) : 0;
    await AsyncStorage.setItem(SHARE_COUNT_KEY, String(count + 1));
    console.log('[ShareCard] Share tracked, total:', count + 1);
  } catch (e) {
    console.log('[ShareCard] Error tracking share:', e);
  }
}

function StarGeometry({ size, opacity }: { size: number; opacity: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;

  const starPath = useMemo(() => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * Math.PI / 180;
      pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    let d = '';
    for (let i = 0; i < 12; i++) {
      const j = (i + 5) % 12;
      d += `M${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} L${pts[j][0].toFixed(1)},${pts[j][1].toFixed(1)} `;
    }
    return d;
  }, [cx, cy, r]);

  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
      <Path d={starPath} fill="none" stroke="#B8A088" strokeWidth={0.5} opacity={opacity} />
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke="#B8A088" strokeWidth={0.3} opacity={opacity * 0.8} />
    </Svg>
  );
}

function MiniRadarChart({ stats, size }: { stats: Record<StatKey, number>; size: number }) {
  const center = size / 2;
  const radius = size / 2 - 20;

  function getPoint(index: number, rad: number): { x: number; y: number } {
    const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
    return {
      x: center + rad * Math.cos(angle),
      y: center + rad * Math.sin(angle),
    };
  }

  const gridLevels = [0.5, 1.0];
  const dataPoints = STAT_KEYS.map((key, i) => getPoint(i, radius * (stats[key] / 100)));
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={size} height={size}>
      {gridLevels.map((level) => {
        const pts = Array.from({ length: 6 }, (_, i) => {
          const p = getPoint(i, radius * level);
          return `${p.x},${p.y}`;
        }).join(' ');
        return (
          <Polygon
            key={`g-${level}`}
            points={pts}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={0.8}
          />
        );
      })}
      {STAT_KEYS.map((_, i) => {
        const outer = getPoint(i, radius);
        return (
          <Line
            key={`a-${i}`}
            x1={center}
            y1={center}
            x2={outer.x}
            y2={outer.y}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={0.8}
          />
        );
      })}
      <Polygon
        points={dataPolygon}
        fill="rgba(79,209,197,0.15)"
        stroke="#4FD1C5"
        strokeWidth={1.5}
        opacity={0.9}
      />
      {dataPoints.map((pt, i) => (
        <Circle key={`d-${i}`} cx={pt.x} cy={pt.y} r={2.5} fill="#4FD1C5" opacity={0.9} />
      ))}
      {STAT_KEYS.map((key, i) => {
        const labelPt = getPoint(i, radius + 14);
        return (
          <SvgText
            key={`l-${key}`}
            x={labelPt.x}
            y={labelPt.y}
            fill="rgba(255,255,255,0.45)"
            fontSize={8}
            fontWeight="400"
            textAnchor="middle"
            alignmentBaseline="central"
          >
            {STAT_LABELS[key]}
          </SvgText>
        );
      })}
    </Svg>
  );
}

function BodyOutline() {
  return (
    <Svg width={120} height={130} viewBox="0 0 100 110">
      <Defs>
        <RadialGradient id="shareBodyGlow" cx="50" cy="50" rx="40" ry="50">
          <Stop offset="0" stopColor="#4FD1C5" stopOpacity="0.08" />
          <Stop offset="1" stopColor="#4FD1C5" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={50} cy={50} rx={35} ry={45} fill="url(#shareBodyGlow)" />
      <Path
        d={BODY_OUTLINE_SIMPLE}
        fill="none"
        stroke="#4FD1C5"
        strokeWidth={0.8}
        opacity={0.5}
      />
      <Path
        d={BODY_OUTLINE_SIMPLE}
        fill="none"
        stroke="#4FD1C5"
        strokeWidth={2}
        opacity={0.08}
      />
    </Svg>
  );
}

function ScoreRing({ score, size, color }: { score: number; size: number; color: string }) {
  const r = size / 2 - 4;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 10);

  return (
    <View style={{ width: size, height: size, alignItems: 'center' as const, justifyContent: 'center' as const }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="scoreGlow" cx={`${size / 2}`} cy={`${size / 2}`} rx={`${r}`} ry={`${r}`}>
            <Stop offset="0" stopColor={color} stopOpacity="0.1" />
            <Stop offset="1" stopColor="transparent" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="url(#scoreGlow)" stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          opacity={0.85}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill as object}>
        <View style={{ flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const }}>
          <Text style={[cardStyles.ringScore, { color }]}>{score.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
}

function CoherenceScoreRing({ score, size }: { score: number; size: number }) {
  const color = getCoherenceScoreColor(score);
  const r = size / 2 - 4;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  return (
    <View style={{ width: size, height: size, alignItems: 'center' as const, justifyContent: 'center' as const }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          opacity={0.85}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill as object}>
        <View style={{ flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const }}>
          <Text style={[cardStyles.ringScoreLarge, { color }]}>{score}</Text>
        </View>
      </View>
    </View>
  );
}

function StatBars({ stats }: { stats: Record<StatKey, number> }) {
  return (
    <View style={cardStyles.statBarsContainer}>
      {STAT_KEYS.map((key) => {
        const val = stats[key];
        const barColor = val >= 70 ? '#4FD1C5' : val >= 50 ? '#B8A088' : '#C5A572';
        return (
          <View key={key} style={cardStyles.statBarItem}>
            <View style={cardStyles.statBarTrack}>
              <View style={[cardStyles.statBarFill, { width: `${val}%` as unknown as number, backgroundColor: barColor }]} />
            </View>
            <Text style={cardStyles.statBarLabel}>{STAT_LABELS[key].substring(0, 3)}</Text>
            <Text style={[cardStyles.statBarValue, { color: barColor }]}>{val}</Text>
          </View>
        );
      })}
    </View>
  );
}

function HealthTwinVariant({ profile }: { profile: HealthTwinProfile }) {
  const score = getEffectiveOverallScore();
  const scoreColor = getScoreColor(score);
  const titleInfo = getTitleForLevel(profile.level);

  return (
    <>
      <View style={cardStyles.centerSection}>
        <View style={cardStyles.bodyAndScore}>
          <BodyOutline />
          <View style={cardStyles.scoreOverlay}>
            <ScoreRing score={score} size={70} color={scoreColor} />
          </View>
        </View>
        <Text style={[cardStyles.scoreLabel, { color: scoreColor }]}>{getScoreLabel(score)}</Text>
      </View>

      <View style={cardStyles.levelRow}>
        <View style={[cardStyles.levelBadge, { borderColor: titleInfo.color }]}>
          <Text style={[cardStyles.levelText, { color: titleInfo.color }]}>Lv.{profile.level}</Text>
        </View>
        <Text style={[cardStyles.titleText, { color: titleInfo.color }]}>{titleInfo.title}</Text>
      </View>

      <View style={cardStyles.xpBarWrap}>
        <View style={cardStyles.xpBarBg}>
          <View style={[cardStyles.xpBarFill, { width: `${(profile.xp / profile.xpToNextLevel) * 100}%` as unknown as number }]} />
        </View>
        <Text style={cardStyles.xpBarText}>{profile.xp}/{profile.xpToNextLevel} XP</Text>
      </View>

      <StatBars stats={profile.stats} />
    </>
  );
}

function StatsVariant({ profile }: { profile: HealthTwinProfile }) {
  const titleInfo = getTitleForLevel(profile.level);

  return (
    <>
      <View style={cardStyles.levelRow}>
        <View style={[cardStyles.levelBadge, { borderColor: titleInfo.color }]}>
          <Text style={[cardStyles.levelText, { color: titleInfo.color }]}>Lv.{profile.level}</Text>
        </View>
        <Text style={[cardStyles.titleText, { color: titleInfo.color }]}>{titleInfo.title}</Text>
      </View>

      <View style={cardStyles.radarWrap}>
        <MiniRadarChart stats={profile.stats} size={180} />
      </View>

      <StatBars stats={profile.stats} />

      {profile.streaks.checkIn >= 3 && (
        <View style={cardStyles.streakRow}>
          <Text style={cardStyles.streakEmoji}>🔥</Text>
          <Text style={cardStyles.streakText}>{profile.streaks.checkIn} day streak</Text>
        </View>
      )}
    </>
  );
}

function CoherenceVariant() {
  const latestReading = DEMO_READINGS.length > 0
    ? [...DEMO_READINGS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;
  const score = latestReading?.coherenceScore ?? 50;
  const level = getCoherenceLevel(score);
  const levelLabel = getCoherenceLevelLabel(level);
  const levelColor = getCoherenceLevelColor(level);

  return (
    <>
      <View style={cardStyles.centerSection}>
        <CoherenceScoreRing score={score} size={90} />
        <Text style={cardStyles.coherenceTitle}>Heart-Brain Coherence</Text>
        <Text style={[cardStyles.coherenceLevel, { color: levelColor }]}>{levelLabel}</Text>
      </View>

      <View style={cardStyles.wavePreview}>
        <Svg width={CARD_WIDTH - 60} height={50} viewBox={`0 0 ${CARD_WIDTH - 60} 50`}>
          <Path
            d={generateWavePath(CARD_WIDTH - 60, 25, 8, 0.8, 0)}
            fill="none"
            stroke="#C5A572"
            strokeWidth={1.5}
            opacity={0.6}
          />
          <Path
            d={generateWavePath(CARD_WIDTH - 60, 25, 12, 0.5, 2)}
            fill="none"
            stroke="#7C6FD4"
            strokeWidth={1.5}
            opacity={0.6}
          />
        </Svg>
      </View>

      <Text style={cardStyles.coherenceSubtext}>The energy that forms the body</Text>
    </>
  );
}

function AchievementVariant({ achievement }: { achievement: Achievement }) {
  return (
    <>
      <View style={cardStyles.achievementCenter}>
        <View style={cardStyles.achievementIconWrap}>
          <Text style={cardStyles.achievementIcon}>{achievement.icon}</Text>
        </View>
        <Text style={cardStyles.achievementTitle}>Achievement Unlocked</Text>
        <Text style={cardStyles.achievementName}>{achievement.name}</Text>
        <Text style={cardStyles.achievementDesc}>{achievement.description}</Text>
      </View>
    </>
  );
}

function generateWavePath(width: number, centerY: number, freq: number, amp: number, phase: number): string {
  let d = `M0,${centerY}`;
  for (let x = 1; x <= width; x += 2) {
    const y = centerY + Math.sin((x / width) * Math.PI * freq + phase) * centerY * amp;
    d += ` L${x},${y.toFixed(1)}`;
  }
  return d;
}

export type ShareCardVariant = 'health-twin' | 'stats' | 'coherence' | 'achievement';

interface ShareCardProps {
  variant?: ShareCardVariant;
  achievement?: Achievement;
  onShareComplete?: () => void;
}

const ShareCard = React.forwardRef<ViewShot, ShareCardProps>(function ShareCard(
  { variant = 'health-twin', achievement, onShareComplete },
  ref,
) {
  const profile = DEMO_PROFILE;

  return (
    <ViewShot
      ref={ref}
      options={{ format: 'png', quality: 1.0 }}
      style={cardStyles.card}
    >
      <View style={cardStyles.cardInner}>
        <View style={cardStyles.geometryBg}>
          <StarGeometry size={CARD_WIDTH * 0.6} opacity={0.035} />
        </View>

        <View style={cardStyles.topSection}>
          <Text style={cardStyles.logoText}>Gabriel</Text>
          <Text style={cardStyles.cardTitle}>
            {variant === 'health-twin' ? 'My Health Twin' :
             variant === 'stats' ? 'My Character Stats' :
             variant === 'coherence' ? 'My Coherence' :
             'Achievement'}
          </Text>
        </View>

        <View style={cardStyles.contentSection}>
          {variant === 'health-twin' && <HealthTwinVariant profile={profile} />}
          {variant === 'stats' && <StatsVariant profile={profile} />}
          {variant === 'coherence' && <CoherenceVariant />}
          {variant === 'achievement' && achievement && <AchievementVariant achievement={achievement} />}
        </View>

        <View style={cardStyles.bottomSection}>
          {profile.streaks.checkIn >= 3 && variant === 'health-twin' && (
            <View style={cardStyles.streakRow}>
              <Text style={cardStyles.streakEmoji}>🔥</Text>
              <Text style={cardStyles.streakText}>{profile.streaks.checkIn} day streak</Text>
            </View>
          )}
          <Text style={cardStyles.urlText}>trygabriel.ai</Text>
          <Text style={cardStyles.poweredText}>Powered by Gabriel</Text>
        </View>
      </View>
    </ViewShot>
  );
});

export async function captureAndShare(
  viewShotRef: React.RefObject<ViewShot | null>,
  onComplete?: () => void,
): Promise<void> {
  try {
    if (!viewShotRef.current || !viewShotRef.current.capture) {
      console.log('[ShareCard] ViewShot ref not ready');
      return;
    }

    const uri = await viewShotRef.current.capture();
    console.log('[ShareCard] Captured image:', uri);

    if (Platform.OS === 'web') {
      await Share.share({ message: 'Check out my Health Twin on Gabriel! trygabriel.ai' });
    } else {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your Health Twin',
        });
      } else {
        await Share.share({
          message: 'Check out my Health Twin on Gabriel! trygabriel.ai',
          url: uri,
        });
      }
    }

    await trackShare();
    hapticSuccess();
    onComplete?.();
  } catch (e: unknown) {
    const error = e as Error;
    if (error.message && !error.message.includes('dismiss')) {
      console.log('[ShareCard] Share error:', error);
      Alert.alert('Share Error', 'Could not share your card. Please try again.');
    }
  }
}

export default React.memo(ShareCard);

const cardStyles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 24,
    overflow: 'hidden' as const,
  },
  cardInner: {
    backgroundColor: '#060D15',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(79,209,197,0.15)',
    paddingVertical: 28,
    paddingHorizontal: 24,
    minHeight: CARD_HEIGHT,
  },
  geometryBg: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    opacity: 1,
  },
  topSection: {
    alignItems: 'flex-start' as const,
    marginBottom: 20,
    gap: 4,
    zIndex: 1,
  },
  logoText: {
    fontSize: 14,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: 'rgba(79,209,197,0.6)',
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: '#F5F0E8',
    letterSpacing: 0.5,
  },
  contentSection: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 16,
    zIndex: 1,
  },
  centerSection: {
    alignItems: 'center' as const,
    gap: 8,
  },
  bodyAndScore: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  scoreOverlay: {
    position: 'absolute' as const,
    top: 20,
    alignSelf: 'center' as const,
  },
  scoreLabel: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  ringScore: {
    fontSize: 18,
    fontFamily: Fonts.light,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    letterSpacing: -0.5,
  },
  ringScoreLarge: {
    fontSize: 28,
    fontFamily: Fonts.light,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    letterSpacing: -1,
  },
  levelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  levelBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(79,209,197,0.08)',
  },
  levelText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  titleText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  xpBarWrap: {
    width: '80%' as unknown as number,
    alignItems: 'center' as const,
    gap: 4,
    alignSelf: 'center' as const,
  },
  xpBarBg: {
    width: '100%' as unknown as number,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden' as const,
  },
  xpBarFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#4FD1C5',
  },
  xpBarText: {
    fontSize: 10,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.3,
  },
  statBarsContainer: {
    width: '100%' as unknown as number,
    gap: 8,
    paddingHorizontal: 8,
  },
  statBarItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  statBarTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden' as const,
  },
  statBarFill: {
    height: 3,
    borderRadius: 2,
  },
  statBarLabel: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    width: 26,
    textAlign: 'right' as const,
  },
  statBarValue: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
    width: 22,
  },
  radarWrap: {
    alignItems: 'center' as const,
    marginVertical: 4,
  },
  streakRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    paddingVertical: 4,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: '#FFA032',
    letterSpacing: 0.3,
  },
  coherenceTitle: {
    fontSize: 12,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  coherenceLevel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
  wavePreview: {
    alignItems: 'center' as const,
    marginVertical: 8,
  },
  coherenceSubtext: {
    fontSize: 11,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    fontStyle: 'italic' as const,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.3,
    textAlign: 'center' as const,
  },
  achievementCenter: {
    alignItems: 'center' as const,
    gap: 12,
    paddingVertical: 20,
  },
  achievementIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(79,209,197,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79,209,197,0.2)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  achievementIcon: {
    fontSize: 40,
  },
  achievementTitle: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: '#D4AF37',
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  achievementName: {
    fontSize: 22,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: '#F5F0E8',
    letterSpacing: 0.3,
  },
  achievementDesc: {
    fontSize: 13,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center' as const,
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  bottomSection: {
    alignItems: 'center' as const,
    gap: 6,
    marginTop: 20,
    zIndex: 1,
  },
  urlText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: '#4FD1C5',
    letterSpacing: 1,
  },
  poweredText: {
    fontSize: 10,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 0.5,
  },
});
