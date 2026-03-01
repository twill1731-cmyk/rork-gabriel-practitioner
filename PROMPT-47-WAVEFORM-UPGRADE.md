# Prompt 47: Coherence Waveform — Futuristic Phase-Alignment Visualization

## CRITICAL: Preserve Everything That Exists
**DO NOT remove or restructure ANY existing screens or components.** You are REWRITING `components/CoherenceWaveform.tsx` and enhancing the waveform area in `app/heart-coherence.tsx`.

**DO NOT touch:** `app.json`, `eas.json`, `tsconfig.json`, `app/health-twin.tsx`, `constants/health-twin-data.ts`

## Context

The coherence waveform currently shows two basic wave lines (brain and heart). We're upgrading this to a futuristic, scientifically-accurate visualization where the waves visually demonstrate phase alignment (constructive interference) vs phase misalignment (destructive interference) based on the coherence score.

Think: sci-fi medical display from a movie set in 2087. Holographic, alive, mesmerizing.

## Rewrite: `components/CoherenceWaveform.tsx`

### Wave Behavior Based on Coherence Score

**Low Coherence (0-25 "Scattered"):**
- Heart wave: jagged, irregular, random amplitude spikes, chaotic
- Brain wave: completely different frequency, erratic, noisy
- Waves are visually disconnected — different speeds, different shapes
- No glow between them
- Background: dark, no ambient light
- Thin, dim lines (0.4 opacity)

**Medium-Low Coherence (26-50 "Settling"):**
- Heart wave: still rough but starting to show a pattern
- Brain wave: starting to slow down toward heart's frequency
- Occasional moments where peaks briefly align then drift apart
- Faint flickers of warm light between waves when they momentarily sync
- Lines slightly brighter (0.6 opacity)

**Medium-High Coherence (51-75 "Coherent"):**
- Heart wave: smooth sine-like pattern, consistent rhythm
- Brain wave: similar frequency, mostly in phase but with slight drift
- Waves are visibly "trying to lock in" — close but not perfect
- Steady warm glow between them where peaks align (teal-gold gradient, 15% opacity)
- Lines bright (0.8 opacity)
- Subtle particle sparkles at alignment points

**High Coherence (76-90 "Elevated"):**
- Both waves: smooth, clean sine waves at the SAME frequency
- Nearly perfect phase alignment — peaks match peaks, valleys match valleys
- Strong golden glow fills the space between aligned waves (constructive interference)
- The glow pulses subtly, like a heartbeat
- Energy particles flow between the two waves at sync points
- Lines fully bright (1.0 opacity) with subtle glow effect

**Peak Coherence (91-100 "Transcendent"):**
- Waves are perfectly synchronized — they appear to merge into ONE unified wave
- The two colors (indigo + rose-gold) blend into a luminous gold at sync points
- Intense golden-white glow radiates outward from the merged wave
- Particle burst effect — tiny golden particles emanate from the wave continuously
- The entire waveform area seems to "breathe" with energy
- Subtle sacred geometry pattern faintly visible behind the wave

### Visual Enhancements (Futuristic Feel)

#### Grid Background
- Faint horizontal grid lines behind the waves (like an oscilloscope or medical monitor)
- Color: `rgba(79, 209, 197, 0.04)` — barely visible
- 5-6 horizontal lines evenly spaced
- One center line slightly brighter (the zero/baseline)
- Grid adds "lab equipment" / diagnostic feel

#### Frequency Labels
- Left edge: tiny frequency indicator "~0.1 Hz" for heart rhythm
- Right edge: tiny "α 8-12 Hz" for brain alpha waves
- Color: white 20% opacity, 9px font
- These are real: heart coherence frequency IS ~0.1 Hz, brain alpha IS 8-12 Hz

#### Scan Line
- A thin vertical line that sweeps left-to-right across the waveform every 4 seconds
- Color: teal at 30% opacity with a 2px bright core
- Leaves a brief "trail" of brightness as it passes (fades over 0.5 seconds)
- Like a radar sweep or EKG trace head

#### Wave Trail / Afterglow
- Each wave leaves a faint "echo" trail behind it — previous cycles shown at decreasing opacity
- Creates depth, like you're seeing the wave's history
- 3 echo trails at 15%, 8%, 3% opacity behind the current wave

#### Glow Between Waves (Constructive Interference)
- When waves are aligned (high coherence), the area BETWEEN the two waves fills with light
- Use an SVG path that traces from one wave to the other
- Fill: linear gradient from indigo (brain color) through gold to rose-gold (heart color)
- Opacity scales with coherence: 0% at score 0, 25% at score 100
- This represents the amplified electromagnetic field — the constructive interference made visible

#### Edge Glow
- Top and bottom of the waveform container have a subtle vignette
- Fades to the background color, creating a "floating hologram" effect
- The waveform appears to be projected, not contained

#### Animated Data Points
- Tiny dots ride along each wave line (like data points being plotted in real-time)
- 3-4 dots per wave, moving with the wave animation
- Dot size: 3px, same color as their wave, with a tiny glow
- These make it feel like LIVE data, not a static animation

### Wave Generation (Technical)

Generate waves using sine functions with controlled parameters:

```
Heart wave: y = A_h * sin(2π * f_h * t + phase_h) + noise_h
Brain wave: y = A_b * sin(2π * f_b * t + phase_b) + noise_b

Where:
- A = amplitude (increases with coherence)
- f = frequency (converges as coherence increases)
- phase = phase offset (approaches 0 as coherence increases)
- noise = random noise (decreases with coherence)
```

At low coherence: f_h ≠ f_b, phase is random, noise is high
At high coherence: f_h ≈ f_b, phase ≈ 0, noise ≈ 0

Animate by incrementing `t` over time. Both waves scroll continuously left-to-right.

### Container Sizing
- Full width of the screen minus 32px padding (16px each side)
- Height: 220px (taller than current to give waves room to breathe)
- Border radius: 20px
- Background: `#0A1218` (slightly different from screen bg, creates depth)
- Border: 1px `rgba(79, 209, 197, 0.06)`
- Overflow: hidden (waves clip at edges)

### Labels Below Waveform
Keep the existing "● Brain  ● Heart" legend but enhance:
- Add coherence score label between them: "72% Aligned"
- Brain dot: indigo `#7C6FD4`
- Heart dot: rose-gold `#C5A572`
- "Aligned" text: color based on coherence level

## Also Fix: Practitioner Connection Status (Prompt 46 was missed)

Rork didn't build the practitioner connection visualization from Prompt 46. Add it now:

In `components/HealthDashboard.tsx`, enhance the "My Practitioners" section:

### For each practitioner row, add:
- **Active connection**: Replace the static pin icon with a pulsing teal dot (10px, scale 1.0→1.2→1.0 on 2s loop) with a soft glow ring (16px, teal 15% opacity)
- **Pending**: Gold dot (8px), slow blink (opacity 0.4→0.8→0.4, 3s cycle), add small "Pending" text in gold
- **Inactive**: Gray dot, no animation

### Add to each practitioner row:
- "Last sync: 2h ago" in teal, 11px, below the specialty text (for active connections)
- A subtle animated dashed line (1px, teal 15% opacity) with dash offset animating to show "data flowing"

### Update demo practitioner data to include:
- Dr. Sarah Chen: `connectionStatus: 'active'`, lastSync: '2h ago'
- Dr. Michael Torres: `connectionStatus: 'active'`, lastSync: '5h ago'  
- Dr. Amy Myers: `connectionStatus: 'pending'`, lastSync: null

## Design Rules
- All animations: `useNativeDriver: true` where possible
- Use SVG `Path` for wave rendering (react-native-svg)
- Memoize wave point calculations with `useMemo`
- `React.memo` on the entire waveform component
- Target 60fps — wave animation should be butter smooth
- All imports use relative paths (no `@/` aliases)
- Do NOT modify `tsconfig.json`, `app.json`, or `eas.json`

## Color Reference
- Brain wave: `#7C6FD4` (indigo)
- Heart wave: `#C5A572` (rose-gold)
- Constructive interference glow: `#D4AF37` (gold)
- Grid lines: `rgba(79, 209, 197, 0.04)`
- Scan line: `rgba(79, 209, 197, 0.3)`
- Background: `#0A1218`
- Active connection dot: `#4FD1C5`
- Pending dot: `#B8A088`

## What Success Looks Like
The waveform looks like a piece of medical technology from the future. The phase-alignment behavior tells a STORY — you can literally SEE incoherence (chaos, disconnection) vs coherence (harmony, amplification). At peak coherence, the merged wave with golden glow radiating outward should give people chills. This is the visual that makes people understand what heart-brain coherence IS without reading a word. It's science made beautiful.
