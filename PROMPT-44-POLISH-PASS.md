# Prompt 44: UX Polish Pass — Make Everything Feel Premium

## CRITICAL: Preserve Everything That Exists
**DO NOT remove any features, screens, or functionality.** This is a refinement pass. Fix rough edges, improve transitions, tighten spacing, and make everything feel cohesive.

**DO NOT touch:** `app.json`, `eas.json`, `tsconfig.json`

## Areas to Polish

### 1. Screen Transitions

All screen transitions should feel smooth and intentional:
- Health Twin: slide up from bottom with slight spring overshoot
- Heart-Brain Coherence: slide up from bottom
- Character Stats: slide in from right
- Connect Health: slide up from bottom
- Paywall: fade in with scale (0.95 → 1.0)
- Organ detail card: already good (spring slide up)
- Conversation drawer: already good (slide from left)
- Health dashboard: already good (slide from right)

Ensure ALL modal screens have consistent dismiss gestures (swipe down to close).

### 2. Loading States

Add skeleton loaders or subtle shimmer effects when:
- Health Twin is calculating scores from Apple Health data
- Coherence readings are loading
- Chat is "thinking" (already has NeuralThinking component — verify it's used)

Use the existing `SkeletonLoader` component if available. If not, create shimmer placeholders that match the dark theme.

### 3. Haptic Feedback Consistency

Ensure haptic feedback (using the existing `hapticLight` utility) fires on:
- Every button tap
- Organ dot taps
- Drawer/dashboard open gestures
- Share button
- XP earned moments (use a slightly stronger haptic if possible)
- Level up (strong haptic burst)
- Paywall CTA buttons

### 4. Empty States

Every screen that can have no data should have a beautiful empty state (not just blank space):
- Coherence with no readings: "Your coherence journey begins here. Log your first reading to see Gabriel's insights."
- Connect Health with nothing connected: "Your Health Twin is waiting for data. Connect Apple Health to bring it to life."
- Chat with no history: Already handled (Gabriel greeting)

Use the existing `EmptyState` component. Include a relevant icon/illustration and a single CTA button.

### 5. Typography Consistency Check

Verify across ALL screens:
- Large numbers: fontWeight 200-300, letterSpacing -1
- Section headers: fontWeight 500, letterSpacing 0.5, cream color
- Body text: fontWeight 300, lineHeight 21, white 60% opacity
- Uppercase labels: fontWeight 400-500, letterSpacing 1.5, white 40-50% opacity
- Button text: fontWeight 600, letterSpacing 0.3
- No screen should use fontWeight 700 or higher (too heavy for this brand)

### 6. Color Consistency Check

Verify the correct colors are used everywhere:
- Background: `#0A0F1A` (main screens), `#060D15` (coherence), `#111B2A` (cards)
- Teal: `#4FD1C5` (primary accent, healthy scores, CTAs)
- Gold muted: `#B8A088` (secondary, moderate scores)
- Gold bright: `#D4AF37` (achievements, high-level accents, Guardian tier)
- Cream: `#F5F0E8` (primary text)
- Red warm: `#e87b6b` (needs support, warnings)
- Indigo: `#7C6FD4` (coherence screen accent)
- Borders: `rgba(79, 209, 197, 0.08)` to `rgba(79, 209, 197, 0.12)`
- No pure white (#FFFFFF) text — always use cream or opacity-reduced white

### 7. Scroll Behavior

- All scrollable screens should have `showsVerticalScrollIndicator={false}`
- Add `contentContainerStyle={{ paddingBottom: 40 }}` to all ScrollViews to prevent content from being cut off by bottom safe area
- Health Twin screen is NOT scrollable (fixed full-screen) — verify this
- Coherence and Connect Health ARE scrollable — verify smooth scroll

### 8. Safe Area Consistency

Verify all screens properly use `useSafeAreaInsets()`:
- Top padding for notch/Dynamic Island
- Bottom padding for home indicator
- No content should be hidden behind the notch or cut off at the bottom

### 9. Keyboard Behavior

On screens with text inputs (coherence reading log, chat):
- Keyboard should push content up smoothly (use `KeyboardAvoidingView` or `KeyboardAwareScrollView`)
- No content should be hidden behind the keyboard
- Chat input should stay visible and accessible

### 10. Micro-Animations

Add subtle micro-animations where missing:
- Cards should have a slight scale press effect on touch (scale to 0.97, spring back)
- Buttons should have a brief opacity dip on press (activeOpacity 0.7)
- Numbers that change (scores, XP) should animate between values (count up/down)
- Toggle switches and pill selectors should have smooth transitions

### 11. Onboarding Tightening

Review the onboarding flow:
- Should be 3-4 screens MAX (not more)
- Each screen: one key message, one visual, one CTA
- Screen 1: "Meet Gabriel — your AI health companion"
- Screen 2: "Your Health Twin — a living map of your body" (show body silhouette)
- Screen 3: "Connect your data — Apple Health, labs, devices" (show data sources)
- Screen 4: "Choose your path" (free vs premium, or skip for now)
- If onboarding is already short, just verify it flows well

### 12. Error Handling

Add graceful error states:
- Apple Health permission denied: helpful message + "Open Settings" button
- Network offline: `OfflineBanner` component should show (verify it's wired up)
- Any crash-prone area: wrap in error boundaries with friendly fallback

## What NOT to Change
- Don't add new features
- Don't remove any screens or components
- Don't change the navigation structure
- Don't change data models or types
- Don't change the color palette or design direction
- Don't change organ positions or scores

## What Success Looks Like
Every tap feels responsive. Every screen feels consistent. Transitions are smooth. Empty states are beautiful. The app feels like a premium product made by a team of 20, not a prototype. Zero rough edges. Zero "oh that looks unfinished" moments. The kind of polish that makes people assume you spent millions building it.
