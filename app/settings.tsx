import { useAuth } from "@/contexts/auth-context";
import { StorageService } from "@/services/storage";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function SettingsScreen() {
  const { logout, masterPassword } = useAuth();
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

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
          onPress: () => performImport(false),
        },
        {
          text: "Merge",
          onPress: () => performImport(true),
        },
      ],
    );
  };

  const performImport = async (merge: boolean) => {
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

      await StorageService.importVault(fileContent, masterPassword, merge);
      Alert.alert("Success", "Passwords imported successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to import passwords. Invalid file format.");
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
              Alert.alert("Error", "Failed to clear data");
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="#4A90E2" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="settings" size={40} color="#4A90E2" />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <TouchableOpacity
          style={styles.option}
          onPress={handleExport}
          disabled={isExporting}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="cloud-upload" size={24} color="#4A90E2" />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Export Passwords</Text>
              <Text style={styles.optionDescription}>
                Backup your vault to a secure file
              </Text>
            </View>
          </View>
          {isExporting ? (
            <Text style={styles.optionStatus}>Exporting...</Text>
          ) : (
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={handleImport}
          disabled={isImporting}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="cloud-download" size={24} color="#4A90E2" />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Import Passwords</Text>
              <Text style={styles.optionDescription}>
                Restore from a backup file
              </Text>
            </View>
          </View>
          {isImporting ? (
            <Text style={styles.optionStatus}>Importing...</Text>
          ) : (
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={32} color="#4CAF50" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>🔒 Your data is encrypted</Text>
            <Text style={styles.infoDescription}>
              All passwords are encrypted with AES-256 encryption using your
              master password. Your data is stored locally on your device and
              never sent to any server.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="warning" size={32} color="#ff9800" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>⚠️ Important Reminder</Text>
            <Text style={styles.infoDescription}>
              Your master password cannot be recovered. If you forget it, you
              will lose access to all your saved passwords. Make sure to
              remember it or store it safely!
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.option} onPress={logout}>
          <View style={styles.optionLeft}>
            <Ionicons name="log-out" size={24} color="#ff6b6b" />
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: "#ff6b6b" }]}>
                Logout
              </Text>
              <Text style={styles.optionDescription}>
                Lock your password vault
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleClearData}>
          <View style={styles.optionLeft}>
            <Ionicons name="trash" size={24} color="#ff0000" />
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: "#ff0000" }]}>
                Clear All Data
              </Text>
              <Text style={styles.optionDescription}>
                Permanently delete everything
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>SecurePass v1.0</Text>
        <Text style={styles.footerText}>Made with ❤️ for your security</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: "center",
    padding: 32,
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
});
