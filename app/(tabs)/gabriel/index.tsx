import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Send,
  Mic,
  ChevronDown,
  User,
  X,
  Sparkles,
  BookmarkPlus,
  Forward,
  FileEdit,
  ClipboardList,
  Check,
} from 'lucide-react-native';
import Colors from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { usePractitioner } from '../../../contexts/PractitionerContext';
import { hapticLight, hapticMedium } from '../../../utils/haptics';
import type { Patient } from '../../../constants/practitioner-data';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  actions?: QuickAction[];
}

interface QuickAction {
  id: string;
  label: string;
  icon: 'protocol' | 'send' | 'notes' | 'record';
  done?: boolean;
}

const GABRIEL_GREETING = `Good morning, Doctor. How can I assist you today? I'm ready to discuss patient cases, review protocols, or help with clinical decision-making.`;

const MOCK_RESPONSES: Record<string, { text: string; actions?: QuickAction[] }> = {
  default: {
    text: `That's an excellent clinical question. Based on current integrative medicine literature, I'd recommend considering a multi-pronged approach. Would you like me to elaborate on specific protocols or discuss this in the context of a particular patient?`,
  },
  patient: {
    text: `I've reviewed this patient's full history including recent labs, current protocol, and symptom tracking. Their health score trajectory is positive, though I notice a few areas we should address.\n\nKey observations:\n• Recent lab trends suggest the current protocol is working\n• Compliance has been consistent\n• There may be room to optimize their supplement timing\n\nWould you like me to draft protocol adjustments?`,
    actions: [
      { id: 'a1', label: 'Save as Protocol', icon: 'protocol' },
      { id: 'a2', label: 'Add to Visit Notes', icon: 'notes' },
      { id: 'a3', label: 'Update Patient Record', icon: 'record' },
    ],
  },
  protocol: {
    text: `Based on the patient's labs and symptom profile, here's my recommended protocol adjustment:\n\n**Morning:**\n• Selenium 200mcg (maintain)\n• Zinc 30mg (maintain)\n• Vitamin D 5000IU → 8000IU (increase based on low levels)\n\n**Evening:**\n• Magnesium Glycinate 400mg (maintain)\n• Add Phosphatidylserine 300mg (for cortisol regulation)\n\nThis modification targets the vitamin D insufficiency while supporting the adrenal axis. Retest in 6 weeks.`,
    actions: [
      { id: 'a4', label: 'Save as Protocol', icon: 'protocol' },
      { id: 'a5', label: 'Send to Patient', icon: 'send' },
      { id: 'a6', label: 'Add to Visit Notes', icon: 'notes' },
      { id: 'a7', label: 'Update Patient Record', icon: 'record' },
    ],
  },
};

function getActionIcon(icon: string, size: number, color: string) {
  switch (icon) {
    case 'protocol':
      return <BookmarkPlus size={size} color={color} strokeWidth={1.8} />;
    case 'send':
      return <Forward size={size} color={color} strokeWidth={1.8} />;
    case 'notes':
      return <FileEdit size={size} color={color} strokeWidth={1.8} />;
    case 'record':
      return <ClipboardList size={size} color={color} strokeWidth={1.8} />;
    default:
      return <BookmarkPlus size={size} color={color} strokeWidth={1.8} />;
  }
}

function getMockResponse(input: string, selectedPatient: Patient | null): { text: string; actions?: QuickAction[] } {
  const lower = input.toLowerCase();
  if (selectedPatient) {
    if (lower.includes('protocol') || lower.includes('adjust') || lower.includes('change') || lower.includes('recommend')) {
      return {
        text: MOCK_RESPONSES.protocol.text.replace('the patient', selectedPatient.name),
        actions: MOCK_RESPONSES.protocol.actions?.map((a: QuickAction) => ({ ...a })),
      };
    }
    return {
      ...MOCK_RESPONSES.patient,
      text: `I've reviewed ${selectedPatient.name}'s full history including recent labs, current protocol, and symptom tracking. Their health score is ${selectedPatient.healthScore} (${selectedPatient.healthScoreDelta > 0 ? '+' : ''}${selectedPatient.healthScoreDelta} trend), with ${selectedPatient.complianceRate}% compliance.\n\nKey observations:\n• Primary conditions: ${selectedPatient.primaryConditions.join(', ')}\n• Currently on ${selectedPatient.protocolCount} supplements\n• ${selectedPatient.alerts.filter(a => !a.read).length > 0 ? 'Has unread alerts requiring attention' : 'No critical alerts'}\n\nWhat specific aspect would you like to explore?`,
      actions: MOCK_RESPONSES.patient.actions,
    };
  }
  return MOCK_RESPONSES.default;
}

function PatientSelectorModal({
  visible,
  onClose,
  patients,
  onSelect,
  selectedId,
}: {
  visible: boolean;
  onClose: () => void;
  patients: Patient[];
  onSelect: (patient: Patient | null) => void;
  selectedId: string | null;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.headerTitle}>Select Patient Context</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <X size={22} color={Colors.textSecondary} strokeWidth={1.8} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[modalStyles.patientRow, !selectedId && modalStyles.patientRowActive]}
            onPress={() => { onSelect(null); onClose(); }}
            activeOpacity={0.6}
          >
            <View style={[modalStyles.avatar, { backgroundColor: Colors.tealBg }]}>
              <Sparkles size={16} color={Colors.teal} strokeWidth={1.8} />
            </View>
            <View style={modalStyles.patientInfo}>
              <Text style={modalStyles.patientName}>General Clinical</Text>
              <Text style={modalStyles.patientSub}>No specific patient context</Text>
            </View>
            {!selectedId && <Check size={18} color={Colors.teal} strokeWidth={2} />}
          </TouchableOpacity>

          <View style={modalStyles.divider} />

          <FlatList
            data={patients}
            keyExtractor={p => p.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[modalStyles.patientRow, selectedId === item.id && modalStyles.patientRowActive]}
                onPress={() => { hapticLight(); onSelect(item); onClose(); }}
                activeOpacity={0.6}
              >
                <View style={modalStyles.avatar}>
                  <Text style={modalStyles.avatarText}>{item.avatar}</Text>
                </View>
                <View style={modalStyles.patientInfo}>
                  <Text style={modalStyles.patientName}>{item.name}</Text>
                  <Text style={modalStyles.patientSub}>{item.primaryConditions.join(' · ')}</Text>
                </View>
                {selectedId === item.id && <Check size={18} color={Colors.teal} strokeWidth={2} />}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

function ActionButton({ action, onPress }: { action: QuickAction; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, action.done && styles.actionBtnDone]}
      onPress={onPress}
      activeOpacity={0.6}
      disabled={action.done}
    >
      {action.done ? (
        <Check size={13} color={Colors.green} strokeWidth={2} />
      ) : (
        getActionIcon(action.icon, 13, Colors.teal)
      )}
      <Text style={[styles.actionBtnText, action.done && styles.actionBtnTextDone]}>
        {action.label}
      </Text>
    </TouchableOpacity>
  );
}

function MessageBubble({ message, onActionPress }: { message: ChatMessage; onActionPress: (msgId: string, actionId: string) => void }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && (
        <View style={styles.gabrielAvatar}>
          <Sparkles size={14} color={Colors.gold} strokeWidth={2} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{message.content}</Text>
        {message.actions && message.actions.length > 0 && (
          <View style={styles.actionsRow}>
            {message.actions.map(action => (
              <ActionButton
                key={action.id}
                action={action}
                onPress={() => onActionPress(message.id, action.id)}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export default function GabrielChatScreen() {
  const insets = useSafeAreaInsets();
  const { patients } = usePractitioner();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientSelector, setShowPatientSelector] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: GABRIEL_GREETING,
      timestamp: Date.now(),
    },
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const typingDot1 = useRef(new Animated.Value(0.3)).current;
  const typingDot2 = useRef(new Animated.Value(0.3)).current;
  const typingDot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (!isTyping) return;
    const anim = Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(typingDot1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(typingDot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(typingDot2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(typingDot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(typingDot3, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(typingDot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isTyping]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;

    hapticLight();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    const delay = 1200 + Math.random() * 800;
    setTimeout(() => {
      const response = getMockResponse(text, selectedPatient);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        actions: response.actions,
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
      scrollToBottom();
    }, delay);
  }, [inputText, selectedPatient, scrollToBottom]);

  const handleActionPress = useCallback((msgId: string, actionId: string) => {
    hapticMedium();
    setMessages(prev => prev.map(msg => {
      if (msg.id !== msgId) return msg;
      return {
        ...msg,
        actions: msg.actions?.map(a =>
          a.id === actionId ? { ...a, done: true } : a
        ),
      };
    }));
    console.log('[Gabriel] Action triggered:', actionId, 'on message:', msgId);
  }, []);

  const handlePatientSelect = useCallback((patient: Patient | null) => {
    setSelectedPatient(patient);
    hapticLight();
    if (patient) {
      const contextMsg: ChatMessage = {
        id: `system-${Date.now()}`,
        role: 'assistant',
        content: `Now discussing ${patient.name}. I have access to their full history, labs, protocols, and visit notes. What would you like to review?`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, contextMsg]);
      scrollToBottom();
    }
    console.log('[Gabriel] Patient context changed:', patient?.name || 'General');
  }, [scrollToBottom]);

  const quickPrompts = useMemo(() => {
    if (selectedPatient) {
      return [
        `Review ${selectedPatient.name.split(' ')[0]}'s latest labs`,
        'Suggest protocol adjustments',
        'Summarize recent progress',
      ];
    }
    return [
      'Help me interpret labs',
      'Protocol for Hashimoto\'s',
      'SIBO treatment approach',
    ];
  }, [selectedPatient]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerLeft}>
          <View style={styles.gabrielIcon}>
            <Sparkles size={18} color={Colors.gold} strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Gabriel</Text>
            <Text style={styles.headerSubtitle}>Clinical Colleague</Text>
          </View>
        </View>
      </Animated.View>

      <TouchableOpacity
        style={styles.patientSelector}
        onPress={() => { hapticLight(); setShowPatientSelector(true); }}
        activeOpacity={0.6}
      >
        <View style={styles.patientSelectorLeft}>
          {selectedPatient ? (
            <View style={styles.patientSelectorAvatar}>
              <Text style={styles.patientSelectorAvatarText}>{selectedPatient.avatar}</Text>
            </View>
          ) : (
            <View style={[styles.patientSelectorAvatar, { backgroundColor: Colors.tealBg }]}>
              <User size={14} color={Colors.teal} strokeWidth={1.8} />
            </View>
          )}
          <View>
            <Text style={styles.patientSelectorLabel}>Discussing</Text>
            <Text style={styles.patientSelectorName}>
              {selectedPatient ? selectedPatient.name : 'General Clinical'}
            </Text>
          </View>
        </View>
        <ChevronDown size={18} color={Colors.textTertiary} strokeWidth={1.8} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 110 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          contentContainerStyle={[styles.messagesContent, { paddingBottom: 16 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onActionPress={handleActionPress}
            />
          ))}

          {isTyping && (
            <View style={styles.bubbleRow}>
              <View style={styles.gabrielAvatar}>
                <Sparkles size={14} color={Colors.gold} strokeWidth={2} />
              </View>
              <View style={[styles.bubble, styles.bubbleAssistant, styles.typingBubble]}>
                <View style={styles.typingDots}>
                  <Animated.View style={[styles.typingDot, { opacity: typingDot1 }]} />
                  <Animated.View style={[styles.typingDot, { opacity: typingDot2 }]} />
                  <Animated.View style={[styles.typingDot, { opacity: typingDot3 }]} />
                </View>
              </View>
            </View>
          )}

          {messages.length <= 1 && !isTyping && (
            <View style={styles.quickPrompts}>
              {quickPrompts.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickPromptChip}
                  onPress={() => { setInputText(prompt); }}
                  activeOpacity={0.6}
                >
                  <Text style={styles.quickPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder={selectedPatient ? `Ask about ${selectedPatient.name.split(' ')[0]}...` : 'Ask Gabriel anything...'}
              placeholderTextColor={Colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
              testID="gabriel-input"
            />
            <TouchableOpacity
              style={styles.voiceBtn}
              onPress={() => hapticLight()}
              activeOpacity={0.6}
            >
              <Mic size={20} color={Colors.textTertiary} strokeWidth={1.8} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendBtn, inputText.trim() ? styles.sendBtnActive : null]}
              onPress={handleSend}
              activeOpacity={0.6}
              disabled={!inputText.trim() || isTyping}
              testID="gabriel-send"
            >
              <Send size={18} color={inputText.trim() ? '#FFF' : Colors.textTertiary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <PatientSelectorModal
        visible={showPatientSelector}
        onClose={() => setShowPatientSelector(false)}
        patients={patients}
        onSelect={handlePatientSelect}
        selectedId={selectedPatient?.id || null}
      />
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
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gabrielIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(184, 160, 136, 0.25)',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.gold,
    letterSpacing: 0.3,
  },
  patientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 8,
  },
  patientSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  patientSelectorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  patientSelectorAvatarText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  patientSelectorLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.textTertiary,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },
  patientSelectorName: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 1,
  },
  chatArea: {
    flex: 1,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    gap: 8,
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  gabrielAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(184, 160, 136, 0.2)',
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleAssistant: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderBottomLeftRadius: 6,
  },
  bubbleUser: {
    backgroundColor: Colors.teal,
    borderBottomRightRadius: 6,
    marginLeft: 'auto' as const,
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.text,
    lineHeight: 21,
  },
  bubbleTextUser: {
    color: '#FFF',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.tealBg,
    borderWidth: 1,
    borderColor: 'rgba(45, 138, 126, 0.15)',
  },
  actionBtnDone: {
    backgroundColor: Colors.greenBg,
    borderColor: 'rgba(61, 139, 94, 0.15)',
  },
  actionBtnText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.teal,
  },
  actionBtnTextDone: {
    color: Colors.green,
  },
  typingBubble: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  quickPrompts: {
    gap: 8,
    marginTop: 8,
    paddingLeft: 38,
  },
  quickPromptChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  quickPromptText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.teal,
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.text,
    maxHeight: 100,
    paddingVertical: 4,
    padding: 0,
  },
  voiceBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnActive: {
    backgroundColor: Colors.teal,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  patientRowActive: {
    backgroundColor: Colors.tealBg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  avatarText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  patientSub: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
