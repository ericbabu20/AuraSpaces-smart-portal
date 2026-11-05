import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  useFonts,
} from "@expo-google-fonts/figtree";
import {
  Parkinsans_600SemiBold,
  Parkinsans_700Bold,
} from "@expo-google-fonts/parkinsans";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { EnergyProvider } from "@/context/EnergyContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const colors = useColors();
  const { isDark } = useTheme();
  const { session, loading, passwordRecovery } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  useEffect(() => {
    if (loading) return;
    const inAuth = (segments[0] as string | undefined) === "auth";
    if (!session && !inAuth) router.replace("/auth" as never);
    if (session && inAuth && !passwordRecovery) router.replace("/(tabs)");
  }, [session, loading, passwordRecovery, segments]);

  if (loading) return null;

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerShadowVisible: false,
          headerBackTitle: "Back",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="auth" options={{ headerShown: false }} />
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
        <Stack.Screen name="octopus" options={{ title: "Octopus Energy" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Parkinsans_600SemiBold,
    Parkinsans_700Bold,
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
          <ThemeProvider>
            <AuthProvider>
              <EnergyProvider>
                <GestureHandlerRootView>
                  <KeyboardProvider>
                    <RootLayoutNav />
                  </KeyboardProvider>
                </GestureHandlerRootView>
              </EnergyProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
