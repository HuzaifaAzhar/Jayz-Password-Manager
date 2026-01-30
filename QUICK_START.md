# SecurePass - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Start the App

\`\`\`bash
npm start
\`\`\`

### 3. Run on Your Device

- **iOS**: Press `i` or scan QR with Camera app
- **Android**: Press `a` or scan QR with Expo Go
- **Web**: Press `w` (limited features)

## 📱 First Use

1. **Create Master Password** (8+ chars, uppercase, lowercase, number, special char)
2. **Confirm Password**
3. **Start Adding Passwords!**

## 🔑 Key Features

| Feature           | How To                            |
| ----------------- | --------------------------------- |
| Add Password      | Tap **+** button                  |
| Generate Password | Tap refresh icon in add/edit form |
| View Password     | Tap eye icon                      |
| Copy Password     | Tap copy icon                     |
| Edit Password     | Tap pencil icon                   |
| Delete Password   | Tap trash icon                    |
| Search            | Use search bar at top             |
| Export Backup     | Settings → Export Passwords       |
| Import Backup     | Settings → Import Passwords       |
| Logout            | Tap logout icon (top right)       |

## 🔒 Password Entry Fields

- **Title** ⭐ (Required): Name of the service (e.g., "Gmail")
- **Username**: Your username or email
- **Password** ⭐ (Required): The password to store
- **Website**: URL of the service
- **Category**: Group similar passwords (e.g., "Social Media")
- **Notes**: Any additional information

## 💾 Backup Your Data

### Export (Recommended Weekly)

1. Go to Settings
2. Tap "Export Passwords"
3. Save file securely

### Import

1. Go to Settings
2. Tap "Import Passwords"
3. Choose:
   - **Replace**: Delete current vault, import new
   - **Merge**: Add imported to existing

## ⚠️ Critical Reminders

- 🔴 **Master password CANNOT be recovered**
- 📁 **Backup regularly** - export your vault
- 🔐 **Keep backups secure** - they contain your passwords
- 📱 **Lock your device** - use biometrics/PIN
- 🚪 **Logout when done** - lock your vault

## 🛠️ Tech Stack

- **Framework**: React Native + Expo
- **Encryption**: AES-256 (crypto-js)
- **Storage**: Expo SecureStore (iOS Keychain/Android Keystore)
- **Navigation**: Expo Router
- **Language**: TypeScript

## 📂 Project Files

\`\`\`
Key Files:
├── app/auth.tsx → Login/Signup
├── app/password-manager.tsx → Main screen
├── app/settings.tsx → Import/Export
├── contexts/auth-context.tsx → Auth state
├── services/storage.ts → Data storage
└── utils/encryption.ts → Encryption
\`\`\`

## 🐛 Common Issues

| Problem                | Solution                        |
| ---------------------- | ------------------------------- |
| Can't login            | Check password (case-sensitive) |
| Import fails           | Verify valid export file        |
| Forgot master password | Must clear data & restart       |
| App won't start        | Run `npm install` again         |

## 📋 Password Requirements

Master Password Must Have:

- ✅ At least 8 characters
- ✅ One uppercase letter (A-Z)
- ✅ One lowercase letter (a-z)
- ✅ One number (0-9)
- ✅ One special character (!@#$%^&\*...)

## 🎯 Best Practices

1. ✅ Use a unique master password
2. ✅ Export vault weekly
3. ✅ Use generated passwords (16+ chars)
4. ✅ Add categories to organize
5. ✅ Add notes for security questions
6. ✅ Logout when not in use
7. ✅ Store backups securely offline

## 🔐 Security Features

- 🛡️ **AES-256 Encryption**: Military-grade encryption
- 🔒 **Local Storage**: Never leaves your device
- 🚫 **No Cloud**: 100% offline
- 🔑 **Master Password**: Single key to your vault
- 🎲 **Password Generator**: Strong random passwords
- 👁️ **Hidden by Default**: Passwords masked

## 📞 Need Help?

Check the full documentation in `PASSWORD_MANAGER_README.md`

---

**Stay Secure! 🔐**
