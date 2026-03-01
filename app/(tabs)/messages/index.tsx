import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  MessageCircle,
  ChevronRight,
  Bot,
} from 'lucide-react-native';
import Colors from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { usePractitioner } from '../../../contexts/PractitionerContext';
import { hapticLight } from '../../../utils/haptics';
import type { PractitionerMessage } from '../../../constants/practitioner-data';

function formatMessageTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function MessageRow({ message, onPress }: { message: PractitionerMessage; onPress: () => void }) {
  const isSystem = message.messages[message.messages.length - 1]?.sender === 'system';

  return (
    <TouchableOpacity style={styles.messageRow} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.avatarWrap}>
        <Text style={styles.avatarText}>{message.patientAvatar}</Text>
        {message.unreadCount > 0 && (
          <View style={styles.unreadDot} />
        )}
      </View>
      <View style={styles.messageInfo}>
        <View style={styles.messageTopRow}>
          <Text style={[styles.messageName, message.unreadCount > 0 && styles.messageNameUnread]}>
            {message.patientName}
          </Text>
          <Text style={styles.messageTime}>{formatMessageTime(message.lastMessageTime)}</Text>
        </View>
        <View style={styles.messagePreviewRow}>
          {isSystem && <Bot size={12} color={Colors.teal} strokeWidth={1.5} />}
          <Text
            style={[styles.messagePreview, message.unreadCount > 0 && styles.messagePreviewUnread]}
            numberOfLines={2}
          >
            {message.lastMessage}
          </Text>
        </View>
      </View>
      {message.unreadCount > 0 ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{message.unreadCount}</Text>
        </View>
      ) : (
        <ChevronRight size={16} color={Colors.textTertiary} strokeWidth={1.5} />
      )}
    </TouchableOpacity>
  );
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { messages, totalUnreadMessages } = usePractitioner();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const sortedMessages = [...messages].sort((a, b) => b.lastMessageTime - a.lastMessageTime);

  const handleMessagePress = useCallback((msg: PractitionerMessage) => {
    hapticLight();
    router.push(`/patient/${msg.patientId}` as never);
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          {totalUnreadMessages > 0 && (
            <Text style={styles.headerSubtitle}>{totalUnreadMessages} unread</Text>
          )}
        </View>
        <TouchableOpacity style={styles.composeButton} onPress={() => hapticLight()} activeOpacity={0.7}>
          <MessageCircle size={18} color={Colors.teal} strokeWidth={1.8} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.messagesList}>
          {sortedMessages.map((msg, idx) => (
            <View key={msg.id}>
              {idx > 0 && <View style={styles.divider} />}
              <MessageRow message={msg} onPress={() => handleMessagePress(msg)} />
            </View>
          ))}
        </View>

        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <MessageCircle size={40} color={Colors.textTertiary} strokeWidth={1} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>Patient messages and system alerts will appear here</Text>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.teal,
    marginTop: 2,
  },
  composeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.tealBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  messagesList: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 72,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  avatarText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.teal,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  messageInfo: {
    flex: 1,
  },
  messageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageName: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  messageNameUnread: {
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
  },
  messageTime: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
  },
  messagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 4,
  },
  messagePreview: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  messagePreviewUnread: {
    color: Colors.text,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
