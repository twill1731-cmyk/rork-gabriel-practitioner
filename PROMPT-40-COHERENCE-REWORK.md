# Prompt 40: Rework Heart-Brain Coherence — Data Tracking & Interpretation (Not Meditation)

## Context

The Heart-Brain Coherence screen currently has a guided breathing pacer and "Begin Session" flow that makes it feel like a meditation app. That's NOT what Gabriel is. Gabriel is a health INTERPRETER — it reads your data from real devices and practitioners, interprets it, shows trends, and connects you with practitioners who offer these diagnostics.

**Strip out all meditation/breathing/session features. Replace with data logging, interpretation, and practitioner discovery.**

## CRITICAL: What to Remove

Delete these files entirely:
- `components/BreathingPacer.tsx` — DELETE this file
- `components/CoherenceHistory.tsx` — will be rewritten below

## CRITICAL: What to Keep

- `components/CoherenceWaveform.tsx` — KEEP but repurpose (see below)
- `constants/heart-coherence-data.ts` — REWRITE (see below)
- `app/heart-coherence.tsx` — REWRITE (see below)
- `app/_layout.tsx` — keep the route, don't touch
- `components/HealthDashboard.tsx` — don't touch (coherence card stays)

**DO NOT touch:**
- `app/health-twin.tsx` (except the coherence button on heart detail card stays)
- `app/character-stats.tsx`
- `constants/health-twin-data.ts`
- `constants/health-twin-leveling.ts`
- `app.json`, `eas.json`, `tsconfig.json`

## New Data Layer: `constants/heart-coherence-data.ts` (REWRITE)

```typescript
export interface CoherenceReading {
  id: string;
  date: string;
  source: CoherenceSource;
  coherenceScore: number;        // 0-100
  hrvMs: number | null;          // heart rate variability in ms
  notes: string;
  practitionerId: string | null; // if done at a practitioner
}

export type CoherenceSource = 
  | 'heartmath'       // HeartMath Inner Balance sensor
  | 'biowell'         // Bio-Well GDV camera
  | 'practitioner'    // In-office reading
  | 'apple-health'    // Derived from Apple Health HRV data
  | 'manual';         // Manual entry

export type CoherenceLevel = 
  | 'scattered'    // 0-25
  | 'settling'     // 26-50
  | 'coherent'     // 51-75
  | 'elevated'     // 76-90
  | 'transcendent'; // 91-100

export interface CoherenceInsight {
  title: string;
  body: string;
  category: 'interpretation' | 'recommendation' | 'connection';
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
    case 'transcendent': return '#D4AF37';
    case 'elevated': return '#4FD1C5';
    case 'coherent': return '#7C6FD4';
    case 'settling': return '#C5A572';
    case 'scattered': return '#e87b6b';
  }
}

export function getCoherenceLevelLabel(level: CoherenceLevel): string {
  switch (level) {
    case 'transcendent': return 'Transcendent';
    case 'elevated': return 'Elevated';
    case 'coherent': return 'Coherent';
    case 'settling': return 'Settling';
    case 'scattered': return 'Scattered';
  }
}

export const SOURCE_LABELS: Record<CoherenceSource, { label: string; icon: string }> = {
  heartmath: { label: 'HeartMath', icon: '💚' },
  biowell: { label: 'Bio-Well', icon: '🔮' },
  practitioner: { label: 'Practitioner', icon: '🩺' },
  'apple-health': { label: 'Apple Health', icon: '⌚' },
  manual: { label: 'Manual Entry', icon: '✏️' },
};

// Gabriel's interpretations based on coherence level
export function getGabrielInsights(score: number, readings: CoherenceReading[]): CoherenceInsight[] {
  const level = getCoherenceLevel(score);
  const insights: CoherenceInsight[] = [];

  // Interpretation
  if (level === 'transcendent') {
    insights.push({
      title: 'Exceptional Coherence',
      body: 'Your heart and brain are in deep synchronization. This state is associated with enhanced intuition, accelerated healing, and elevated gene expression. Research shows sustained coherence at this level can measurably reduce inflammatory markers.',
      category: 'interpretation',
    });
  } else if (level === 'elevated') {
    insights.push({
      title: 'Strong Coherence',
      body: 'Your heart rhythm patterns show organized, sine-wave-like oscillations. This indicates your autonomic nervous system is balanced and your body is in a regenerative state rather than survival mode.',
      category: 'interpretation',
    });
  } else if (level === 'coherent') {
    insights.push({
      title: 'Building Coherence',
      body: 'Your heart-brain communication is functional but has room to deepen. The heart generates an electromagnetic field 5,000 times stronger than the brain — as coherence improves, this field becomes more organized and influential.',
      category: 'interpretation',
    });
  } else if (level === 'settling') {
    insights.push({
      title: 'Developing Coherence',
      body: 'Your readings suggest your nervous system spends significant time in sympathetic (stress) dominance. Heart-brain coherence practices can help shift toward parasympathetic balance, where healing and regeneration occur.',
      category: 'interpretation',
    });
  } else {
    insights.push({
      title: 'Low Coherence Detected',
      body: 'Your heart rhythm patterns are irregular, suggesting stress-driven autonomic activity. This is common and reversible. Chronic incoherence is linked to elevated cortisol, reduced immune function, and impaired cognitive performance.',
      category: 'interpretation',
    });
  }

  // Trend insight if multiple readings
  if (readings.length >= 3) {
    const recent = readings.slice(0, 3).map(r => r.coherenceScore);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const older = readings.slice(-3).map(r => r.coherenceScore);
    const oldAvg = older.reduce((a, b) => a + b, 0) / older.length;
    if (avg > oldAvg + 5) {
      insights.push({
        title: 'Upward Trend',
        body: `Your coherence has improved ${Math.round(avg - oldAvg)} points on average compared to earlier readings. Whatever you're doing is working.`,
        category: 'interpretation',
      });
    }
  }

  // Recommendation
  insights.push({
    title: 'Deepen Your Understanding',
    body: 'For the most accurate coherence measurements, work with a certified HeartMath or Bio-Well practitioner who can provide clinical-grade readings and personalized protocols.',
    category: 'recommendation',
  });

  return insights;
}

// Demo readings for MVP
export const DEMO_READINGS: CoherenceReading[] = [
  { id: '1', date: '2026-02-25', source: 'heartmath', coherenceScore: 72, hrvMs: 68, notes: 'Morning reading, felt focused', practitionerId: null },
  { id: '2', date: '2026-02-22', source: 'practitioner', coherenceScore: 81, hrvMs: 74, notes: 'Session with Dr. Chen, post-treatment reading', practitionerId: 'dr-chen' },
  { id: '3', date: '2026-02-18', source: 'heartmath', coherenceScore: 58, hrvMs: 52, notes: 'Evening, stressful day', practitionerId: null },
  { id: '4', date: '2026-02-14', source: 'biowell', coherenceScore: 65, hrvMs: null, notes: 'Bio-Well full scan at wellness center', practitionerId: null },
  { id: '5', date: '2026-02-10', source: 'apple-health', coherenceScore: 45, hrvMs: 42, notes: 'Derived from Apple Watch HRV', practitionerId: null },
];
```

## New Screen: `app/heart-coherence.tsx` (REWRITE)

### Background
- Base color: `#060D15` (deep cosmic blue-black)
- Subtle radial gradient, violet-to-transparent, 3% opacity
- Fewer particles than Health Twin, larger, slower, violet/indigo/gold tones

### Layout (scrollable)

#### Header
- Close button (X) top-left
- Title: **"Heart-Brain Coherence"** centered
- Subtitle: "The energy that forms the body"

#### Current Score Section
- Large coherence score from most recent reading (e.g. "72")
- Glowing ring around it, color based on level
- Level label below (e.g. "Coherent") in level color
- Source badge: "via HeartMath • Feb 25" (small, muted text showing where the reading came from and when)

#### Waveform Visualization
- KEEP the `CoherenceWaveform` component but modify it:
- Instead of simulating real-time data, it visualizes the CURRENT score aesthetically
- Higher scores = smoother, more synchronized waves
- Lower scores = more chaotic, desynchronized waves
- This is a beautiful ambient visualization of their data, NOT a live reading
- Heart wave (rose-gold) + Brain wave (indigo), same as before

#### Gabriel's Insights Section
- Header: "Gabriel's Analysis" with a subtle ✨ icon
- Cards for each insight returned by `getGabrielInsights()`
- Card style: `#111B2A` background, 1px border `rgba(124, 111, 212, 0.12)`, 16px border radius
- Each card has: title (cream, font-weight 500), body (white 60% opacity, font-weight 300, line-height 21)
- Recommendation cards have a subtle indigo left border accent

#### Reading History
- Header: "Your Readings" with a "Log Reading +" button on the right
- List of past readings, each showing:
  - Date
  - Source icon + label (e.g. "💚 HeartMath")
  - Coherence score with color dot
  - HRV value if available
  - Brief note
- Tap a reading to see full detail (just expand inline, no new screen needed)

#### Log a Reading (Modal/Sheet)
- Tapping "Log Reading +" opens a bottom sheet
- Fields:
  - **Source**: pill selector (HeartMath, Bio-Well, Practitioner, Apple Health, Manual)
  - **Coherence Score**: number input (0-100)
  - **HRV (optional)**: number input in ms
  - **Notes (optional)**: text input
  - **Date**: defaults to today, tappable to change
- "Save Reading" button (teal fill)
- Save to AsyncStorage (for MVP, no backend yet)

#### Find a Practitioner CTA
- At the bottom of the scroll, a prominent card:
- "Get a Professional Coherence Assessment"
- "Clinical-grade HeartMath and Bio-Well measurements from certified practitioners in your area"
- "Find Practitioners →" button (teal outline)
- This button can just show an alert for now: "Practitioner directory coming soon"

### Bottom Section
- Small educational text that rotates (same wisdom quotes from Prompt 38, but fewer — only the data/science ones):
  - "The heart generates an electromagnetic field 5,000 times stronger than the brain."
  - "HeartMath research shows coherence practice can reduce cortisol by 23%."
  - "In coherence, the heart sends more information to the brain than the brain sends to the heart."
  - "Your emotional state literally changes your DNA expression."

## Delete
- `components/BreathingPacer.tsx` — DELETE entirely

## Rewrite
- `components/CoherenceHistory.tsx` — Rewrite as the reading history list described above (not a chart, a list of logged readings with source badges and scores)

## Keep As-Is
- `components/CoherenceWaveform.tsx` — Keep the visual but it now represents stored data aesthetically, not real-time simulation

## Design Rules
- Dark theme: `#060D15` background, `#111B2A` cards
- Indigo `#7C6FD4` as primary accent (distinct from Health Twin's teal)
- Gold `#D4AF37` for high scores
- Teal `#4FD1C5` for buttons/CTAs (continuity with rest of app)
- Rose-gold `#C5A572` for heart wave
- Cream `#F5F0E8` for primary text
- All imports use relative paths (no `@/` aliases)
- Do NOT modify `tsconfig.json`, `app.json`, or `eas.json`
- All animations use `useNativeDriver: true`
- Use `React.memo` and `useMemo` where appropriate

## What Success Looks Like
This screen says: "Gabriel understands the cutting-edge science of heart-brain coherence, and it can interpret YOUR data from real devices." It's not a toy meditation timer. It's a serious health intelligence tool that happens to look beautiful. Users log real readings from real devices, Gabriel tells them what it means, and when they want to go deeper, Gabriel connects them with a certified practitioner. That's the funnel.
