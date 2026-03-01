import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import type { HealthGoal, ChatMessage, ProtocolItem, LabMarker, LabUpload, ProtocolScan, Conversation } from '../constants/gabriel';
import type { ConversationState } from '../services/gabriel-ai';
import { createInitialConversationState } from '../services/gabriel-ai';
import type { HealthKitData } from '../services/healthkit';
import { generateSimulatedHealthData } from '../services/healthkit';

export interface CheckIn {
  date: string;
  mood: number;
  energy: number;
  sleep: number;
  note?: string;
  timestamp: number;
}

export interface ComplianceEntry {
  date: string;
  timeBlock: 'morning' | 'afternoon' | 'evening';
  completed: boolean;
  completedAt: string | null;
  items: string[];
  confirmationMethod?: 'quick_confirm' | 'individual';
}

export interface SymptomLog {
  id: string;
  region: string;
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
  timestamp: number;
  date: string;
}

export interface ReminderSettings {
  enabled: boolean;
  morningTime: string;
  afternoonTime: string;
  eveningTime: string;
}
import { MOCK_PROTOCOL, MOCK_LAB_RESULTS } from '../constants/gabriel';

const SYMPTOMS_KEY = 'gabriel_symptoms';
const HEALTHKIT_CONNECTION_KEY = 'gabriel_healthkit_connection';
const HEALTHKIT_DATA_KEY = 'gabriel_healthkit_data';

interface HealthKitConnectionState {
  isConnected: boolean;
  connectedAt: number | null;
}

interface UserProfile {
  name: string;
  healthGoals: HealthGoal[];
  conditions: string[];
  medications: string[];
  supplements: string[];
  onboardingComplete: boolean;
  hasCompletedIntake: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  healthGoals: [],
  conditions: [],
  medications: [],
  supplements: [],
  onboardingComplete: false,
  hasCompletedIntake: false,
};

const CHECKINS_KEY = 'gabriel_checkins';
const STORAGE_KEY = 'gabriel_profile';
const CHAT_STORAGE_KEY = 'gabriel_chat';
const LAB_RESULTS_KEY = 'gabriel_lab_results';
const LAB_UPLOADS_KEY = 'gabriel_lab_uploads';
const PROTOCOL_KEY = 'gabriel_protocol';
const PROTOCOL_SCANS_KEY = 'gabriel_protocol_scans';
const COMPLIANCE_KEY = 'gabriel_compliance';
const REMINDER_SETTINGS_KEY = 'gabriel_reminder_settings';
const CONVERSATION_STATE_KEY = 'gabriel_conversation_state';
const RATING_STATE_KEY = 'gabriel_rating_state';
const CONVERSATIONS_KEY = 'gabriel_conversations';
const ACTIVE_CONVERSATION_KEY = 'gabriel_active_conversation';

const MAX_CHAT_MESSAGES = 100;
const MAX_CONVERSATIONS = 50;

interface RatingState {
  chatCount: number;
  hasRatedApp: boolean;
  dismissedAtCount: number;
}

const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  morningTime: '08:00',
  afternoonTime: '13:00',
  eveningTime: '20:00',
};

export const [GabrielProvider, useGabriel] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<ProtocolItem[]>(MOCK_PROTOCOL);
  const [protocolScans, setProtocolScans] = useState<ProtocolScan[]>([]);
  const [labResults, setLabResults] = useState<LabMarker[]>(MOCK_LAB_RESULTS);
  const [labUploads, setLabUploads] = useState<LabUpload[]>([]);
  const [vitalityScore] = useState<number>(78);
  const [complianceLog, setComplianceLog] = useState<ComplianceEntry[]>([]);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const [conversationState, setConversationState] = useState<ConversationState>(createInitialConversationState());
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [ratingState, setRatingState] = useState<RatingState>({ chatCount: 0, hasRatedApp: false, dismissedAtCount: 0 });
  const [healthKitConnected, setHealthKitConnected] = useState<boolean>(false);
  const [healthKitData, setHealthKitData] = useState<HealthKitData | null>(null);
  const [healthKitSyncing, setHealthKitSyncing] = useState<boolean>(false);
  const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);

  const profileQuery = useQuery({
    queryKey: ['gabriel_profile'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as UserProfile) : DEFAULT_PROFILE;
    },
  });

  const labResultsQuery = useQuery({
    queryKey: ['gabriel_lab_results'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(LAB_RESULTS_KEY);
      return stored ? (JSON.parse(stored) as LabMarker[]) : null;
    },
  });

  const labUploadsQuery = useQuery({
    queryKey: ['gabriel_lab_uploads'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(LAB_UPLOADS_KEY);
      return stored ? (JSON.parse(stored) as LabUpload[]) : [];
    },
  });

  const protocolQuery = useQuery({
    queryKey: ['gabriel_protocol'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PROTOCOL_KEY);
      return stored ? (JSON.parse(stored) as ProtocolItem[]) : null;
    },
  });

  const protocolScansQuery = useQuery({
    queryKey: ['gabriel_protocol_scans'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PROTOCOL_SCANS_KEY);
      return stored ? (JSON.parse(stored) as ProtocolScan[]) : [];
    },
  });

  const complianceQuery = useQuery({
    queryKey: ['gabriel_compliance'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(COMPLIANCE_KEY);
      return stored ? (JSON.parse(stored) as ComplianceEntry[]) : [];
    },
  });

  const reminderSettingsQuery = useQuery({
    queryKey: ['gabriel_reminder_settings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(REMINDER_SETTINGS_KEY);
      return stored ? (JSON.parse(stored) as ReminderSettings) : DEFAULT_REMINDER_SETTINGS;
    },
  });

  const chatQuery = useQuery({
    queryKey: ['gabriel_chat'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as ChatMessage[]) : [];
    },
  });

  const checkInsQuery = useQuery({
    queryKey: ['gabriel_checkins'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(CHECKINS_KEY);
      return stored ? (JSON.parse(stored) as CheckIn[]) : [];
    },
  });

  const ratingStateQuery = useQuery({
    queryKey: ['gabriel_rating_state'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(RATING_STATE_KEY);
      return stored ? (JSON.parse(stored) as RatingState) : { chatCount: 0, hasRatedApp: false, dismissedAtCount: 0 };
    },
  });

  const symptomsQuery = useQuery({
    queryKey: ['gabriel_symptoms'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SYMPTOMS_KEY);
      return stored ? (JSON.parse(stored) as SymptomLog[]) : [];
    },
  });

  const healthKitConnectionQuery = useQuery({
    queryKey: ['gabriel_healthkit_connection'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(HEALTHKIT_CONNECTION_KEY);
      return stored ? (JSON.parse(stored) as HealthKitConnectionState) : { isConnected: false, connectedAt: null };
    },
  });

  const healthKitDataQuery = useQuery({
    queryKey: ['gabriel_healthkit_data'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(HEALTHKIT_DATA_KEY);
      return stored ? (JSON.parse(stored) as HealthKitData) : null;
    },
  });

  const conversationStateQuery = useQuery({
    queryKey: ['gabriel_conversation_state'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(CONVERSATION_STATE_KEY);
      return stored ? (JSON.parse(stored) as ConversationState) : createInitialConversationState();
    },
  });

  const conversationsQuery = useQuery({
    queryKey: ['gabriel_conversations'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(CONVERSATIONS_KEY);
      return stored ? (JSON.parse(stored) as Conversation[]) : [];
    },
  });

  const activeConversationIdQuery = useQuery({
    queryKey: ['gabriel_active_conversation'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ACTIVE_CONVERSATION_KEY);
      return stored ? (JSON.parse(stored) as string) : null;
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (updated: UserProfile) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gabriel_profile'] });
      setProfile(data);
    },
  });

  const saveLabResultsMutation = useMutation({
    mutationFn: async (markers: LabMarker[]) => {
      await AsyncStorage.setItem(LAB_RESULTS_KEY, JSON.stringify(markers));
      return markers;
    },
  });

  const saveLabUploadsMutation = useMutation({
    mutationFn: async (uploads: LabUpload[]) => {
      await AsyncStorage.setItem(LAB_UPLOADS_KEY, JSON.stringify(uploads));
      return uploads;
    },
  });

  const saveProtocolMutation = useMutation({
    mutationFn: async (items: ProtocolItem[]) => {
      await AsyncStorage.setItem(PROTOCOL_KEY, JSON.stringify(items));
      return items;
    },
  });

  const saveProtocolScansMutation = useMutation({
    mutationFn: async (scans: ProtocolScan[]) => {
      await AsyncStorage.setItem(PROTOCOL_SCANS_KEY, JSON.stringify(scans));
      return scans;
    },
  });

  const saveComplianceMutation = useMutation({
    mutationFn: async (entries: ComplianceEntry[]) => {
      await AsyncStorage.setItem(COMPLIANCE_KEY, JSON.stringify(entries));
      return entries;
    },
  });

  const saveReminderSettingsMutation = useMutation({
    mutationFn: async (settings: ReminderSettings) => {
      await AsyncStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(settings));
      return settings;
    },
  });

  const saveChatMutation = useMutation({
    mutationFn: async (messages: ChatMessage[]) => {
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      return messages;
    },
  });

  const saveCheckInsMutation = useMutation({
    mutationFn: async (entries: CheckIn[]) => {
      await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(entries));
      return entries;
    },
  });

  const saveRatingStateMutation = useMutation({
    mutationFn: async (state: RatingState) => {
      await AsyncStorage.setItem(RATING_STATE_KEY, JSON.stringify(state));
      return state;
    },
  });

  const saveSymptomsMutation = useMutation({
    mutationFn: async (entries: SymptomLog[]) => {
      await AsyncStorage.setItem(SYMPTOMS_KEY, JSON.stringify(entries));
      return entries;
    },
  });

  const saveHealthKitConnectionMutation = useMutation({
    mutationFn: async (state: HealthKitConnectionState) => {
      await AsyncStorage.setItem(HEALTHKIT_CONNECTION_KEY, JSON.stringify(state));
      return state;
    },
  });

  const saveHealthKitDataMutation = useMutation({
    mutationFn: async (data: HealthKitData) => {
      await AsyncStorage.setItem(HEALTHKIT_DATA_KEY, JSON.stringify(data));
      return data;
    },
  });

  const saveConversationStateMutation = useMutation({
    mutationFn: async (state: ConversationState) => {
      await AsyncStorage.setItem(CONVERSATION_STATE_KEY, JSON.stringify(state));
      return state;
    },
  });

  const saveConversationsMutation = useMutation({
    mutationFn: async (convos: Conversation[]) => {
      await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convos));
      return convos;
    },
  });

  const saveActiveConversationIdMutation = useMutation({
    mutationFn: async (id: string | null) => {
      if (id) {
        await AsyncStorage.setItem(ACTIVE_CONVERSATION_KEY, JSON.stringify(id));
      } else {
        await AsyncStorage.removeItem(ACTIVE_CONVERSATION_KEY);
      }
      return id;
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      setProfile(profileQuery.data);
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (chatQuery.data) {
      setChatMessages(chatQuery.data);
    }
  }, [chatQuery.data]);

  useEffect(() => {
    if (conversationStateQuery.data) {
      setConversationState(conversationStateQuery.data);
    }
  }, [conversationStateQuery.data]);

  useEffect(() => {
    if (checkInsQuery.data) {
      setCheckIns(checkInsQuery.data);
    }
  }, [checkInsQuery.data]);

  useEffect(() => {
    if (ratingStateQuery.data) {
      setRatingState(ratingStateQuery.data);
    }
  }, [ratingStateQuery.data]);

  useEffect(() => {
    if (protocolQuery.data) {
      setProtocol(protocolQuery.data);
    }
  }, [protocolQuery.data]);

  useEffect(() => {
    if (protocolScansQuery.data) {
      setProtocolScans(protocolScansQuery.data);
    }
  }, [protocolScansQuery.data]);

  useEffect(() => {
    if (labResultsQuery.data) {
      setLabResults(labResultsQuery.data);
    }
  }, [labResultsQuery.data]);

  useEffect(() => {
    if (labUploadsQuery.data) {
      setLabUploads(labUploadsQuery.data);
    }
  }, [labUploadsQuery.data]);

  useEffect(() => {
    if (complianceQuery.data) {
      setComplianceLog(complianceQuery.data);
    }
  }, [complianceQuery.data]);

  useEffect(() => {
    if (reminderSettingsQuery.data) {
      setReminderSettings(reminderSettingsQuery.data);
    }
  }, [reminderSettingsQuery.data]);

  useEffect(() => {
    if (symptomsQuery.data) {
      setSymptoms(symptomsQuery.data);
    }
  }, [symptomsQuery.data]);

  useEffect(() => {
    if (healthKitConnectionQuery.data) {
      setHealthKitConnected(healthKitConnectionQuery.data.isConnected);
    }
  }, [healthKitConnectionQuery.data]);

  useEffect(() => {
    if (healthKitDataQuery.data) {
      setHealthKitData(healthKitDataQuery.data);
    }
  }, [healthKitDataQuery.data]);

  useEffect(() => {
    if (conversationsQuery.data) {
      setConversations(conversationsQuery.data);
    }
  }, [conversationsQuery.data]);

  useEffect(() => {
    if (activeConversationIdQuery.data !== undefined) {
      setActiveConversationId(activeConversationIdQuery.data);
    }
  }, [activeConversationIdQuery.data]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates };
      saveProfileMutation.mutate(updated);
      return updated;
    });
  }, [saveProfileMutation]);

  const completeOnboarding = useCallback((name: string, goals: HealthGoal[], extras?: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, name, healthGoals: goals, onboardingComplete: true, ...extras };
      saveProfileMutation.mutate(updated);
      console.log('[Gabriel] Onboarding completed, profile saved:', updated.name, 'onboardingComplete:', updated.onboardingComplete);
      return updated;
    });
  }, [saveProfileMutation]);

  const generateConversationTitle = useCallback((firstMessage: string): string => {
    const cleaned = firstMessage.trim().replace(/\n/g, ' ');
    if (cleaned.length <= 40) return cleaned;
    const truncated = cleaned.slice(0, 40);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated) + '...';
  }, []);

  const addChatMessage = useCallback((message: ChatMessage) => {
    setChatMessages(prev => {
      const updated = [...prev, message].slice(-MAX_CHAT_MESSAGES);
      saveChatMutation.mutate(updated);

      setConversations(prevConvos => {
        if (!activeConversationId) return prevConvos;
        const idx = prevConvos.findIndex(c => c.id === activeConversationId);
        if (idx === -1) return prevConvos;
        const convo = prevConvos[idx];
        const updatedConvo: Conversation = {
          ...convo,
          messages: updated,
          updatedAt: Date.now(),
          title: convo.messages.length === 0 && message.role === 'user'
            ? generateConversationTitle(message.content)
            : (convo.title === 'New Chat' && message.role === 'user'
              ? generateConversationTitle(message.content)
              : convo.title),
        };
        const newConvos = [...prevConvos];
        newConvos[idx] = updatedConvo;
        saveConversationsMutation.mutate(newConvos);
        return newConvos;
      });

      return updated;
    });
  }, [saveChatMutation, activeConversationId, generateConversationTitle, saveConversationsMutation]);

  const clearChat = useCallback(() => {
    setChatMessages([]);
    saveChatMutation.mutate([]);
    setConversationState(createInitialConversationState());
    saveConversationStateMutation.mutate(createInitialConversationState());
  }, [saveChatMutation, saveConversationStateMutation]);

  const startNewConversation = useCallback(() => {
    if (activeConversationId) {
      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === activeConversationId);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], messages: chatMessages, updatedAt: Date.now() };
          saveConversationsMutation.mutate(updated);
          return updated;
        }
        return prev;
      });
    }

    const newId = 'conv-' + Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setConversations(prev => {
      const updated = [newConversation, ...prev].slice(0, MAX_CONVERSATIONS);
      saveConversationsMutation.mutate(updated);
      return updated;
    });

    setActiveConversationId(newId);
    saveActiveConversationIdMutation.mutate(newId);
    setChatMessages([]);
    saveChatMutation.mutate([]);
    setConversationState(createInitialConversationState());
    saveConversationStateMutation.mutate(createInitialConversationState());

    console.log('[Gabriel] Started new conversation:', newId);
    return newId;
  }, [activeConversationId, chatMessages, saveChatMutation, saveConversationsMutation, saveActiveConversationIdMutation, saveConversationStateMutation]);

  const switchConversation = useCallback((conversationId: string) => {
    if (conversationId === activeConversationId) return;

    if (activeConversationId) {
      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === activeConversationId);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], messages: chatMessages, updatedAt: Date.now() };
          saveConversationsMutation.mutate(updated);
          return updated;
        }
        return prev;
      });
    }

    const target = conversations.find(c => c.id === conversationId);
    if (target) {
      setChatMessages(target.messages);
      saveChatMutation.mutate(target.messages);
      setActiveConversationId(conversationId);
      saveActiveConversationIdMutation.mutate(conversationId);
      setConversationState(createInitialConversationState());
      saveConversationStateMutation.mutate(createInitialConversationState());
      console.log('[Gabriel] Switched to conversation:', conversationId, target.title);
    }
  }, [activeConversationId, chatMessages, conversations, saveChatMutation, saveConversationsMutation, saveActiveConversationIdMutation, saveConversationStateMutation]);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== conversationId);
      saveConversationsMutation.mutate(updated);
      return updated;
    });

    if (conversationId === activeConversationId) {
      setChatMessages([]);
      saveChatMutation.mutate([]);
      setActiveConversationId(null);
      saveActiveConversationIdMutation.mutate(null);
      setConversationState(createInitialConversationState());
      saveConversationStateMutation.mutate(createInitialConversationState());
    }

    console.log('[Gabriel] Deleted conversation:', conversationId);
  }, [activeConversationId, saveChatMutation, saveConversationsMutation, saveActiveConversationIdMutation, saveConversationStateMutation]);

  const getActiveConversationTitle = useCallback((): string => {
    if (!activeConversationId) return 'Gabriel';
    const convo = conversations.find(c => c.id === activeConversationId);
    return convo?.title || 'Gabriel';
  }, [activeConversationId, conversations]);

  useEffect(() => {
    if (conversationsQuery.data && activeConversationIdQuery.data !== undefined) {
      const convos = conversationsQuery.data;
      const activeId = activeConversationIdQuery.data;
      if (activeId && convos.find(c => c.id === activeId)) {
        const target = convos.find(c => c.id === activeId);
        if (target && target.messages.length > 0 && chatMessages.length === 0) {
          setChatMessages(target.messages);
          saveChatMutation.mutate(target.messages);
        }
      }
    }
  }, [conversationsQuery.data, activeConversationIdQuery.data]);

  const incrementChatCount = useCallback(() => {
    setRatingState(prev => {
      const updated = { ...prev, chatCount: prev.chatCount + 1 };
      saveRatingStateMutation.mutate(updated);
      return updated;
    });
  }, [saveRatingStateMutation]);

  const markAppRated = useCallback(() => {
    setRatingState(prev => {
      const updated = { ...prev, hasRatedApp: true };
      saveRatingStateMutation.mutate(updated);
      return updated;
    });
  }, [saveRatingStateMutation]);

  const dismissRatingPrompt = useCallback(() => {
    setRatingState(prev => {
      const updated = { ...prev, dismissedAtCount: prev.chatCount };
      saveRatingStateMutation.mutate(updated);
      return updated;
    });
  }, [saveRatingStateMutation]);

  const shouldShowRatingPrompt = useCallback(() => {
    if (ratingState.hasRatedApp) return false;
    if (ratingState.chatCount < 5) return false;
    if (ratingState.dismissedAtCount > 0 && ratingState.chatCount < ratingState.dismissedAtCount + 10) return false;
    return true;
  }, [ratingState]);

  const addCheckIn = useCallback((entry: CheckIn) => {
    setCheckIns(prev => {
      const updated = [entry, ...prev].slice(0, 90);
      saveCheckInsMutation.mutate(updated);
      return updated;
    });
  }, [saveCheckInsMutation]);

  const hasCheckedInToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return checkIns.some(c => c.date === today);
  }, [checkIns]);

  const getRecentCheckIns = useCallback((days: number = 7) => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return checkIns.filter(c => c.timestamp >= cutoff);
  }, [checkIns]);

  const updateConversationState = useCallback((state: ConversationState) => {
    setConversationState(state);
    saveConversationStateMutation.mutate(state);
  }, [saveConversationStateMutation]);

  const resetIntake = useCallback(() => {
    setProfile(prev => {
      const updated = { ...prev, hasCompletedIntake: false };
      saveProfileMutation.mutate(updated);
      return updated;
    });
    setChatMessages([]);
    saveChatMutation.mutate([]);
    setConversationState(createInitialConversationState());
    saveConversationStateMutation.mutate(createInitialConversationState());
  }, [saveProfileMutation, saveChatMutation, saveConversationStateMutation]);

  const resetOnboarding = useCallback(() => {
    console.log('[Gabriel] Resetting onboarding...');
    const resetProfile = { ...DEFAULT_PROFILE };
    setProfile(resetProfile);
    saveProfileMutation.mutate(resetProfile);
    setChatMessages([]);
    saveChatMutation.mutate([]);
    setConversationState(createInitialConversationState());
    saveConversationStateMutation.mutate(createInitialConversationState());
  }, [saveProfileMutation, saveChatMutation, saveConversationStateMutation]);

  const addProtocolItems = useCallback((items: ProtocolItem[]) => {
    setProtocol(prev => {
      const updated = [...prev, ...items];
      saveProtocolMutation.mutate(updated);
      return updated;
    });
  }, [saveProtocolMutation]);

  const removeProtocolItems = useCallback((ids: string[]) => {
    console.log('[Gabriel] Removing protocol items:', ids);
    setProtocol(prev => {
      const updated = prev.filter(item => !ids.includes(item.id));
      saveProtocolMutation.mutate(updated);
      return updated;
    });
  }, [saveProtocolMutation]);

  const updateProtocolItem = useCallback((id: string, updates: Partial<ProtocolItem>) => {
    console.log('[Gabriel] Updating protocol item:', id, updates);
    setProtocol(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      saveProtocolMutation.mutate(updated);
      return updated;
    });
  }, [saveProtocolMutation]);

  const clearProtocol = useCallback(() => {
    console.log('[Gabriel] Clearing entire protocol');
    setProtocol([]);
    saveProtocolMutation.mutate([]);
  }, [saveProtocolMutation]);

  const addProtocolScan = useCallback((scan: ProtocolScan) => {
    setProtocolScans(prev => {
      const updated = [scan, ...prev];
      saveProtocolScansMutation.mutate(updated);
      return updated;
    });
  }, [saveProtocolScansMutation]);

  const addLabResults = useCallback((markers: LabMarker[]) => {
    setLabResults(prev => {
      const updated = [...markers, ...prev];
      saveLabResultsMutation.mutate(updated);
      return updated;
    });
  }, [saveLabResultsMutation]);

  const addLabUpload = useCallback((upload: LabUpload) => {
    setLabUploads(prev => {
      const updated = [upload, ...prev];
      saveLabUploadsMutation.mutate(updated);
      return updated;
    });
  }, [saveLabUploadsMutation]);

  const markTimeBlockComplete = useCallback((timeBlock: 'morning' | 'afternoon' | 'evening', itemNames: string[], method: 'quick_confirm' | 'individual' = 'individual') => {
    const today = new Date().toISOString().split('T')[0];
    setComplianceLog(prev => {
      const existing = prev.findIndex(e => e.date === today && e.timeBlock === timeBlock);
      let updated: ComplianceEntry[];
      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = {
          ...updated[existing],
          completed: true,
          completedAt: new Date().toISOString(),
          items: itemNames,
          confirmationMethod: method,
        };
      } else {
        updated = [...prev, {
          date: today,
          timeBlock,
          completed: true,
          completedAt: new Date().toISOString(),
          items: itemNames,
          confirmationMethod: method,
        }];
      }
      saveComplianceMutation.mutate(updated);
      return updated;
    });
  }, [saveComplianceMutation]);

  const markItemComplete = useCallback((timeBlock: 'morning' | 'afternoon' | 'evening', itemName: string, completed: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    setComplianceLog(prev => {
      const existing = prev.findIndex(e => e.date === today && e.timeBlock === timeBlock);
      let updated: ComplianceEntry[];
      if (existing >= 0) {
        const entry = prev[existing];
        const items = completed
          ? [...new Set([...entry.items, itemName])]
          : entry.items.filter(i => i !== itemName);
        updated = [...prev];
        updated[existing] = {
          ...entry,
          items,
          completed: false,
          completedAt: items.length > 0 ? new Date().toISOString() : null,
          confirmationMethod: 'individual',
        };
      } else if (completed) {
        updated = [...prev, {
          date: today,
          timeBlock,
          completed: false,
          completedAt: new Date().toISOString(),
          items: [itemName],
          confirmationMethod: 'individual',
        }];
      } else {
        return prev;
      }
      saveComplianceMutation.mutate(updated);
      return updated;
    });
  }, [saveComplianceMutation]);

  const addSymptom = useCallback((entry: SymptomLog) => {
    setSymptoms(prev => {
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const filtered = prev.filter(s => s.timestamp >= cutoff);
      const updated = [entry, ...filtered];
      saveSymptomsMutation.mutate(updated);
      return updated;
    });
  }, [saveSymptomsMutation]);

  const getTodaySymptoms = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return symptoms.filter(s => s.date === today);
  }, [symptoms]);

  const getRecentSymptoms = useCallback((days: number = 7) => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return symptoms.filter(s => s.timestamp >= cutoff);
  }, [symptoms]);

  const getSymptomSummaryForAI = useCallback(() => {
    const recent = symptoms.filter(s => s.timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (recent.length === 0) return '';
    const grouped: Record<string, number> = {};
    for (const s of recent) {
      grouped[s.symptom] = (grouped[s.symptom] || 0) + 1;
    }
    const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    const parts = entries.slice(0, 5).map(([sym, count]) => `${sym} (${count}x this week)`);
    return `\n\n📍 Logged Symptoms (Last 7 Days):\n${parts.map(p => `  • ${p}`).join('\n')}`;
  }, [symptoms]);

  const connectHealthKit = useCallback(async () => {
    console.log('[HealthKit] Connecting...');
    setHealthKitSyncing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const data = generateSimulatedHealthData();
      setHealthKitData(data);
      setHealthKitConnected(true);
      saveHealthKitConnectionMutation.mutate({ isConnected: true, connectedAt: Date.now() });
      saveHealthKitDataMutation.mutate(data);
      console.log('[HealthKit] Connected and synced successfully');
    } catch (error) {
      console.log('[HealthKit] Connection error:', error);
    } finally {
      setHealthKitSyncing(false);
    }
  }, [saveHealthKitConnectionMutation, saveHealthKitDataMutation]);

  const disconnectHealthKit = useCallback(() => {
    console.log('[HealthKit] Disconnecting...');
    setHealthKitConnected(false);
    setHealthKitData(null);
    saveHealthKitConnectionMutation.mutate({ isConnected: false, connectedAt: null });
    AsyncStorage.removeItem(HEALTHKIT_DATA_KEY);
  }, [saveHealthKitConnectionMutation]);

  const refreshHealthKitData = useCallback(async () => {
    if (!healthKitConnected) return;
    console.log('[HealthKit] Refreshing data...');
    setHealthKitSyncing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const data = generateSimulatedHealthData();
      setHealthKitData(data);
      saveHealthKitDataMutation.mutate(data);
      console.log('[HealthKit] Data refreshed');
    } catch (error) {
      console.log('[HealthKit] Refresh error:', error);
    } finally {
      setHealthKitSyncing(false);
    }
  }, [healthKitConnected, saveHealthKitDataMutation]);

  const updateReminderSettings = useCallback((updates: Partial<ReminderSettings>) => {
    const updated = { ...reminderSettings, ...updates };
    setReminderSettings(updated);
    saveReminderSettingsMutation.mutate(updated);
  }, [reminderSettings, saveReminderSettingsMutation]);

  const getTodayCompliance = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return complianceLog.filter(e => e.date === today);
  }, [complianceLog]);

  const getWeekCompliance = useCallback(() => {
    const now = new Date();
    const weekEntries: { date: string; status: 'full' | 'partial' | 'missed' }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayEntries = complianceLog.filter(e => e.date === dateStr);
      const totalBlocks = 3;
      const completedBlocks = dayEntries.filter(e => e.items.length > 0).length;
      if (completedBlocks === 0) {
        weekEntries.push({ date: dateStr, status: 'missed' });
      } else if (completedBlocks >= totalBlocks) {
        weekEntries.push({ date: dateStr, status: 'full' });
      } else {
        weekEntries.push({ date: dateStr, status: 'partial' });
      }
    }
    return weekEntries;
  }, [complianceLog]);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return {
    profile,
    updateProfile,
    completeOnboarding,
    chatMessages,
    addChatMessage,
    clearChat,
    conversationState,
    updateConversationState,
    resetIntake,
    resetOnboarding,
    protocol,
    protocolScans,
    addProtocolItems,
    removeProtocolItems,
    updateProtocolItem,
    clearProtocol,
    addProtocolScan,
    labResults,
    labUploads,
    addLabResults,
    addLabUpload,
    vitalityScore,
    getGreeting,
    complianceLog,
    reminderSettings,
    markTimeBlockComplete,
    markItemComplete,
    updateReminderSettings,
    getTodayCompliance,
    getWeekCompliance,
    checkIns,
    addCheckIn,
    hasCheckedInToday,
    getRecentCheckIns,
    ratingState,
    incrementChatCount,
    markAppRated,
    dismissRatingPrompt,
    shouldShowRatingPrompt,
    symptoms,
    addSymptom,
    getTodaySymptoms,
    getRecentSymptoms,
    getSymptomSummaryForAI,
    healthKitConnected,
    healthKitData,
    healthKitSyncing,
    connectHealthKit,
    disconnectHealthKit,
    refreshHealthKitData,
    conversations,
    activeConversationId,
    startNewConversation,
    switchConversation,
    deleteConversation,
    getActiveConversationTitle,
    isLoading: profileQuery.isLoading,
  };
});
