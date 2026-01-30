import { useAuth } from "@/contexts/auth-context";
import { StorageService } from "@/services/storage";
import { PasswordEntry } from "@/types/password";
import { generateSecurePassword } from "@/utils/encryption";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PasswordManagerScreen() {
  const { masterPassword, logout } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>(
    {},
  );

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formWebsite, setFormWebsite] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [showFormPassword, setShowFormPassword] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadEntries();
    }, [masterPassword]),
  );

  const loadEntries = async () => {
    if (!masterPassword) return;

    try {
      const vault = await StorageService.loadVault(masterPassword);
      setEntries(vault.entries);
    } catch (error) {
      Alert.alert("Error", "Failed to load passwords");
    }
  };

  const handleAddEntry = async () => {
    if (!formTitle || !formPassword) {
      Alert.alert("Error", "Title and password are required");
      return;
    }

    if (!masterPassword) return;

    try {
      await StorageService.addEntry(
        {
          title: formTitle,
          username: formUsername,
          password: formPassword,
          website: formWebsite,
          notes: formNotes,
          category: formCategory,
        },
        masterPassword,
      );

      await loadEntries();
      resetForm();
      setIsAddModalVisible(false);
      Alert.alert("Success", "Password added successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to add password");
    }
  };

  const handleUpdateEntry = async () => {
    if (!selectedEntry || !masterPassword) return;

    try {
      await StorageService.updateEntry(
        selectedEntry.id,
        {
          title: formTitle,
          username: formUsername,
          password: formPassword,
          website: formWebsite,
          notes: formNotes,
          category: formCategory,
        },
        masterPassword,
      );

      await loadEntries();
      resetForm();
      setIsEditModalVisible(false);
      setSelectedEntry(null);
      Alert.alert("Success", "Password updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update password");
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!masterPassword) return;

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this password?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.deleteEntry(id, masterPassword);
              await loadEntries();
              Alert.alert("Success", "Password deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete password");
            }
          },
        },
      ],
    );
  };

  const openEditModal = (entry: PasswordEntry) => {
    setSelectedEntry(entry);
    setFormTitle(entry.title);
    setFormUsername(entry.username);
    setFormPassword(entry.password);
    setFormWebsite(entry.website || "");
    setFormNotes(entry.notes || "");
    setFormCategory(entry.category || "");
    setIsEditModalVisible(true);
  };

  const resetForm = () => {
    setFormTitle("");
    setFormUsername("");
    setFormPassword("");
    setFormWebsite("");
    setFormNotes("");
    setFormCategory("");
  };

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", `${label} copied to clipboard`);
  };

  const generatePassword = () => {
    const newPassword = generateSecurePassword(16);
    setFormPassword(newPassword);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.website &&
        entry.website.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const renderPasswordForm = (isEdit: boolean) => (
    <ScrollView
      style={styles.modalContent}
      showsVerticalScrollIndicator={true}
      bounces={false}
    >
      <Text style={styles.modalTitle}>
        {isEdit ? "Edit Password" : "Add Password"}
      </Text>

      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={formTitle}
        onChangeText={setFormTitle}
        placeholder="e.g., Gmail Account"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Username/Email</Text>
      <TextInput
        style={styles.input}
        value={formUsername}
        onChangeText={setFormUsername}
        placeholder="username@example.com"
        placeholderTextColor="#999"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password *</Text>
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={[styles.input, { flex: 1, paddingRight: 90 }]}
          value={formPassword}
          onChangeText={setFormPassword}
          placeholder="Enter password"
          placeholderTextColor="#999"
          secureTextEntry={!showFormPassword}
        />
        <TouchableOpacity
          style={styles.eyeIconForm}
          onPress={() => setShowFormPassword(!showFormPassword)}
        >
          <Ionicons
            name={showFormPassword ? "eye-off" : "eye"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generatePassword}
        >
          <Ionicons name="refresh" size={20} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Website</Text>
      <TextInput
        style={styles.input}
        value={formWebsite}
        onChangeText={setFormWebsite}
        placeholder="https://example.com"
        placeholderTextColor="#999"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        value={formCategory}
        onChangeText={setFormCategory}
        placeholder="e.g., Social Media, Banking"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formNotes}
        onChangeText={setFormNotes}
        placeholder="Additional notes..."
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
      />

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.modalButton, styles.cancelButton]}
          onPress={() => {
            resetForm();
            setShowFormPassword(false);
            isEdit ? setIsEditModalVisible(false) : setIsAddModalVisible(false);
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, styles.saveButton]}
          onPress={isEdit ? handleUpdateEntry : handleAddEntry}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderEntry = ({ item }: { item: PasswordEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.entryTitleContainer}>
          <Ionicons name="key" size={24} color="#4A90E2" />
          <View style={styles.entryTextContainer}>
            <Text style={styles.entryTitle}>{item.title}</Text>
            {item.username && (
              <View style={styles.usernameRow}>
                <Text style={styles.entryUsername}>{item.username}</Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(item.username, "Username")}
                  style={styles.copyIconSmall}
                >
                  <Ionicons name="copy" size={16} color="#4A90E2" />
                </TouchableOpacity>
              </View>
            )}
            {item.category && (
              <Text style={styles.entryCategory}>📁 {item.category}</Text>
            )}
          </View>
        </View>
        <View style={styles.entryActions}>
          <TouchableOpacity
            onPress={() => openEditModal(item)}
            style={styles.actionButton}
          >
            <Ionicons name="pencil" size={20} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteEntry(item.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.entryDetails}>
        {item.website && (
          <TouchableOpacity
            onPress={() => copyToClipboard(item.website!, "Website")}
          >
            <Text style={styles.entryWebsite}>🌐 {item.website}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.passwordContainer}>
          <Text style={styles.passwordLabel}>Password: </Text>
          <Text style={styles.passwordText}>
            {showPassword[item.id] ? item.password : "••••••••"}
          </Text>
          <TouchableOpacity onPress={() => togglePasswordVisibility(item.id)}>
            <Ionicons
              name={showPassword[item.id] ? "eye-off" : "eye"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => copyToClipboard(item.password, "Password")}
          >
            <Ionicons
              name="copy"
              size={20}
              color="#4A90E2"
              style={{ marginLeft: 12 }}
            />
          </TouchableOpacity>
        </View>

        {item.notes && <Text style={styles.entryNotes}>📝 {item.notes}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Passwords</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            style={styles.headerButton}
          >
            <Ionicons name="settings" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.headerButton}>
            <Ionicons name="log-out" size={24} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search passwords..."
          placeholderTextColor="#999"
        />
      </View>

      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="lock-closed" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No passwords yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first password
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>{renderPasswordForm(false)}</View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={isEditModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>{renderPasswordForm(true)}</View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    margin: 16,
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  entryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  entryTitleContainer: {
    flexDirection: "row",
    flex: 1,
  },
  entryTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  entryUsername: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  copyIconSmall: {
    marginLeft: 8,
    padding: 4,
  },
  entryCategory: {
    fontSize: 12,
    color: "#4A90E2",
    marginTop: 4,
  },
  entryActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  entryDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  entryWebsite: {
    fontSize: 14,
    color: "#4A90E2",
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  passwordLabel: {
    fontSize: 14,
    color: "#666",
  },
  passwordText: {
    fontSize: 14,
    color: "#333",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginRight: 8,
    flex: 1,
  },
  entryNotes: {
    fontSize: 13,
    color: "#999",
    marginTop: 8,
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  eyeIconForm: {
    position: "absolute",
    right: 56,
    padding: 8,
    zIndex: 1,
  },
  generateButton: {
    marginLeft: 8,
    padding: 12,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 20,
    paddingBottom: Platform.OS === "android" ? 20 : 0,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: "#4A90E2",
    marginLeft: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
