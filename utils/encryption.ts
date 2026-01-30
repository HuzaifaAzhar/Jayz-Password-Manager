// Polyfill for crypto in React Native
import CryptoJS from "crypto-js";
import "react-native-get-random-values";

/**
 * Encrypts data using AES-256 encryption
 * @param data - The data to encrypt
 * @param masterPassword - The master password used as encryption key
 * @returns Encrypted string
 */
export const encryptData = (data: string, masterPassword: string): string => {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, masterPassword).toString();
    return encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
};

/**
 * Decrypts AES-256 encrypted data
 * @param encryptedData - The encrypted data
 * @param masterPassword - The master password used as decryption key
 * @returns Decrypted string
 */
export const decryptData = (
  encryptedData: string,
  masterPassword: string,
): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, masterPassword);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      throw new Error("Invalid password or corrupted data");
    }

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error(
      "Failed to decrypt data. Invalid password or corrupted data.",
    );
  }
};

/**
 * Generates a hash of the master password for verification
 * @param password - The password to hash
 * @returns SHA-256 hash of the password
 */
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

/**
 * Validates password strength
 * @param password - The password to validate
 * @returns Object with isValid flag and error message
 */
export const validatePasswordStrength = (
  password: string,
): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character",
    };
  }

  return { isValid: true, message: "Password is strong" };
};

/**
 * Generates a random secure password
 * @param length - Length of the password
 * @returns Generated password
 */
export const generateSecurePassword = (length: number = 16): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = uppercase + lowercase + numbers + special;
  let password = "";

  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};
