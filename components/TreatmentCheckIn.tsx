import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { hapticLight, hapticSuccess } from '../utils/haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SLIDER_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 300);

interface TreatmentCheckInProps {
  onSubmit: (checkIn: { mood: number; energy: number; pain: number; notes: string }) => void;
  onCancel: () => void;
}

function Slider({
  label,
  value,
  onChange,
  leftEmoji,
  rightEmoji,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  leftEmoji: string;
  rightEmoji: string;
}) {
  const translateX = useRef(new Animated.Value(((value - 1) / 9) * SLIDER_WIDTH)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        hapticLight();
      },
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.max(0, Math.min(SLIDER_WIDTH, gestureState.moveX - 40));
        translateX.setValue(newX);
        const newValue = Math.round((newX / SLIDER_WIDTH) * 9) + 1;
        if (newValue !== value) {
          onChange(newValue);
          hapticLight();
        }
      },
      onPanResponderRelease: () => {
        hapticSuccess();
      },
    })
  ).current;

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{value}/10</Text>
      </View>
      <View style={styles.sliderRow}>
        <Text style={styles.emoji}>{leftEmoji}</Text>
        <View style={styles.sliderTrack}>
          <Animated.View
            style={[
              styles.sliderFill,
              {
                width: translateX.interpolate({
                  inputRange: [0, SLIDER_WIDTH],
                  outputRange: [0, SLIDER_WIDTH],
                }),
              },
            ]}
          />
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.sliderThumb,
              {
                transform: [{ translateX }],
              },
            ]}
          />
        </View>
        <Text style={styles.emoji}>{rightEmoji}</Text>
      </View>
    </View>
  );
}

export default function TreatmentCheckIn({ onSubmit, onCancel }: TreatmentCheckInProps) {
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [pain, setPain] = useState(7);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    hapticSuccess();
    onSubmit({ mood, energy, pain, notes });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Check-In</Text>
        <Text style={styles.subtitle}>How are you feeling?</Text>
      </View>

      <Slider label="Mood" value={mood} onChange={setMood} leftEmoji="😫" rightEmoji="😊" />
      <Slider label="Energy" value={energy} onChange={setEnergy} leftEmoji="😴" rightEmoji="⚡" />
      <Slider label="Pain Level" value={pain} onChange={setPain} leftEmoji="😖" rightEmoji="😌" />

      <View style={styles.notesContainer}>
        <Text style={styles.notesLabel}>Notes (optional)</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any observations?"
          placeholderTextColor={Colors.whiteDim}
          multiline
          maxLength={200}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.7}>
          <Text style={styles.submitButtonText}>Submit Check-In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111B2A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.light,
    fontWeight: '300',
    color: Colors.cream,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.whiteMuted,
    fontFamily: Fonts.light,
    fontWeight: '300',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    fontWeight: '400',
    color: Colors.cream,
    letterSpacing: 0.3,
  },
  sliderValue: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    fontWeight: '500',
    color: Colors.teal,
    letterSpacing: 0.5,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 20,
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 8,
    backgroundColor: Colors.teal,
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.teal,
    borderWidth: 3,
    borderColor: '#111B2A',
    shadowColor: Colors.teal,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    fontWeight: '400',
    color: Colors.cream,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.cream,
    fontFamily: Fonts.light,
    fontWeight: '300',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.12)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    fontWeight: '400',
    color: Colors.whiteMuted,
    letterSpacing: 0.3,
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.teal,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    fontWeight: '500',
    color: '#0A1A14',
    letterSpacing: 0.3,
  },
});
