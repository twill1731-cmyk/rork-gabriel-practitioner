# Prompt 37: Health Twin — "Holy Shit" Visual Upgrade

## CRITICAL: Preserve Everything That Exists

**DO NOT remove, replace, or restructure ANY existing components.** The body silhouette, organ dots, scan beam, particles, breathing animation, organ detail cards, XP bar, streak badge, aura layer, and character stats button ALL stay exactly as they are. You are ADDING new visual layers on top.

**Files you may modify (ADD ONLY):**
- `app/health-twin.tsx` — add new visual components, render them in the existing layout
- `constants/health-twin-data.ts` — only if you need to add connection data between organs

**Files you must NOT touch:**
- `constants/health-twin-leveling.ts`
- `app/character-stats.tsx`
- `app.json`, `eas.json`, `tsconfig.json`

## What to Build — 6 Visual Enhancements

### 1. Meridian Energy Flow Lines (HIGHEST PRIORITY)

Animated glowing lines that connect related organs, showing energy flowing through the body like a living circuit.

**Connections (these are anatomically/functionally related organ pairs):**
- Heart → Lungs (cardiovascular-respiratory)
- Liver → Gut (hepatic-digestive)
- Liver → Stomach (bile duct)
- Kidneys → Adrenals (adrenals sit on kidneys)
- Thyroid → Heart (thyroid regulates heart rate)
- Nervous System → Thyroid (brain-endocrine axis)
- Gut → Immune (gut-immune connection, 70% of immune system is in gut)
- Adrenals → Nervous System (HPA axis / stress response)

**Visual spec:**
- Curved SVG paths (use quadratic bezier `Q` curves, not straight lines) between organ dot positions
- Line color: teal `#4FD1C5` at 15% opacity for the static line
- Animated "pulse" traveling along each line: a bright dot (teal, 80% opacity) that moves from one organ to the other, taking 3-4 seconds per trip
- Use SVG `strokeDasharray` + `strokeDashoffset` animation to create the flowing effect
- Lines should feel like energy/chi flowing through meridians, not rigid connections
- Stagger the animations so different lines pulse at different times (not all synchronized)

### 2. Chakra Energy Centers Along the Spine

7 chakra points positioned along the body's centerline (spine), with their traditional colors. These are SEPARATE from the organ dots — they're spiritual energy centers.

**Positions (percentage-based, same coordinate system as organ dots):**
- Crown (Sahasrara): x:48, y:1 — color: `#9B59B6` (violet)
- Third Eye (Ajna): x:48, y:5 — color: `#4B0082` (indigo)
- Throat (Vishuddha): x:48, y:12 — color: `#3498DB` (blue)
- Heart (Anahata): x:48, y:21 — color: `#2ECC71` (green)
- Solar Plexus (Manipura): x:48, y:29 — color: `#F1C40F` (yellow)
- Sacral (Svadhisthana): x:48, y:40 — color: `#E67E22` (orange)
- Root (Muladhara): x:48, y:48 — color: `#E74C3C` (red)

**Visual spec:**
- Much smaller than organ dots (4px diameter, not 8px)
- Very subtle — opacity 0.25 normally, gentle pulse to 0.45
- No touch target (these are ambient, not interactive)
- Soft radial glow around each (6px radius, same color, 10% opacity)
- Connected by a very faint vertical line (the "sushumna" / central channel) — 1px, white, 5% opacity

### 3. Heartbeat Ripple Effect

The heart organ dot emits a rhythmic ripple, like a real heartbeat.

**Visual spec:**
- Every 1.5 seconds, a concentric ring expands outward from the heart dot position
- Ring starts at 8px diameter (size of dot), expands to 40px
- Color: same as heart's score color (teal if healthy)
- Opacity: starts at 0.4, fades to 0 as it expands
- Two rings staggered (second ring starts 0.3s after first) to mimic the "lub-dub" of a real heartbeat
- Use Animated.loop with Animated.parallel for the two rings

### 4. Staggered Organ Dot Entrance Animation

When the Health Twin screen opens, organ dots don't all appear at once. They cascade in from top to bottom.

**Visual spec:**
- Sort organs by y-position (top to bottom)
- Each dot fades in (opacity 0 → 1) + scales up (0.3 → 1) with a spring animation
- Stagger: 120ms delay between each dot
- Total entrance: ~1.5 seconds for all 12 dots
- The body silhouette and particles are already visible while dots cascade in
- Add a subtle "ping" scale overshoot (scale to 1.15 then settle to 1.0)

### 5. Sacred Geometry Background Layer

A very subtle rotating mandala/sacred geometry pattern behind the body. This is Gabriel's signature.

**Visual spec:**
- SVG circle with 12 evenly-spaced points connected to form a 12-pointed star
- Centered on the body's torso area (x:48%, y:30%)
- Size: roughly 60% of the body height
- Color: gold `#B8A088` at 3-4% opacity (VERY subtle, almost subliminal)
- Slow rotation: one full revolution every 60 seconds
- Use `Animated.loop` with `Animated.timing` rotating the SVG transform
- Add a second, smaller geometry shape inside (hexagon) rotating in the opposite direction at half speed
- This layer renders BEHIND the body silhouette but ABOVE the dark background

### 6. Breath-Synced Ambient Glow

The entire screen subtly pulses with a "breathing" rhythm, like the app itself is alive.

**Visual spec:**
- A large radial gradient centered on the body's chest area
- Color: teal `#4FD1C5`
- Opacity oscillates between 0.02 and 0.06 on a 4-second cycle (matches the body's existing breathing animation timing)
- This creates a subtle "the whole screen breathes" effect
- Layer this BEHIND everything (lowest z-index, above background color)

## Rendering Order (back to front)

1. Background color (#0A0F1A)
2. **NEW: Breath-synced ambient glow**
3. **NEW: Sacred geometry rotating layer**
4. Existing: Body silhouette (with breathing animation)
5. **NEW: Meridian energy flow lines**
6. **NEW: Chakra energy centers**
7. Existing: Floating particles
8. Existing: Scan beam
9. **NEW: Heartbeat ripple (renders at heart dot position)**
10. Existing: Organ dots (with **NEW staggered entrance**)
11. Existing: Score gauge, XP bar, streak badge, legend
12. Existing: Organ detail card overlay (when tapped)

## Animation Performance Rules

- ALL animations must use `useNativeDriver: true`
- Use `Animated.Value` (not `Animated.ValueXY` unless needed)
- Memoize static SVG paths with `useMemo`
- Use `React.memo` on all new components
- Keep total concurrent animations reasonable — the subtle ones (geometry rotation, ambient glow) should be lightweight
- Test that the screen stays at 60fps

## Design Rules (same as before)

- Dark theme: `#0A0F1A` background
- Teal `#4FD1C5` primary accent
- Gold `#B8A088` secondary accent  
- Gold bright `#D4AF37` for special accents
- Cream `#F5F0E8` for text
- All imports use relative paths (no `@/` aliases)
- Do NOT modify `tsconfig.json`, `app.json`, or `eas.json`

## What Success Looks Like

When someone opens the Health Twin screen, they should feel like they're looking at something from a sci-fi movie. The body should feel ALIVE — energy flowing through meridian lines, heart pulsing, chakras glowing softly along the spine, sacred geometry slowly rotating in the background, the whole screen gently breathing. It should make people grab their friend's arm and say "look at this." Every element is subtle on its own, but together they create a mesmerizing, living visualization that you want to stare at.
