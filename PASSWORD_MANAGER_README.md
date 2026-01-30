# SecurePass - Local Password Manager

A highly secure, locally-encrypted password manager built with React Native and Expo. All your passwords are encrypted with AES-256 encryption and stored securely on your device.

## 🔒 Security Features

- **AES-256 Encryption**: All passwords are encrypted using industry-standard AES-256 encryption
- **Master Password**: Single master password protects your entire vault
- **Local Storage**: All data is stored locally on your device using Expo SecureStore
- **No Cloud Sync**: Your data never leaves your device
- **Strong Password Validation**: Enforced password requirements for master password
- **Secure Password Generator**: Built-in generator for strong, random passwords

## ✨ Features

### Core Functionality

- ✅ **Signup/Login**: Secure account creation with master password
- ✅ **Add Passwords**: Store website/app credentials with additional metadata
- ✅ **Edit/Delete**: Manage your password entries
- ✅ **Search**: Quickly find passwords by title, username, or website
- ✅ **Copy to Clipboard**: One-tap copy for usernames and passwords
- ✅ **Password Visibility Toggle**: Show/hide passwords as needed
- ✅ **Password Generator**: Create strong, random passwords

### Import/Export

- 📥 **Export Vault**: Backup your encrypted vault to a JSON file
- 📤 **Import Vault**: Restore from backup or merge with existing data
- 🔄 **Merge or Replace**: Choose to merge imported data or replace existing vault

### Settings

- ⚙️ **Data Management**: Export and import your password vault
- 🔓 **Logout**: Lock your vault when not in use
- 🗑️ **Clear All Data**: Delete account and all passwords

## 📱 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI

### Setup

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the Development Server**
   \`\`\`bash
   npm start
   \`\`\`

3. **Run on Device/Emulator**

- Press `a` for Android
- Press `i` for iOS
- Press `w` for web (note: some features may be limited on web)
- Or scan QR code with Expo Go app

## 🏗️ Project Structure

\`\`\`
├── app/
│ ├── auth.tsx # Authentication screen (signup/login)
│ ├── password-manager.tsx # Main password management screen
│ ├── settings.tsx # Settings and import/export
│ └── \_layout.tsx # Root navigation layout
├── contexts/
│ └── auth-context.tsx # Authentication state management
├── services/
│ └── storage.ts # Encrypted storage service
├── utils/
│ └── encryption.ts # Encryption/decryption utilities
├── types/
│ └── password.ts # TypeScript interfaces
└── components/ # Reusable UI components
\`\`\`

## 🔐 Security Architecture

### Encryption

- **Algorithm**: AES-256-CBC
- **Key Derivation**: Master password used directly as encryption key
- **Storage**: Encrypted vault stored in Expo SecureStore (iOS Keychain/Android Keystore)

### Master Password

- Hashed using SHA-256 for verification
- Never stored in plain text
- Cannot be recovered if forgotten
- Must meet strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

### Data Structure

\`\`\`typescript
interface PasswordEntry {
id: string;
title: string;
username: string;
password: string;
website?: string;
notes?: string;
category?: string;
createdAt: number;
updatedAt: number;
}
\`\`\`

## 🚀 Usage

### First Time Setup

1. Launch the app
2. Create a master password (must meet security requirements)
3. Confirm master password
4. You're ready to start storing passwords!

### Adding a Password

1. Tap the **+** button
2. Fill in the required fields (Title and Password)
3. Optionally add username, website, category, and notes
4. Use the refresh icon to generate a strong random password
5. Tap **Save**

### Managing Passwords

- **View**: Tap the eye icon to show/hide password
- **Copy**: Tap the copy icon to copy password to clipboard
- **Edit**: Tap the pencil icon to modify entry
- **Delete**: Tap the trash icon to remove entry
- **Search**: Use the search bar to filter passwords

### Backup and Restore

#### Export

1. Go to Settings (gear icon)
2. Tap **Export Passwords**
3. Confirm export
4. Save the JSON file in a secure location

#### Import

1. Go to Settings
2. Tap **Import Passwords**
3. Choose **Replace** (delete current) or **Merge** (combine with existing)
4. Select your backup JSON file

## ⚠️ Important Security Notes

1. **Master Password**: Your master password CANNOT be recovered. Make sure to remember it or store it safely!
2. **Backup Regularly**: Export your vault regularly and store backups in a secure location
3. **Secure Your Device**: Use device encryption and biometric locks
4. **Backup Files**: Keep exported backup files secure and encrypted
5. **Physical Security**: Your device security is crucial - use strong device passwords/biometrics

## 🛡️ Best Practices

1. **Use a Strong Master Password**: Follow all password requirements and use a unique, memorable password
2. **Regular Backups**: Export your vault weekly or after significant changes
3. **Secure Backup Storage**: Store backups in encrypted cloud storage or offline media
4. **Unique Passwords**: Generate unique passwords for each service
5. **Update Regularly**: Change important passwords periodically
6. **Logout When Not in Use**: Lock your vault when you're done

## 📝 License

MIT License - feel free to use and modify for your needs

## 🤝 Contributing

This is a personal security tool. Feel free to fork and customize for your needs!

## 🆘 Troubleshooting

### Can't Login

- Make sure you're entering the correct master password
- Password is case-sensitive
- If you've forgotten your master password, you'll need to clear all data and start fresh

### Import Fails

- Ensure the JSON file is from a valid SecurePass export
- Check that the file hasn't been corrupted
- Try exporting again if issues persist

### App Crashes

- Clear app data and restart
- Ensure all dependencies are properly installed
- Check for console errors in development mode

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Remember**: Your security is only as strong as your master password. Choose wisely! 🔐
