import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { hapticSuccess } from '../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PARTICLE_COLORS = ['#4FD1C5', '#B8A088', '#F5F0E8'];
const PARTICLE_COUNT = 25;

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  size: number;
  color: string;
  velocityX: number;
  velocityY: number;
}

function createParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.8;
    const speed = 120 + Math.random() * 200;
    particles.push({
      x: new Animated.Value(SCREEN_WIDTH / 2),
      y: new Animated.Value(SCREEN_HEIGHT / 2),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(0),
      size: 3 + Math.random() * 3,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed - 60,
    });
  }
  return particles;
}

interface CelebrationProps {
  visible: boolean;
  onComplete?: () => void;
}

export default function Celebration({ visible, onComplete }: CelebrationProps) {
  const particlesRef = useRef<Particle[]>(createParticles());

  useEffect(() => {
    if (!visible) return;

    hapticSuccess();

    const particles = createParticles();
    particlesRef.current = particles;

    const animations = particles.map((p) => {
      p.x.setValue(SCREEN_WIDTH / 2);
      p.y.setValue(SCREEN_HEIGHT / 2);
      p.opacity.setValue(1);
      p.scale.setValue(0);

      const duration = 1500;

      return Animated.parallel([
        Animated.timing(p.x, {
          toValue: SCREEN_WIDTH / 2 + p.velocityX,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: SCREEN_HEIGHT / 2 + p.velocityY + 80,
          duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(p.scale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(p.scale, {
            toValue: 0.6,
            duration: duration - 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start(() => {
      onComplete?.();
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particlesRef.current.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { scale: p.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  particle: {
    position: 'absolute',
  },
});
