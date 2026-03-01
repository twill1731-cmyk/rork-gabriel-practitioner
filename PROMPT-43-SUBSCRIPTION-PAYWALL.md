# Prompt 43: Subscription Paywall & Premium Tiers

## CRITICAL: Preserve Everything That Exists
**DO NOT remove or restructure ANY existing components.** You are adding a paywall layer and premium gating.

**DO NOT touch:** `app.json`, `eas.json`, `tsconfig.json`

## Context

Gabriel has three tiers:
- **Free** — Limited access, taste of the experience
- **Guide** — $29/mo — Full Health Twin, unlimited chat, Apple Health
- **Guardian** — $79/mo — Everything + advanced diagnostics, priority support, practitioner matching

For MVP, we're building the UI and gating logic. Actual payment processing (RevenueCat/StoreKit) will be wired up before App Store submission. For now, use a mock purchase flow that simulates subscription.

## Files to Create

### 1. `constants/subscription.ts` — Tier Definitions

```typescript
export type SubscriptionTier = 'free' | 'guide' | 'guardian';

export interface TierFeature {
  name: string;
  free: boolean | string;  // true/false or limit string like "3/day"
  guide: boolean | string;
  guardian: boolean | string;
}

export const TIER_DETAILS = {
  free: {
    name: 'Free',
    price: '$0',
    tagline: 'Start your health journey',
    color: '#a89d8c',
  },
  guide: {
    name: 'Guide',
    price: '$29/mo',
    tagline: 'Your personal health companion',
    color: '#4FD1C5',
  },
  guardian: {
    name: 'Guardian',
    price: '$79/mo',
    tagline: 'Advanced health intelligence',
    color: '#D4AF37',
  },
};

export const FEATURES: TierFeature[] = [
  { name: 'Health Twin (basic view)', free: true, guide: true, guardian: true },
  { name: 'Chat with Gabriel', free: '5/day', guide: true, guardian: true },
  { name: 'Apple Health sync', free: false, guide: true, guardian: true },
  { name: 'Heart-Brain Coherence', free: false, guide: true, guardian: true },
  { name: 'Organ deep-dives', free: false, guide: true, guardian: true },
  { name: 'Character stats & XP', free: true, guide: true, guardian: true },
  { name: 'Share cards', free: true, guide: true, guardian: true },
  { name: 'Lab results upload', free: false, guide: true, guardian: true },
  { name: 'Advanced diagnostics', free: false, guide: false, guardian: true },
  { name: 'Bio-Well integration', free: false, guide: false, guardian: true },
  { name: 'HeartMath integration', free: false, guide: false, guardian: true },
  { name: 'Practitioner matching', free: false, guide: false, guardian: true },
  { name: 'Priority Gabriel responses', free: false, guide: false, guardian: true },
  { name: 'Supplement protocols', free: false, guide: true, guardian: true },
];
```

### 2. `services/subscription.ts` — Subscription State Management

```typescript
// For MVP: AsyncStorage-based mock subscription
// Will be replaced with RevenueCat before App Store launch

export async function getCurrentTier(): Promise<SubscriptionTier>
export async function setTier(tier: SubscriptionTier): Promise<void>  // mock for testing
export function canAccess(feature: string, tier: SubscriptionTier): boolean
export function getUpgradeMessage(feature: string): string  // "Upgrade to Guide to unlock..."
```

### 3. `app/paywall.tsx` — Premium Upgrade Screen

Beautiful, persuasive paywall screen. This is the MONEY screen — it needs to convert.

**Layout:**

Header:
- "Unlock Your Full Potential" (large, cream, weight 300)
- Subtle sacred geometry background element

Tier Cards (horizontally scrollable or stacked):

**Free card** (current, muted):
- Gray border, muted styling
- "Current Plan" badge if active
- Basic feature list with checkmarks

**Guide card** (recommended, highlighted):
- Teal border with subtle glow
- "MOST POPULAR" badge at top
- "$29/mo" price prominent
- Feature list with teal checkmarks
- "Start 7-Day Free Trial" button (teal fill, primary CTA)

**Guardian card** (premium):
- Gold border with glow
- "ADVANCED" badge
- "$79/mo" price
- Full feature list with gold checkmarks
- "Start 7-Day Free Trial" button (gold outline)

Below cards:
- "All plans include a 7-day free trial"
- "Cancel anytime"
- Small "Restore Purchases" link
- Privacy/terms links

**For MVP:** Tapping "Start Free Trial" shows a confirmation modal: "Trial activated! (Demo mode)" and sets the tier in AsyncStorage. This will be replaced with real IAP before launch.

### 4. `components/PaywallGate.tsx` — Feature Gating Component

A reusable wrapper component:

```tsx
<PaywallGate feature="apple-health-sync" tier={userTier}>
  {/* Protected content renders if user has access */}
  <AppleHealthSection />
</PaywallGate>
```

When the user doesn't have access:
- Shows a blurred/dimmed version of the content
- Overlay with lock icon + "Upgrade to Guide to unlock Apple Health sync"
- "Upgrade" button → navigates to paywall screen

### 5. Where to Gate Features

Add `PaywallGate` wrappers to:

- **Chat** (`app/index.tsx`): After 5 messages/day on free tier, show gate
- **Apple Health** (`app/connect-health.tsx`): Entire screen gated for free users
- **Heart-Brain Coherence** (`app/heart-coherence.tsx`): Free users see score + waveform but can't log readings
- **Advanced diagnostics**: Bio-Well, HeartMath sources gated behind Guardian
- **Lab upload**: Gated behind Guide

DON'T gate:
- Health Twin basic view (let everyone see their body, just with limited data)
- Character stats & XP (gamification drives engagement for all tiers)
- Share cards (free marketing)
- Onboarding

### 6. Soft Upgrade Prompts

In addition to hard gates, add soft prompts in natural moments:

- After viewing Health Twin for 30 seconds with low-confidence organs: "Want more accurate scores? Guide members can sync Apple Health."
- After a chat conversation: "You have 2 messages left today. Upgrade for unlimited."
- On the Health Dashboard: small "⭐ Upgrade" badge next to locked features

These are NOT modals or popups. They're inline text/cards that feel like helpful suggestions, not aggressive upsells.

## Navigation
- Add route for `app/paywall.tsx` in `app/_layout.tsx`
- Presentation: `fullScreenModal` with transparent background option
- Accessible from: upgrade prompts, settings, gated features

## Design Rules
- Paywall screen must feel PREMIUM, not salesy
- Dark theme consistent with rest of app
- Guide tier = teal, Guardian tier = gold
- Animations on the tier cards (subtle float/glow)
- All imports use relative paths (no `@/` aliases)
- Do NOT modify `tsconfig.json`, `app.json`, or `eas.json`

## What Success Looks Like
Free users get enough value to be hooked (Health Twin + basic chat + gamification) but naturally encounter gates at "aha" moments that make upgrading feel like the obvious next step. The paywall screen itself looks so premium that subscribing feels like joining an exclusive club, not paying for software.
