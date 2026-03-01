# Prompt 39: Add Heart-Brain Coherence Card to Health Dashboard

## CRITICAL: Preserve Everything That Exists

**DO NOT remove, replace, or restructure ANY existing components.** You are adding ONE new component to ONE existing file.

**DO NOT touch:**
- `app/health-twin.tsx`
- `app/heart-coherence.tsx`
- `app/character-stats.tsx`
- `constants/` files
- `app.json`, `eas.json`, `tsconfig.json`

## What to Build

Add a **Heart-Brain Coherence card** to `components/HealthDashboard.tsx`, positioned directly below the existing `HealthTwinCard`.

### CoherenceCard Component

Same visual style as `HealthTwinCard` (match the container, typography, and layout exactly), but with coherence-specific content:

**Layout (same structure as HealthTwinCard):**
- Left side: A small visual — two overlapping wave lines (one rose-gold `#C5A572`, one indigo `#7C6FD4`) with a subtle pulse animation. Simple SVG, ~40x40px.
- Center:
  - Title: **"Heart-Brain Coherence"**
  - Subtitle: "Mind-body energy alignment"  
  - Score row: coherence score (e.g. "58") + level label (e.g. "Coherent") in the level's color
- Right: ChevronRight arrow (same as HealthTwinCard)

**On tap:** Navigate to `/heart-coherence` (close the dashboard first, same pattern as HealthTwinCard)

**Data:** Import `DEMO_COHERENCE_PROFILE` and `getCoherenceLevel` and `getCoherenceLevelColor` from `../constants/heart-coherence-data`

### Where to Render

In the `HealthDashboard` component's main content/scroll area, render `<CoherenceCard />` immediately after `<HealthTwinCard />`. Pass the same `onClose` and `onNavigate` props.

### Style

- Use the EXACT same container style as `HealthTwinCard` (same padding, border radius, background color, border)
- Match font sizes, weights, colors, and spacing
- The wave icon animation: two small SVG sine wave paths that gently pulse in opacity (0.4 to 0.8), staggered timing
- Keep it clean and minimal — this card should feel like a natural sibling to the Health Twin card

## What Success Looks Like

When a user swipes open the Health Dashboard from the chat screen, they see two equal-weight cards stacked:
1. **Health Twin** — their physical body map
2. **Heart-Brain Coherence** — their consciousness/energy state

Both are one tap away. No digging through sub-menus. The coherence feature is now a first-class citizen of the app, right next to the Health Twin.
