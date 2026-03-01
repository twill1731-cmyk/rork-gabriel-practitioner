import { Fonts } from '../constants/fonts';
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface Node {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
}

interface Connection {
  from: number;
  to: number;
}

const NODES: Node[] = [
  { x: 18, y: 20, size: 5, baseOpacity: 0.4 },
  { x: 45, y: 12, size: 6, baseOpacity: 0.5 },
  { x: 75, y: 22, size: 4, baseOpacity: 0.35 },
  { x: 100, y: 14, size: 5, baseOpacity: 0.6 },
  { x: 30, y: 48, size: 5, baseOpacity: 0.45 },
  { x: 58, y: 42, size: 6, baseOpacity: 0.7 },
  { x: 85, y: 50, size: 4, baseOpacity: 0.5 },
  { x: 22, y: 68, size: 4, baseOpacity: 0.3 },
  { x: 52, y: 65, size: 5, baseOpacity: 0.55 },
  { x: 90, y: 38, size: 5, baseOpacity: 0.4 },
];

const CONNECTIONS: Connection[] = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 0, to: 4 },
  { from: 1, to: 5 },
  { from: 4, to: 5 },
  { from: 5, to: 6 },
  { from: 3, to: 9 },
  { from: 6, to: 9 },
  { from: 4, to: 7 },
  { from: 7, to: 8 },
  { from: 5, to: 8 },
  { from: 8, to: 6 },
  { from: 2, to: 5 },
];

const PULSE_GROUPS = [
  [1, 5, 9],
  [0, 6, 8],
  [2, 4, 7],
  [3, 5, 7],
];

const TRAVEL_PATHS = [
  { connection: 0, delay: 0 },
  { connection: 4, delay: 300 },
  { connection: 6, delay: 600 },
  { connection: 10, delay: 150 },
  { connection: 8, delay: 450 },
  { connection: 13, delay: 750 },
];

export default function NeuralThinking() {
  const nodeAnims = useRef(NODES.map(n => new Animated.Value(n.baseOpacity))).current;
  const travelAnims = useRef(TRAVEL_PATHS.map(() => new Animated.Value(0))).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    let pulseIndex = 0;

    const runPulse = () => {
      const group = PULSE_GROUPS[pulseIndex % PULSE_GROUPS.length];
      const animations = group.map(idx =>
        Animated.sequence([
          Animated.timing(nodeAnims[idx], {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(nodeAnims[idx], {
            toValue: NODES[idx].baseOpacity,
            duration: 450,
            useNativeDriver: true,
          }),
        ])
      );
      Animated.parallel(animations).start(() => {
        pulseIndex++;
        runPulse();
      });
    };
    runPulse();

    const travelLoops = TRAVEL_PATHS.map((path, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(path.delay),
          Animated.timing(travelAnims[i], {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(travelAnims[i], {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.delay(1200 + i * 200),
        ])
      )
    );
    travelLoops.forEach(l => l.start());

    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    breatheLoop.start();

    const textLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0.5,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    textLoop.start();

    return () => {
      nodeAnims.forEach(a => a.stopAnimation());
      travelLoops.forEach(l => l.stop());
      breatheLoop.stop();
      textLoop.stop();
    };
  }, []);

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, { transform: [{ scale: breatheAnim }] }]}>
        {CONNECTIONS.map((conn, i) => {
          const from = NODES[conn.from];
          const to = NODES[conn.to];
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);

          return (
            <View
              key={`line-${i}`}
              style={[
                styles.connectionLine,
                {
                  left: from.x,
                  top: from.y,
                  width: length,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}

        {TRAVEL_PATHS.map((path, i) => {
          const conn = CONNECTIONS[path.connection];
          const from = NODES[conn.from];
          const to = NODES[conn.to];

          const translateX = travelAnims[i].interpolate({
            inputRange: [0, 1],
            outputRange: [from.x, to.x],
          });
          const translateY = travelAnims[i].interpolate({
            inputRange: [0, 1],
            outputRange: [from.y, to.y],
          });
          const opacity = travelAnims[i].interpolate({
            inputRange: [0, 0.2, 0.8, 1],
            outputRange: [0, 0.9, 0.9, 0],
          });

          return (
            <Animated.View
              key={`travel-${i}`}
              style={[
                styles.travelDot,
                {
                  opacity,
                  transform: [{ translateX }, { translateY }],
                },
              ]}
            />
          );
        })}

        {NODES.map((node, i) => (
          <Animated.View
            key={`node-${i}`}
            style={[
              styles.node,
              {
                left: node.x - node.size / 2,
                top: node.y - node.size / 2,
                width: node.size,
                height: node.size,
                borderRadius: node.size / 2,
                opacity: nodeAnims[i],
              },
            ]}
          />
        ))}
      </Animated.View>

      <Animated.Text style={[styles.label, { opacity: textOpacity }]}>
        Gabriel is thinking...
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  container: {
    width: 120,
    height: 80,
    position: 'relative' as const,
  },
  node: {
    position: 'absolute' as const,
    backgroundColor: '#4FD1C5',
  },
  connectionLine: {
    position: 'absolute' as const,
    height: 1,
    backgroundColor: 'rgba(79, 209, 197, 0.15)',
    transformOrigin: 'left center',
  },
  travelDot: {
    position: 'absolute' as const,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#4FD1C5',
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: '#B8A088',
    letterSpacing: 0.3,
  },
});
