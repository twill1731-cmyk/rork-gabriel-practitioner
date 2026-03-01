# Prompt 45: Remove Consumer Paywall — App is 100% Free

## Context

Strategic decision: the Gabriel consumer app is 100% free. No subscription tiers. No feature gating. No paywall. Revenue comes from affiliate commissions (supplements, diagnostics, devices) and the practitioner app ($199/mo B2B), not consumer subscriptions.

## What to Remove

### Delete these files entirely:
- `app/paywall.tsx` — DELETE
- `components/PaywallGate.tsx` — DELETE
- `constants/subscription.ts` — DELETE
- `contexts/SubscriptionContext.tsx` — DELETE

### Remove paywall references from these files:

**`app/_layout.tsx`:**
- Remove the paywall route/Screen entry
- Remove SubscriptionContext/Provider wrapper if added

**`app/index.tsx`:**
- Remove any chat message limits (no "5/day" cap)
- Remove any paywall gate imports or wrappers
- Remove any "upgrade" prompts or buttons

**`app/connect-health.tsx`:**
- Remove any PaywallGate wrappers
- All features freely accessible

**`app/heart-coherence.tsx`:**
- Remove any PaywallGate wrappers
- All features freely accessible (log readings, view insights, etc.)

**`components/HealthDashboard.tsx`:**
- Remove any "upgrade" badges, locked feature indicators, or paywall references
- Remove any subscription-related cards or CTAs
- All dashboard features shown as fully accessible

**`app/settings.tsx`:**
- Remove subscription management section
- Remove "upgrade" or "manage subscription" buttons
- Keep everything else in settings

### General cleanup:
- Search all files for `PaywallGate`, `subscription`, `SubscriptionContext`, `paywall`, `upgrade`, `tier`, `'guide'`, `'guardian'` and remove all references
- Remove any "locked" or "premium" badges/icons from any UI
- Remove any blurred/dimmed overlay effects that were gating content
- Remove any "X messages remaining" counters

## What to ADD

In `app/settings.tsx`, add a simple line:
- "Gabriel is free. Forever. ❤️" — small text, cream color, centered, near the bottom of settings

## DO NOT touch:
- `app/health-twin.tsx`
- `app/character-stats.tsx`
- `components/ShareCard.tsx`
- `components/CoherenceWaveform.tsx`
- `constants/health-twin-data.ts`
- `constants/health-twin-leveling.ts`
- `constants/heart-coherence-data.ts`
- `services/apple-health.ts`
- `services/health-score-engine.ts`
- `app.json`, `eas.json`, `tsconfig.json`

## What Success Looks Like
Every screen is fully accessible. No locks, no gates, no "upgrade" prompts anywhere. A user downloads Gabriel and gets the FULL experience from minute one. The app feels generous and premium — the kind of thing that makes people say "wait, this is really free?"
