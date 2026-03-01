# Prompt 36: Health Twin Gamification — RPG Character System

## CRITICAL: Preserve Everything That Exists

**DO NOT MODIFY these files:**
- `app/health-twin.tsx` — the body silhouette, organ dots, scan beam, particles, breathing animation, organ detail cards ALL stay exactly as they are
- `constants/health-twin-data.ts` — organ positions and data stay exactly as they are

**You are ADDING to the Health Twin, not replacing it.**

## What to Build

### 1. XP & Leveling System (`constants/health-twin-leveling.ts`)

Create a new file with the gamification data layer:

```typescript
export interface HealthTwinProfile {
  level: number;           // 1-100
  xp: number;             // current XP
  xpToNextLevel: number;  // XP needed for next level
  title: string;          // "Novice", "Awakened", "Ascended", etc.
  streaks: {
    checkIn: number;      // consecutive days
    supplement: number;   // consecutive days
    longest: number;      // all-time longest
  };
  achievements: Achievement[];
  stats: CharacterStats;
}

export interface CharacterStats {
  vitality: number;      // heart + cardiovascular (0-100)
  clarity: number;       // nervous system + mental (0-100)
  resilience: number;    // immune system (0-100)
  digestion: number;     // gut + stomach + liver (0-100)
  balance: number;       // endocrine + hormonal (0-100)
  structure: number;     // musculoskeletal (0-100)
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;          // emoji
  unlockedAt: string | null;
  category: 'streak' | 'milestone' | 'discovery' | 'mastery';
}

// Title progression
export const LEVEL_TITLES: { minLevel: number; title: string; color: string }[] = [
  { minLevel: 1, title: 'Novice', color: '#a89d8c' },
  { minLevel: 10, title: 'Seeker', color: '#a89d8c' },
  { minLevel: 20, title: 'Awakened', color: '#B8A088' },
  { minLevel: 35, title: 'Attuned', color: '#B8A088' },
  { minLevel: 50, title: 'Harmonized', color: '#4FD1C5' },
  { minLevel: 65, title: 'Illuminated', color: '#4FD1C5' },
  { minLevel: 80, title: 'Transcendent', color: '#D4AF37' },
  { minLevel: 90, title: 'Ascended', color: '#D4AF37' },
  { minLevel: 100, title: 'Radiant', color: '#FFFFFF' },
];

// XP curve: each level requires progressively more XP
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

// XP rewards
export const XP_REWARDS = {
  dailyCheckIn: 25,
  supplementLogged: 10,
  labUploaded: 200,
  protocolCompleted: 500,
  streakBonus7Day: 100,
  streakBonus30Day: 500,
  firstOrganTap: 15,
  askGabriel: 5,
};

// Achievements
export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-check-in', name: 'First Steps', description: 'Complete your first daily check-in', icon: '🌱', unlockedAt: null, category: 'milestone' },
  { id: 'streak-7', name: 'Weekly Warrior', description: '7-day check-in streak', icon: '🔥', unlockedAt: null, category: 'streak' },
  { id: 'streak-30', name: 'Monthly Master', description: '30-day check-in streak', icon: '⚡', unlockedAt: null, category: 'streak' },
  { id: 'streak-100', name: 'Centurion', description: '100-day check-in streak', icon: '👑', unlockedAt: null, category: 'streak' },
  { id: 'first-lab', name: 'Data Driven', description: 'Upload your first lab results', icon: '🔬', unlockedAt: null, category: 'milestone' },
  { id: 'all-organs', name: 'Body Explorer', description: 'Tap every organ on your Health Twin', icon: '🗺️', unlockedAt: null, category: 'discovery' },
  { id: 'level-10', name: 'Awakening', description: 'Reach Level 10', icon: '✨', unlockedAt: null, category: 'mastery' },
  { id: 'level-25', name: 'Rising', description: 'Reach Level 25', icon: '🌅', unlockedAt: null, category: 'mastery' },
  { id: 'level-50', name: 'Halfway There', description: 'Reach Level 50', icon: '⭐', unlockedAt: null, category: 'mastery' },
  { id: 'level-100', name: 'Radiant Being', description: 'Reach Level 100', icon: '👼', unlockedAt: null, category: 'mastery' },
  { id: 'protocol-complete', name: 'Protocol Master', description: 'Complete your first full protocol', icon: '🎯', unlockedAt: null, category: 'milestone' },
  { id: 'ask-gabriel-10', name: 'Curious Mind', description: 'Ask Gabriel 10 health questions', icon: '💡', unlockedAt: null, category: 'discovery' },
];

// Demo profile for MVP (before real data)
export const DEMO_PROFILE: HealthTwinProfile = {
  level: 12,
  xp: 340,
  xpToNextLevel: 535,
  title: 'Seeker',
  streaks: { checkIn: 5, supplement: 3, longest: 12 },
  achievements: ALL_ACHIEVEMENTS.map(a =>
    ['first-check-in', 'streak-7', 'level-10'].includes(a.id)
      ? { ...a, unlockedAt: '2026-02-20' }
      : a
  ),
  stats: {
    vitality: 78,
    clarity: 68,
    resilience: 65,
    digestion: 52,
    balance: 48,
    structure: 70,
  },
};
```

### 2. Visual Progression on Body (`app/health-twin.tsx` — ADD, don't replace)

Add these visual elements to the existing HealthTwinScreen. **Keep every existing component intact.** Layer these ON TOP:

#### a. Aura intensity based on level
- Level 1-20: very faint teal glow around body outline (opacity 0.05)
- Level 21-50: brighter teal aura (opacity 0.12) + subtle outer ring
- Level 51-79: bright teal + gold particles mixed in
- Level 80-99: golden aura, sacred geometry faint mandala behind body
- Level 100: full radiant white-gold, particle burst

Implement this as a new `<AuraLayer level={profile.level} />` component rendered BEHIND the body silhouette but ABOVE the background.

#### b. XP bar below the score gauge
- Thin horizontal bar (2px height, rounded) below "YOUR HEALTH TWIN" / "Moderate" text
- Background: rgba(255,255,255,0.06)
- Fill: teal (#4FD1C5) gradient, animated width based on xp/xpToNextLevel
- Small "Lv.12" badge to the left, "340/535 XP" text to the right
- The title ("Seeker") replaces or sits next to "Moderate" label

#### c. Streak flame icon
- If checkIn streak >= 3, show a small 🔥 with the streak number near the top-right
- Subtle pulse animation on the flame

#### d. Stats radar on organ detail card
When an organ is tapped and the detail card slides up, ADD (below the existing note text, above the "Ask Gabriel" button):
- The relevant character stat for that organ system as a mini progress bar
- Example: Tap Heart → shows "Vitality: 78/100" with a teal fill bar
- "+10 XP: Complete cardiovascular check-in" hint text below

### 3. Character Stats Screen (`app/character-stats.tsx`)

New screen accessible from a small button on the Health Twin (e.g., a shield/stats icon in the top-right, opposite the X close button).

Layout (dark theme, same style as Health Twin):
- **Header**: Level badge + title + XP bar (larger version)
- **Stats hexagon/radar chart**: 6 stats (Vitality, Clarity, Resilience, Digestion, Balance, Structure) displayed as a radar/hexagon chart using SVG. Fill color = teal at current values, gray outline for max.
- **Stat list below**: Each stat as a row with name, value, progress bar, and the organ systems that feed into it
- **Streaks section**: Current streaks with flame icons, longest streak record
- **Achievements grid**: 3-column grid of achievement icons. Unlocked = full color + glow. Locked = gray + lock icon. Tap for detail.
- **"Share Your Twin" button** at bottom (for later — just show disabled/coming soon)

### 4. Navigation

- Add route for `app/character-stats.tsx` 
- Add a small stats icon button (top-right of Health Twin screen, like a shield or hexagon icon) that navigates to character-stats
- Use `lucide-react-native` for the icon (Shield or Hexagon)

## Design Rules

- Dark theme: `#0A0F1A` background, `#111B2A` cards
- Teal `#4FD1C5` for optimal/primary
- Gold `#D4AF37` for high-level accents and achievements  
- Gold muted `#B8A088` for secondary text
- Cream `#F5F0E8` for primary text
- All animations: `useNativeDriver: true`, subtle and smooth
- Font weights: 200-300 for large numbers, 400-500 for labels
- Letter spacing: 0.3-1.5 for uppercase labels
- Everything uses relative imports (no `@/` aliases)
- Do NOT modify `tsconfig.json`, `app.json`, or `eas.json`

## Files to Create
1. `constants/health-twin-leveling.ts` — data + types + demo profile
2. `app/character-stats.tsx` — full character stats screen
3. Modify `app/health-twin.tsx` — ADD aura layer, XP bar, streak badge, stats button, stat bar in organ detail card. **DO NOT remove or restructure any existing components.**

## What Success Looks Like
- Health Twin feels like a character screen from a premium RPG
- Users want to "level up" their body
- Existing body silhouette, organ dots, scan beam, particles all still work exactly as before
- New visual layers enhance without cluttering
- Tapping an organ shows both health info AND gamified stat progress
