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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Send, Mic, MicOff, ArrowLeft, Sparkles, Download, CheckCircle, PenTool } from 'lucide-react-native';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { hapticLight, hapticSuccess } from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;

type IntakeMessage = {
  id: string;
  sender: 'gabriel' | 'patient' | 'system';
  content: string;
  timestamp: number;
  typing?: boolean;
  options?: IntakeOption[];
  multiSelect?: boolean;
  signatureRequest?: boolean;
};

type IntakeOption = {
  label: string;
  value: string;
  selected?: boolean;
};

type IntakePhase =
  | 'greeting'
  | 'basics'
  | 'chief-complaint'
  | 'symptoms'
  | 'medical-history'
  | 'medications'
  | 'supplements'
  | 'lifestyle'
  | 'goals'
  | 'consent'
  | 'complete';

// Intake question flow
const INTAKE_FLOW: { phase: IntakePhase; questions: string[] }[] = [
  {
    phase: 'basics',
    questions: [
      "Let's start with the basics. What's your full name?",
      "And your date of birth?",
      "What's the best phone number to reach you?",
      "And your email address?",
    ],
  },
  {
    phase: 'chief-complaint',
    questions: [
      "Now I'd love to understand what brings you in today. In your own words, what's your main health concern?",
      "How long have you been experiencing this?",
      "On a scale of 1-10, how much does this affect your daily life?",
    ],
  },
  {
    phase: 'symptoms',
    questions: [
      "Are you experiencing any of these symptoms? Select all that apply, or tell me about others.",
    ],
  },
  {
    phase: 'medical-history',
    questions: [
      "Have you been diagnosed with any medical conditions? If so, which ones?",
      "Any surgeries or hospitalizations?",
      "Any family history of chronic illness? (Heart disease, diabetes, cancer, autoimmune, etc.)",
    ],
  },
  {
    phase: 'medications',
    questions: [
      "Are you currently taking any prescription medications? If so, please list them.",
    ],
  },
  {
    phase: 'supplements',
    questions: [
      "How about supplements, herbs, or vitamins? Anything you're taking regularly?",
    ],
  },
  {
    phase: 'lifestyle',
    questions: [
      "Let's talk lifestyle. How would you describe your diet?",
      "How many hours of sleep do you typically get?",
      "How often do you exercise, and what type?",
      "How would you rate your stress level? (Low, moderate, high, very high)",
    ],
  },
  {
    phase: 'goals',
    questions: [
      "Last question: what's your #1 health goal? What would success look like for you?",
    ],
  },
];

const SYMPTOM_OPTIONS: IntakeOption[] = [
  { label: '😴 Fatigue / Low energy', value: 'fatigue' },
  { label: '😰 Anxiety / Stress', value: 'anxiety' },
  { label: '🛏️ Sleep issues', value: 'sleep' },
  { label: '🧠 Brain fog', value: 'brain_fog' },
  { label: '🤢 Digestive issues', value: 'digestive' },
  { label: '🔥 Joint / Muscle pain', value: 'pain' },
  { label: '⚖️ Weight concerns', value: 'weight' },
  { label: '🤧 Allergies / Sinus', value: 'allergies' },
  { label: '💔 Mood changes', value: 'mood' },
  { label: '🥶 Cold hands/feet', value: 'circulation' },
  { label: '💇 Hair / Skin changes', value: 'hair_skin' },
  { label: '🫀 Heart palpitations', value: 'heart' },
];

function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, []);

  return (
    <View style={styles.typingRow}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.typingDot,
            { opacity: Animated.add(0.3, Animated.multiply(dot, 0.7)) },
            { transform: [{ translateY: Animated.multiply(dot, -4) }] },
          ]}
        />
      ))}
    </View>
  );
}

function MessageBubble({ message }: { message: IntakeMessage }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  if (message.sender === 'gabriel') {
    return (
      <Animated.View style={[styles.gabrielBubble, { opacity: fadeAnim }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>✦</Text>
        </View>
        <View style={styles.gabrielContent}>
          {message.typing ? <TypingIndicator /> : (
            <Text style={styles.gabrielText}>{message.content}</Text>
          )}
        </View>
      </Animated.View>
    );
  }

  if (message.sender === 'system') {
    return (
      <Animated.View style={[styles.systemMsg, { opacity: fadeAnim }]}>
        <CheckCircle size={14} color={Colors.green} strokeWidth={2} />
        <Text style={styles.systemText}>{message.content}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.patientBubble, { opacity: fadeAnim }]}>
      <View style={styles.patientContent}>
        <Text style={styles.patientText}>{message.content}</Text>
      </View>
    </Animated.View>
  );
}

function SymptomSelector({ options, onSubmit }: { options: IntakeOption[]; onSubmit: (selected: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (value: string) => {
    hapticLight();
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  return (
    <View style={styles.symptomGrid}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.symptomChip, selected.has(opt.value) && styles.symptomChipSelected]}
          onPress={() => toggle(opt.value)}
          activeOpacity={0.7}
        >
          <Text style={[styles.symptomChipText, selected.has(opt.value) && styles.symptomChipTextSelected]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.submitSymptomsBtn, selected.size === 0 && styles.submitSymptomsBtnDisabled]}
        onPress={() => { if (selected.size > 0) { hapticLight(); onSubmit(Array.from(selected)); } }}
        disabled={selected.size === 0}
        activeOpacity={0.7}
      >
        <Text style={styles.submitSymptomsText}>
          {selected.size === 0 ? 'Select your symptoms' : `Continue with ${selected.size} selected`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function DownloadPrompt() {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.downloadCard, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.downloadIcon}>
        <Sparkles size={28} color={Colors.teal} strokeWidth={1.8} />
      </View>
      <Text style={styles.downloadTitle}>Stay connected with your practitioner</Text>
      <Text style={styles.downloadDesc}>
        Download Gabriel to access your protocols, track your progress, message your practitioner, and get personalized health insights powered by AI.
      </Text>
      <TouchableOpacity
        style={styles.downloadBtn}
        onPress={() => {
          hapticLight();
          // TODO: Replace with actual App Store link
          Linking.openURL('https://apps.apple.com/app/gabriel-health/id0000000000');
        }}
        activeOpacity={0.7}
      >
        <Download size={18} color={Colors.textInverse} strokeWidth={2} />
        <Text style={styles.downloadBtnText}>Download Gabriel</Text>
      </TouchableOpacity>
      <Text style={styles.downloadFree}>Free for patients. Always.</Text>
    </Animated.View>
  );
}

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
  const [currentFlowIndex, setCurrentFlowIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<IntakePhase>('greeting');
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [intakeData, setIntakeData] = useState<Record<string, string>>({});
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const addMessage = useCallback((sender: 'gabriel' | 'patient' | 'system', content: string) => {
    if (sender === 'gabriel') {
      const typingId = `typing-${Date.now()}`;
      setMessages(prev => [...prev, { id: typingId, sender: 'gabriel', content: '', timestamp: Date.now(), typing: true }]);
      setInputEnabled(false);

      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== typingId));
        setMessages(prev => [...prev, { id: `g-${Date.now()}`, sender: 'gabriel', content, timestamp: Date.now() }]);
        setInputEnabled(true);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }, 600 + Math.random() * 400);
    } else {
      setMessages(prev => [...prev, { id: `${sender[0]}-${Date.now()}`, sender, content, timestamp: Date.now() }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, []);

  // Start conversation
  useEffect(() => {
    const greeting = patientScheduledName
      ? `Hi ${patientScheduledName.split(' ')[0]}! I'm Gabriel, ${practitionerName}'s health assistant.\n\nBefore your visit, I'd like to learn about you so we can make the most of your time together. This takes about 5 minutes and it's way better than a clipboard.\n\nReady to get started?`
      : `Welcome! I'm Gabriel, ${practitionerName}'s health assistant.\n\nBefore your visit, I'd like to learn about you so we can make the most of your time together. This takes about 5 minutes.\n\nLet's get started.`;

    setTimeout(() => addMessage('gabriel', greeting), 500);
    setTimeout(() => {
      setPhase('basics');
      setCurrentFlowIndex(0);
      setCurrentQuestionIndex(0);
      addMessage('gabriel', INTAKE_FLOW[0].questions[0]);
    }, 2000);
  }, []);

  const advanceQuestion = useCallback(() => {
    const flow = INTAKE_FLOW[currentFlowIndex];
    const nextQ = currentQuestionIndex + 1;

    if (nextQ < flow.questions.length) {
      setCurrentQuestionIndex(nextQ);
      addMessage('gabriel', flow.questions[nextQ]);
    } else {
      const nextFlow = currentFlowIndex + 1;
      if (nextFlow < INTAKE_FLOW.length) {
        setCurrentFlowIndex(nextFlow);
        setCurrentQuestionIndex(0);
        const nextPhase = INTAKE_FLOW[nextFlow].phase;
        setPhase(nextPhase);

        if (nextPhase === 'symptoms') {
          addMessage('gabriel', INTAKE_FLOW[nextFlow].questions[0]);
          setTimeout(() => setShowSymptoms(true), 1200);
        } else {
          addMessage('gabriel', INTAKE_FLOW[nextFlow].questions[0]);
        }
      } else {
        // Intake complete
        setPhase('complete');
        addMessage('system', 'Intake form completed');
        setTimeout(() => {
          addMessage('gabriel', `Thank you! I've compiled all your information for ${practitionerName}. They'll have everything they need before your visit.\n\nYou're all set!`);
          hapticSuccess();
          setTimeout(() => setShowDownload(true), 1500);
        }, 800);
      }
    }
  }, [currentFlowIndex, currentQuestionIndex, addMessage, practitionerName]);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || !inputEnabled) return;
    const text = inputText.trim();
    setInputText('');
    addMessage('patient', text);

    // Store the answer
    const key = `${phase}-${currentQuestionIndex}`;
    setIntakeData(prev => ({ ...prev, [key]: text }));

    // Smart follow-ups based on content
    if (phase === 'chief-complaint' && currentQuestionIndex === 0) {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('fatigue') || lowerText.includes('tired') || lowerText.includes('energy')) {
        setTimeout(() => addMessage('gabriel', "Fatigue can have many underlying causes. I'll make sure to flag this for a thorough workup. When during the day is it worst?"), 500);
        // Still advance after the follow-up
        setTimeout(() => advanceQuestion(), 3000);
        return;
      }
      if (lowerText.includes('gut') || lowerText.includes('stomach') || lowerText.includes('digestion') || lowerText.includes('bloat')) {
        setTimeout(() => addMessage('gabriel', "GI concerns are one of the most common things we see. We'll definitely want to look at this holistically. Is it worse after eating certain foods?"), 500);
        setTimeout(() => advanceQuestion(), 3000);
        return;
      }
    }

    advanceQuestion();
  }, [inputText, inputEnabled, phase, currentQuestionIndex, addMessage, advanceQuestion, intakeData]);

  const handleSymptomSubmit = useCallback((selected: string[]) => {
    setShowSymptoms(false);
    const labels = selected.map(v => SYMPTOM_OPTIONS.find(o => o.value === v)?.label || v).join(', ');
    addMessage('patient', labels);
    setIntakeData(prev => ({ ...prev, symptoms: selected.join(',') }));

    // Smart response based on symptom combinations
    if (selected.includes('fatigue') && selected.includes('cold_hands')) {
      setTimeout(() => addMessage('gabriel', "I notice you mentioned both fatigue and cold hands/feet. That combination often points to thyroid function. I'll flag this for your practitioner. Let's continue."), 500);
      setTimeout(() => advanceQuestion(), 3500);
    } else if (selected.includes('digestive') && selected.includes('brain_fog')) {
      setTimeout(() => addMessage('gabriel', "Interesting combination. Gut and brain health are deeply connected through the gut-brain axis. Your practitioner will likely want to explore this. Let's keep going."), 500);
      setTimeout(() => advanceQuestion(), 3500);
    } else {
      setTimeout(() => {
        addMessage('gabriel', `Got it. I've noted ${selected.length} symptoms. Let's continue.`);
        setTimeout(() => advanceQuestion(), 1200);
      }, 500);
    }
  }, [addMessage, advanceQuestion]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIconSmall}>
            <Text style={styles.headerIconText}>✦</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Patient Intake</Text>
            <Text style={styles.headerSubtitle}>Powered by Gabriel</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.voiceToggle, isVoiceMode && styles.voiceToggleActive]}
          onPress={() => { hapticLight(); setIsVoiceMode(!isVoiceMode); }}
        >
          {isVoiceMode
            ? <Mic size={18} color={Colors.teal} strokeWidth={2} />
            : <MicOff size={18} color={Colors.textTertiary} strokeWidth={2} />
          }
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.min(100, ((currentFlowIndex + (currentQuestionIndex / (INTAKE_FLOW[currentFlowIndex]?.questions.length || 1))) / INTAKE_FLOW.length) * 100)}%` }]} />
      </View>

      {/* Chat area */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={[styles.chatContent, IS_TABLET && styles.chatContentTablet]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {showSymptoms && (
          <SymptomSelector options={SYMPTOM_OPTIONS} onSubmit={handleSymptomSubmit} />
        )}

        {showDownload && <DownloadPrompt />}
      </ScrollView>

      {/* Input */}
      {phase !== 'complete' && !showSymptoms && (
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }, IS_TABLET && styles.inputBarTablet]}>
          {IS_TABLET && (
            <TouchableOpacity style={styles.pencilBtn} onPress={() => hapticLight()}>
              <PenTool size={18} color={Colors.textTertiary} strokeWidth={2} />
            </TouchableOpacity>
          )}
          <TextInput
            ref={inputRef}
            style={[styles.input, IS_TABLET && styles.inputTablet]}
            placeholder={isVoiceMode ? "Tap mic to speak..." : "Type your answer..."}
            placeholderTextColor={Colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={inputEnabled && !isVoiceMode}
            multiline={IS_TABLET}
          />
          {isVoiceMode ? (
            <TouchableOpacity
              style={[styles.sendButton, styles.micButton]}
              onPress={() => hapticLight()}
              activeOpacity={0.7}
            >
              <Mic size={20} color={Colors.textInverse} strokeWidth={2} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || !inputEnabled) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || !inputEnabled}
              activeOpacity={0.7}
            >
              <Send size={18} color={inputText.trim() && inputEnabled ? Colors.textInverse : Colors.textTertiary} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Return to dashboard after complete */}
      {phase === 'complete' && (
        <View style={[styles.completeBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity
            style={styles.returnBtn}
            onPress={() => { hapticLight(); router.back(); }}
            activeOpacity={0.7}
          >
            <Text style={styles.returnBtnText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 14,
    color: Colors.teal,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textTertiary,
    letterSpacing: 0.2,
  },
  voiceToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  voiceToggleActive: {
    backgroundColor: Colors.tealBg,
    borderColor: Colors.teal,
  },
  // Progress
  progressBar: {
    height: 3,
    backgroundColor: Colors.bgTertiary,
  },
  progressFill: {
    height: 3,
    backgroundColor: Colors.teal,
    borderRadius: 1.5,
  },
  // Chat
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  chatContentTablet: {
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
  // Bubbles
  gabrielBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    maxWidth: '88%',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  avatarText: {
    fontSize: 14,
    color: Colors.teal,
  },
  gabrielContent: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  gabrielText: {
    fontSize: IS_TABLET ? 17 : 15,
    fontFamily: Fonts.regular,
    color: Colors.text,
    lineHeight: IS_TABLET ? 26 : 22,
  },
  patientBubble: {
    alignItems: 'flex-end',
  },
  patientContent: {
    maxWidth: '75%',
    backgroundColor: Colors.teal,
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  patientText: {
    fontSize: IS_TABLET ? 17 : 15,
    fontFamily: Fonts.regular,
    color: Colors.textInverse,
    lineHeight: IS_TABLET ? 26 : 22,
  },
  systemMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  systemText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.green,
    letterSpacing: 0.2,
  },
  // Typing
  typingRow: {
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 4,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.tealMuted,
  },
  // Symptoms
  symptomGrid: {
    paddingLeft: 42,
    gap: 8,
    paddingTop: 4,
  },
  symptomChip: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  symptomChipSelected: {
    backgroundColor: Colors.tealBg,
    borderColor: Colors.teal,
  },
  symptomChipText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  symptomChipTextSelected: {
    color: Colors.teal,
    fontFamily: Fonts.medium,
  },
  submitSymptomsBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitSymptomsBtnDisabled: {
    backgroundColor: Colors.bgTertiary,
  },
  submitSymptomsText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
  // Download prompt
  downloadCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.tealLight,
    marginTop: 12,
    gap: 12,
  },
  downloadIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.tealBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  downloadDesc: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.teal,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 4,
  },
  downloadBtnText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
  downloadFree: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textTertiary,
    letterSpacing: 0.2,
  },
  // Input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  inputBarTablet: {
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
  pencilBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: IS_TABLET ? 17 : 15,
    fontFamily: Fonts.regular,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputTablet: {
    fontSize: 17,
    minHeight: 48,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.bgTertiary,
  },
  micButton: {
    backgroundColor: Colors.teal,
  },
  // Complete
  completeBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  returnBtn: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  returnBtnText: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: Colors.text,
    letterSpacing: 0.2,
  },
});
