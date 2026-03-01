# Prompt 38: Heart-Brain Coherence — The Energy Behind the Body

## Context

The Health Twin shows your physical body. This screen shows the invisible energy that FORMS the body — the mind-heart-consciousness connection. Think of it as the spiritual/energetic layer of your digital twin. Inspired by HeartMath Institute research, Joe Dispenza's work on heart-brain coherence, and the understanding that consciousness and elevated emotions literally shape physical health.

This is what makes Gabriel different from every other health app. Other apps track your body. Gabriel tracks the energy that creates it.

## CRITICAL: Preserve Everything That Exists

**DO NOT modify any existing files.** This prompt creates NEW files only.

**Files you must NOT touch:**
- `app/health-twin.tsx`
- `constants/health-twin-data.ts`
- `constants/health-twin-leveling.ts`
- `app/character-stats.tsx`
- `app.json`, `eas.json`, `tsconfig.json`

**One small addition to an existing file:**
- `app/health-twin.tsx` — In the `OrganDetailCard` component, when the organ is the heart (`organ.id === 'heart'`), add a second button below the existing "Ask Gabriel" button: **"Heart-Brain Coherence →"** that navigates to `/heart-coherence`. Style it as a secondary/outline button (border only, no fill). Do NOT change anything else in this file.

## Files to Create

1. `app/heart-coherence.tsx` — Main coherence screen
2. `constants/heart-coherence-data.ts` — Data types, demo data, coherence logic
3. `components/CoherenceWaveform.tsx` — The dual waveform visualization
4. `components/BreathingPacer.tsx` — Guided breathing circle animation
5. `components/CoherenceHistory.tsx` — Session history chart

## Screen Layout: `app/heart-coherence.tsx`

Full-screen dark experience. More ethereal/cosmic than the Health Twin's clinical feel.

### Background
- Base color: `#060D15` (slightly deeper/bluer than Health Twin's `#0A0F1A`)
- Ambient: very subtle radial gradient, warm violet-to-transparent, centered on screen, 3% opacity
- Floating particles: fewer than Health Twin but larger, slower, in violet/indigo/gold tones (not teal)

### Top Section
- Close button (X) top-left, same style as Health Twin
- **Coherence Score**: large number (0-100) centered, with a glowing ring around it
  - Ring color shifts based on score: red (0-25) → orange (26-50) → teal (51-75) → gold (76-100)
  - Score has a soft pulse animation
- Label below score: **"Heart-Brain Coherence"**
- Subtitle: current state label — "Scattered" / "Settling" / "Coherent" / "Elevated" / "Transcendent"

### Center: Dual Waveform Visualization (`CoherenceWaveform.tsx`)

This is the hero visual. Two waveforms representing heart rhythm and brain state.

**Heart Wave (bottom):**
- Smooth sine-like wave, warm color (rose-gold `#C5A572`)
- Animates continuously left-to-right
- Amplitude represents heart rhythm variability
- When coherent: wave becomes smooth, rhythmic, beautiful sine pattern
- When incoherent: wave is jagged, irregular, chaotic

**Brain Wave (top):**
- More complex waveform, cool color (indigo `#7C6FD4`)
- Higher frequency oscillation layered on slower wave
- When coherent: synchronizes with heart wave, peaks align
- When incoherent: completely out of phase with heart wave

**Coherence Visual:**
- When coherence is HIGH (>70): a golden glow (`#D4AF37`, 15% opacity) fills the space BETWEEN the two waves where they overlap/sync
- Faint vertical "connection lines" appear between matching peaks, like energy bridges
- The two waves literally appear to communicate and harmonize
- When coherence is LOW: gap between waves is dark, no connection lines, waves move independently

**Technical implementation:**
- Use SVG `Path` elements with animated `d` attributes
- Generate wave points using sine functions with noise
- Animate by shifting the phase offset over time
- Both waves are in one SVG, roughly 300px tall, full width
- Render in a `View` that takes ~40% of screen height

### Breathing Pacer (`BreathingPacer.tsx`)

A guided breathing circle for coherence sessions.

**Visual:**
- Circle centered below the waveforms
- Expands on inhale, contracts on exhale
- Color: soft teal outer ring, warm gold inner glow
- Breathing pattern: 5 seconds inhale → 5 seconds exhale (HeartMath-recommended coherence breathing)
- Text inside circle: "Breathe In..." / "Breathe Out..." with gentle fade transitions
- Subtle haptic pulse at each inhale/exhale transition

**States:**
- **Idle**: Circle is small and still, shows "Begin Session" text. Tap to start.
- **Active**: Circle animates with breathing rhythm. Timer shows elapsed time.
- **Complete**: Circle pulses gold, shows session summary.

### Session Controls
- "Begin Session" button when idle — teal fill, centered below pacer
- During session: timer (MM:SS) + "End Session" button (outline style)
- Session durations: 3 min, 5 min, 10 min, 20 min selectable before starting (pill buttons in a row)
- Default: 5 min

### Bottom: Session Summary (shown after completing a session)
- Coherence score achieved
- Time in coherence (% of session)
- Peak coherence moment
- XP earned ("+50 XP" with teal glow animation)
- "Your heart and mind were in harmony for X minutes"
- Two buttons: "Share" (disabled/coming soon) and "Done" (returns to Health Twin)

### Session History (`CoherenceHistory.tsx`)
- Scrollable section below the pacer (or accessible via a "History" tab/toggle at top)
- Simple line chart showing coherence scores over last 7/30 days
- Each session shown as a dot on the timeline
- Tap a dot for session detail
- If no history: "Complete your first session to start tracking your coherence journey"

## Data Layer: `constants/heart-coherence-data.ts`

```typescript
export interface CoherenceSession {
  id: string;
  date: string;
  durationSeconds: number;
  averageCoherence: number;
  peakCoherence: number;
  timeInCoherence: number; // seconds spent above 50
  emotionalState: EmotionalState;
  xpEarned: number;
}

export type EmotionalState = 
  | 'gratitude' 
  | 'love' 
  | 'joy' 
  | 'peace' 
  | 'compassion' 
  | 'appreciation'
  | 'neutral';

export type CoherenceLevel = 
  | 'scattered'    // 0-25
  | 'settling'     // 26-50
  | 'coherent'     // 51-75
  | 'elevated'     // 76-90
  | 'transcendent'; // 91-100

export interface CoherenceProfile {
  totalSessions: number;
  totalMinutes: number;
  averageCoherence: number;
  bestStreak: number; // consecutive days with a session
  currentStreak: number;
  sessions: CoherenceSession[];
}

export function getCoherenceLevel(score: number): CoherenceLevel {
  if (score >= 91) return 'transcendent';
  if (score >= 76) return 'elevated';
  if (score >= 51) return 'coherent';
  if (score >= 26) return 'settling';
  return 'scattered';
}

export function getCoherenceLevelColor(level: CoherenceLevel): string {
  switch (level) {
    case 'transcendent': return '#D4AF37'; // gold
    case 'elevated': return '#4FD1C5';     // teal
    case 'coherent': return '#7C6FD4';     // indigo
    case 'settling': return '#C5A572';     // warm gold
    case 'scattered': return '#e87b6b';    // warm red
  }
}

// Emotional states for pre-session intention setting
export const ELEVATED_EMOTIONS: { state: EmotionalState; label: string; icon: string }[] = [
  { state: 'gratitude', label: 'Gratitude', icon: '🙏' },
  { state: 'love', label: 'Love', icon: '💚' },
  { state: 'joy', label: 'Joy', icon: '✨' },
  { state: 'peace', label: 'Peace', icon: '🕊️' },
  { state: 'compassion', label: 'Compassion', icon: '💛' },
  { state: 'appreciation', label: 'Appreciation', icon: '🌟' },
];

// XP rewards for coherence
export const COHERENCE_XP = {
  sessionComplete: 50,
  highCoherence: 25,     // bonus if avg > 70
  transcendent: 100,     // bonus if hit 90+
  dailyStreak: 15,       // per day of streak
};

// Demo data for MVP
export const DEMO_COHERENCE_PROFILE: CoherenceProfile = {
  totalSessions: 8,
  totalMinutes: 52,
  averageCoherence: 58,
  bestStreak: 4,
  currentStreak: 2,
  sessions: [
    { id: '1', date: '2026-02-25', durationSeconds: 300, averageCoherence: 62, peakCoherence: 81, timeInCoherence: 180, emotionalState: 'gratitude', xpEarned: 75 },
    { id: '2', date: '2026-02-24', durationSeconds: 600, averageCoherence: 71, peakCoherence: 89, timeInCoherence: 420, emotionalState: 'love', xpEarned: 100 },
    { id: '3', date: '2026-02-23', durationSeconds: 300, averageCoherence: 45, peakCoherence: 67, timeInCoherence: 90, emotionalState: 'peace', xpEarned: 50 },
    { id: '4', date: '2026-02-22', durationSeconds: 300, averageCoherence: 53, peakCoherence: 72, timeInCoherence: 150, emotionalState: 'gratitude', xpEarned: 50 },
  ],
};
```

## Pre-Session Flow

Before starting a breathing session, a brief intention-setting step:

1. Screen dims slightly, text appears: **"Set Your Intention"**
2. "What elevated emotion do you want to cultivate?"
3. Show the 6 elevated emotions as tappable pills (emoji + label)
4. User picks one (e.g., "Gratitude 🙏")
5. Brief text: "Place your attention on your heart center. Feel [gratitude] as if it's already happening."
6. 3-second pause, then breathing pacer begins

This is straight from Dispenza's method — heart focus + elevated emotion = coherence.

## Gabriel's Wisdom (contextual text)

Sprinkle these as subtle educational moments (one shown per session, rotated):

- "When your heart and brain synchronize, your body shifts from survival mode to creation mode."
- "The heart generates an electromagnetic field 5,000 times stronger than the brain. What you feel, you broadcast."
- "Coherence isn't just meditation. It's training your nervous system to sustain elevated states."
- "HeartMath research shows just 5 minutes of coherence practice can reduce cortisol by 23%."
- "In coherence, the heart sends more information to the brain than the brain sends to the heart."
- "Your emotional state literally changes your DNA expression. Elevated emotions activate healing genes."

Show these as small italic text at the bottom of the screen during idle state, rotating every 8 seconds with fade transitions.

## Color Palette (distinct from Health Twin but harmonious)

- Background: `#060D15` (deep cosmic blue-black)
- Heart wave: `#C5A572` (rose-gold warmth)
- Brain wave: `#7C6FD4` (indigo consciousness)
- Coherence glow: `#D4AF37` (gold — when in sync)
- Primary accent: `#4FD1C5` (teal — shared with Health Twin for continuity)
- Text primary: `#F5F0E8` (cream)
- Text secondary: `rgba(255,255,255,0.5)`
- Particles: mix of `#7C6FD4`, `#9B59B6`, `#D4AF37` at very low opacity

## Design Rules

- All imports use relative paths (no `@/` aliases)
- Do NOT modify `tsconfig.json`, `app.json`, or `eas.json`
- All animations use `useNativeDriver: true` where possible
- Use `React.memo` on visualization components
- Use `useMemo` for static calculations
- Same font weight/spacing conventions as Health Twin (200-300 for numbers, 300 for labels, 1.5 letter-spacing for uppercase)

## Navigation

- Accessible from: Heart organ detail card → "Heart-Brain Coherence →" button
- Also accessible from: Chat (when Gabriel suggests a coherence session)
- Add route in `app/_layout.tsx` for `heart-coherence`
- Back button returns to Health Twin (or wherever they came from)

## What Success Looks Like

This screen should feel like entering a different dimension of the app. The Health Twin is your physical body scan. This is your consciousness scan. The dual waveforms synchronizing should be mesmerizing — the kind of thing you show someone and they go quiet for a second. The breathing pacer should feel like the app is breathing WITH you. After a session, users should feel like they actually did something meaningful for their health, not just tracked a number. And the subtle Dispenza/HeartMath wisdom positions Gabriel as the only health app that understands consciousness shapes biology.
