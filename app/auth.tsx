import { useAuth } from "@/contexts/auth-context";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { validatePasswordStrength } from "@/utils/encryption";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const { hasAccount, login, signup } = useAuth();
  const colors = useThemeColors();
  const router = useRouter();
  const [isSignupMode, setIsSignupMode] = useState(!hasAccount);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [storedPassword, setStoredPassword] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignupMode && hasAccount) {
      checkBiometric();
    }
  }, [isSignupMode, hasAccount]);

  const checkBiometric = async () => {
    try {
      console.log("[Biometric] Checking biometric availability...");
      const compatible = await LocalAuthentication.hasHardwareAsync();
      console.log("[Biometric] Hardware compatible:", compatible);

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      console.log("[Biometric] User enrolled:", enrolled);

      const AsyncStorage = (
        await import("@react-native-async-storage/async-storage")
      ).default;
      const enabled = await AsyncStorage.getItem("biometric_enabled");
      console.log("[Biometric] Setting enabled:", enabled);

      const savedPassword = await AsyncStorage.getItem(
        "cached_master_password",
      );
      console.log("[Biometric] Password cached:", !!savedPassword);

      const isAvailable =
        compatible && enrolled && enabled === "true" && !!savedPassword;
      console.log("[Biometric] Final availability:", isAvailable);

      setBiometricAvailable(isAvailable);
      setStoredPassword(savedPassword);
    } catch (error) {
      console.error("[Biometric] Error checking biometric:", error);
      setBiometricAvailable(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      console.log("[Biometric] Starting biometric authentication...");
      console.log("[Biometric] Platform:", Platform.OS);
      console.log("[Biometric] Has cached password:", !!storedPassword);

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access your passwords",
        fallbackLabel: "Use master password",
        disableDeviceFallback: false,
      });

      console.log("[Biometric] Authentication result:", result);

      if (result.success && storedPassword) {
        console.log(
          "[Biometric] Authentication successful, attempting login...",
        );
        setIsLoading(true);
        const success = await login(storedPassword);
        console.log("[Biometric] Login result:", success);

        if (success) {
          console.log("[Biometric] Navigating to password manager");
          router.replace("/password-manager");
        } else {
          console.error("[Biometric] Login failed with cached password");
          Alert.alert(
            "Error",
            "Authentication failed. Please use your master password.",
          );
        }
        setIsLoading(false);
      } else {
        console.log(
          "[Biometric] Authentication not successful or no cached password",
        );
      }
    } catch (error) {
      console.error("[Biometric] Biometric auth error:", error);
      Alert.alert(
        "Error",
        `Biometric authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleAuth = async () => {
    if (!password) {
      Alert.alert("Error", "Please enter a password");
      return;
    }

    if (isSignupMode) {
      // Signup flow
      const validation = validatePasswordStrength(password);
      if (!validation.isValid) {
        Alert.alert("Weak Password", validation.message);
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }
    }

    setIsLoading(true);

    try {
      console.log(
        "Attempting authentication...",
        isSignupMode ? "Signup" : "Login",
      );
      const success = isSignupMode
        ? await signup(password)
        : await login(password);

      console.log("Authentication result:", success);

      if (!success) {
        Alert.alert(
          "Error",
          isSignupMode
            ? "Failed to create account. Please try again."
            : "Invalid master password",
        );
      } else {
        console.log("Authentication successful!");
        // Cache password for biometric auth if enabled
        if (!isSignupMode) {
          try {
            console.log("[Biometric] Checking if should cache password...");
            const AsyncStorage = (
              await import("@react-native-async-storage/async-storage")
            ).default;
            const biometricEnabled =
              await AsyncStorage.getItem("biometric_enabled");
            console.log("[Biometric] Biometric enabled:", biometricEnabled);

            if (biometricEnabled === "true") {
              await AsyncStorage.setItem("cached_master_password", password);
              console.log("[Biometric] Password cached successfully");
            }
          } catch (error) {
            console.error("[Biometric] Error caching password:", error);
          }
        }
        // Navigate to password manager on success
        router.replace("/password-manager");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      Alert.alert(
        "Error",
        `An error occurred: ${error instanceof Error ? error.message : "Please try again."}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Ionicons
              name="shield-checkmark"
              size={80}
              color={colors.primary}
            />
            <Text style={[styles.title, { color: colors.text }]}>
              SecurePass
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isSignupMode ? "Create your secure vault" : "Welcome back!"}
            </Text>
          </View>

          <View
            style={[
              styles.form,
              {
                backgroundColor: colors.cardBackground,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Text style={[styles.label, { color: colors.text }]}>
              Master Password
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.inputBackground,
                    color: colors.text,
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your master password"
                placeholderTextColor={colors.placeholderText}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {isSignupMode && (
              <>
                <Text style={[styles.label, { color: colors.text }]}>
                  Confirm Password
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: colors.inputBorder,
                        backgroundColor: colors.inputBackground,
                        color: colors.text,
                      },
                    ]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your master password"
                    placeholderTextColor={colors.placeholderText}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View
                  style={[
                    styles.requirements,
                    { backgroundColor: colors.primary + "15" },
                  ]}
                >
                  <Text
                    style={[
                      styles.requirementsTitle,
                      { color: colors.primary },
                    ]}
                  >
                    Password Requirements:
                  </Text>
                  <Text
                    style={[
                      styles.requirementText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    • At least 8 characters
                  </Text>
                  <Text
                    style={[
                      styles.requirementText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    • One uppercase letter
                  </Text>
                  <Text
                    style={[
                      styles.requirementText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    • One lowercase letter
                  </Text>
                  <Text
                    style={[
                      styles.requirementText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    • One number
                  </Text>
                  <Text
                    style={[
                      styles.requirementText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    • One special character
                  </Text>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleAuth}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading
                  ? "Please wait..."
                  : isSignupMode
                    ? "Create Account"
                    : "Login"}
              </Text>
            </TouchableOpacity>

            {!isSignupMode && biometricAvailable && (
              <TouchableOpacity
                style={[
                  styles.biometricButton,
                  { borderColor: colors.primary },
                ]}
                onPress={handleBiometricAuth}
                disabled={isLoading}
              >
                <Ionicons
                  name="finger-print"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.biometricText, { color: colors.primary }]}>
                  Use Biometric Login
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => {
                setIsSignupMode(!isSignupMode);
                setPassword("");
                setConfirmPassword("");
              }}
            >
              <Text style={[styles.toggleText, { color: colors.primary }]}>
                {isSignupMode
                  ? "Already have an account? Login"
                  : hasAccount
                    ? "Need to create a new account? Signup"
                    : "Create an account? Signup"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.warningText}>
              ⚠️ Your master password cannot be recovered. Make sure you
              remember it!
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  form: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  requirements: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A90E2",
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: "#666",
    marginVertical: 2,
  },
  button: {
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
    gap: 8,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: "600",
  },
  warningText: {
    marginTop: 16,
    fontSize: 13,
    color: "#ff6b6b",
    textAlign: "center",
    fontStyle: "italic",
  },
  toggleButton: {
    marginTop: 16,
    padding: 12,
    alignItems: "center",
  },
  toggleText: {
    color: "#4A90E2",
    fontSize: 15,
    fontWeight: "500",
  },
});
