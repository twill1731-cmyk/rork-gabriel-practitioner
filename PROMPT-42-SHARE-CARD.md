# Prompt 42: Health Twin Share Card — Social Virality

## CRITICAL: Preserve Everything That Exists
**DO NOT remove or restructure ANY existing components.** You are adding share functionality.

**DO NOT touch:** `app.json`, `eas.json`, `tsconfig.json`

## What to Build

A beautiful, screenshot-ready share card that users can post to Instagram Stories, iMessage, Twitter, etc. When someone sees it, they should want to download Gabriel.

### 1. `components/ShareCard.tsx` — The Shareable Image

A self-contained component that renders a visually stunning card (designed for Instagram Story dimensions 1080x1920, but works as a square too).

**Card Layout (dark background, premium feel):**

Top section:
- Gabriel logo (small, top-left)
- "My Health Twin" title (cream, elegant)

Center section:
- Simplified body silhouette outline (teal, minimal — just the outline, no organ dots)
- Overall health score in a large glowing ring (same style as Health Twin gauge)
- Level badge: "Lv.12 Seeker" with XP bar
- 6 character stats as mini bars in a row: Vitality, Clarity, Resilience, Digestion, Balance, Structure

Bottom section:
- Streak flame if active: "🔥 5 day streak"
- Heart-Brain Coherence score if available: "💜 72 Coherence"
- Small QR code or text: "trygabriel.ai" (so people know where to find it)
- "Powered by Gabriel" tagline

**Visual style:**
- Background: gradient from `#060D15` (top) to `#0A1A14` (bottom)
- Teal glow accent behind the body silhouette
- Gold accents for high scores
- Sacred geometry watermark (very subtle, 3% opacity) in background
- Border: thin 1px border with subtle teal glow
- Border radius: 24px
- Premium, dark, mysterious — makes people curious

### 2. Share Flow

**Trigger points (add share buttons to these screens):**

a) **Health Twin screen** — Add a share icon (Upload/Share icon from lucide) in the top-right area (next to the shield/stats button). Tapping it:
1. Renders the ShareCard off-screen
2. Captures it as an image using `react-native-view-shot`
3. Opens the native share sheet (React Native's `Share` API or `expo-sharing`)

b) **Character Stats screen** — Add a "Share My Stats" button at the bottom

c) **Heart-Brain Coherence screen** — Add a share button for coherence score

**Install dependency:**
```
npx expo install react-native-view-shot expo-sharing
```

### 3. Share Card Variations

The ShareCard component accepts a `variant` prop:

- `variant="health-twin"` — Full body + overall score + level (default)
- `variant="stats"` — Radar chart + all 6 stats + level
- `variant="coherence"` — Coherence score + waveform snapshot + level
- `variant="achievement"` — Single achievement unlocked (for sharing achievements)

Each variant uses the same dark premium frame but different center content.

### 4. Post-Share XP Reward

After a successful share:
- Award 25 XP
- Show a brief toast: "+25 XP for sharing!" with teal glow
- Track shares in AsyncStorage (for achievement: "Share your Health Twin 5 times")

## Design Rules
- Card must look stunning as a standalone image (no app chrome visible)
- Dark theme matches app but works as a social media post
- Text must be readable on both dark and light social media backgrounds
- Include "trygabriel.ai" prominently but tastefully — this is free marketing
- All imports use relative paths (no `@/` aliases)
- Do NOT modify `tsconfig.json`, `app.json`, or `eas.json`

## What Success Looks Like
A user opens their Health Twin, taps share, and gets a gorgeous dark card showing their health stats that looks like it belongs on a luxury brand's Instagram. Their friends see it, ask "what is this?", and download Gabriel. The card is the ad.
