import { useAuth } from "@/contexts/auth-context";
import { validatePasswordStrength } from "@/utils/encryption";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

export default function AuthScreen() {
  const { hasAccount, login, signup } = useAuth();
  const router = useRouter();
  const [isSignupMode, setIsSignupMode] = useState(!hasAccount);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={80} color="#4A90E2" />
          <Text style={styles.title}>SecurePass</Text>
          <Text style={styles.subtitle}>
            {isSignupMode ? "Create your secure vault" : "Welcome back!"}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Master Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your master password"
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
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {isSignupMode && (
            <>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your master password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.requirements}>
                <Text style={styles.requirementsTitle}>
                  Password Requirements:
                </Text>
                <Text style={styles.requirementText}>
                  • At least 8 characters
                </Text>
                <Text style={styles.requirementText}>
                  • One uppercase letter
                </Text>
                <Text style={styles.requirementText}>
                  • One lowercase letter
                </Text>
                <Text style={styles.requirementText}>• One number</Text>
                <Text style={styles.requirementText}>
                  • One special character
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
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

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => {
              setIsSignupMode(!isSignupMode);
              setPassword("");
              setConfirmPassword("");
            }}
          >
            <Text style={styles.toggleText}>
              {isSignupMode
                ? "Already have an account? Login"
                : hasAccount
                  ? "Need to create a new account? Signup"
                  : "Create an account? Signup"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.warningText}>
            ⚠️ Your master password cannot be recovered. Make sure you remember
            it!
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
