import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, MessageSquare, Trash2, X, Heart, Smile, Zap, Moon as MoonIcon } from 'lucide-react-native';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';
import type { Conversation } from '../constants/gabriel';
import { hapticLight, hapticMedium, hapticSuccess } from '../utils/haptics';
import { useGabriel } from '../contexts/GabrielContext';
import type { CheckIn } from '../contexts/GabrielContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);
const SWIPE_DELETE_THRESHOLD = -80;

interface ConversationDrawerProps {
  visible: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

function getPreviewText(messages: Array<{ role: string; content: string }>): string {
  if (messages.length === 0) return 'No messages yet';
  const last = messages[messages.length - 1];
  const prefix = last.role === 'gabriel' ? 'Gabriel: ' : '';
  const text = last.content.replace(/\n/g, ' ').trim();
  const full = prefix + text;
  return full.length > 60 ? full.slice(0, 57) + '...' : full;
}

function ConversationRow({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(0)).current;
  const rowHeight = useRef(new Animated.Value(72)).current;
  const rowOpacity = useRef(new Animated.Value(1)).current;
  const currentTranslateX = useRef(0);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 20;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        const clamped = Math.max(gestureState.dx, -120);
        translateX.setValue(clamped);
        currentTranslateX.current = clamped;
        deleteOpacity.setValue(Math.min(Math.abs(clamped) / 80, 1));
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < SWIPE_DELETE_THRESHOLD) {
        hapticMedium();
        Animated.parallel([
          Animated.timing(translateX, { toValue: -DRAWER_WIDTH, duration: 200, useNativeDriver: true }),
          Animated.timing(rowHeight, { toValue: 0, duration: 200, useNativeDriver: false }),
          Animated.timing(rowOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start(() => {
          onDelete();
        });
      } else {
        Animated.spring(translateX, { toValue: 0, friction: 8, useNativeDriver: true }).start();
        Animated.timing(deleteOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
        currentTranslateX.current = 0;
      }
    },
  }), [onDelete]);

  return (
    <Animated.View style={[drawerItemStyles.wrapper, { height: rowHeight, opacity: rowOpacity }]}>
      <Animated.View style={[drawerItemStyles.deleteBackground, { opacity: deleteOpacity }]}>
        <Trash2 size={18} color="#fff" strokeWidth={1.5} />
        <Text style={drawerItemStyles.deleteText}>Delete</Text>
      </Animated.View>
      <Animated.View
        style={[{ transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[
            drawerItemStyles.row,
            isActive && drawerItemStyles.rowActive,
          ]}
          onPress={() => {
            hapticLight();
            onSelect();
          }}
          activeOpacity={0.7}
          testID={`conversation-row-${conversation.id}`}
        >
          <View style={[drawerItemStyles.icon, isActive && drawerItemStyles.iconActive]}>
            <MessageSquare size={14} color={isActive ? Colors.teal : Colors.whiteDim} strokeWidth={1.5} />
          </View>
          <View style={drawerItemStyles.textContainer}>
            <View style={drawerItemStyles.titleRow}>
              <Text
                style={[drawerItemStyles.title, isActive && drawerItemStyles.titleActive]}
                numberOfLines={1}
              >
                {conversation.title}
              </Text>
              <Text style={drawerItemStyles.date}>
                {formatRelativeDate(conversation.updatedAt)}
              </Text>
            </View>
            <Text style={drawerItemStyles.preview} numberOfLines={1}>
              {getPreviewText(conversation.messages)}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

function QuickCheckInCard({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { hasCheckedInToday, addCheckIn } = useGabriel();
  const [mood, setMood] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(0);
  const [sleep, setSleep] = useState<number>(0);
  const [saved, setSaved] = useState<boolean>(false);
  const checkedIn = hasCheckedInToday();

  const handleSave = useCallback(() => {
    if (mood === 0 || energy === 0 || sleep === 0) return;
    hapticSuccess();
    const today = new Date().toISOString().split('T')[0];
    const entry: CheckIn = { date: today, mood, energy, sleep, timestamp: Date.now() };
    addCheckIn(entry);
    setSaved(true);
    setTimeout(() => { setSaved(false); setMood(0); setEnergy(0); setSleep(0); }, 2000);
  }, [mood, energy, sleep, addCheckIn]);

  if (checkedIn && !saved) return null;

  if (saved) {
    return (
      <View style={checkinStyles.card}>
        <View style={checkinStyles.savedRow}>
          <Heart size={14} color={Colors.teal} strokeWidth={2} />
          <Text style={checkinStyles.savedText}>Check-in saved!</Text>
        </View>
      </View>
    );
  }

  const renderSlider = (label: string, icon: React.ReactNode, value: number, onChange: (v: number) => void) => (
    <View style={checkinStyles.sliderRow}>
      <View style={checkinStyles.sliderLabel}>
        {icon}
        <Text style={checkinStyles.sliderLabelText}>{label}</Text>
      </View>
      <View style={checkinStyles.dots}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            style={[checkinStyles.dot, n <= value && checkinStyles.dotActive]}
            onPress={() => { hapticLight(); onChange(n); }}
            activeOpacity={0.7}
          >
            <Text style={[checkinStyles.dotText, n <= value && checkinStyles.dotTextActive]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const canSave = mood > 0 && energy > 0 && sleep > 0;

  return (
    <View style={checkinStyles.card}>
      <View style={checkinStyles.header}>
        <Heart size={14} color={Colors.teal} strokeWidth={1.5} />
        <Text style={checkinStyles.title}>Daily Check-in</Text>
      </View>
      {renderSlider('Mood', <Smile size={12} color={Colors.teal} strokeWidth={1.5} />, mood, setMood)}
      {renderSlider('Energy', <Zap size={12} color="#F5C842" strokeWidth={1.5} />, energy, setEnergy)}
      {renderSlider('Sleep', <MoonIcon size={12} color="#8B7EC8" strokeWidth={1.5} />, sleep, setSleep)}
      <TouchableOpacity
        style={[checkinStyles.saveBtn, !canSave && checkinStyles.saveBtnDisabled]}
        onPress={handleSave}
        activeOpacity={0.7}
        disabled={!canSave}
      >
        <Text style={[checkinStyles.saveBtnText, !canSave && checkinStyles.saveBtnTextDisabled]}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const checkinStyles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(79, 209, 197, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.12)',
    borderRadius: 14,
    padding: 14,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.cream,
    letterSpacing: 0.3,
  },
  sliderRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderLabel: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 5,
    width: 70,
  },
  sliderLabelText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.whiteMuted,
    letterSpacing: 0.2,
  },
  dots: {
    flexDirection: 'row' as const,
    gap: 6,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  dotActive: {
    backgroundColor: 'rgba(79, 209, 197, 0.15)',
    borderColor: 'rgba(79, 209, 197, 0.3)',
  },
  dotText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.whiteDim,
  },
  dotTextActive: {
    color: Colors.teal,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
  },
  saveBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center' as const,
    marginTop: 4,
  },
  saveBtnDisabled: {
    backgroundColor: 'rgba(79, 209, 197, 0.15)',
  },
  saveBtnText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.darkBg,
    letterSpacing: 0.3,
  },
  saveBtnTextDisabled: {
    color: Colors.whiteDim,
  },
  savedRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  savedText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.teal,
    letterSpacing: 0.3,
  },
});

export default function ConversationDrawer({
  visible,
  onClose,
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
}: ConversationDrawerProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  useEffect(() => {
    if (visible) {
      isAnimating.current = true;
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isAnimating.current = false;
      });
    } else {
      isAnimating.current = true;
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isAnimating.current = false;
      });
    }
  }, [visible]);

  const handleNewChat = useCallback(() => {
    hapticMedium();
    onNewChat();
    onClose();
  }, [onNewChat, onClose]);

  const handleSelect = useCallback((id: string) => {
    onSelectConversation(id);
    onClose();
  }, [onSelectConversation, onClose]);

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [conversations]);

  if (!visible && !isAnimating.current) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View
        style={[drawerStyles.overlay, { opacity: overlayOpacity }]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View
        style={[
          drawerStyles.drawer,
          {
            width: DRAWER_WIDTH,
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        <View style={drawerStyles.header}>
          <Text style={drawerStyles.headerTitle}>Conversations</Text>
          <TouchableOpacity
            style={drawerStyles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            testID="close-drawer-btn"
          >
            <X size={18} color={Colors.whiteDim} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={drawerStyles.newChatBtn}
          onPress={handleNewChat}
          activeOpacity={0.7}
          testID="new-chat-drawer-btn"
        >
          <Plus size={18} color={Colors.darkBg} strokeWidth={2.5} />
          <Text style={drawerStyles.newChatBtnText}>New Chat</Text>
        </TouchableOpacity>

        <ScrollView
          style={drawerStyles.list}
          contentContainerStyle={drawerStyles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <QuickCheckInCard onClose={onClose} />

          {sortedConversations.length === 0 ? (
            <View style={drawerStyles.emptyState}>
              <MessageSquare size={32} color={Colors.whiteDim} strokeWidth={1} />
              <Text style={drawerStyles.emptyTitle}>No conversations yet</Text>
              <Text style={drawerStyles.emptySubtitle}>
                Your conversations will appear here
              </Text>
            </View>
          ) : (
            sortedConversations.map((convo) => (
              <ConversationRow
                key={convo.id}
                conversation={convo}
                isActive={convo.id === activeConversationId}
                onSelect={() => handleSelect(convo.id)}
                onDelete={() => {
                  hapticMedium();
                  onDeleteConversation(convo.id);
                }}
              />
            ))
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const drawerStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  drawer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#091912',
    borderRightWidth: 1,
    borderRightColor: 'rgba(79, 209, 197, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(79, 209, 197, 0.1)',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.cream,
    letterSpacing: 0.5,
  },
  newChatBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.teal,
  },
  newChatBtnText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.darkBg,
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.cream,
    letterSpacing: 0.3,
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: Colors.whiteDim,
    textAlign: 'center' as const,
    letterSpacing: 0.2,
    lineHeight: 19,
  },
});

const drawerItemStyles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  deleteBackground: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    width: 100,
    backgroundColor: Colors.softRed,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    borderRadius: 0,
  },
  deleteText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: '#fff',
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#091912',
  },
  rowActive: {
    backgroundColor: 'rgba(79, 209, 197, 0.08)',
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconActive: {
    backgroundColor: 'rgba(79, 209, 197, 0.12)',
    borderColor: 'rgba(79, 209, 197, 0.2)',
  },
  textContainer: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.cream,
    letterSpacing: 0.2,
    flex: 1,
  },
  titleActive: {
    color: Colors.teal,
  },
  date: {
    fontSize: 11,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: Colors.whiteDim,
    letterSpacing: 0.2,
  },
  preview: {
    fontSize: 12,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: 'rgba(255, 255, 255, 0.35)',
    letterSpacing: 0.2,
  },
});
