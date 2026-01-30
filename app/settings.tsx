import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { StorageService } from "@/services/storage";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { logout, masterPassword } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const colors = useThemeColors();
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricPreference();
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);
  };

  const loadBiometricPreference = async () => {
    try {
      const AsyncStorage = (
        await import("@react-native-async-storage/async-storage")
      ).default;
      const enabled = await AsyncStorage.getItem("biometric_enabled");
      setBiometricEnabled(enabled === "true");
    } catch (error) {
      console.error("Error loading biometric preference:", error);
    }
  };

  const handleEnableBiometric = async () => {
    const password = passwordInput.trim();

    if (!password) {
      Alert.alert("Error", "Password is required");
      return;
    }

    try {
      console.log("[Biometric Setup] Starting biometric enable flow...");
      console.log("[Biometric Setup] Platform:", Platform.OS);

      // Verify the password against stored hash
      console.log("[Biometric Setup] Verifying master password...");
      const isValid = await StorageService.verifyMasterPassword(password);
      console.log("[Biometric Setup] Password valid:", isValid);

      if (!isValid) {
        console.log("[Biometric Setup] Invalid password entered");
        Alert.alert(
          "Invalid Password",
          "The password you entered is incorrect",
        );
        return;
      }

      // Check biometric availability
      console.log(
        "[Biometric Setup] Checking supported authentication types...",
      );
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      console.log("[Biometric Setup] Has hardware:", hasHardware);
      console.log("[Biometric Setup] Is enrolled:", isEnrolled);

      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      console.log("[Biometric Setup] Supported types:", supportedTypes);

      // Request biometric authentication to trigger permission
      console.log("[Biometric Setup] Requesting biometric authentication...");
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to confirm biometric setup",
        fallbackLabel: "Cancel",
        disableDeviceFallback: false,
      });
      console.log("[Biometric Setup] Authentication result:", result);

      if (result.success) {
        console.log(
          "[Biometric Setup] Authentication successful, caching password...",
        );
        const AsyncStorage = (
          await import("@react-native-async-storage/async-storage")
        ).default;

        // Cache the master password for biometric login
        await AsyncStorage.setItem("cached_master_password", password);
        console.log("[Biometric Setup] Password cached");

        await AsyncStorage.setItem("biometric_enabled", "true");
        console.log("[Biometric Setup] Biometric enabled flag set");

        setBiometricEnabled(true);
        setShowPasswordModal(false);
        setPasswordInput("");

        // Show which biometric type was enabled
        const biometricType = supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        )
          ? "Face ID"
          : supportedTypes.includes(
                LocalAuthentication.AuthenticationType.FINGERPRINT,
              )
            ? "Fingerprint"
            : "Biometric";

        console.log("[Biometric Setup] Setup complete, type:", biometricType);
        Alert.alert(
          "Success",
          `${biometricType} login enabled. You can now use ${biometricType} to unlock your passwords.`,
        );
      } else {
        console.log("[Biometric Setup] Authentication failed or cancelled");
        Alert.alert(
          "Authentication Failed",
          "Could not verify your biometric identity",
        );
      }
    } catch (error) {
      console.error("[Biometric Setup] Error enabling biometric:", error);
      Alert.alert(
        "Error",
        `Failed to enable biometric login: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      // Show password input modal (works on both iOS and Android)
      console.log("[Biometric] Opening password input modal");
      setShowPasswordModal(true);
    } else {
      try {
        const AsyncStorage = (
          await import("@react-native-async-storage/async-storage")
        ).default;
        await AsyncStorage.setItem("biometric_enabled", "false");
        await AsyncStorage.removeItem("cached_master_password");
        setBiometricEnabled(false);
        Alert.alert(
          "Disabled",
          "Biometric login disabled and password cache cleared",
        );
      } catch (error) {
        console.error("Error saving biometric preference:", error);
      }
    }
  };

  const handleExport = async () => {
    if (!masterPassword) return;

    Alert.alert(
      "Export Passwords",
      "This will export all your passwords as an encrypted JSON file. Keep this file secure!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: async () => {
            setIsExporting(true);
            try {
              const vaultJson =
                await StorageService.exportVault(masterPassword);
              const fileName = `securepass_backup_${Date.now()}.json`;

              if (Platform.OS === "web") {
                // Web download
                const blob = new Blob([vaultJson], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
                Alert.alert("Success", "Backup file downloaded");
              } else {
                // Mobile share
                const fileUri = `${FileSystem.documentDirectory}${fileName}`;
                await FileSystem.writeAsStringAsync(fileUri, vaultJson);

                await Share.share({
                  url: fileUri,
                  message: "SecurePass Backup",
                });
                Alert.alert("Success", "Backup file created");
              }
            } catch (error) {
              console.error("Export error:", error);
              Alert.alert("Error", "Failed to export passwords");
            } finally {
              setIsExporting(false);
            }
          },
        },
      ],
    );
  };

  const handleImport = async () => {
    if (!masterPassword) return;

    Alert.alert(
      "Import Passwords",
      "Choose how to import:\n\n• Replace: Delete current passwords and import new ones\n• Merge: Add imported passwords to existing ones",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Replace",
          style: "destructive",
          onPress: () => askForImportPassword(false),
        },
        {
          text: "Merge",
          onPress: () => askForImportPassword(true),
        },
      ],
    );
  };

  const askForImportPassword = (merge: boolean) => {
    Alert.alert(
      "Backup Password",
      "The backup file is encrypted. Choose which password to use:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Use Current Password",
          onPress: () => performImport(merge, masterPassword!),
        },
        {
          text: "Enter Different Password",
          onPress: () => {
            Alert.prompt(
              "Enter Backup Password",
              "Enter the master password used to create this backup:",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Import",
                  onPress: (password?: string) => {
                    if (password && password.trim()) {
                      performImport(merge, password.trim());
                    } else {
                      Alert.alert("Error", "Password cannot be empty");
                    }
                  },
                },
              ],
              "secure-text",
            );
          },
        },
      ],
    );
  };

  const performImport = async (merge: boolean, importPassword: string) => {
    if (!masterPassword) return;

    setIsImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsImporting(false);
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);

      // Use the import password to decrypt, then save with current master password
      await StorageService.importVault(
        fileContent,
        importPassword,
        merge,
        masterPassword,
      );

      Alert.alert(
        "Success",
        "Passwords imported successfully! Returning to password manager...",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error("Import error:", error);
      const errorMessage =
        error instanceof Error &&
        error.message.includes("Wrong master password")
          ? "Wrong master password or invalid backup file"
          : "Failed to import passwords. Invalid file format.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "⚠️ WARNING: This will permanently delete your account and all saved passwords. This action cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              logout();
              Alert.alert("Success", "All data has been cleared");
            } catch (error) {
              console.error("Clear data error:", error);
              Alert.alert("Error", "Failed to clear data");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.cardBackground,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Settings
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Data Management
          </Text>

          <TouchableOpacity
            style={[
              styles.option,
              {
                backgroundColor: colors.cardBackground,
                shadowColor: colors.shadow,
              },
            ]}
            onPress={handleExport}
            disabled={isExporting}
          >
            <View style={styles.optionLeft}>
              <Ionicons
                name="cloud-upload"
                size={24}
                color={colors.iconColor}
              />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Export Passwords
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Backup your vault to a secure file
                </Text>
              </View>
            </View>
            {isExporting ? (
              <Text style={[styles.optionStatus, { color: colors.primary }]}>
                Exporting...
              </Text>
            ) : (
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.textTertiary}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              {
                backgroundColor: colors.cardBackground,
                shadowColor: colors.shadow,
              },
            ]}
            onPress={handleImport}
            disabled={isImporting}
          >
            <View style={styles.optionLeft}>
              <Ionicons
                name="cloud-download"
                size={24}
                color={colors.iconColor}
              />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Import Passwords
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Restore from a backup file
                </Text>
              </View>
            </View>
            {isImporting ? (
              <Text style={[styles.optionStatus, { color: colors.primary }]}>
                Importing...
              </Text>
            ) : (
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.textTertiary}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>

          <View style={styles.themeSelector}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor:
                    themeMode === "light" ? colors.primary : "transparent",
                  shadowColor: colors.shadow,
                },
              ]}
              onPress={() => setThemeMode("light")}
            >
              <Ionicons
                name="sunny"
                size={24}
                color={
                  themeMode === "light" ? colors.primary : colors.textTertiary
                }
              />
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color:
                      themeMode === "light"
                        ? colors.primary
                        : colors.textSecondary,
                  },
                ]}
              >
                Light
              </Text>
              {themeMode === "light" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor:
                    themeMode === "dark" ? colors.primary : "transparent",
                  shadowColor: colors.shadow,
                },
              ]}
              onPress={() => setThemeMode("dark")}
            >
              <Ionicons
                name="moon"
                size={24}
                color={
                  themeMode === "dark" ? colors.primary : colors.textTertiary
                }
              />
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color:
                      themeMode === "dark"
                        ? colors.primary
                        : colors.textSecondary,
                  },
                ]}
              >
                Dark
              </Text>
              {themeMode === "dark" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor:
                    themeMode === "system" ? colors.primary : "transparent",
                  shadowColor: colors.shadow,
                },
              ]}
              onPress={() => setThemeMode("system")}
            >
              <Ionicons
                name="phone-portrait"
                size={24}
                color={
                  themeMode === "system" ? colors.primary : colors.textTertiary
                }
              />
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color:
                      themeMode === "system"
                        ? colors.primary
                        : colors.textSecondary,
                  },
                ]}
              >
                System
              </Text>
              {themeMode === "system" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Security
          </Text>

          {biometricAvailable && (
            <View
              style={[
                styles.option,
                {
                  backgroundColor: colors.cardBackground,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <View style={styles.optionLeft}>
                <Ionicons
                  name="finger-print"
                  size={24}
                  color={colors.iconColor}
                />
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    Biometric Login
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Use fingerprint or face recognition
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{
                  false: colors.inputBorder,
                  true: colors.primary,
                }}
                thumbColor={
                  biometricEnabled ? colors.buttonText : colors.textTertiary
                }
              />
            </View>
          )}

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.cardBackground,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark"
              size={32}
              color={colors.success}
            />
            <View style={styles.infoText}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                🔒 Your data is encrypted
              </Text>
              <Text
                style={[
                  styles.infoDescription,
                  { color: colors.textSecondary },
                ]}
              >
                All passwords are encrypted with AES-256 encryption using your
                master password. Your data is stored locally on your device and
                never sent to any server.
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.cardBackground,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Ionicons name="warning" size={32} color={colors.warning} />
            <View style={styles.infoText}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                ⚠️ Important Reminder
              </Text>
              <Text
                style={[
                  styles.infoDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Your master password cannot be recovered. If you forget it, you
                will lose access to all your saved passwords. Make sure to
                remember it or store it safely!
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account
          </Text>

          <TouchableOpacity
            style={[
              styles.option,
              {
                backgroundColor: colors.cardBackground,
                shadowColor: colors.shadow,
              },
            ]}
            onPress={logout}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="log-out" size={24} color={colors.danger} />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: colors.danger }]}>
                  Logout
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Lock your password vault
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.textTertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              {
                backgroundColor: colors.cardBackground,
                shadowColor: colors.shadow,
              },
            ]}
            onPress={handleClearData}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="trash" size={24} color={colors.dangerDark} />
              <View style={styles.optionText}>
                <Text
                  style={[styles.optionTitle, { color: colors.dangerDark }]}
                >
                  Clear All Data
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Permanently delete everything
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            SecurePass v1.0
          </Text>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Made with ❤️ for your security
          </Text>
        </View>
      </ScrollView>

      {/* Password Input Modal for Biometric Setup */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowPasswordModal(false);
          setPasswordInput("");
          setBiometricEnabled(false);
        }}
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: colors.modalBackground },
          ]}
        >
          <View
            style={[
              styles.passwordModal,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Enable Biometric Login
            </Text>
            <Text
              style={[styles.modalDescription, { color: colors.textSecondary }]}
            >
              Enter your master password to enable biometric authentication
            </Text>

            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[
                  styles.passwordModalInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                value={passwordInput}
                onChangeText={setPasswordInput}
                placeholder="Master Password"
                placeholderTextColor={colors.placeholderText}
                secureTextEntry={!showPasswordInput}
                autoFocus
                onSubmitEditing={handleEnableBiometric}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPasswordInput(!showPasswordInput)}
              >
                <Ionicons
                  name={showPasswordInput ? "eye-off" : "eye"}
                  size={22}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalCancelButton,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                  },
                ]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPasswordInput("");
                  setBiometricEnabled(false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalConfirmButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleEnableBiometric}
              >
                <Text
                  style={[styles.modalButtonText, { color: colors.buttonText }]}
                >
                  Enable
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 32,
    padding: 8,
    zIndex: 1,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginLeft: 4,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionText: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  optionDescription: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  optionStatus: {
    fontSize: 14,
    color: "#4A90E2",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  footer: {
    alignItems: "center",
    padding: 32,
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: "#999",
    marginVertical: 4,
  },
  themeSelector: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  themeOption: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  themeOptionActive: {
    borderColor: "#4A90E2",
    backgroundColor: "#f0f8ff",
  },
  themeOptionText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    fontWeight: "500",
  },
  themeOptionTextActive: {
    color: "#4A90E2",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  passwordModal: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  passwordInputContainer: {
    position: "relative",
    marginBottom: 20,
  },
  passwordModalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    top: 14,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modalConfirmButton: {
    backgroundColor: "#4A90E2",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
