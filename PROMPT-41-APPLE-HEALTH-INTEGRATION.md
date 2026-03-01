# Prompt 41: Apple Health Integration — Real Data for the Health Twin

## Context

The Health Twin currently shows demo/hardcoded organ scores. This prompt connects Apple Health (HealthKit) so real wearable data flows into the app. When a user wears an Apple Watch or uses iPhone health features, their Health Twin lights up with actual data.

## CRITICAL: Preserve Everything That Exists

**DO NOT remove, replace, or restructure ANY existing components.** You are adding a new health data service, a connection UI, and wiring real data into existing components.

**DO NOT touch:**
- `app/health-twin.tsx` (visual layer stays as-is)
- `app/heart-coherence.tsx`
- `app/character-stats.tsx`
- `components/CoherenceWaveform.tsx`
- `components/CoherenceHistory.tsx`
- `app.json`, `eas.json`, `tsconfig.json`

## Dependencies

Install `react-native-health` for HealthKit access:
```
npx expo install react-native-health
```

If `react-native-health` is not compatible with Expo, use `expo-health-connect` or the Expo HealthKit community package. Pick whichever works with the current Expo SDK version. The key is HealthKit read access.

## Files to Create

### 1. `services/apple-health.ts` — HealthKit Service

Core service that handles all Apple Health reads.

```typescript
// Types
export interface HealthData {
  heartRate: HealthMetric | null;          // bpm (resting)
  heartRateVariability: HealthMetric | null; // ms (SDNN)
  sleepHours: HealthMetric | null;         // hours last night
  sleepQuality: HealthMetric | null;       // derived from stages
  steps: HealthMetric | null;             // daily count
  bloodOxygen: HealthMetric | null;       // SpO2 %
  respiratoryRate: HealthMetric | null;   // breaths/min
  activeEnergy: HealthMetric | null;      // kcal burned
  restingEnergy: HealthMetric | null;     // kcal
  bodyTemperature: HealthMetric | null;   // °F
  weight: HealthMetric | null;            // lbs
  bloodPressureSystolic: HealthMetric | null;
  bloodPressureDiastolic: HealthMetric | null;
  vo2Max: HealthMetric | null;            // ml/kg/min
}

export interface HealthMetric {
  value: number;
  unit: string;
  date: string;        // ISO date of most recent reading
  trend: 'up' | 'down' | 'stable';  // compared to 7-day average
  weekAverage: number | null;
}

// Permissions to request
const READ_PERMISSIONS = [
  'HeartRate',
  'HeartRateVariabilitySDNN',
  'SleepAnalysis',
  'StepCount',
  'OxygenSaturation',
  'RespiratoryRate',
  'ActiveEnergyBurned',
  'BasalEnergyBurned',
  'BodyTemperature',
  'BodyMass',
  'BloodPressureSystolic',
  'BloodPressureDiastolic',
  'Vo2Max',
];

// Functions to implement:

// initHealthKit() — request permissions, return success/failure
// fetchAllHealthData() — pull latest values for all metrics
// fetchMetric(type, days) — pull specific metric with trend calculation
// calculateTrend(values[]) — compare recent vs 7-day avg → up/down/stable
// isHealthKitAvailable() — check if device supports HealthKit
```

### 2. `services/health-score-engine.ts` — Score Calculator

Maps Apple Health data to organ scores. This is the LOCAL scoring engine (before the full backend is built).

```typescript
import { HealthData } from './apple-health';
import { OrganData } from '../constants/health-twin-data';

export interface OrganScoreResult {
  organId: string;
  score: number;           // 0-10
  confidence: 'high' | 'medium' | 'low' | 'unlit';
  dataSources: string[];
  reasoning: string;       // brief explanation
}

// Mapping: which health metrics affect which organs
const ORGAN_METRIC_MAP = {
  'heart': {
    metrics: ['heartRate', 'heartRateVariability', 'bloodPressureSystolic', 'bloodPressureDiastolic', 'vo2Max'],
    weights: [0.25, 0.30, 0.20, 0.10, 0.15],
  },
  'lungs': {
    metrics: ['respiratoryRate', 'bloodOxygen', 'vo2Max'],
    weights: [0.30, 0.40, 0.30],
  },
  'nervous-system': {
    metrics: ['heartRateVariability', 'sleepQuality', 'sleepHours'],
    weights: [0.40, 0.35, 0.25],
  },
  'immune': {
    metrics: ['sleepHours', 'sleepQuality', 'bodyTemperature', 'steps'],
    weights: [0.30, 0.30, 0.20, 0.20],
  },
  'musculoskeletal': {
    metrics: ['steps', 'activeEnergy', 'vo2Max'],
    weights: [0.35, 0.35, 0.30],
  },
  'gut': {
    metrics: ['sleepQuality'], // limited data from wearables
    weights: [1.0],
  },
  'liver': {
    metrics: [], // no direct wearable data for liver
    weights: [],
  },
  'kidneys': {
    metrics: [], // no direct wearable data
    weights: [],
  },
  'thyroid': {
    metrics: ['heartRate', 'bodyTemperature', 'restingEnergy'],
    weights: [0.35, 0.35, 0.30],
  },
  'adrenals': {
    metrics: ['heartRateVariability', 'sleepQuality', 'heartRate'],
    weights: [0.40, 0.35, 0.25],
  },
  'stomach': {
    metrics: [], // no direct wearable data
    weights: [],
  },
  'reproductive': {
    metrics: ['sleepHours', 'activeEnergy'],
    weights: [0.50, 0.50],
  },
};

// Score normalization ranges (functional, not just "normal")
// Example: resting HR 50-60 = optimal (9-10), 60-70 = good (7-8), 70-80 = fair (5-6), 80+ = concerning (3-4)
// These should be based on functional/optimal ranges, not just conventional lab ranges

// Functions to implement:
// calculateOrganScores(healthData: HealthData): OrganScoreResult[]
// normalizeMetric(type: string, value: number): number (0-10)
// calculateConfidence(availableMetrics: number, totalMetrics: number): confidence level
// generateReasoning(organId: string, scores: Map<string, number>): string
```

### 3. `app/connect-health.tsx` — Apple Health Connection Screen

Accessible from Health Dashboard and Settings.

**Layout:**

Header: "Connect Your Data"
Subtitle: "The more data Gabriel has, the more accurate your Health Twin becomes."

**Apple Health Card:**
- Apple Health icon (heart icon) + "Apple Health"
- Status: "Connected ✓" (green) or "Not Connected" 
- If not connected: "Connect" button → triggers HealthKit permission request
- If connected: shows last sync time + list of available metrics with checkmarks
- "Sync Now" button to pull latest data

**Other Data Sources (coming soon):**
- HeartMath Inner Balance — "Coming Soon" badge
- Bio-Well — "Coming Soon" badge  
- Lab Results — "Upload Labs" → placeholder for now
- Each shown as a card with the source icon, name, and status

**Connected Metrics Display (when Apple Health is connected):**
Show which metrics are available from the user's device:
- ✅ Heart Rate (68 bpm, updated 2h ago)
- ✅ HRV (42ms, updated today)
- ✅ Sleep (7.2h last night)
- ✅ Steps (8,432 today)
- ❌ Blood Oxygen (no data — device doesn't support or not enabled)
- etc.

Gray out metrics with no data. Show the most recent value for available ones.

**Bottom CTA:**
"Your Health Twin accuracy: 34%" (based on how many data sources are connected)
"Connect more sources to improve your score accuracy"

### 4. Modify `constants/health-twin-data.ts` — Dynamic Scores

Currently `ORGAN_DATA` is a static array with hardcoded scores. Add a mechanism to override scores with real data:

- Add an `export let dynamicScores: Map<string, Partial<OrganData>> = new Map();`
- Add a function `updateOrganScore(organId: string, score: number, confidence: DataConfidence, dataSources: string[])`
- The existing `ORGAN_DATA` array serves as the fallback/demo data
- Components that read `ORGAN_DATA` should check `dynamicScores` first

### 5. Modify `components/HealthDashboard.tsx` — Add Connect Health Card

Add a "Connect Your Data" card below the Heart-Brain Coherence card. Same style as the other cards.

- Icon: heart with plus sign
- Title: "Connect Your Data"
- Subtitle: "Sync Apple Health, labs & devices"
- Status: "2 of 6 sources connected" or "Not connected"
- Taps to `/connect-health`

### 6. Health Data Summary on Health Twin Screen

Add a small, subtle banner at the bottom of the Health Twin screen (above the legend):
- If Apple Health is connected: "Powered by Apple Health • Updated 2h ago" (very small, muted text)
- If not connected: "Connect Apple Health for real-time data →" (tappable, navigates to connect-health)

## Navigation

- Add route for `app/connect-health.tsx` in `app/_layout.tsx`
- Accessible from: Health Dashboard card, Settings screen, Health Twin banner
- Style: fullScreenModal presentation (same as Health Twin)

## Permissions & Privacy

- Only request READ permissions (never write to Apple Health)
- Show a clear explanation before requesting: "Gabriel reads your health data to power your Health Twin. We never store your data on our servers."
- Handle permission denied gracefully: "Apple Health access denied. You can enable it in Settings → Privacy → Health → Gabriel"
- All health data stays on-device (AsyncStorage cache). No server upload for MVP.

## Design Rules

- Dark theme: `#0A0F1A` background, `#111B2A` cards
- Teal `#4FD1C5` for connected/active states
- Gold `#B8A088` for secondary
- Red `#e87b6b` for disconnected/warning
- Cream `#F5F0E8` for text
- All imports use relative paths (no `@/` aliases)
- Do NOT modify `tsconfig.json`, `app.json`, or `eas.json`
- Use `React.memo` and `useMemo` where appropriate

## What Success Looks Like

A user opens Gabriel, connects Apple Health in 2 taps, and immediately sees their Health Twin organ scores update with real data from their Apple Watch. The heart dot brightens because it now has HRV + resting HR data. The nervous system dot shifts because real sleep data is flowing in. Organs with no wearable data (liver, kidneys) stay at lower confidence, naturally driving the user to "upload labs" or "find a practitioner" for more complete data. The Health Twin goes from a cool demo to a living, breathing reflection of their actual health.
