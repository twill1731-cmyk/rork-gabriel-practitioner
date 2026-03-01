export interface HealthTwinProfile {
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: string;
  streaks: {
    checkIn: number;
    supplement: number;
    longest: number;
  };
  achievements: Achievement[];
  stats: CharacterStats;
}

export interface CharacterStats {
  vitality: number;
  clarity: number;
  resilience: number;
  digestion: number;
  balance: number;
  structure: number;
}

export type StatKey = keyof CharacterStats;

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  category: 'streak' | 'milestone' | 'discovery' | 'mastery';
}

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

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function getTitleForLevel(level: number): { title: string; color: string } {
  let result = LEVEL_TITLES[0];
  for (const entry of LEVEL_TITLES) {
    if (level >= entry.minLevel) {
      result = entry;
    }
  }
  return result;
}

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

export const STAT_LABELS: Record<StatKey, string> = {
  vitality: 'Vitality',
  clarity: 'Clarity',
  resilience: 'Resilience',
  digestion: 'Digestion',
  balance: 'Balance',
  structure: 'Structure',
};

export const STAT_ICONS: Record<StatKey, string> = {
  vitality: '❤️',
  clarity: '🧠',
  resilience: '🛡️',
  digestion: '🔥',
  balance: '⚖️',
  structure: '🦴',
};

export const STAT_ORGAN_MAP: Record<StatKey, string[]> = {
  vitality: ['heart', 'lungs'],
  clarity: ['nervous-system'],
  resilience: ['immune'],
  digestion: ['gut', 'stomach', 'liver'],
  balance: ['thyroid', 'adrenals', 'reproductive'],
  structure: ['musculoskeletal'],
};

export const ORGAN_STAT_MAP: Record<string, StatKey> = {
  'heart': 'vitality',
  'lungs': 'vitality',
  'nervous-system': 'clarity',
  'immune': 'resilience',
  'gut': 'digestion',
  'stomach': 'digestion',
  'liver': 'digestion',
  'thyroid': 'balance',
  'adrenals': 'balance',
  'reproductive': 'balance',
  'musculoskeletal': 'structure',
  'kidneys': 'vitality',
};

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-check-in', name: 'First Steps', description: 'Complete your first daily check-in', icon: '👣', unlockedAt: null, category: 'milestone' },
  { id: 'streak-7', name: 'Weekly Warrior', description: '7-day check-in streak', icon: '🔥', unlockedAt: null, category: 'streak' },
  { id: 'streak-30', name: 'Monthly Master', description: '30-day check-in streak', icon: '⚡', unlockedAt: null, category: 'streak' },
  { id: 'streak-100', name: 'Centurion', description: '100-day check-in streak', icon: '👑', unlockedAt: null, category: 'streak' },
  { id: 'first-lab', name: 'Data Driven', description: 'Upload your first lab results', icon: '🔬', unlockedAt: null, category: 'milestone' },
  { id: 'all-organs', name: 'Body Explorer', description: 'Tap every organ on your Health Twin', icon: '🫀', unlockedAt: null, category: 'discovery' },
  { id: 'level-10', name: 'Awakening', description: 'Reach Level 10', icon: '✨', unlockedAt: null, category: 'mastery' },
  { id: 'level-25', name: 'Rising', description: 'Reach Level 25', icon: '🌟', unlockedAt: null, category: 'mastery' },
  { id: 'level-50', name: 'Halfway There', description: 'Reach Level 50', icon: '⭐', unlockedAt: null, category: 'mastery' },
  { id: 'level-100', name: 'Radiant Being', description: 'Reach Level 100', icon: '💫', unlockedAt: null, category: 'mastery' },
  { id: 'protocol-complete', name: 'Protocol Master', description: 'Complete your first full protocol', icon: '🏆', unlockedAt: null, category: 'milestone' },
  { id: 'ask-gabriel-10', name: 'Curious Mind', description: 'Ask Gabriel 10 health questions', icon: '💡', unlockedAt: null, category: 'discovery' },
];

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
