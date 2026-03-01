import React, { useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Animated } from 'react-native';
import Colors from '../constants/colors';
import { Fonts } from '../constants/fonts';
import * as Haptics from 'expo-haptics';

export interface ActionCardProps {
  type: 'supplement' | 'diagnostic' | 'treatment' | 'device' | 'booking';
  title: string;
  subtitle: string;
  price?: string;
  ctaText: string;
  ctaUrl: string;
  icon: string;
  isAffiliate?: boolean;
  location?: string;
  availability?: string;
}

const ActionCard = memo(({ 
  type, 
  title, 
  subtitle, 
  price, 
  ctaText, 
  ctaUrl, 
  icon, 
  isAffiliate, 
  location, 
  availability 
}: ActionCardProps) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleCTAPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(ctaUrl).catch((err) => {
      console.log('[ActionCard] Failed to open URL:', err);
    });
  }, [ctaUrl]);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            {location && <Text style={styles.location} numberOfLines={1}>📍 {location}</Text>}
            {availability && <Text style={styles.availability} numberOfLines={1}>🕐 {availability}</Text>}
          </View>
          {price && <Text style={styles.price}>{price}</Text>}
        </View>
        
        <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.ctaButton} 
            onPress={handleCTAPress}
            activeOpacity={0.7}
          >
            <Text style={styles.ctaText}>{ctaText}</Text>
          </TouchableOpacity>
          
          {isAffiliate && (
            <Text style={styles.affiliateDisclosure}>ⓘ Partner link</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
});

ActionCard.displayName = 'ActionCard';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#132E22',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.teal,
    marginVertical: 4,
    overflow: 'hidden',
  },
  content: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
    marginTop: 2,
  },
  headerText: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    fontWeight: '500',
    color: Colors.cream,
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  availability: {
    fontSize: 12,
    color: Colors.teal,
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    fontWeight: '600',
    color: Colors.teal,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    alignItems: 'flex-start',
  },
  ctaButton: {
    borderWidth: 1.5,
    borderColor: Colors.teal,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  ctaText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    fontWeight: '600',
    color: Colors.teal,
  },
  affiliateDisclosure: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 8,
  },
});

export default ActionCard;
