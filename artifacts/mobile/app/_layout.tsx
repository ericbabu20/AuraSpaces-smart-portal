import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
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
SystemUI.setBackgroundColorAsync("#0D1117");

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0D1117" },
        headerTintColor: "#E6EDF3",
        headerShadowVisible: false,
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: "#0D1117" },
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
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

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
