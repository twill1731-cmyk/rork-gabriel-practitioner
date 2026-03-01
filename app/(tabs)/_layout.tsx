import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { LayoutDashboard, Users, FlaskConical, Settings, Sparkles } from 'lucide-react-native';
import Colors from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { usePractitioner } from '../../contexts/PractitionerContext';

export default function TabLayout() {
  const { unreadAlerts } = usePractitioner();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: Colors.teal,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          fontFamily: Fonts.medium,
          fontSize: 10,
          fontWeight: '500' as const,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="(dashboard)"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size - 2} color={color} strokeWidth={1.8} />
          ),
          tabBarBadge: unreadAlerts.length > 0 ? unreadAlerts.length : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.softRed,
            fontSize: 10,
            fontFamily: Fonts.semiBold,
            minWidth: 18,
            height: 18,
            lineHeight: 18,
          },
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color, size }) => (
            <Users size={size - 2} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="gabriel"
        options={{
          title: 'Gabriel',
          tabBarIcon: ({ color, focused }) => (
            <View style={[gabrielStyles.iconWrap, focused && gabrielStyles.iconWrapActive]}>
              <Sparkles size={22} color={focused ? Colors.gold : color} strokeWidth={focused ? 2 : 1.8} />
            </View>
          ),
          tabBarLabelStyle: {
            fontFamily: Fonts.semiBold,
            fontSize: 10,
            fontWeight: '600' as const,
            letterSpacing: 0.3,
          },
        }}
      />
      <Tabs.Screen
        name="protocols"
        options={{
          title: 'Protocols',
          tabBarIcon: ({ color, size }) => (
            <FlaskConical size={size - 2} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size - 2} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const gabrielStyles = StyleSheet.create({
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -4,
  },
  iconWrapActive: {
    backgroundColor: Colors.goldLight,
    borderWidth: 1.5,
    borderColor: 'rgba(184, 160, 136, 0.25)',
  },
});
