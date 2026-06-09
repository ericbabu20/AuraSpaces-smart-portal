import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  useFonts as useFigtreeFonts,
} from "@expo-google-fonts/figtree";
import {
  Parkinsans_600SemiBold,
  Parkinsans_700Bold,
  useFonts as useParkinsansFonts,
} from "@expo-google-fonts/parkinsans";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EnergyProvider } from "@/context/EnergyContext";

SplashScreen.preventAutoHideAsync();
SystemUI.setBackgroundColorAsync("#EEE7D2");

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#EEE7D2" },
        headerTintColor: "#2C2B26",
        headerShadowVisible: false,
        headerBackTitle: "Back",
        headerTitleStyle: { fontFamily: "Figtree_600SemiBold", color: "#2C2B26" },
        contentStyle: { backgroundColor: "#EEE7D2" },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="aura"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="recommendations"
        options={{ title: "Recommendations" }}
      />
      <Stack.Screen name="thermostat" options={{ title: "Thermostat" }} />
      <Stack.Screen name="schedule" options={{ title: "Schedule" }} />
      <Stack.Screen name="automation" options={{ title: "Automation" }} />
      <Stack.Screen name="connect" options={{ title: "Connect Device" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [figtreeLoaded, figtreeError] = useFigtreeFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  const [parkinsansLoaded, parkinsansError] = useParkinsansFonts({
    Parkinsans_600SemiBold,
    Parkinsans_700Bold,
  });

  const fontsLoaded = figtreeLoaded && parkinsansLoaded;
  const fontError = figtreeError || parkinsansError;

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <EnergyProvider>
            <GestureHandlerRootView>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </EnergyProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
