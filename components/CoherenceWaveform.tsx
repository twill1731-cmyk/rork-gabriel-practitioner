import { Fonts } from '../constants/fonts';
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WAVE_WIDTH = SCREEN_WIDTH - 40;
const WAVE_HEIGHT = 240;
const POINTS = 80;

interface CoherenceWaveformProps {
  coherenceScore: number;
}

function generateWavePoints(
  phase: number,
  amplitude: number,
  frequency: number,
  noiseLevel: number,
  yCenter: number,
  width: number,
  points: number,
  secondaryFreq?: number,
  secondaryAmp?: number,
): string {
  const step = width / points;
  let d = '';

  for (let i = 0; i <= points; i++) {
    const x = i * step;
    const t = (i / points) * Math.PI * 2 * frequency + phase;
    let y = yCenter + Math.sin(t) * amplitude;

    if (secondaryFreq && secondaryAmp) {
      const t2 = (i / points) * Math.PI * 2 * secondaryFreq + phase * 1.3;
      y += Math.sin(t2) * secondaryAmp;
    }

    const seed = Math.sin(i * 12.9898 + phase * 3.0) * 43758.5453;
    const noise = (seed - Math.floor(seed) - 0.5) * 2 * noiseLevel;
    y += noise;

    if (i === 0) {
      d = `M${x.toFixed(1)},${y.toFixed(1)}`;
    } else {
      const prevX = (i - 1) * step;
      const prevT = ((i - 1) / points) * Math.PI * 2 * frequency + phase;
      let prevY = yCenter + Math.sin(prevT) * amplitude;
      if (secondaryFreq && secondaryAmp) {
        const prevT2 = ((i - 1) / points) * Math.PI * 2 * secondaryFreq + phase * 1.3;
        prevY += Math.sin(prevT2) * secondaryAmp;
      }
      const prevSeed = Math.sin((i - 1) * 12.9898 + phase * 3.0) * 43758.5453;
      const prevNoise = (prevSeed - Math.floor(prevSeed) - 0.5) * 2 * noiseLevel;
      prevY += prevNoise;

      const cpx = (prevX + x) / 2;
      d += ` C${cpx.toFixed(1)},${prevY.toFixed(1)} ${cpx.toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
    }
  }

  return d;
}

const CoherenceWaveform = React.memo(function CoherenceWaveform({
  coherenceScore,
}: CoherenceWaveformProps) {
  const [frame, setFrame] = useState<number>(0);
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const waveOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(waveOpacity, {
      toValue: 0.7,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const targetGlow = coherenceScore > 70 ? 0.12 : 0;
    Animated.timing(glowOpacity, {
      toValue: targetGlow,
      duration: 1200,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.sin),
    }).start();
  }, [coherenceScore]);

  useEffect(() => {
    let cancelled = false;
    let rafId: number;
    let lastTime = Date.now();

    const tick = () => {
      if (cancelled) return;
      const now = Date.now();
      if (now - lastTime > 120) {
        lastTime = now;
        setFrame(f => f + 1);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const coherenceNorm = coherenceScore / 100;
  const heartNoise = useMemo(() => Math.max(2, 18 * (1 - coherenceNorm)), [coherenceNorm]);
  const brainNoise = useMemo(() => Math.max(3, 22 * (1 - coherenceNorm)), [coherenceNorm]);
  const heartAmp = useMemo(() => 25 + coherenceNorm * 15, [coherenceNorm]);
  const brainAmp = useMemo(() => 18 + coherenceNorm * 12, [coherenceNorm]);

  const phase = frame * 0.08;

  const heartPath = useMemo(() =>
    generateWavePoints(
      phase, heartAmp, 2.5, heartNoise,
      WAVE_HEIGHT * 0.72, WAVE_WIDTH, POINTS,
    ),
    [phase, heartAmp, heartNoise],
  );

  const brainPath = useMemo(() =>
    generateWavePoints(
      phase * (coherenceNorm > 0.7 ? 1.0 : 0.7),
      brainAmp, 3.5, brainNoise,
      WAVE_HEIGHT * 0.28, WAVE_WIDTH, POINTS,
      8, 6 * (1 - coherenceNorm * 0.5),
    ),
    [phase, brainAmp, brainNoise, coherenceNorm],
  );

  const connectionLines = useMemo(() => {
    if (coherenceScore < 50) return [];
    const lines: { x: number; y1: number; y2: number; opacity: number }[] = [];
    const count = Math.floor((coherenceScore - 50) / 10) + 2;
    const step = WAVE_WIDTH / (count + 1);
    for (let i = 1; i <= count; i++) {
      const x = step * i;
      lines.push({
        x,
        y1: WAVE_HEIGHT * 0.28,
        y2: WAVE_HEIGHT * 0.72,
        opacity: 0.06 + (coherenceScore / 100) * 0.08,
      });
    }
    return lines;
  }, [coherenceScore, frame]);

  return (
    <View style={waveStyles.container}>
      <Animated.View style={[waveStyles.glowOverlay, { opacity: glowOpacity }]} />
      <Animated.View style={{ opacity: waveOpacity }}>
        <Svg width={WAVE_WIDTH} height={WAVE_HEIGHT} viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`}>
          <Defs>
            <LinearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#C5A572" stopOpacity="0" />
              <Stop offset="0.2" stopColor="#C5A572" stopOpacity="0.8" />
              <Stop offset="0.8" stopColor="#C5A572" stopOpacity="0.8" />
              <Stop offset="1" stopColor="#C5A572" stopOpacity="0" />
            </LinearGradient>
            <LinearGradient id="brainGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#7C6FD4" stopOpacity="0" />
              <Stop offset="0.2" stopColor="#7C6FD4" stopOpacity="0.8" />
              <Stop offset="0.8" stopColor="#7C6FD4" stopOpacity="0.8" />
              <Stop offset="1" stopColor="#7C6FD4" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {connectionLines.map((line, idx) => (
            <Line
              key={`conn-${idx}`}
              x1={line.x}
              y1={line.y1}
              x2={line.x}
              y2={line.y2}
              stroke="#D4AF37"
              strokeWidth={0.5}
              opacity={line.opacity}
              strokeDasharray="3 5"
            />
          ))}

          <Path
            d={brainPath}
            fill="none"
            stroke="url(#brainGrad)"
            strokeWidth={1.8}
          />
          <Path
            d={brainPath}
            fill="none"
            stroke="#7C6FD4"
            strokeWidth={4}
            opacity={0.08}
          />

          <Path
            d={heartPath}
            fill="none"
            stroke="url(#heartGrad)"
            strokeWidth={1.8}
          />
          <Path
            d={heartPath}
            fill="none"
            stroke="#C5A572"
            strokeWidth={4}
            opacity={0.08}
          />
        </Svg>
      </Animated.View>

      <View style={waveStyles.labelRow}>
        <View style={waveStyles.labelItem}>
          <View style={[waveStyles.labelDot, { backgroundColor: '#7C6FD4' }]} />
          <Animated.Text style={[waveStyles.labelText, { opacity: waveOpacity }]}>Brain</Animated.Text>
        </View>
        <View style={waveStyles.labelItem}>
          <View style={[waveStyles.labelDot, { backgroundColor: '#C5A572' }]} />
          <Animated.Text style={[waveStyles.labelText, { opacity: waveOpacity }]}>Heart</Animated.Text>
        </View>
      </View>
    </View>
  );
});

const waveStyles = StyleSheet.create({
  container: {
    width: WAVE_WIDTH,
    height: WAVE_HEIGHT + 30,
    alignSelf: 'center' as const,
    position: 'relative' as const,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D4AF37',
    borderRadius: 20,
  },
  labelRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: 24,
    marginTop: 8,
  },
  labelItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  labelText: {
    fontSize: 11,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },
});

export default CoherenceWaveform;
