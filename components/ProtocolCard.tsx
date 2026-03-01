import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Share } from 'react-native';
import { ExternalLink, Share2 } from 'lucide-react-native';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';
import * as Haptics from 'expo-haptics';

export interface ProtocolCardSupplement {
  name: string;
  dosage: string;
  timing: string;
  tier: number;
}

interface ProtocolCardProps {
  supplements: ProtocolCardSupplement[];
  footerText?: string;
}

function TierBadge({ tier }: { tier: number }) {
  const label = `Tier ${tier}`;
  const badgeStyle =
    tier === 1
      ? styles.tierBadge1
      : tier === 2
      ? styles.tierBadge2
      : styles.tierBadge3;
  const textStyle =
    tier === 1
      ? styles.tierText1
      : tier === 2
      ? styles.tierText2
      : styles.tierText3;

  return (
    <View style={[styles.tierBadge, badgeStyle]}>
      <Text style={[styles.tierText, textStyle]}>{label}</Text>
    </View>
  );
}

function timingLabel(timing: string): string {
  switch (timing) {
    case 'morning':
      return '☀️ Morning';
    case 'afternoon':
      return '🌤️ Afternoon';
    case 'evening':
      return '🌙 Evening';
    default:
      return timing;
  }
}

function ProtocolCard({ supplements, footerText }: ProtocolCardProps) {
  const handleOrderPress = useCallback(() => {
    Linking.openURL('https://fullscript.com').catch((err) => {
      console.log('[ProtocolCard] Failed to open URL:', err);
    });
  }, []);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const grouped: Record<string, ProtocolCardSupplement[]> = { morning: [], afternoon: [], evening: [] };
    supplements.forEach(s => {
      const key = s.timing || 'morning';
      if (grouped[key]) grouped[key].push(s);
    });

    let text = 'My Gabriel Protocol:\n';
    if (grouped.morning.length > 0) {
      text += '\n\u2600\ufe0f Morning:\n';
      grouped.morning.forEach(s => { text += `\u2022 ${s.name} ${s.dosage}\n`; });
    }
    if (grouped.afternoon.length > 0) {
      text += '\n\ud83c\udf05 Afternoon:\n';
      grouped.afternoon.forEach(s => { text += `\u2022 ${s.name} ${s.dosage}\n`; });
    }
    if (grouped.evening.length > 0) {
      text += '\n\ud83c\udf19 Evening:\n';
      grouped.evening.forEach(s => { text += `\u2022 ${s.name} ${s.dosage}\n`; });
    }
    text += '\nPowered by Gabriel \u2014 trygabriel.ai';

    try {
      await Share.share({ message: text });
    } catch (error) {
      console.log('[ProtocolCard] Share error:', error);
    }
  }, [supplements]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.shareIconBtn}
        onPress={handleShare}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        testID="protocol-card-share-btn"
      >
        <Share2 size={14} color={Colors.teal} strokeWidth={1.5} />
      </TouchableOpacity>
      {supplements.map((supp, index) => (
        <View
          key={`${supp.name}-${index}`}
          style={[styles.supplementRow, index < supplements.length - 1 && styles.supplementRowBorder]}
        >
          <View style={styles.supplementHeader}>
            <Text style={styles.supplementName}>{supp.name}</Text>
            <TierBadge tier={supp.tier} />
          </View>
          <Text style={styles.supplementDosage}>{supp.dosage}</Text>
          <Text style={styles.supplementTiming}>{timingLabel(supp.timing)}</Text>
        </View>
      ))}

      {footerText ? (
        <Text style={styles.footerText}>{footerText}</Text>
      ) : null}

      <TouchableOpacity
        style={styles.orderLink}
        onPress={handleOrderPress}
        activeOpacity={0.7}
        testID="order-supplements-link"
      >
        <Text style={styles.orderLinkText}>Order practitioner-grade supplements</Text>
        <ExternalLink size={11} color={Colors.teal} strokeWidth={1.5} />
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(ProtocolCard);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#132E22',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.teal,
    padding: 14,
    marginTop: 8,
    position: 'relative' as const,
  },
  shareIconBtn: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(79, 209, 197, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  supplementRow: {
    paddingVertical: 10,
  },
  supplementRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(79, 209, 197, 0.12)',
    marginBottom: 2,
  },
  supplementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  supplementName: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
    color: Colors.cream,
    flex: 1,
    marginRight: 8,
  },
  supplementDosage: {
    fontSize: 13,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: Colors.cream,
    marginBottom: 2,
    opacity: 0.85,
  },
  supplementTiming: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.tealMuted,
  },
  tierBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tierBadge1: {
    backgroundColor: 'rgba(79, 209, 197, 0.15)',
  },
  tierBadge2: {
    backgroundColor: 'rgba(184, 160, 136, 0.15)',
  },
  tierBadge3: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tierText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
  tierText1: {
    color: Colors.teal,
  },
  tierText2: {
    color: '#B8A088',
  },
  tierText3: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  footerText: {
    fontSize: 13,
    fontFamily: Fonts.light,
    fontWeight: '300' as const,
    color: Colors.whiteMuted,
    marginTop: 10,
    lineHeight: 20,
  },
  orderLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(79, 209, 197, 0.1)',
  },
  orderLinkText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
    color: Colors.teal,
  },
});
