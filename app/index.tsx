import { useAuth } from "@/contexts/auth-context";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const colors = useThemeColors();

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right", "bottom"]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/password-manager" />;
  }

  return <Redirect href="/auth" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
