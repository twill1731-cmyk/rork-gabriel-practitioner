import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Fonts } from '../constants/fonts';
import Colors from '../constants/colors';
import { hapticLight } from '../utils/haptics';

const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = screenWidth * 0.8;

interface Conversation {
  id: string;
  title: string;
  date: Date;
  active?: boolean;
}

interface ConversationSidebarProps {
  visible: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  userName?: string;
}

function formatConversationDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function groupConversations(conversations: Conversation[]): Record<string, Conversation[]> {
  const now = new Date();
  const groups: Record<string, Conversation[]> = {
    'Today': [],
    'Yesterday': [],
    'Previous 7 Days': [],
    'Previous 30 Days': [],
    'Older': [],
  };

  conversations.forEach(conv => {
    const diffMs = now.getTime() - conv.date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      groups['Today'].push(conv);
    } else if (diffDays === 1) {
      groups['Yesterday'].push(conv);
    } else if (diffDays < 7) {
      groups['Previous 7 Days'].push(conv);
    } else if (diffDays < 30) {
      groups['Previous 30 Days'].push(conv);
    } else {
      groups['Older'].push(conv);
    }
  });

  return groups;
}

export default function ConversationSidebar({
  visible,
  onClose,
  conversations,
  onSelectConversation,
  userName = 'Guest',
}: ConversationSidebarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible && backdropAnim._value === 0) {
    return null;
  }

  const handleSelectConversation = (id: string) => {
    hapticLight();
    onSelectConversation(id);
  };

  const handleSettingsPress = () => {
    hapticLight();
    onClose();
    // TODO: Navigate to settings when screen is built
    console.log('Settings pressed');
  };

  const handleConnectHealthPress = () => {
    hapticLight();
    onClose();
    router.push('/connect-health');
  };

  const groupedConversations = groupConversations(conversations);
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'G';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdropAnim },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            width: SIDEBAR_WIDTH,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Header with logo and user profile */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image
              source={require('../assets/images/icon-transparent.png')}
              style={styles.logo}
            />
            <Text style={styles.logoText}>Gabriel</Text>
          </View>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.planBadge}>Free Plan</Text>
            </View>
          </View>
          <View style={styles.divider} />
        </View>

        {/* Conversation list */}
        <ScrollView
          style={styles.conversationList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.conversationListContent}
        >
          {Object.entries(groupedConversations).map(([groupName, convs]) => {
            if (convs.length === 0) return null;
            return (
              <View key={groupName}>
                <Text style={styles.groupHeader}>{groupName.toUpperCase()}</Text>
                {convs.map(conv => (
                  <TouchableOpacity
                    key={conv.id}
                    style={[
                      styles.conversationRow,
                      conv.active && styles.activeConversationRow,
                    ]}
                    onPress={() => handleSelectConversation(conv.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.conversationContent}>
                      <Text
                        style={[
                          styles.conversationTitle,
                          conv.active && styles.activeConversationTitle,
                        ]}
                        numberOfLines={1}
                      >
                        {conv.title}
                      </Text>
                      <Text style={styles.conversationDate}>
                        {formatConversationDate(conv.date)}
                      </Text>
                    </View>
                    {conv.active && <View style={styles.activeBorder} />}
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </ScrollView>

        {/* Bottom actions */}
        <View style={styles.bottomActions}>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.bottomActionRow}
            onPress={handleConnectHealthPress}
            activeOpacity={0.7}
          >
            <Heart size={18} color={Colors.cream} opacity={0.6} />
            <Text style={styles.bottomActionText}>Connect Health Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomActionRow}
            onPress={handleSettingsPress}
            activeOpacity={0.7}
          >
            <Settings size={18} color={Colors.cream} opacity={0.6} />
            <Text style={styles.bottomActionText}>Settings</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#0D1117',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 7,
  },
  logoText: {
    fontSize: 18,
    fontFamily: Fonts.light,
    fontWeight: '300',
    color: Colors.cream,
    letterSpacing: 1.5,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 209, 197, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.teal,
    letterSpacing: 0.3,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.cream,
    marginBottom: 2,
  },
  planBadge: {
    fontSize: 12,
    fontFamily: Fonts.light,
    color: 'rgba(245, 240, 232, 0.5)',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(79, 209, 197, 0.08)',
  },
  conversationList: {
    flex: 1,
  },
  conversationListContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  groupHeader: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: 'rgba(245, 240, 232, 0.3)',
    letterSpacing: 1.5,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 8,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    position: 'relative',
  },
  activeConversationRow: {
    backgroundColor: 'rgba(79, 209, 197, 0.06)',
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.cream,
    marginBottom: 4,
  },
  activeConversationTitle: {
    fontFamily: Fonts.medium,
  },
  conversationDate: {
    fontSize: 12,
    fontFamily: Fonts.light,
    color: 'rgba(245, 240, 232, 0.4)',
  },
  activeBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.teal,
    borderRadius: 1,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  bottomActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  bottomActionText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(245, 240, 232, 0.7)',
  },
  versionText: {
    fontSize: 11,
    fontFamily: Fonts.light,
    color: 'rgba(245, 240, 232, 0.25)',
    textAlign: 'center',
    marginTop: 8,
  },
});
