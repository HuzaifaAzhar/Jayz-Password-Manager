// Polyfill for crypto in React Native - must be first
import "react-native-get-random-values";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/contexts/auth-context";
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from "@/contexts/theme-context";

function RootLayoutNav() {
  const { actualTheme } = useTheme();

  return (
    <ThemeProvider value={actualTheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen
          name="password-manager"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="settings"
          options={{ presentation: "modal", title: "Settings" }}
        />
      </Stack>
      <StatusBar style={actualTheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CustomThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </CustomThemeProvider>
    </SafeAreaProvider>
  );
}
