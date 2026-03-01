export const APP_STORE_METADATA = {
  appName: "Gabriel",
  subtitle: "Your Naturopathic Health Companion",
  version: "1.0.0",
  buildNumber: "1",
  bundleIdentifier: {
    ios: "app.rork.gabriel-health-companion",
    android: "app.rork.gabriel_health_companion",
  },
  category: "Health & Fitness",
  secondaryCategory: "Medical",
  contentRating: "4+",
  price: "Free",

  description: `Gabriel is your personal naturopathic health companion — an AI-powered assistant that helps you understand supplements, track protocols, interpret lab results, and navigate holistic wellness with confidence.

Whether you're managing a chronic condition, optimizing your health, or exploring natural alternatives, Gabriel gives you the tools and knowledge to take control of your wellness journey.

KEY FEATURES:

• AI Health Assistant — Ask Gabriel anything about supplements, conditions, drug-nutrient interactions, and natural health approaches. Get instant, evidence-based answers tailored to your profile.

• Supplement Protocol Tracking — Build and manage your daily supplement protocol. Scan labels to add supplements instantly. Track compliance with streaks and reminders.

• Lab Result Analysis — Upload blood work and lab panels. Gabriel interprets your results using naturopathic optimal ranges and suggests actionable next steps.

• Interaction Checker — Check safety between supplements and medications. Visual safety matrix shows safe, caution, and critical pairings at a glance.

• Symptom Logging — Track symptoms by body region, severity, and frequency. Spot patterns over time and share insights with your practitioner.

• Practitioner Directory — Find naturopathic doctors, functional medicine practitioners, and integrative health professionals near you.

• Health Trends & Insights — Visualize mood, energy, sleep, and biometric data over time. Weekly AI-generated health summaries keep you informed.

• Wearable Integration — Connect Apple Health to sync sleep, heart rate, HRV, and activity data for deeper personalized insights.

Gabriel is not a replacement for medical advice. Always consult with a qualified healthcare professional before making changes to your health regimen.`,

  promotionalText:
    "Meet Gabriel — your AI naturopathic health companion. Track supplements, interpret labs, check interactions, and get personalized wellness guidance.",

  keywords: [
    "supplements",
    "naturopathic",
    "health",
    "wellness",
    "vitamins",
    "protocol",
    "lab results",
    "holistic",
    "natural health",
    "supplement tracker",
    "drug interactions",
    "health assistant",
    "functional medicine",
    "AI health",
    "nutrition",
    "biometrics",
    "symptom tracker",
    "health trends",
    "practitioner",
    "integrative",
  ],

  releaseNotes: `Welcome to Gabriel 1.0 — your personal naturopathic health companion.

What's New:
• AI-Powered Health Assistant — Ask Gabriel about supplements, conditions, interactions, and holistic wellness
• Supplement Protocol Tracker — Scan labels, build daily protocols, and track compliance with streaks
• Lab Result Interpreter — Upload blood work and get naturopathic-range analysis
• Interaction Checker — Visual safety matrix for supplement and medication pairings
• Symptom Logger — Track symptoms by body region with severity and frequency
• Practitioner Directory — Find naturopathic and integrative health professionals nearby
• Health Trends Dashboard — Visualize mood, energy, sleep, and biometric data over time
• Weekly Health Reports — AI-generated summaries of your wellness progress
• Apple Health Integration — Sync sleep, HRV, heart rate, and activity data
• Daily Check-ins — Log mood, energy, and sleep to build your health baseline

We'd love your feedback — tap the settings gear to share your thoughts with us.`,

  supportUrl: "https://rork.app/support",
  privacyPolicyUrl: "https://rork.app/privacy",
  termsOfServiceUrl: "https://rork.app/terms",

  permissions: {
    camera:
      "Gabriel uses your camera to scan supplement labels and barcodes.",
    healthKit:
      "Gabriel syncs your health data to provide personalized insights and track your wellness trends.",
    notifications:
      "Gabriel sends reminders for your supplement protocol and weekly health summaries.",
    photoLibrary:
      "Gabriel uses your photo library to upload lab results and supplement images.",
    location:
      "Gabriel uses your location to find naturopathic practitioners near you.",
  },

  appStoreScreenshotCaptions: [
    "Ask Gabriel anything about supplements and natural health",
    "Track your daily supplement protocol with smart reminders",
    "Scan supplement labels to instantly add to your protocol",
    "Interpret lab results with naturopathic optimal ranges",
    "Check interactions between supplements and medications",
    "Visualize health trends with mood, energy, and sleep data",
    "Find naturopathic practitioners near you",
    "Get weekly AI-generated health progress reports",
  ],
} as const;

export const EAS_BUILD_PROFILES = {
  development: {
    description: "Internal testing with development client",
    distribution: "internal",
    developmentClient: true,
  },
  preview: {
    description: "TestFlight / internal distribution builds",
    distribution: "internal",
    channel: "preview",
  },
  production: {
    description: "App Store / Google Play submission builds",
    channel: "production",
    ios: {
      autoIncrement: "buildNumber",
    },
    android: {
      buildType: "app-bundle",
      autoIncrement: "versionCode",
    },
  },
} as const;

export const IOS_ENTITLEMENTS = {
  healthkit: true,
  pushNotifications: "production",
  usesNonExemptEncryption: false,
} as const;
