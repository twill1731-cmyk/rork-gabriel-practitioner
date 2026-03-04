import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Linking,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Send, Mic, ArrowLeft, Sparkles, Download, CheckCircle, Lock } from 'lucide-react-native';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { hapticLight, hapticSuccess, hapticMedium } from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;

// ─── Types ────────────────────────────────────────────────
type MessageSender = 'gabriel' | 'patient' | 'system';

type IntakeMessage = {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: number;
  typing?: boolean;
};

type QuestionType = 'text' | 'yes-no' | 'single-select' | 'multi-select' | 'scale' | 'date';

type IntakeQuestion = {
  id: string;
  phase: string;
  prompt: string;
  type: QuestionType;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: [string, string];
  required?: boolean;
  followUp?: (answer: string) => string | null; // Gabriel's smart follow-up
};

// ─── Intake Questions ─────────────────────────────────────
const INTAKE_QUESTIONS: IntakeQuestion[] = [
  // Basics
  { id: 'name', phase: 'basics', prompt: "What's your full name?", type: 'text', required: true },
  { id: 'dob', phase: 'basics', prompt: "Date of birth?", type: 'date', required: true },
  { id: 'phone', phase: 'basics', prompt: "Best phone number to reach you?", type: 'text' },
  { id: 'email', phase: 'basics', prompt: "Email address?", type: 'text' },
  { id: 'sex', phase: 'basics', prompt: "Biological sex?", type: 'single-select', options: ['Female', 'Male', 'Intersex', 'Prefer not to say'] },

  // Chief complaint
  {
    id: 'chief_complaint',
    phase: 'chief-complaint',
    prompt: "Now I'd love to understand what brings you in today. In your own words, what's your main health concern?",
    type: 'text',
    required: true,
    followUp: (answer) => {
      const lower = answer.toLowerCase();
      if (lower.includes('fatigue') || lower.includes('tired') || lower.includes('energy'))
        return "Fatigue can have many root causes. I'll flag this for a thorough workup. Is it worse at any particular time of day?";
      if (lower.includes('gut') || lower.includes('stomach') || lower.includes('bloat') || lower.includes('digest'))
        return "GI concerns are one of the most common things we see. We'll look at this holistically. Is it triggered by specific foods?";
      if (lower.includes('anxiety') || lower.includes('stress') || lower.includes('sleep'))
        return "Mental health and sleep are deeply connected to overall wellbeing. We'll make sure to address this comprehensively.";
      return null;
    },
  },
  { id: 'duration', phase: 'chief-complaint', prompt: "How long have you been experiencing this?", type: 'single-select', options: ['Less than 1 month', '1-3 months', '3-6 months', '6-12 months', '1-3 years', 'More than 3 years'] },
  { id: 'severity', phase: 'chief-complaint', prompt: "How much does this affect your daily life?", type: 'scale', scaleMin: 1, scaleMax: 10, scaleLabels: ['Barely noticeable', 'Severely limiting'] },

  // Symptoms
  {
    id: 'symptoms',
    phase: 'symptoms',
    prompt: "Are you experiencing any of these? Select all that apply.",
    type: 'multi-select',
    options: [
      '😴 Fatigue / Low energy',
      '😰 Anxiety / Stress',
      '🛏️ Sleep issues',
      '🧠 Brain fog',
      '🤢 Digestive issues',
      '🔥 Joint / Muscle pain',
      '⚖️ Weight concerns',
      '🤧 Allergies / Sinus',
      '💔 Mood changes',
      '🥶 Cold hands/feet',
      '💇 Hair / Skin changes',
      '🫀 Heart palpitations',
    ],
    followUp: (answer) => {
      if (answer.includes('Fatigue') && answer.includes('Cold hands'))
        return "Fatigue combined with cold extremities often points to thyroid function. I'll flag this for your practitioner.";
      if (answer.includes('Digestive') && answer.includes('Brain fog'))
        return "Interesting pattern. Gut and brain health are deeply connected through the gut-brain axis. Your practitioner will want to explore this.";
      return null;
    },
  },

  // Medical history
  {
    id: 'conditions',
    phase: 'medical-history',
    prompt: "Have you been diagnosed with any of these conditions?",
    type: 'multi-select',
    options: ['Diabetes', 'Heart Disease', 'High Blood Pressure', 'Thyroid Disorder', 'Autoimmune Condition', 'Cancer', 'Asthma/COPD', 'Mental Health Condition', 'Chronic Pain', 'None of the above'],
  },
  { id: 'surgeries', phase: 'medical-history', prompt: "Any previous surgeries or hospitalizations?", type: 'yes-no' },
  { id: 'surgeries_detail', phase: 'medical-history', prompt: "Please briefly describe:", type: 'text' }, // conditional, shown only if yes
  {
    id: 'family_history',
    phase: 'medical-history',
    prompt: "Family history of chronic illness?",
    type: 'multi-select',
    options: ['Heart Disease', 'Diabetes', 'Cancer', 'Autoimmune', 'Thyroid', 'Mental Health', 'None / Unknown'],
  },

  // Medications & supplements
  { id: 'on_medications', phase: 'medications', prompt: "Are you currently taking any prescription medications?", type: 'yes-no' },
  { id: 'medications_list', phase: 'medications', prompt: "Please list your current medications:", type: 'text' },
  { id: 'on_supplements', phase: 'supplements', prompt: "Taking any supplements, herbs, or vitamins regularly?", type: 'yes-no' },
  { id: 'supplements_list', phase: 'supplements', prompt: "Please list what you're taking:", type: 'text' },
  { id: 'allergies', phase: 'allergies', prompt: "Any known allergies? (medications, foods, environmental)", type: 'text' },

  // Lifestyle
  {
    id: 'diet',
    phase: 'lifestyle',
    prompt: "How would you describe your diet?",
    type: 'single-select',
    options: ['Standard American', 'Mediterranean', 'Vegetarian/Vegan', 'Keto/Low-Carb', 'Paleo', 'Whole Foods', 'No specific diet'],
  },
  { id: 'sleep_hours', phase: 'lifestyle', prompt: "How many hours of sleep do you typically get?", type: 'single-select', options: ['Less than 5', '5-6 hours', '6-7 hours', '7-8 hours', '8-9 hours', '9+ hours'] },
  { id: 'exercise', phase: 'lifestyle', prompt: "How often do you exercise?", type: 'single-select', options: ['Rarely / Never', '1-2x per week', '3-4x per week', '5+ per week', 'Daily'] },
  { id: 'stress', phase: 'lifestyle', prompt: "Current stress level?", type: 'scale', scaleMin: 1, scaleMax: 5, scaleLabels: ['Very low', 'Very high'] },
  { id: 'alcohol', phase: 'lifestyle', prompt: "Alcohol consumption?", type: 'single-select', options: ['None', 'Occasional (1-2/week)', 'Moderate (3-5/week)', 'Daily', 'Prefer not to say'] },
  { id: 'smoking', phase: 'lifestyle', prompt: "Do you smoke or use tobacco/cannabis?", type: 'single-select', options: ['No', 'Former smoker', 'Occasional', 'Daily tobacco', 'Cannabis only', 'Prefer not to say'] },

  // Goals
  {
    id: 'health_goal',
    phase: 'goals',
    prompt: "Last one: what's your #1 health goal? What would success look like for you?",
    type: 'text',
    required: true,
  },
];

// ─── Components ───────────────────────────────────────────
function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 200),
        Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]))
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);
  return (
    <View style={styles.typingRow}>
      {dots.map((dot, i) => (
        <Animated.View key={i} style={[styles.typingDot, { opacity: Animated.add(0.3, Animated.multiply(dot, 0.7)), transform: [{ translateY: Animated.multiply(dot, -4) }] }]} />
      ))}
    </View>
  );
}

function GabrielBubble({ content, typing }: { content: string; typing?: boolean }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start(); }, []);
  return (
    <Animated.View style={[styles.gabrielBubble, { opacity: fade }]}>
      <View style={styles.avatar}><Text style={styles.avatarText}>✦</Text></View>
      <View style={styles.gabrielContent}>
        {typing ? <TypingIndicator /> : <Text style={styles.gabrielText}>{content}</Text>}
      </View>
    </Animated.View>
  );
}

function PatientBubble({ content }: { content: string }) {
  return (
    <View style={styles.patientBubble}>
      <View style={styles.patientContent}><Text style={styles.patientText}>{content}</Text></View>
    </View>
  );
}

function SystemBubble({ content }: { content: string }) {
  return (
    <View style={styles.systemMsg}>
      <CheckCircle size={14} color={Colors.green} strokeWidth={2} />
      <Text style={styles.systemText}>{content}</Text>
    </View>
  );
}

// Yes/No buttons
function YesNoInput({ onAnswer }: { onAnswer: (val: string) => void }) {
  return (
    <View style={styles.yesNoRow}>
      <TouchableOpacity style={styles.yesBtn} onPress={() => { hapticLight(); onAnswer('Yes'); }} activeOpacity={0.7}>
        <Text style={styles.yesBtnText}>Yes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.noBtn} onPress={() => { hapticLight(); onAnswer('No'); }} activeOpacity={0.7}>
        <Text style={styles.noBtnText}>No</Text>
      </TouchableOpacity>
    </View>
  );
}

// Single select
function SingleSelect({ options, onAnswer }: { options: string[]; onAnswer: (val: string) => void }) {
  return (
    <View style={styles.optionsGrid}>
      {options.map((opt) => (
        <TouchableOpacity key={opt} style={styles.optionBtn} onPress={() => { hapticLight(); onAnswer(opt); }} activeOpacity={0.7}>
          <Text style={styles.optionBtnText}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Multi select
function MultiSelect({ options, onAnswer }: { options: string[]; onAnswer: (val: string) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (opt: string) => {
    hapticLight();
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt); else next.add(opt);
      return next;
    });
  };
  return (
    <View style={styles.multiSelectWrap}>
      <View style={styles.optionsGrid}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionBtn, selected.has(opt) && styles.optionBtnSelected]}
            onPress={() => toggle(opt)}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionBtnText, selected.has(opt) && styles.optionBtnTextSelected]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.continueBtn, selected.size === 0 && styles.continueBtnDisabled]}
        onPress={() => { if (selected.size > 0) { hapticLight(); onAnswer(Array.from(selected).join(', ')); } }}
        disabled={selected.size === 0}
      >
        <Text style={styles.continueBtnText}>{selected.size === 0 ? 'Select at least one' : `Continue (${selected.size} selected)`}</Text>
      </TouchableOpacity>
    </View>
  );
}

// Scale input (1-10, 1-5, etc.)
function ScaleInput({ min, max, labels, onAnswer }: { min: number; max: number; labels?: [string, string]; onAnswer: (val: string) => void }) {
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <View style={styles.scaleWrap}>
      {labels && (
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleLabelText}>{labels[0]}</Text>
          <Text style={styles.scaleLabelText}>{labels[1]}</Text>
        </View>
      )}
      <View style={styles.scaleRow}>
        {range.map((n) => (
          <TouchableOpacity
            key={n}
            style={styles.scaleBtn}
            onPress={() => { hapticLight(); onAnswer(String(n)); }}
            activeOpacity={0.7}
          >
            <Text style={styles.scaleBtnText}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Download prompt
function DownloadPrompt() {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.downloadCard, { opacity, transform: [{ scale }] }]}>
      <View style={styles.downloadIcon}><Sparkles size={28} color={Colors.teal} strokeWidth={1.8} /></View>
      <Text style={styles.downloadTitle}>Stay connected with your practitioner</Text>
      <Text style={styles.downloadDesc}>Download Gabriel to access your protocols, track progress, and get personalized health insights.</Text>
      <TouchableOpacity style={styles.downloadBtn} onPress={() => { hapticLight(); Linking.openURL('https://apps.apple.com/app/gabriel-health/id0000000000'); }} activeOpacity={0.7}>
        <Download size={18} color={Colors.textInverse} strokeWidth={2} />
        <Text style={styles.downloadBtnText}>Download Gabriel</Text>
      </TouchableOpacity>
      <Text style={styles.downloadFree}>Free for patients. Always.</Text>
    </Animated.View>
  );
}

// Lock screen (return to practitioner)
function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  return (
    <View style={styles.lockScreen}>
      <Lock size={32} color={Colors.teal} strokeWidth={1.5} />
      <Text style={styles.lockTitle}>Intake Complete</Text>
      <Text style={styles.lockDesc}>Please hand this device back to your practitioner or front desk staff.</Text>
      <TouchableOpacity style={styles.lockBtn} onPress={() => { hapticMedium(); onUnlock(); }} activeOpacity={0.7}>
        <Text style={styles.lockBtnText}>Unlock (Staff Only)</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function IntakeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const practitionerName = (params.practitioner as string) || 'your practitioner';
  const patientScheduledName = (params.patientName as string) || '';

  const [messages, setMessages] = useState<IntakeMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [inputEnabled, setInputEnabled] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(-1); // -1 = greeting
  const [currentQuestion, setCurrentQuestion] = useState<IntakeQuestion | null>(null);
  const [showInput, setShowInput] = useState<QuestionType | null>(null);
  const [intakeData, setIntakeData] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(new Set());

  const addGabriel = useCallback((content: string, delay = 600) => {
    const typingId = `typing-${Date.now()}`;
    setMessages(prev => [...prev, { id: typingId, sender: 'gabriel', content: '', timestamp: Date.now(), typing: true }]);
    setShowInput(null);
    setInputEnabled(false);

    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== typingId));
      setMessages(prev => [...prev, { id: `g-${Date.now()}`, sender: 'gabriel', content, timestamp: Date.now() }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, delay + Math.random() * 300);
  }, []);

  const addPatient = useCallback((content: string) => {
    setMessages(prev => [...prev, { id: `p-${Date.now()}`, sender: 'patient', content, timestamp: Date.now() }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, []);

  const addSystem = useCallback((content: string) => {
    setMessages(prev => [...prev, { id: `s-${Date.now()}`, sender: 'system', content, timestamp: Date.now() }]);
  }, []);

  // Determine which question to show next (handles conditional logic)
  const getNextQuestionIndex = useCallback((fromIndex: number, answers: Record<string, string>): number => {
    let next = fromIndex + 1;
    while (next < INTAKE_QUESTIONS.length) {
      const q = INTAKE_QUESTIONS[next];
      // Skip surgery detail if they said No to surgeries
      if (q.id === 'surgeries_detail' && answers['surgeries'] !== 'Yes') {
        next++;
        continue;
      }
      // Skip medication list if they said No
      if (q.id === 'medications_list' && answers['on_medications'] !== 'Yes') {
        next++;
        continue;
      }
      // Skip supplement list if they said No
      if (q.id === 'supplements_list' && answers['on_supplements'] !== 'Yes') {
        next++;
        continue;
      }
      break;
    }
    return next;
  }, []);

  const showQuestion = useCallback((index: number) => {
    if (index >= INTAKE_QUESTIONS.length) {
      // Intake complete
      setIsComplete(true);
      setShowInput(null);
      addSystem('Intake form completed');
      setTimeout(() => {
        addGabriel(`Thank you! I've compiled everything for ${practitionerName}. They'll have a complete picture before your visit.\n\nYou're all set!`);
        hapticSuccess();
        setTimeout(() => {
          setShowDownload(true);
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
        }, 1500);
      }, 800);
      return;
    }

    const q = INTAKE_QUESTIONS[index];
    setCurrentQuestion(q);
    setQuestionIndex(index);

    // Phase transition messages
    const prevPhase = index > 0 ? INTAKE_QUESTIONS[index - 1]?.phase : '';
    if (q.phase !== prevPhase && q.phase !== 'basics') {
      const transitions: Record<string, string> = {
        'chief-complaint': "Great, now let's talk about why you're here.",
        'symptoms': "Let me ask about some common symptoms.",
        'medical-history': "Quick medical history check.",
        'medications': "Almost there. A few questions about what you're currently taking.",
        'supplements': '',
        'allergies': '',
        'lifestyle': "Now some lifestyle questions. These help your practitioner see the full picture.",
        'goals': "Last section!",
      };
      const transition = transitions[q.phase];
      if (transition) {
        addGabriel(transition, 400);
        setTimeout(() => {
          addGabriel(q.prompt, 800);
          setTimeout(() => { setShowInput(q.type); setInputEnabled(true); }, 1200);
        }, 1000);
        return;
      }
    }

    addGabriel(q.prompt);
    setTimeout(() => { setShowInput(q.type); setInputEnabled(true); }, 1000);
  }, [addGabriel, addSystem, practitionerName]);

  // Start
  useEffect(() => {
    const name = patientScheduledName ? patientScheduledName.split(' ')[0] : '';
    const greeting = name
      ? `Hi ${name}! I'm Gabriel, ${practitionerName}'s health assistant. I'll walk you through a quick intake before your visit. Most people finish in about 3 minutes.`
      : `Welcome! I'm Gabriel, ${practitionerName}'s health assistant. I'll walk you through a quick intake. Most people finish in about 3 minutes.`;

    setTimeout(() => {
      addGabriel(greeting);
      setTimeout(() => showQuestion(0), 1800);
    }, 500);
  }, []);

  // Handle answer
  const handleAnswer = useCallback((answer: string) => {
    if (!currentQuestion) return;

    addPatient(answer);
    setShowInput(null);
    setInputEnabled(false);

    const newData = { ...intakeData, [currentQuestion.id]: answer };
    setIntakeData(newData);

    // Check for smart follow-up
    const followUp = currentQuestion.followUp?.(answer);
    if (followUp) {
      setTimeout(() => {
        addGabriel(followUp);
        const nextIdx = getNextQuestionIndex(questionIndex, newData);
        setTimeout(() => showQuestion(nextIdx), 2000);
      }, 500);
    } else {
      const nextIdx = getNextQuestionIndex(questionIndex, newData);
      setTimeout(() => showQuestion(nextIdx), 300);
    }
  }, [currentQuestion, intakeData, questionIndex, addPatient, addGabriel, showQuestion, getNextQuestionIndex]);

  const handleTextSend = useCallback(() => {
    if (!inputText.trim() || !inputEnabled) return;
    handleAnswer(inputText.trim());
    setInputText('');
  }, [inputText, inputEnabled, handleAnswer]);

  const progress = questionIndex >= 0 ? ((questionIndex + 1) / INTAKE_QUESTIONS.length) * 100 : 0;

  // Scroll to bottom when keyboard shows
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => showSub.remove();
  }, []);

  if (showLock) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LockScreen onUnlock={() => { router.back(); }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIconSmall}><Text style={styles.headerIconText}>✦</Text></View>
          <View>
            <Text style={styles.headerTitle}>Patient Intake</Text>
            <Text style={styles.headerSubtitle}>Powered by Gabriel</Text>
          </View>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, { width: `${Math.min(100, progress)}%` }]} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}
      >
        {/* Chat */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={[styles.chatContent, IS_TABLET && styles.chatContentTablet]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
        >
          {messages.map((msg) => {
            if (msg.sender === 'gabriel') return <GabrielBubble key={msg.id} content={msg.content} typing={msg.typing} />;
            if (msg.sender === 'system') return <SystemBubble key={msg.id} content={msg.content} />;
            return <PatientBubble key={msg.id} content={msg.content} />;
          })}

          {/* Inline response UI */}
          {showInput === 'yes-no' && <YesNoInput onAnswer={handleAnswer} />}
          {showInput === 'single-select' && currentQuestion?.options && <SingleSelect options={currentQuestion.options} onAnswer={handleAnswer} />}
          {showInput === 'multi-select' && currentQuestion?.options && <MultiSelect options={currentQuestion.options} onAnswer={handleAnswer} />}
          {showInput === 'scale' && currentQuestion && (
            <ScaleInput min={currentQuestion.scaleMin || 1} max={currentQuestion.scaleMax || 10} labels={currentQuestion.scaleLabels} onAnswer={handleAnswer} />
          )}

          {showDownload && <DownloadPrompt />}
        </ScrollView>

        {/* Text input (only for text/date questions) */}
        {(showInput === 'text' || showInput === 'date') && !isComplete && (
          <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }, IS_TABLET && styles.inputBarTablet]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, IS_TABLET && styles.inputTablet]}
              placeholder={showInput === 'date' ? "MM/DD/YYYY" : "Type your answer..."}
              placeholderTextColor={Colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleTextSend}
              returnKeyType="send"
              editable={inputEnabled}
              keyboardType={showInput === 'date' ? 'numbers-and-punctuation' : 'default'}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || !inputEnabled) && styles.sendButtonDisabled]}
              onPress={handleTextSend}
              disabled={!inputText.trim() || !inputEnabled}
              activeOpacity={0.7}
            >
              <Send size={18} color={inputText.trim() && inputEnabled ? Colors.textInverse : Colors.textTertiary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}

        {/* Complete bar */}
        {isComplete && !showLock && (
          <View style={[styles.completeBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TouchableOpacity style={styles.returnBtn} onPress={() => { hapticMedium(); setShowLock(true); }} activeOpacity={0.7}>
              <Lock size={16} color={Colors.text} strokeWidth={2} />
              <Text style={styles.returnBtnText}>Hand Back to Staff</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.card, gap: 12,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.tealLight, justifyContent: 'center', alignItems: 'center' },
  headerIconText: { fontSize: 14, color: Colors.teal },
  headerTitle: { fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.text, letterSpacing: 0.2 },
  headerSubtitle: { fontSize: 11, fontFamily: Fonts.regular, color: Colors.textTertiary },
  progressBar: { height: 3, backgroundColor: Colors.bgTertiary },
  progressFill: { height: 3, backgroundColor: Colors.teal, borderRadius: 1.5 },
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 24, gap: 12 },
  chatContentTablet: { maxWidth: 680, alignSelf: 'center', width: '100%' },

  // Bubbles
  gabrielBubble: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, maxWidth: '88%' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.tealLight, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  avatarText: { fontSize: 14, color: Colors.teal },
  gabrielContent: { flex: 1, backgroundColor: Colors.card, borderRadius: 18, borderTopLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  gabrielText: { fontSize: IS_TABLET ? 17 : 15, fontFamily: Fonts.regular, color: Colors.text, lineHeight: IS_TABLET ? 26 : 22 },
  patientBubble: { alignItems: 'flex-end' },
  patientContent: { maxWidth: '75%', backgroundColor: Colors.teal, borderRadius: 18, borderTopRightRadius: 4, paddingHorizontal: 16, paddingVertical: 12 },
  patientText: { fontSize: IS_TABLET ? 17 : 15, fontFamily: Fonts.regular, color: Colors.textInverse, lineHeight: IS_TABLET ? 26 : 22 },
  systemMsg: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  systemText: { fontSize: 13, fontFamily: Fonts.medium, color: Colors.green, letterSpacing: 0.2 },
  typingRow: { flexDirection: 'row', gap: 5, paddingVertical: 4 },
  typingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.tealMuted },

  // Yes/No
  yesNoRow: { flexDirection: 'row', gap: 10, paddingLeft: 42 },
  yesBtn: { flex: 1, backgroundColor: Colors.teal, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  yesBtnText: { fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.textInverse, letterSpacing: 0.3 },
  noBtn: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  noBtnText: { fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.text, letterSpacing: 0.3 },

  // Options (single/multi select)
  optionsGrid: { paddingLeft: 42, gap: 8 },
  optionBtn: {
    backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  optionBtnSelected: { backgroundColor: Colors.tealBg, borderColor: Colors.teal },
  optionBtnText: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.text },
  optionBtnTextSelected: { color: Colors.teal, fontFamily: Fonts.medium },
  multiSelectWrap: { gap: 10 },
  continueBtn: { marginLeft: 42, backgroundColor: Colors.teal, borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: Colors.bgTertiary },
  continueBtnText: { fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textInverse, letterSpacing: 0.3 },

  // Scale
  scaleWrap: { paddingLeft: 42, gap: 8 },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleLabelText: { fontSize: 11, fontFamily: Fonts.regular, color: Colors.textTertiary },
  scaleRow: { flexDirection: 'row', gap: 6 },
  scaleBtn: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  scaleBtnText: { fontSize: 15, fontFamily: Fonts.semiBold, color: Colors.text },

  // Download
  downloadCard: {
    backgroundColor: Colors.card, borderRadius: 20, padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.tealLight, marginTop: 12, gap: 12,
  },
  downloadIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.tealBg, justifyContent: 'center', alignItems: 'center' },
  downloadTitle: { fontSize: 18, fontFamily: Fonts.semiBold, color: Colors.text, textAlign: 'center' },
  downloadDesc: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.teal, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 14, marginTop: 4 },
  downloadBtnText: { fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.textInverse, letterSpacing: 0.3 },
  downloadFree: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textTertiary },

  // Lock screen
  lockScreen: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 16,
  },
  lockTitle: { fontSize: 22, fontFamily: Fonts.semiBold, color: Colors.text, letterSpacing: 0.3 },
  lockDesc: { fontSize: 15, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  lockBtn: {
    backgroundColor: Colors.bgSecondary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14,
    borderWidth: 1, borderColor: Colors.border, marginTop: 16,
  },
  lockBtnText: { fontSize: 14, fontFamily: Fonts.medium, color: Colors.textSecondary },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.card,
  },
  inputBarTablet: { maxWidth: 680, alignSelf: 'center', width: '100%' },
  input: {
    flex: 1, minHeight: 44, maxHeight: 100, backgroundColor: Colors.bgSecondary, borderRadius: 22,
    paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, fontSize: IS_TABLET ? 17 : 15,
    fontFamily: Fonts.regular, color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  inputTablet: { fontSize: 17, minHeight: 48 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.teal, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  sendButtonDisabled: { backgroundColor: Colors.bgTertiary },

  // Complete bar
  completeBar: {
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.card,
  },
  returnBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.bgSecondary, borderRadius: 22, paddingVertical: 14, borderWidth: 1, borderColor: Colors.border,
  },
  returnBtnText: { fontSize: 15, fontFamily: Fonts.medium, color: Colors.text },
});
