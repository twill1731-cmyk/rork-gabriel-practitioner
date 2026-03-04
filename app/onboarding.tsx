import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
  Dimensions,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Send, ArrowRight, Check, Loader, Link2, FileUp, Sparkles } from 'lucide-react-native';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { useOnboarding, EMR_PROVIDERS, type EMRProvider } from '../contexts/OnboardingContext';
import { hapticLight, hapticSuccess } from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ChatMessage = {
  id: string;
  sender: 'gabriel' | 'user' | 'system';
  content: string;
  timestamp: number;
  actions?: ChatAction[];
  emrGrid?: boolean;
  typing?: boolean;
};

type ChatAction = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  primary?: boolean;
};

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

function GabrielBubble({ message }: { message: ChatMessage }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  if (message.typing) {
    return (
      <Animated.View style={[styles.gabrielBubble, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.gabrielAvatar}>
          <Text style={styles.avatarEmoji}>✦</Text>
        </View>
        <View style={styles.bubbleContent}>
          <TypingIndicator />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.gabrielBubble, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.gabrielAvatar}>
        <Text style={styles.avatarEmoji}>✦</Text>
      </View>
      <View style={styles.bubbleContent}>
        <Text style={styles.gabrielText}>{message.content}</Text>
      </View>
    </Animated.View>
  );
}

function UserBubble({ message }: { message: ChatMessage }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.userBubble, { opacity: fadeAnim }]}>
      <View style={styles.userBubbleContent}>
        <Text style={styles.userText}>{message.content}</Text>
      </View>
    </Animated.View>
  );
}

function SystemMessage({ message }: { message: ChatMessage }) {
  return (
    <View style={styles.systemMessage}>
      <View style={styles.systemDot} />
      <Text style={styles.systemText}>{message.content}</Text>
    </View>
  );
}

function EMRGrid({ onSelect }: { onSelect: (emr: EMRProvider) => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.emrGrid, { opacity: fadeAnim }]}>
      {EMR_PROVIDERS.map((emr) => (
        <TouchableOpacity
          key={emr.id}
          style={styles.emrCard}
          onPress={() => { hapticLight(); onSelect(emr); }}
          activeOpacity={0.7}
        >
          <Text style={styles.emrIcon}>{emr.icon}</Text>
          <Text style={styles.emrName}>{emr.name}</Text>
          {emr.hasApi && (
            <View style={styles.apiTag}>
              <Text style={styles.apiTagText}>API</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}

function ActionButtons({ actions, onAction }: { actions: ChatAction[]; onAction: (value: string) => void }) {
  return (
    <View style={styles.actionsRow}>
      {actions.map((action, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.actionButton, action.primary && styles.actionButtonPrimary]}
          onPress={() => { hapticLight(); onAction(action.value); }}
          activeOpacity={0.7}
        >
          {action.icon}
          <Text style={[styles.actionText, action.primary && styles.actionTextPrimary]}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { updateData, completeOnboarding } = useOnboarding();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const [kbHeight, setKbHeight] = useState(0);
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => { setKbHeight(e.endCoordinates.height); setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50); }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => { setKbHeight(0); }
    );
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [phase, setPhase] = useState<'name' | 'practice' | 'specialty' | 'emr' | 'emr-connect' | 'sync' | 'done'>('name');
  const [showEmrGrid, setShowEmrGrid] = useState(false);
  const [selectedEmr, setSelectedEmr] = useState<EMRProvider | null>(null);
  const [inputEnabled, setInputEnabled] = useState(false);

  const addGabrielMessage = useCallback((content: string, extras?: Partial<ChatMessage>) => {
    // Show typing first
    const typingId = `typing-${Date.now()}`;
    setMessages(prev => [...prev, { id: typingId, sender: 'gabriel', content: '', timestamp: Date.now(), typing: true }]);
    setInputEnabled(false);

    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== typingId));
      setMessages(prev => [...prev, {
        id: `g-${Date.now()}`,
        sender: 'gabriel',
        content,
        timestamp: Date.now(),
        ...extras,
      }]);
      setInputEnabled(true);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 800 + Math.random() * 600);
  }, []);

  const addUserMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, {
      id: `u-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: Date.now(),
    }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, []);

  const addSystemMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, {
      id: `s-${Date.now()}`,
      sender: 'system',
      content,
      timestamp: Date.now(),
    }]);
  }, []);

  // Start the conversation
  useEffect(() => {
    const timer = setTimeout(() => {
      addGabrielMessage("Welcome to Gabriel. I'm here to get your practice set up so you can start using AI-powered patient intelligence right away.\n\nWhat's your name?");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || !inputEnabled) return;
    const text = inputText.trim();
    setInputText('');

    switch (phase) {
      case 'name':
        addUserMessage(text);
        updateData({ practitionerName: text });
        setPhase('practice');
        addGabrielMessage(`Great to meet you, ${text.split(' ')[0]}. What's the name of your practice?`);
        break;

      case 'practice':
        addUserMessage(text);
        updateData({ practiceName: text });
        setPhase('specialty');
        addGabrielMessage("And what's your primary specialty? For example: naturopathic medicine, functional medicine, integrative oncology, chiropractic, acupuncture...");
        break;

      case 'specialty':
        addUserMessage(text);
        updateData({ specialty: text });
        setPhase('emr');
        setShowEmrGrid(true);
        addGabrielMessage("Perfect. Now let's connect your patient data. What software do you currently use to manage your patients?\n\nSelect your platform below, or just type it in.");
        break;

      default:
        addUserMessage(text);
        break;
    }
  }, [inputText, phase, inputEnabled, addUserMessage, addGabrielMessage, updateData]);

  const handleEmrSelect = useCallback((emr: EMRProvider) => {
    setSelectedEmr(emr);
    setShowEmrGrid(false);
    updateData({ selectedEmr: emr });
    addUserMessage(emr.name);

    if (emr.id === 'other') {
      addGabrielMessage(
        "No problem. You can add patients manually or import a CSV file later. Let's get you into the app.\n\nYou can always connect an EMR from Settings whenever you're ready.",
        {
          actions: [
            { label: 'Get Started', value: 'finish', primary: true, icon: <ArrowRight size={16} color={Colors.textInverse} strokeWidth={2} /> },
          ],
        }
      );
      setPhase('done');
    } else if (emr.hasApi) {
      setPhase('emr-connect');
      addGabrielMessage(
        `${emr.name} has a direct integration. I can connect to your account securely via OAuth — you'll authorize access and I'll sync your patient data automatically.\n\nThis takes about 30 seconds.`,
        {
          actions: [
            { label: `Connect ${emr.name}`, value: 'connect-oauth', primary: true, icon: <Link2 size={16} color={Colors.textInverse} strokeWidth={2} /> },
            { label: 'Skip for now', value: 'skip-emr' },
          ],
        }
      );
    } else {
      setPhase('emr-connect');
      addGabrielMessage(
        `${emr.name} doesn't have an open API yet, but we can import your patient data via CSV export. Most practitioners do this in under 5 minutes.\n\nOr you can skip this and add patients manually.`,
        {
          actions: [
            { label: 'Import CSV', value: 'import-csv', primary: true, icon: <FileUp size={16} color={Colors.textInverse} strokeWidth={2} /> },
            { label: 'Add Manually Later', value: 'skip-emr' },
          ],
        }
      );
    }
  }, [addUserMessage, addGabrielMessage, updateData]);

  const handleAction = useCallback((value: string) => {
    hapticLight();

    switch (value) {
      case 'connect-oauth':
        addSystemMessage(`Connecting to ${selectedEmr?.name}...`);
        setPhase('sync');
        // Simulate OAuth + sync
        setTimeout(() => {
          addSystemMessage(`✓ Connected to ${selectedEmr?.name}`);
          updateData({ emrConnected: true });
        }, 1500);
        setTimeout(() => {
          addSystemMessage('✓ Syncing patient data...');
        }, 2500);
        setTimeout(() => {
          const patientCount = 23 + Math.floor(Math.random() * 40);
          updateData({ patientCount });
          addSystemMessage(`✓ ${patientCount} patients imported`);
          addGabrielMessage(
            `All set — I can see ${patientCount} patients from your ${selectedEmr?.name} account. Your data is encrypted and synced.\n\nI'm ready when you are.`,
            {
              actions: [
                { label: 'Go to Dashboard', value: 'finish', primary: true, icon: <Sparkles size={16} color={Colors.textInverse} strokeWidth={2} /> },
              ],
            }
          );
          setPhase('done');
          hapticSuccess();
        }, 4000);
        break;

      case 'import-csv':
        addSystemMessage('CSV import will be available in the next update.');
        addGabrielMessage(
          "CSV import is coming soon. For now, let's get you into the app — you can add patients manually or I can help you set up import later from Settings.",
          {
            actions: [
              { label: 'Get Started', value: 'finish', primary: true, icon: <ArrowRight size={16} color={Colors.textInverse} strokeWidth={2} /> },
            ],
          }
        );
        setPhase('done');
        break;

      case 'skip-emr':
        addGabrielMessage(
          "No problem. You can connect your EMR or import patients anytime from Settings. Let's get you into the app.",
          {
            actions: [
              { label: 'Get Started', value: 'finish', primary: true, icon: <ArrowRight size={16} color={Colors.textInverse} strokeWidth={2} /> },
            ],
          }
        );
        setPhase('done');
        break;

      case 'finish':
        hapticSuccess();
        completeOnboarding();
        router.replace('/(tabs)/(dashboard)');
        break;
    }
  }, [selectedEmr, addSystemMessage, addGabrielMessage, updateData, completeOnboarding, router]);

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>✦</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Gabriel</Text>
            <Text style={styles.headerSubtitle}>Practice Setup</Text>
          </View>
        </View>
      </View>

      {/* Chat */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          if (msg.sender === 'gabriel') {
            return (
              <View key={msg.id}>
                <GabrielBubble message={msg} />
                {msg.actions && <ActionButtons actions={msg.actions} onAction={handleAction} />}
              </View>
            );
          }
          if (msg.sender === 'system') {
            return <SystemMessage key={msg.id} message={msg} />;
          }
          return <UserBubble key={msg.id} message={msg} />;
        })}

        {showEmrGrid && <EMRGrid onSelect={handleEmrSelect} />}
      </ScrollView>

      {/* Input */}
      {phase !== 'sync' && phase !== 'done' && (
        <View style={[styles.inputBar, { paddingBottom: kbHeight > 0 ? 8 : Math.max(insets.bottom, 12), marginBottom: kbHeight > 0 ? kbHeight - insets.bottom : 0 }]}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={
              phase === 'name' ? "Your full name..." :
              phase === 'practice' ? "Practice name..." :
              phase === 'specialty' ? "Your specialty..." :
              "Type a message..."
            }
            placeholderTextColor={Colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={inputEnabled}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || !inputEnabled) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || !inputEnabled}
            activeOpacity={0.7}
          >
            <Send size={18} color={inputText.trim() && inputEnabled ? Colors.textInverse : Colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      )}
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 18,
    color: Colors.teal,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textTertiary,
    letterSpacing: 0.2,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  // Gabriel bubble
  gabrielBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    maxWidth: '88%',
  },
  gabrielAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  avatarEmoji: {
    fontSize: 14,
    color: Colors.teal,
  },
  bubbleContent: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  gabrielText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.text,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  // User bubble
  userBubble: {
    alignItems: 'flex-end',
  },
  userBubbleContent: {
    maxWidth: '75%',
    backgroundColor: Colors.teal,
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textInverse,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  // System message
  systemMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  systemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.tealMuted,
  },
  systemText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  // Typing
  typingRow: {
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.tealMuted,
  },
  // EMR grid
  emrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingLeft: 42,
    paddingTop: 4,
  },
  emrCard: {
    width: (SCREEN_WIDTH - 42 - 32 - 20) / 2,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 6,
  },
  emrIcon: {
    fontSize: 24,
  },
  emrName: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  apiTag: {
    backgroundColor: Colors.tealBg,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  apiTagText: {
    fontSize: 9,
    fontFamily: Fonts.semiBold,
    color: Colors.teal,
    letterSpacing: 0.5,
  },
  // Actions
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingLeft: 42,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  actionText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.text,
    letterSpacing: 0.2,
  },
  actionTextPrimary: {
    color: Colors.textInverse,
  },
  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 22,
    paddingHorizontal: 18,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.bgTertiary,
  },
});
