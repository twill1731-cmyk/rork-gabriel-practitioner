import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Animated, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { PractitionerProvider } from "../contexts/PractitionerContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { OnboardingProvider, useOnboarding } from "../contexts/OnboardingContext";
import Colors from "../constants/colors";
import {
  useFonts,
  Sora_300Light,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
} from '@expo-google-fonts/sora';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { isComplete, checkOnboarding } = useOnboarding();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (isComplete === null) return; // Still loading

    const onOnboardingScreen = segments[0] === 'onboarding';

    if (!isComplete && !onOnboardingScreen) {
      router.replace('/onboarding');
    } else if (isComplete && onOnboardingScreen) {
      router.replace('/(tabs)/(dashboard)');
    }
  }, [isComplete, segments]);

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <OnboardingGate>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="patient/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="intake"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="protocol-builder"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="lab-interpreter"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </OnboardingGate>
  );
}

function BrandedSplash({
  containerOpacity,
  logoOpacity,
  logoScale,
  textOpacity,
}: {
  containerOpacity: Animated.Value;
  logoOpacity: Animated.Value;
  logoScale: Animated.Value;
  textOpacity: Animated.Value;
}) {
  return (
    <Animated.View style={[splashStyles.overlay, { opacity: containerOpacity }]} pointerEvents="none">
      <Animated.View
        style={[
          splashStyles.logoWrapper,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image
          source={require('../assets/images/icon-transparent.png')}
          style={splashStyles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.Text style={[splashStyles.title, { opacity: textOpacity }]}>
        Gabriel
      </Animated.Text>
      <Animated.Text style={[splashStyles.subtitle, { opacity: textOpacity }]}>
        Practitioner
      </Animated.Text>
    </Animated.View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sora_300Light,
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  const [showSplash, setShowSplash] = useState<boolean>(true);
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!fontsLoaded) return;

    SplashScreen.hideAsync();

    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const textTimer = setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 400);

    const fadeOutTimer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    }, 2000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeOutTimer);
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <OnboardingProvider>
        <PractitionerProvider>
          <SettingsProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <StatusBar style="dark" />
              <RootLayoutNav />
              {showSplash && (
                <BrandedSplash
                  containerOpacity={containerOpacity}
                  logoOpacity={logoOpacity}
                  logoScale={logoScale}
                  textOpacity={textOpacity}
                />
              )}
            </GestureHandlerRootView>
          </SettingsProvider>
        </PractitionerProvider>
      </OnboardingProvider>
    </QueryClientProvider>
  );
}

const splashStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Sora_300Light',
    fontWeight: '300' as const,
    color: Colors.text,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Sora_400Regular',
    fontWeight: '400' as const,
    color: Colors.gold,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    marginTop: 6,
  },
});
