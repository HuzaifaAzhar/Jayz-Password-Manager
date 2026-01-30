import { PasswordEntry, PasswordVault, User } from "@/types/password";
import { decryptData, encryptData, hashPassword } from "@/utils/encryption";
import * as SecureStore from "expo-secure-store";

const USER_KEY = "password_manager_user";
const VAULT_KEY = "password_manager_vault";

/**
 * Storage service for managing encrypted password vault
 */
export class StorageService {
  /**
   * Creates a new user account with master password
   */
  static async createUser(masterPassword: string): Promise<void> {
    try {
      const hashedMasterPassword = hashPassword(masterPassword);
      const user: User = {
        hashedMasterPassword,
        createdAt: Date.now(),
      };

      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      // Initialize empty vault
      const emptyVault: PasswordVault = {
        entries: [],
        lastModified: Date.now(),
      };

      await this.saveVault(emptyVault, masterPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user account");
    }
  }

  /**
   * Checks if a user exists
   */
  static async userExists(): Promise<boolean> {
    try {
      const user = await SecureStore.getItemAsync(USER_KEY);
      return user !== null;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  }

  /**
   * Verifies the master password
   */
  static async verifyMasterPassword(masterPassword: string): Promise<boolean> {
    try {
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      if (!userJson) return false;

      const user: User = JSON.parse(userJson);
      const hashedInput = hashPassword(masterPassword);

      return hashedInput === user.hashedMasterPassword;
    } catch (error) {
      console.error("Error verifying password:", error);
      return false;
    }
  }

  /**
   * Saves the encrypted vault
   */
  static async saveVault(
    vault: PasswordVault,
    masterPassword: string,
  ): Promise<void> {
    try {
      const vaultJson = JSON.stringify(vault);
      const encryptedVault = encryptData(vaultJson, masterPassword);
      await SecureStore.setItemAsync(VAULT_KEY, encryptedVault);
    } catch (error) {
      console.error("Error saving vault:", error);
      throw new Error("Failed to save password vault");
    }
  }

  /**
   * Loads and decrypts the vault
   */
  static async loadVault(masterPassword: string): Promise<PasswordVault> {
    try {
      const encryptedVault = await SecureStore.getItemAsync(VAULT_KEY);

      if (!encryptedVault) {
        // Return empty vault if none exists
        return {
          entries: [],
          lastModified: Date.now(),
        };
      }

      const decryptedVault = decryptData(encryptedVault, masterPassword);
      return JSON.parse(decryptedVault);
    } catch (error) {
      console.error("Error loading vault:", error);
      throw new Error("Failed to load password vault. Wrong password?");
    }
  }

  /**
   * Adds a new password entry
   */
  static async addEntry(
    entry: Omit<PasswordEntry, "id" | "createdAt" | "updatedAt">,
    masterPassword: string,
  ): Promise<void> {
    try {
      const vault = await this.loadVault(masterPassword);

      const newEntry: PasswordEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      vault.entries.push(newEntry);
      vault.lastModified = Date.now();

      await this.saveVault(vault, masterPassword);
    } catch (error) {
      console.error("Error adding entry:", error);
      throw new Error("Failed to add password entry");
    }
  }

  /**
   * Updates an existing password entry
   */
  static async updateEntry(
    id: string,
    updates: Partial<PasswordEntry>,
    masterPassword: string,
  ): Promise<void> {
    try {
      const vault = await this.loadVault(masterPassword);

      const entryIndex = vault.entries.findIndex((e) => e.id === id);
      if (entryIndex === -1) {
        throw new Error("Entry not found");
      }

      vault.entries[entryIndex] = {
        ...vault.entries[entryIndex],
        ...updates,
        id, // Keep original ID
        createdAt: vault.entries[entryIndex].createdAt, // Keep original creation date
        updatedAt: Date.now(),
      };

      vault.lastModified = Date.now();
      await this.saveVault(vault, masterPassword);
    } catch (error) {
      console.error("Error updating entry:", error);
      throw new Error("Failed to update password entry");
    }
  }

  /**
   * Deletes a password entry
   */
  static async deleteEntry(id: string, masterPassword: string): Promise<void> {
    try {
      const vault = await this.loadVault(masterPassword);

      vault.entries = vault.entries.filter((e) => e.id !== id);
      vault.lastModified = Date.now();

      await this.saveVault(vault, masterPassword);
    } catch (error) {
      console.error("Error deleting entry:", error);
      throw new Error("Failed to delete password entry");
    }
  }

  /**
   * Exports the encrypted vault as JSON string (double encrypted)
   */
  static async exportVault(masterPassword: string): Promise<string> {
    try {
      const vault = await this.loadVault(masterPassword);
      const vaultJson = JSON.stringify(vault, null, 2);
      // Encrypt the entire export with master password for additional security
      const encryptedExport = encryptData(vaultJson, masterPassword);
      return encryptedExport;
    } catch (error) {
      console.error("Error exporting vault:", error);
      throw new Error("Failed to export password vault");
    }
  }

  /**
   * Imports a vault from JSON string (decrypts double-encrypted export)
   */
  static async importVault(
    encryptedVaultJson: string,
    importPassword: string,
    merge: boolean = false,
    currentMasterPassword?: string,
  ): Promise<void> {
    try {
      // First, decrypt the export (which was encrypted with the import password)
      let decryptedVaultJson: string;
      try {
        decryptedVaultJson = decryptData(encryptedVaultJson, importPassword);
      } catch (error) {
        throw new Error("Wrong master password or invalid backup file");
      }

      const importedVault: PasswordVault = JSON.parse(decryptedVaultJson);

      if (!importedVault.entries || !Array.isArray(importedVault.entries)) {
        throw new Error("Invalid vault format");
      }

      // Use current master password if provided, otherwise use import password
      const savePassword = currentMasterPassword || importPassword;

      if (merge) {
        const existingVault = await this.loadVault(savePassword);

        // Filter out duplicates - entries with same ID
        const filteredImportedEntries = importedVault.entries.filter(
          (importedEntry) => {
            return !existingVault.entries.some(
              (existingEntry) => existingEntry.id === importedEntry.id,
            );
          },
        );

        importedVault.entries = [
          ...existingVault.entries,
          ...filteredImportedEntries,
        ];
      }

      importedVault.lastModified = Date.now();
      await this.saveVault(importedVault, savePassword);
    } catch (error) {
      console.error("Error importing vault:", error);
      if (
        error instanceof Error &&
        error.message.includes("Wrong master password")
      ) {
        throw error;
      }
      throw new Error("Failed to import password vault");
    }
  }

  /**
   * Clears all data (for reset/logout)
   */
  static async clearAllData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(USER_KEY);
      await SecureStore.deleteItemAsync(VAULT_KEY);
    } catch (error) {
      console.error("Error clearing data:", error);
      throw new Error("Failed to clear data");
    }
  }
}
