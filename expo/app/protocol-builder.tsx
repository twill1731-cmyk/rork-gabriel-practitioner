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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Save,
  Send,
  Sun,
  CloudSun,
  Moon,
  AlertTriangle,
  Check,
  ChevronDown,
  FlaskConical,
} from 'lucide-react-native';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { hapticLight, hapticSuccess, hapticMedium } from '../utils/haptics';

type ProtocolItem = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  notes: string;
  interaction?: { severity: 'low' | 'moderate' | 'high'; message: string };
};

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

const TIME_ICONS: Record<TimeOfDay, React.ReactNode> = {
  morning: <Sun size={14} color={Colors.amber} strokeWidth={2} />,
  afternoon: <CloudSun size={14} color={Colors.gold} strokeWidth={2} />,
  evening: <Moon size={14} color={Colors.blue} strokeWidth={2} />,
};

const COMMON_SUPPLEMENTS = [
  'Vitamin D3', 'Magnesium Glycinate', 'Omega-3 EPA/DHA', 'Ashwagandha KSM-66',
  'B-Complex', 'Curcumin', 'Probiotics', 'Zinc', 'CoQ10', 'L-Glutamine',
  'Rhodiola Rosea', 'Berberine', 'Alpha Lipoic Acid', 'NAC', 'Quercetin',
  'Vitamin C', 'Iron Bisglycinate', 'Selenium', 'Vitamin K2', 'Melatonin',
];

// Simulated interaction database
function checkInteractions(items: ProtocolItem[]): ProtocolItem[] {
  return items.map(item => {
    const name = item.name.toLowerCase();
    const others = items.filter(i => i.id !== item.id).map(i => i.name.toLowerCase());

    // Common known interactions
    if (name.includes('iron') && others.some(o => o.includes('calcium'))) {
      return { ...item, interaction: { severity: 'moderate', message: 'Iron absorption reduced by calcium. Take 2+ hours apart.' } };
    }
    if (name.includes('magnesium') && others.some(o => o.includes('iron'))) {
      return { ...item, interaction: { severity: 'low', message: 'Magnesium may reduce iron absorption. Separate by 2 hours.' } };
    }
    if (name.includes('curcumin') && others.some(o => o.includes('berberine'))) {
      return { ...item, interaction: { severity: 'low', message: 'Both affect CYP enzymes. Monitor liver markers if combining long-term.' } };
    }
    if (name.includes('melatonin') && others.some(o => o.includes('ashwagandha'))) {
      return { ...item, interaction: { severity: 'low', message: 'Synergistic sedative effect. Start with lower doses of each.' } };
    }
    if (name.includes('vitamin k') && others.some(o => o.includes('omega') || o.includes('fish oil'))) {
      return { ...item, interaction: { severity: 'moderate', message: 'Both affect coagulation. Monitor INR if patient is on blood thinners.' } };
    }

    return { ...item, interaction: undefined };
  });
}

function SupplementItem({
  item,
  onUpdate,
  onRemove,
}: {
  item: ProtocolItem;
  onUpdate: (updated: ProtocolItem) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    hapticLight();
    const toValue = expanded ? 0 : 1;
    Animated.timing(heightAnim, { toValue, duration: 250, useNativeDriver: false }).start();
    setExpanded(!expanded);
  };

  const cycleTime = () => {
    hapticLight();
    const times: TimeOfDay[] = ['morning', 'afternoon', 'evening'];
    const idx = times.indexOf(item.timeOfDay);
    onUpdate({ ...item, timeOfDay: times[(idx + 1) % 3] });
  };

  return (
    <View style={[styles.itemCard, item.interaction && styles.itemCardWarning]}>
      <TouchableOpacity style={styles.itemHeader} onPress={toggleExpand} activeOpacity={0.7}>
        <View style={styles.itemLeft}>
          <TouchableOpacity onPress={cycleTime} style={styles.timeBtn}>
            {TIME_ICONS[item.timeOfDay]}
          </TouchableOpacity>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name || 'New supplement'}</Text>
            {item.dosage ? <Text style={styles.itemDosage}>{item.dosage} · {item.frequency}</Text> : null}
          </View>
        </View>
        <View style={styles.itemRight}>
          {item.interaction && (
            <AlertTriangle
              size={16}
              color={item.interaction.severity === 'high' ? Colors.softRed : Colors.amber}
              strokeWidth={2}
            />
          )}
          <ChevronDown size={18} color={Colors.textTertiary} strokeWidth={2} />
        </View>
      </TouchableOpacity>

      {item.interaction && (
        <View style={[styles.interactionBanner, item.interaction.severity === 'high' ? styles.interactionHigh : styles.interactionMod]}>
          <AlertTriangle size={12} color={item.interaction.severity === 'high' ? Colors.softRed : Colors.amber} strokeWidth={2} />
          <Text style={[styles.interactionText, { color: item.interaction.severity === 'high' ? Colors.softRed : Colors.amber }]}>
            {item.interaction.message}
          </Text>
        </View>
      )}

      {expanded && (
        <Animated.View style={styles.itemExpanded}>
          <TextInput
            style={styles.fieldInput}
            placeholder="Supplement name"
            placeholderTextColor={Colors.textTertiary}
            value={item.name}
            onChangeText={(t) => onUpdate({ ...item, name: t })}
          />
          <View style={styles.fieldRow}>
            <TextInput
              style={[styles.fieldInput, { flex: 1 }]}
              placeholder="Dosage (e.g. 600mg)"
              placeholderTextColor={Colors.textTertiary}
              value={item.dosage}
              onChangeText={(t) => onUpdate({ ...item, dosage: t })}
            />
            <TextInput
              style={[styles.fieldInput, { flex: 1 }]}
              placeholder="Frequency"
              placeholderTextColor={Colors.textTertiary}
              value={item.frequency}
              onChangeText={(t) => onUpdate({ ...item, frequency: t })}
            />
          </View>
          <TextInput
            style={[styles.fieldInput, styles.notesInput]}
            placeholder="Notes (optional)"
            placeholderTextColor={Colors.textTertiary}
            value={item.notes}
            onChangeText={(t) => onUpdate({ ...item, notes: t })}
            multiline
          />
          <TouchableOpacity style={styles.removeBtn} onPress={() => { hapticMedium(); onRemove(); }}>
            <Trash2 size={14} color={Colors.softRed} strokeWidth={2} />
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

export default function ProtocolBuilderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const patientName = (params.patient as string) || 'Patient';

  const [protocolName, setProtocolName] = useState('');
  const [items, setItems] = useState<ProtocolItem[]>([]);
  const [duration, setDuration] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [gabrielSuggestion, setGabrielSuggestion] = useState('');
  const [askGabriel, setAskGabriel] = useState('');

  const addItem = useCallback(() => {
    hapticLight();
    const newItem: ProtocolItem = {
      id: `item-${Date.now()}`,
      name: '',
      dosage: '',
      frequency: 'Daily',
      timeOfDay: 'morning',
      notes: '',
    };
    setItems(prev => [...prev, newItem]);
  }, []);

  const updateItem = useCallback((id: string, updated: ProtocolItem) => {
    setItems(prev => {
      const newItems = prev.map(i => i.id === id ? updated : i);
      return checkInteractions(newItems);
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const newItems = prev.filter(i => i.id !== id);
      return checkInteractions(newItems);
    });
  }, []);

  const addSuggestion = useCallback((name: string) => {
    hapticLight();
    const newItem: ProtocolItem = {
      id: `item-${Date.now()}`,
      name,
      dosage: '',
      frequency: 'Daily',
      timeOfDay: 'morning',
      notes: '',
    };
    setItems(prev => checkInteractions([...prev, newItem]));
    setShowSuggestions(false);
  }, []);

  const handleAskGabriel = useCallback(() => {
    if (!askGabriel.trim()) return;
    hapticLight();
    setGabrielSuggestion('');

    // Simulated Gabriel response
    setTimeout(() => {
      const query = askGabriel.toLowerCase();
      let response = "Based on the current protocol, I'd suggest reviewing dosage timing to optimize absorption. Consider separating minerals from fat-soluble vitamins by 2+ hours.";

      if (query.includes('thyroid') || query.includes('hashimoto')) {
        response = "For thyroid support, I'd recommend adding:\n\n• Selenium 200mcg (morning) - supports T4 to T3 conversion\n• Zinc 30mg (with food) - essential for thyroid hormone synthesis\n• Vitamin D3 5000IU (morning) - deficiency linked to autoimmune thyroid\n• Iron Bisglycinate 25mg (empty stomach, 2hr from thyroid meds) - if ferritin is low\n\nAvoid taking any of these within 4 hours of levothyroxine if applicable.";
      } else if (query.includes('gut') || query.includes('digest') || query.includes('sibo')) {
        response = "For gut restoration, consider a phased approach:\n\nPhase 1 (Weeks 1-4) - Remove:\n• Oregano Oil 200mg 2x daily\n• Berberine 500mg 2x daily\n\nPhase 2 (Weeks 5-8) - Repair:\n• L-Glutamine 5g morning\n• Zinc Carnosine 75mg 2x daily\n\nPhase 3 (Weeks 9-12) - Reinoculate:\n• Multi-strain probiotic 100B CFU\n• Saccharomyces Boulardii 250mg 2x daily";
      } else if (query.includes('sleep') || query.includes('insomnia')) {
        response = "For sleep support:\n\n• Magnesium Glycinate 400-600mg (evening) - calming form\n• L-Theanine 200-400mg (30min before bed)\n• Phosphatidylserine 100mg (evening) - lowers cortisol\n• Tart Cherry Extract 500mg (evening) - natural melatonin source\n\nStart with Mag + Theanine, add others if needed. Avoid melatonin > 0.5mg.";
      }

      setGabrielSuggestion(response);
    }, 1200);
    setAskGabriel('');
  }, [askGabriel]);

  const interactionCount = items.filter(i => i.interaction).length;

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
          <Text style={styles.headerTitle}>Protocol Builder</Text>
          <Text style={styles.headerSubtitle}>for {patientName}</Text>
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, items.length === 0 && styles.saveBtnDisabled]}
          onPress={() => { hapticSuccess(); router.back(); }}
          disabled={items.length === 0}
        >
          <Save size={18} color={items.length > 0 ? Colors.teal : Colors.textTertiary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Protocol name */}
        <TextInput
          style={styles.protocolNameInput}
          placeholder="Protocol name (e.g. Thyroid Support Phase 1)"
          placeholderTextColor={Colors.textTertiary}
          value={protocolName}
          onChangeText={setProtocolName}
        />

        {/* Duration */}
        <View style={styles.durationRow}>
          <Text style={styles.durationLabel}>Duration</Text>
          <TextInput
            style={styles.durationInput}
            placeholder="e.g. 8 weeks"
            placeholderTextColor={Colors.textTertiary}
            value={duration}
            onChangeText={setDuration}
          />
        </View>

        {/* Interaction alert */}
        {interactionCount > 0 && (
          <View style={styles.interactionAlert}>
            <AlertTriangle size={16} color={Colors.amber} strokeWidth={2} />
            <Text style={styles.interactionAlertText}>
              {interactionCount} potential interaction{interactionCount > 1 ? 's' : ''} detected
            </Text>
          </View>
        )}

        {/* Items */}
        {items.map((item) => (
          <SupplementItem
            key={item.id}
            item={item}
            onUpdate={(updated) => updateItem(item.id, updated)}
            onRemove={() => removeItem(item.id)}
          />
        ))}

        {/* Add buttons */}
        <View style={styles.addRow}>
          <TouchableOpacity style={styles.addBtn} onPress={addItem} activeOpacity={0.7}>
            <Plus size={16} color={Colors.teal} strokeWidth={2} />
            <Text style={styles.addBtnText}>Add Supplement</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addBtn, styles.addBtnSecondary]}
            onPress={() => setShowSuggestions(!showSuggestions)}
            activeOpacity={0.7}
          >
            <FlaskConical size={16} color={Colors.gold} strokeWidth={2} />
            <Text style={[styles.addBtnText, { color: Colors.gold }]}>Common</Text>
          </TouchableOpacity>
        </View>

        {/* Common supplements quick-add */}
        {showSuggestions && (
          <View style={styles.suggestionsGrid}>
            {COMMON_SUPPLEMENTS.filter(s => !items.some(i => i.name === s)).map((name) => (
              <TouchableOpacity
                key={name}
                style={styles.suggestionChip}
                onPress={() => addSuggestion(name)}
                activeOpacity={0.7}
              >
                <Plus size={12} color={Colors.teal} strokeWidth={2} />
                <Text style={styles.suggestionText}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Ask Gabriel */}
        <View style={styles.gabrielSection}>
          <View style={styles.gabrielHeader}>
            <Sparkles size={16} color={Colors.teal} strokeWidth={2} />
            <Text style={styles.gabrielTitle}>Ask Gabriel</Text>
          </View>
          <Text style={styles.gabrielDesc}>
            Describe the condition or goal, and Gabriel will suggest a protocol.
          </Text>
          <View style={styles.gabrielInputRow}>
            <TextInput
              style={styles.gabrielInput}
              placeholder="e.g. Hashimoto's with low ferritin..."
              placeholderTextColor={Colors.textTertiary}
              value={askGabriel}
              onChangeText={setAskGabriel}
              onSubmitEditing={handleAskGabriel}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.gabrielSendBtn, !askGabriel.trim() && styles.gabrielSendBtnDisabled]}
              onPress={handleAskGabriel}
              disabled={!askGabriel.trim()}
            >
              <Send size={16} color={askGabriel.trim() ? Colors.textInverse : Colors.textTertiary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {gabrielSuggestion ? (
            <View style={styles.gabrielResponse}>
              <Text style={styles.gabrielResponseText}>{gabrielSuggestion}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
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
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textTertiary,
  },
  saveBtn: { padding: 8 },
  saveBtnDisabled: { opacity: 0.4 },
  content: { flex: 1 },
  contentInner: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  protocolNameInput: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    letterSpacing: 0.2,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  durationInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.text,
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  // Interaction alert
  interactionAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.amberBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 133, 28, 0.2)',
  },
  interactionAlertText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.amber,
  },
  // Items
  itemCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  itemCardWarning: {
    borderColor: 'rgba(212, 133, 28, 0.3)',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  timeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: Colors.text,
  },
  itemDosage: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  interactionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  interactionMod: {
    backgroundColor: Colors.amberBg,
  },
  interactionHigh: {
    backgroundColor: Colors.softRedBg,
  },
  interactionText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    flex: 1,
    lineHeight: 16,
  },
  itemExpanded: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  fieldInput: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.text,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 8,
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  removeBtnText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.softRed,
  },
  // Add buttons
  addRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.tealBg,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.tealLight,
  },
  addBtnSecondary: {
    backgroundColor: Colors.goldLight,
    borderColor: 'rgba(184, 160, 136, 0.3)',
  },
  addBtnText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.teal,
  },
  // Suggestions
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  suggestionText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  // Gabriel
  gabrielSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.tealLight,
    marginTop: 8,
    gap: 10,
  },
  gabrielHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gabrielTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    letterSpacing: 0.2,
  },
  gabrielDesc: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  gabrielInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gabrielInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.text,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gabrielSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gabrielSendBtnDisabled: {
    backgroundColor: Colors.bgTertiary,
  },
  gabrielResponse: {
    backgroundColor: Colors.tealBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.tealLight,
  },
  gabrielResponseText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.text,
    lineHeight: 21,
  },
});
